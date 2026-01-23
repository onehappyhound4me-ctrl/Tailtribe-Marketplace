type BaseUrlInput = {
  /**
   * Request origin, e.g. req.nextUrl.origin.
   * Used as fallback when AUTH_URL/NEXTAUTH_URL are not set (preview deployments).
   */
  reqOrigin?: string | null
}

function normalizeNoTrailingSlash(value: string) {
  return value.trim().replace(/\/+$/, '')
}

function assertNoTrailingSlash(envName: 'AUTH_URL' | 'NEXTAUTH_URL', raw: string | undefined) {
  const v = (raw ?? '').trim()
  if (!v) return null
  if (v.endsWith('/')) {
    throw new Error(`Invalid ${envName}: must not end with '/'`)
  }
  return v
}

export function getAuthBaseUrl(input: BaseUrlInput = {}) {
  // Prefer AUTH_URL (Auth.js v5), fallback to NEXTAUTH_URL.
  const authUrl = assertNoTrailingSlash('AUTH_URL', process.env.AUTH_URL)
  const nextAuthUrl = assertNoTrailingSlash('NEXTAUTH_URL', process.env.NEXTAUTH_URL)

  const fromEnv = authUrl || nextAuthUrl
  if (fromEnv) return normalizeNoTrailingSlash(fromEnv)

  const origin = (input.reqOrigin ?? '').trim()
  if (origin) return normalizeNoTrailingSlash(origin)

  // No base URL available; leave empty and let Auth.js handle it (will likely error).
  return ''
}

export function applyAuthBaseUrlEnv(input: BaseUrlInput = {}) {
  const baseUrl = getAuthBaseUrl(input)
  if (baseUrl) {
    process.env.AUTH_URL = baseUrl
    process.env.NEXTAUTH_URL = baseUrl
  }

  // Auth.js host trust env (keeps behavior consistent across Vercel/proxies).
  if (!process.env.AUTH_TRUST_HOST) process.env.AUTH_TRUST_HOST = 'true'

  // One-time log for observability (serverless: per instance).
  try {
    const g = globalThis as any
    if (!g.__tt_auth_base_url_logged) {
      g.__tt_auth_base_url_logged = true
      // eslint-disable-next-line no-console
      console.log('[auth] baseUrl', { baseUrl: baseUrl || null })
    }
  } catch {
    // ignore
  }

  return { baseUrl }
}

