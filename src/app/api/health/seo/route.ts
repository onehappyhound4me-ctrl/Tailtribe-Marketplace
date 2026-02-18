import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function pick(name: string) {
  const v = String(process.env[name] ?? '').trim()
  return v ? v : null
}

async function fetchStatus(url: string) {
  const startedAt = Date.now()
  try {
    const res = await fetch(url, { cache: 'no-store' })
    const text = await res.text().catch(() => '')
    return {
      ok: res.ok,
      status: res.status,
      contentType: res.headers.get('content-type'),
      bytes: text.length,
      tookMs: Date.now() - startedAt,
      sample: text.slice(0, 1200),
    }
  } catch (e: any) {
    return {
      ok: false,
      status: 0,
      contentType: null,
      bytes: 0,
      tookMs: Date.now() - startedAt,
      error: String(e?.message ?? e ?? ''),
      sample: '',
    }
  }
}

export async function GET() {
  const appUrl = (process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be').replace(/\/+$/, '')
  const robotsUrl = new URL('/robots.txt', appUrl).toString()
  const sitemapUrl = new URL('/sitemap.xml', appUrl).toString()

  const [robots, sitemap] = await Promise.all([fetchStatus(robotsUrl), fetchStatus(sitemapUrl)])

  const payload = {
    ok: Boolean(robots.ok && sitemap.ok),
    canonicalBase: appUrl,
    endpoints: { robotsUrl, sitemapUrl },
    robots: {
      ok: robots.ok,
      status: robots.status,
      tookMs: robots.tookMs,
      bytes: robots.bytes,
      sample: robots.sample,
    },
    sitemap: {
      ok: sitemap.ok,
      status: sitemap.status,
      tookMs: sitemap.tookMs,
      bytes: sitemap.bytes,
      sample: sitemap.sample,
    },
    build: {
      vercelEnv: pick('VERCEL_ENV'),
      vercelUrl: pick('VERCEL_URL'),
      gitCommitSha: pick('VERCEL_GIT_COMMIT_SHA'),
      gitCommitRef: pick('VERCEL_GIT_COMMIT_REF'),
      deploymentId: pick('VERCEL_DEPLOYMENT_ID'),
      region: pick('VERCEL_REGION'),
    },
    now: new Date().toISOString(),
  }

  return NextResponse.json(payload, { headers: { 'Cache-Control': 'no-store, max-age=0' } })
}

