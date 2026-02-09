// Canonical route helpers (avoid stringly-typed navigation + accidental "/" fallbacks).

function normalizeSlug(slug: unknown) {
  return String(slug ?? '').trim()
}

export const routes = {
  home: '/',

  // Services
  diensten: '/diensten',
  dienst(slug: unknown) {
    const s = normalizeSlug(slug)
    if (!s) {
      // Never silently fall back to home. In dev: fail fast; in prod: go to services index.
      if (process.env.NODE_ENV !== 'production') {
        throw new Error('routes.dienst(slug): slug is empty')
      }
      return '/diensten'
    }
    return `/diensten/${encodeURIComponent(s)}`
  },
} as const

