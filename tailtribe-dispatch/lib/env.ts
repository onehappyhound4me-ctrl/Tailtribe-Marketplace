type NormalizeOptions = {
  required?: boolean
  allowHttpInDev?: boolean
}

function isProd() {
  return process.env.NODE_ENV === 'production'
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

  if (isProd() && url.protocol !== 'https:') {
    throw new Error(`[env] Invalid ${envName}: must use https in production`)
  }
  if (!isProd() && !opts.allowHttpInDev && url.protocol !== 'https:') {
    // Keep dev strict by default; pass allowHttpInDev when needed.
    throw new Error(`[env] Invalid ${envName}: must use https (or allowHttpInDev)`)
  }

  return value
}

export function getPublicAppUrl() {
  // Production parity: do not silently fall back; this value affects links, emails, and metadata.
  const required = isProd()
  const raw = process.env.NEXT_PUBLIC_APP_URL
  const normalized = normalizeBaseUrl('NEXT_PUBLIC_APP_URL', raw, { required, allowHttpInDev: true })
  return normalized || 'https://tailtribe.be'
}

