import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/lib/prisma'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function getDatabaseUrlInfo() {
  const raw = (process.env.DATABASE_URL ?? '').toString().trim()
  if (!raw) return null
  try {
    const u = new URL(raw)
    const dbName = (u.pathname || '').replace(/^\//, '') || null
    return {
      protocol: u.protocol.replace(':', ''),
      host: u.hostname || null,
      port: u.port ? Number(u.port) : null,
      database: dbName,
      // do NOT return username/password/query (secrets)
    }
  } catch {
    // If it's not a valid URL, don't leak raw value.
    return { protocol: null, host: null, port: null, database: null }
  }
}

export async function GET(req: NextRequest) {
  // Safety: this is a diagnostics endpoint. In production, require a token.
  // (Avoid exposing env/db details publicly.)
  if (process.env.NODE_ENV === 'production') {
    const expected = (process.env.AUTH_HEALTH_TOKEN ?? '').trim()
    const provided = (req.headers.get('x-auth-health-token') ?? '').trim()
    if (!expected || provided !== expected) {
      return NextResponse.json({ error: 'Not Found' }, { status: 404 })
    }
  }

  const origin = req.nextUrl.origin
  const meta = {
    now: new Date().toISOString(),
    health_version: '2026-01-23T14:33Z',
    vercel: {
      VERCEL: process.env.VERCEL ?? null,
      VERCEL_ENV: process.env.VERCEL_ENV ?? null,
      VERCEL_URL: process.env.VERCEL_URL ?? null,
      VERCEL_REGION: process.env.VERCEL_REGION ?? null,
      VERCEL_GIT_COMMIT_SHA: process.env.VERCEL_GIT_COMMIT_SHA ?? null,
      VERCEL_GIT_COMMIT_REF: process.env.VERCEL_GIT_COMMIT_REF ?? null,
      VERCEL_GIT_REPO_SLUG: process.env.VERCEL_GIT_REPO_SLUG ?? null,
    },
  }

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

  const dbUrlInfo = getDatabaseUrlInfo()

  let db = {
    ok: false as boolean,
    error: null as string | null,
    hasUserTable: null as boolean | null,
  }
  try {
    // Works for Postgres + SQLite
    await prisma.$queryRaw`SELECT 1`
    db.ok = true
    // Postgres: checks if the "User" table exists (Prisma default mapping for model User).
    try {
      const rows = await prisma.$queryRaw<{ regclass: string | null }[]>`
        SELECT to_regclass('public."User"') as regclass
      `
      db.hasUserTable = Boolean(rows?.[0]?.regclass)
    } catch {
      db.hasUserTable = null
    }
  } catch (err: any) {
    db.ok = false
    db.error = (err?.message ?? String(err)).slice(0, 500)
  }

  return NextResponse.json(
    {
      meta,
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
      dbUrlInfo,
    db,
    last_nextauth_error: (globalThis as any).__tt_last_nextauth_error ?? null,
      last_auth_exception: (globalThis as any).__tt_last_auth_exception ?? null,
    },
    {
      headers: {
        'Cache-Control': 'no-store, max-age=0',
      },
    }
  )
}

