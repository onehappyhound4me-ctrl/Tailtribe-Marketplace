import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

/** Production diagnostics: require AUTH_HEALTH_TOKEN + x-auth-health-token header. */
export function requireAuthHealthToken(req: NextRequest): NextResponse | null {
  if (process.env.NODE_ENV !== 'production') return null

  const expected = (process.env.AUTH_HEALTH_TOKEN ?? '').trim()
  const provided = (req.headers.get('x-auth-health-token') ?? '').trim()
  if (!expected || provided !== expected) {
    return NextResponse.json({ error: 'Not Found' }, { status: 404 })
  }
  return null
}
