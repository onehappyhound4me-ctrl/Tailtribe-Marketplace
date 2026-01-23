import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { handlers } from '@/lib/auth'

// Force node runtime (bcrypt incompatible with Edge)
export const runtime = 'nodejs'

function ensureAuthEnv(req: NextRequest) {
  // Ensure NEXTAUTH_URL matches the current host (Vercel preview/prod domains, custom domains during DNS changes).
  const origin = req.nextUrl.origin
  if (!process.env.NEXTAUTH_URL || process.env.NEXTAUTH_URL !== origin) {
    process.env.NEXTAUTH_URL = origin
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
