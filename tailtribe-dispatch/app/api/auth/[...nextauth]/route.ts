import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { handlers } from '@/lib/auth'

// Force node runtime (bcrypt incompatible with Edge)
export const runtime = 'nodejs'

function ensureAuthEnv(req: NextRequest) {
  // Ensure URL env vars match the current host.
  //
  // NextAuth v5 (Auth.js) may use AUTH_URL internally; many setups still use NEXTAUTH_URL.
  // If either is set to a different domain (custom domain vs vercel.app preview/prod),
  // OAuth can fail with "Configuration".
  const origin = req.nextUrl.origin
  if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL !== origin) {
    process.env.NEXTAUTH_URL = origin
  }
  if (!process.env.AUTH_URL || process.env.AUTH_URL !== origin) {
    process.env.AUTH_URL = origin
  }

  // If NEXTAUTH_SECRET is missing, return a clear error instead of NextAuth's generic 500.
  if (!process.env.NEXTAUTH_SECRET && process.env.AUTH_SECRET) {
    process.env.NEXTAUTH_SECRET = process.env.AUTH_SECRET
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
  if (String(process.env.NEXTAUTH_SECRET).trim().length < 32) {
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
  const envError = ensureAuthEnv(req)
  if (envError) return envError
  return handlers.GET(req)
}

export async function POST(req: NextRequest) {
  const envError = ensureAuthEnv(req)
  if (envError) return envError
  return handlers.POST(req)
}
