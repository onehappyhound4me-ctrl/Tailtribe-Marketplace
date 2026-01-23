import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { handlers } from '@/lib/auth'

// Force node runtime (bcrypt incompatible with Edge)
export const runtime = 'nodejs'

function normalizeUrl(value?: string | null) {
  const v = String(value ?? '').trim()
  if (!v) return null
  // Important: avoid trailing slash differences (can cause "Configuration" in Auth.js)
  return v.replace(/\/+$/, '')
}

function ensureAuthEnv() {
  // Normalize URL env vars (no per-request mutation; rely on Vercel env vars).
  const nextauthUrl = normalizeUrl(process.env.NEXTAUTH_URL)
  const authUrl = normalizeUrl(process.env.AUTH_URL)
  if (!nextauthUrl && authUrl) process.env.NEXTAUTH_URL = authUrl
  if (!authUrl && nextauthUrl) process.env.AUTH_URL = nextauthUrl
  if (process.env.NEXTAUTH_URL) process.env.NEXTAUTH_URL = normalizeUrl(process.env.NEXTAUTH_URL) ?? ''
  if (process.env.AUTH_URL) process.env.AUTH_URL = normalizeUrl(process.env.AUTH_URL) ?? ''

  // Extra safety for Auth.js host validation.
  if (!process.env.AUTH_TRUST_HOST) process.env.AUTH_TRUST_HOST = 'true'

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
  const envError = ensureAuthEnv()
  if (envError) return envError
  return handlers.GET(req)
}

export async function POST(req: NextRequest) {
  const envError = ensureAuthEnv()
  if (envError) return envError
  return handlers.POST(req)
}
