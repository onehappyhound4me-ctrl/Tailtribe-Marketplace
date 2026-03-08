import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { handlers } from '@/lib/auth'

// Force node runtime (bcrypt incompatible with Edge)
export const runtime = 'nodejs'

function ensureAuthEnv() {
  const isDev = process.env.NODE_ENV === 'development'

  // Do NOT call applyAuthBaseUrlEnv() here — the route handler already set AUTH_URL/NEXTAUTH_URL
  // from the request origin. Re-applying without reqOrigin would overwrite with env and break
  // OAuth callback on tailtribe.be when env points to vercel.app or differs.

  // Development convenience:
  // For local + iPhone testing we don't want /api/auth/session to hard-fail.
  // If no secret is set (or it's too short), use a dev-only fallback.
  if (isDev) {
    const fallbackSecret = 'dev-only-nextauth-secret-please-change-32chars-minimum'
    if (!process.env.NEXTAUTH_SECRET && process.env.AUTH_SECRET) {
      process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET.trim()
    }
    if (!process.env.NEXTAUTH_SECRET) {
      process.env.NEXTAUTH_SECRET = fallbackSecret
    }
    process.env.NEXTAUTH_SECRET = String(process.env.NEXTAUTH_SECRET).trim()
    if (process.env.NEXTAUTH_SECRET.length < 32) {
      process.env.NEXTAUTH_SECRET = fallbackSecret
    }
    return null
  }

  // If NEXTAUTH_SECRET is missing, return a clear error instead of NextAuth's generic 500.
  if (!process.env.NEXTAUTH_SECRET && process.env.AUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET.trim()
  }

  if (!process.env.NEXTAUTH_SECRET) {
    return NextResponse.json(
      {
        error: 'NEXTAUTH_SECRET ontbreekt',
        fix: 'Zet NEXTAUTH_SECRET (of AUTH_SECRET) in Vercel Environment Variables voor Production (en redeploy).',
      },
      { status: 500 }
    )
  }

  // Auth.js / NextAuth v5 requires a sufficiently long secret (otherwise you typically get "Configuration").
  // We surface a clear error to avoid a confusing redirect loop to /login?error=Configuration.
  // Also auto-trim (users sometimes paste with spaces/newlines in Vercel).
  process.env.NEXTAUTH_SECRET = String(process.env.NEXTAUTH_SECRET).trim()
  if (process.env.NEXTAUTH_SECRET.length < 32) {
    return NextResponse.json(
      {
        error: 'NEXTAUTH_SECRET is te kort (minstens 32 tekens vereist)',
        fix: 'Genereer een nieuwe secret (32+ tekens) en zet die in Vercel (NEXTAUTH_SECRET of AUTH_SECRET), daarna redeploy.',
      },
      { status: 500 }
    )
  }

  return null
}

/** Set AUTH_URL/NEXTAUTH_URL from the incoming request so OAuth callback URL is always correct (e.g. https://tailtribe.be). */
function setAuthUrlFromRequest(req: NextRequest): void {
  const forwardedProto = (req.headers.get('x-forwarded-proto') ?? '').split(',')[0]?.trim()
  const forwardedHost = (req.headers.get('x-forwarded-host') ?? '').split(',')[0]?.trim()
  const host = forwardedHost || req.headers.get('host') || req.nextUrl.host
  const proto = forwardedProto || req.nextUrl.protocol.replace(':', '') || 'https'
  const origin = host ? `${proto}://${host}` : req.nextUrl.origin
  const base = origin.replace(/\/+$/, '')
  process.env.AUTH_URL = base
  process.env.NEXTAUTH_URL = base
  process.env.AUTH_TRUST_HOST = 'true'
}

export async function GET(req: NextRequest) {
  try {
    setAuthUrlFromRequest(req)
  } catch (err: any) {
    return NextResponse.json(
      {
        error: 'Invalid AUTH_URL/NEXTAUTH_URL: must not end with \'/\'',
        message: err?.message ?? String(err),
        fix: 'Zet AUTH_URL en NEXTAUTH_URL zonder trailing slash. Voorbeeld: https://tailtribe.be',
      },
      { status: 500 }
    )
  }
  const envError = ensureAuthEnv()
  if (envError) return envError
  return handlers.GET(req)
}

export async function POST(req: NextRequest) {
  try {
    setAuthUrlFromRequest(req)
  } catch (err: any) {
    return NextResponse.json(
      {
        error: 'Invalid AUTH_URL/NEXTAUTH_URL: must not end with \'/\'',
        message: err?.message ?? String(err),
        fix: 'Zet AUTH_URL en NEXTAUTH_URL zonder trailing slash. Voorbeeld: https://tailtribe.be',
      },
      { status: 500 }
    )
  }
  const envError = ensureAuthEnv()
  if (envError) return envError
  return handlers.POST(req)
}
