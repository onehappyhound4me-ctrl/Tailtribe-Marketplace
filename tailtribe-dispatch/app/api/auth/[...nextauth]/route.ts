import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { handlers } from '@/lib/auth'
import { applyAuthBaseUrlEnv } from '@/lib/auth-base-url'

// Force node runtime (bcrypt incompatible with Edge)
export const runtime = 'nodejs'

function ensureAuthEnv() {
  const isDev = process.env.NODE_ENV === 'development'

  // NOTE: we intentionally validate/normalize the base URL centrally.
  // If AUTH_URL or NEXTAUTH_URL ends with '/', we throw a clear error (prevents vague "Configuration").
  applyAuthBaseUrlEnv()

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

export async function GET(req: NextRequest) {
  try {
    // Use the *real* public origin as fallback (important on Vercel custom domains).
    // nextUrl.origin can still reflect the internal *.vercel.app host in some setups.
    const forwardedProto = (req.headers.get('x-forwarded-proto') ?? '').split(',')[0]?.trim()
    const forwardedHost = (req.headers.get('x-forwarded-host') ?? '').split(',')[0]?.trim()
    const host = forwardedHost || req.headers.get('host') || req.nextUrl.host
    const proto = forwardedProto || req.nextUrl.protocol.replace(':', '') || 'https'
    const reqOrigin = host ? `${proto}://${host}` : req.nextUrl.origin
    applyAuthBaseUrlEnv({ reqOrigin })
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
    const forwardedProto = (req.headers.get('x-forwarded-proto') ?? '').split(',')[0]?.trim()
    const forwardedHost = (req.headers.get('x-forwarded-host') ?? '').split(',')[0]?.trim()
    const host = forwardedHost || req.headers.get('host') || req.nextUrl.host
    const proto = forwardedProto || req.nextUrl.protocol.replace(':', '') || 'https'
    const reqOrigin = host ? `${proto}://${host}` : req.nextUrl.origin
    applyAuthBaseUrlEnv({ reqOrigin })
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
