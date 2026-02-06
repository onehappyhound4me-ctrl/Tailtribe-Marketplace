type NormalizeOptions = {
  required?: boolean
  allowHttpInDev?: boolean
}

function isProd() {
  return process.env.NODE_ENV === 'production'
}

function isPrivateOrLocalAddress(hostname: string) {
  const h = String(hostname || '').trim().toLowerCase()
  if (!h) return false
  if (h === 'localhost' || h === '127.0.0.1' || h === '::1' || h === '0.0.0.0') return true

  // Allow common LAN IPv4 ranges for local/dev builds.
  const m = h.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/)
  if (!m) return false
  const a = Number(m[1])
  const b = Number(m[2])
  const c = Number(m[3])
  const d = Number(m[4])
  if (![a, b, c, d].every((n) => Number.isInteger(n) && n >= 0 && n <= 255)) return false

  // 10.0.0.0/8
  if (a === 10) return true
  // 172.16.0.0/12
  if (a === 172 && b >= 16 && b <= 31) return true
  // 192.168.0.0/16
  if (a === 192 && b === 168) return true
  // 169.254.0.0/16 (link-local)
  if (a === 169 && b === 254) return true

  return false
}

export function normalizeBaseUrl(envName: string, raw: string | undefined, opts: NormalizeOptions = {}) {
  const value = String(raw ?? '').trim()
  if (!value) {
    if (opts.required) {
      throw new Error(`[env] Missing ${envName}. Set it in your environment variables.`)
    }
    return ''
  }

  if (value.endsWith('/')) {
    throw new Error(`[env] Invalid ${envName}: must not end with '/'. Example: https://tailtribe.be`)
  }

  let url: URL
  try {
    url = new URL(value)
  } catch {
    throw new Error(`[env] Invalid ${envName}: must be a full URL (e.g. https://tailtribe.be)`)
  }

  // `next build` runs with NODE_ENV=production even on developer machines.
  // Allow local/LAN http URLs so local prod builds work, but keep real production strict.
  if (isProd() && url.protocol !== 'https:' && !isPrivateOrLocalAddress(url.hostname)) {
    throw new Error(`[env] Invalid ${envName}: must use https in production`)
  }
  if (!isProd() && !opts.allowHttpInDev && url.protocol !== 'https:') {
    // Keep dev strict by default; pass allowHttpInDev when needed.
    throw new Error(`[env] Invalid ${envName}: must use https (or allowHttpInDev)`)
  }

  return value
}

export function getPublicAppUrl() {
  // This value affects links, emails, and metadata.
  // Prefer explicit config, but keep Vercel deployments resilient by deriving from `VERCEL_URL`.
  const raw = process.env.NEXT_PUBLIC_APP_URL
  const explicit = normalizeBaseUrl('NEXT_PUBLIC_APP_URL', raw, { required: false, allowHttpInDev: true })
  if (explicit) return explicit

  // Vercel sets `VERCEL_URL` (no protocol), e.g. "tailtribe.vercel.app" or a preview URL.
  const vercelUrl = String(process.env.VERCEL_URL ?? '').trim()
  if (vercelUrl) {
    const derived = `https://${vercelUrl}`
    return normalizeBaseUrl('VERCEL_URL', derived, { required: false, allowHttpInDev: false }) || derived
  }

  // Local/dev fallback.
  if (!isProd()) return 'http://localhost:3000'

  // Safe last-resort fallback for production if envs are missing.
  return 'https://tailtribe.be'
}

