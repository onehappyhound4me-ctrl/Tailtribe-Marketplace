import { NextResponse } from 'next/server'
import { getPublicAppUrl } from '@/lib/env'

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
    const contentType = res.headers.get('content-type')
    const text = await res.text().catch(() => '')
    return {
      ok: res.ok,
      status: res.status,
      contentType,
      bytes: text.length,
      tookMs: Date.now() - startedAt,
      sample: text.slice(0, 5000),
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
  const appUrl = getPublicAppUrl()
  const robotsUrl = new URL('/robots.txt', appUrl).toString()
  const sitemapUrl = new URL('/sitemap.xml', appUrl).toString()

  const [robots, sitemap] = await Promise.all([fetchStatus(robotsUrl), fetchStatus(sitemapUrl)])

  const robotsHasSitemap =
    robots.sample.toLowerCase().includes('sitemap:') && robots.sample.toLowerCase().includes('/sitemap.xml')

  const sitemapUrlCount = (() => {
    // Cheap signal: number of <url> entries.
    const m = sitemap.sample.match(/<url>/g)
    return m ? m.length : 0
  })()

  const payload = {
    ok: robots.ok && sitemap.ok,
    canonicalBase: appUrl,
    endpoints: {
      robotsUrl,
      sitemapUrl,
    },
    robots: {
      ok: robots.ok,
      status: robots.status,
      contentType: robots.contentType,
      tookMs: robots.tookMs,
      bytes: robots.bytes,
      hasSitemapDirective: robotsHasSitemap,
      sample: robots.sample.slice(0, 1200),
    },
    sitemap: {
      ok: sitemap.ok,
      status: sitemap.status,
      contentType: sitemap.contentType,
      tookMs: sitemap.tookMs,
      bytes: sitemap.bytes,
      urlCountSample: sitemapUrlCount,
      sample: sitemap.sample.slice(0, 1200),
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

  return NextResponse.json(payload, {
    headers: { 'Cache-Control': 'no-store, max-age=0' },
  })
}

import { NextResponse } from 'next/server'
import { getPublicAppUrl } from '@/lib/env'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function pick(name: string) {
  const v = String(process.env[name] ?? '').trim()
  return v ? v : null
}

async function fetchWithTimeout(url: string, opts: RequestInit & { timeoutMs?: number } = {}) {
  const timeoutMs = opts.timeoutMs ?? 4000
  const controller = new AbortController()
  const id = setTimeout(() => controller.abort(), timeoutMs)
  try {
    const res = await fetch(url, {
      ...opts,
      signal: controller.signal,
      cache: 'no-store',
      redirect: 'follow',
      headers: {
        ...(opts.headers ?? {}),
        'user-agent': 'TailTribeSeoHealth/1.0 (+https://tailtribe.be)',
      },
    })
    return {
      ok: res.ok,
      status: res.status,
      contentType: res.headers.get('content-type'),
      cacheControl: res.headers.get('cache-control'),
    }
  } catch (e: any) {
    return {
      ok: false,
      status: 0,
      error: String(e?.name ?? e?.message ?? e ?? 'fetch_failed').slice(0, 180),
    }
  } finally {
    clearTimeout(id)
  }
}

export async function GET() {
  const appUrl = getPublicAppUrl()
  const robotsUrl = new URL('/robots.txt', appUrl).toString()
  const sitemapUrl = new URL('/sitemap.xml', appUrl).toString()

  const [robots, sitemap] = await Promise.all([
    fetchWithTimeout(robotsUrl, { method: 'GET', timeoutMs: 5000 }),
    fetchWithTimeout(sitemapUrl, { method: 'GET', timeoutMs: 5000 }),
  ])

  const payload = {
    ok: Boolean(robots.ok && sitemap.ok),
    appUrl,
    seo: {
      robots: { url: robotsUrl, ...robots },
      sitemap: { url: sitemapUrl, ...sitemap },
    },
    build: {
      vercel: {
        env: pick('VERCEL_ENV'),
        url: pick('VERCEL_URL'),
        gitCommitSha: pick('VERCEL_GIT_COMMIT_SHA'),
        gitCommitRef: pick('VERCEL_GIT_COMMIT_REF'),
        deploymentId: pick('VERCEL_DEPLOYMENT_ID'),
        region: pick('VERCEL_REGION'),
      },
    },
    now: new Date().toISOString(),
  }

  return NextResponse.json(payload, {
    headers: {
      'Cache-Control': 'no-store, max-age=0',
    },
  })
}

