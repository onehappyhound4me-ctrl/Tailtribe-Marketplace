import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function pick(name: string) {
  const v = String(process.env[name] ?? '').trim()
  return v ? v : null
}

export async function GET() {
  // Safe, minimal deployment info to confirm what version is live.
  const payload = {
    app: 'tailtribe-dispatch',
    nodeEnv: pick('NODE_ENV'),
    vercel: {
      url: pick('VERCEL_URL'),
      env: pick('VERCEL_ENV'),
      gitCommitSha: pick('VERCEL_GIT_COMMIT_SHA'),
      gitCommitRef: pick('VERCEL_GIT_COMMIT_REF'),
      deploymentId: pick('VERCEL_DEPLOYMENT_ID'),
      region: pick('VERCEL_REGION'),
    },
    configured: {
      nextPublicAppUrl: pick('NEXT_PUBLIC_APP_URL'),
      hasGaId: Boolean(pick('NEXT_PUBLIC_GA_ID')),
      hasGtmId: Boolean(pick('NEXT_PUBLIC_GTM_ID')),
      hasDatabaseUrl: Boolean(pick('DATABASE_URL')),
      hasNextAuthSecret: Boolean(pick('NEXTAUTH_SECRET')),
      hasResendKey: Boolean(pick('RESEND_API_KEY')),
      hasSmtpHost: Boolean(pick('SMTP_HOST')),
    },
    now: new Date().toISOString(),
  }

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}

