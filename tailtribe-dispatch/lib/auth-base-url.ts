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
  const origin = (input.reqOrigin ?? '').trim()

  // Production safety net:
  // If AUTH_URL/NEXTAUTH_URL (or the request) still point to a *.vercel.app host, but the app is served
  // on a custom domain, force the custom domain using NEXT_PUBLIC_APP_URL (used throughout the app).
  // This avoids OAuth "Configuration" errors caused by callback URLs being generated on the wrong host.
  const isProd = process.env.NODE_ENV === 'production'
  const publicAppUrlRaw = (process.env.NEXT_PUBLIC_APP_URL ?? '').toString().trim()
  const publicAppUrl = publicAppUrlRaw ? normalizeNoTrailingSlash(publicAppUrlRaw) : ''
  if (isProd && publicAppUrl) {
    const publicHost = safeHost(publicAppUrl)
    const envHost = fromEnv ? safeHost(fromEnv) : null
    const reqHost = origin ? safeHost(origin) : null
    if (publicHost && !publicHost.endsWith('.vercel.app') && (envHost?.endsWith('.vercel.app') || reqHost?.endsWith('.vercel.app'))) {
      return publicAppUrl
    }
  }

  // If we have BOTH an env URL and a request origin, prefer the request origin when the env URL
  // is still the Vercel preview domain (e.g. tailtribe-dispatch.vercel.app) but the request came
  // in on the custom domain (e.g. tailtribe.be). This prevents OAuth "Configuration" errors where
  // NextAuth generates callback URLs on the wrong host.
  if (fromEnv && origin) {
    const envHost = safeHost(fromEnv)
    const reqHost = safeHost(origin)
    if (envHost?.endsWith('.vercel.app') && reqHost && !reqHost.endsWith('.vercel.app')) {
      return normalizeNoTrailingSlash(origin)
    }
    return normalizeNoTrailingSlash(fromEnv)
  }

  if (fromEnv) return normalizeNoTrailingSlash(fromEnv)
  if (origin) return normalizeNoTrailingSlash(origin)

  // No base URL available; leave empty and let Auth.js handle it (will likely error).
  return ''
}

function safeHost(url: string) {
  try {
    return new URL(url).hostname.toLowerCase()
  } catch {
    return null
  }
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

