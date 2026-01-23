import { NextRequest, NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  const origin = req.nextUrl.origin

  const nextauthSecretRaw = process.env.NEXTAUTH_SECRET ?? ''
  const authSecretRaw = process.env.AUTH_SECRET ?? ''
  const wrongNextAuthSecretRaw = (process.env.NEXT_AUTH_SECRET ?? '').toString()
  const effectiveSecret = (nextauthSecretRaw || authSecretRaw || '').toString()
  const effectiveSecretTrimmed = effectiveSecret.trim()

  const googleClientIdRaw = (process.env.GOOGLE_CLIENT_ID ?? '').toString()
  const googleClientSecretRaw = (process.env.GOOGLE_CLIENT_SECRET ?? '').toString()

  const nextauthUrl = (process.env.NEXTAUTH_URL ?? '').toString()
  const authUrl = (process.env.AUTH_URL ?? '').toString()
  const wrongNextAuthUrl = (process.env.NEXT_AUTH_URL ?? '').toString()

  return NextResponse.json({
    origin,
    env: {
      NEXTAUTH_URL: nextauthUrl || null,
      AUTH_URL: authUrl || null,
      NEXT_AUTH_URL: wrongNextAuthUrl || null,
      has_GOOGLE_CLIENT_ID: Boolean(googleClientIdRaw.trim()),
      has_GOOGLE_CLIENT_SECRET: Boolean(googleClientSecretRaw.trim()),
      has_NEXTAUTH_SECRET: Boolean(nextauthSecretRaw),
      has_AUTH_SECRET: Boolean(authSecretRaw),
      has_NEXT_AUTH_SECRET: Boolean(wrongNextAuthSecretRaw),
      effective_secret: {
        source: nextauthSecretRaw ? 'NEXTAUTH_SECRET' : authSecretRaw ? 'AUTH_SECRET' : null,
        length: effectiveSecretTrimmed.length,
        has_leading_or_trailing_whitespace: effectiveSecret !== effectiveSecretTrimmed,
      },
    },
  })
}

