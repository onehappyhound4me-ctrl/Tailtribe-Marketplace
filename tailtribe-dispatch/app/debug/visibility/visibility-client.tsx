'use client'

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { COOKIE_CONSENT_STORAGE_KEY } from '@/lib/cookie-consent'
import { getLastTrackedEvents, trackEvent } from '@/lib/analytics'

type SeoHealth = any

function formatTs(ts: number) {
  try {
    return new Date(ts).toLocaleString('nl-BE')
  } catch {
    return String(ts)
  }
}

function safeJson(value: any) {
  try {
    return JSON.stringify(value, null, 2)
  } catch {
    return String(value)
  }
}

export function VisibilityDebugClient() {
  const [seoHealth, setSeoHealth] = useState<SeoHealth | null>(null)
  const [seoHealthError, setSeoHealthError] = useState<string | null>(null)
  const [eventsTick, setEventsTick] = useState(0)

  const utm = useMemo(() => {
    if (typeof window === 'undefined') return null
    const sp = new URLSearchParams(window.location.search)
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term']
    const out: Record<string, string> = {}
    for (const k of keys) {
      const v = sp.get(k)
      if (v) out[k] = v
    }
    return Object.keys(out).length ? out : null
  }, [])

  useEffect(() => {
    let alive = true
    ;(async () => {
      try {
        const res = await fetch('/api/health/seo', { cache: 'no-store' })
        const json = await res.json().catch(() => null)
        if (!alive) return
        if (!res.ok) {
          setSeoHealthError(`HTTP ${res.status}`)
          setSeoHealth(json)
          return
        }
        setSeoHealth(json)
      } catch (e: any) {
        if (!alive) return
        setSeoHealthError(String(e?.message ?? e ?? 'Unknown error'))
      }
    })()
    return () => {
      alive = false
    }
  }, [])

  // Refresh local event list (in-memory buffer).
  useEffect(() => {
    const id = window.setInterval(() => setEventsTick((x) => x + 1), 1000)
    return () => window.clearInterval(id)
  }, [])

  const consent =
    typeof window !== 'undefined' ? window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY) : null
  const gaId = (process.env.NEXT_PUBLIC_GA_ID ?? '').trim()
  const gtmId = (process.env.NEXT_PUBLIC_GTM_ID ?? '').trim()

  const gtagType = typeof (window as any)?.gtag
  const lastEvents = typeof window !== 'undefined' ? getLastTrackedEvents(20) : []

  return (
    <div className="space-y-6">
      <section className="rounded-2xl border border-black/5 bg-gradient-to-br from-emerald-50 via-white to-blue-50 p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">1) Environment & traffic signals</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-white/80 border border-black/5 p-3">
            <div className="text-xs text-gray-500">Hostname</div>
            <div className="font-mono break-all">{typeof window !== 'undefined' ? window.location.host : ''}</div>
          </div>
          <div className="rounded-xl bg-white/80 border border-black/5 p-3">
            <div className="text-xs text-gray-500">Path</div>
            <div className="font-mono break-all">
              {typeof window !== 'undefined' ? window.location.pathname + window.location.search : ''}
            </div>
          </div>
          <div className="rounded-xl bg-white/80 border border-black/5 p-3">
            <div className="text-xs text-gray-500">Referrer</div>
            <div className="font-mono break-all">
              {typeof document !== 'undefined' ? document.referrer || '(none)' : ''}
            </div>
          </div>
          <div className="rounded-xl bg-white/80 border border-black/5 p-3">
            <div className="text-xs text-gray-500">UTM</div>
            <div className="font-mono break-all">{utm ? safeJson(utm) : '(none)'}</div>
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-black/5 bg-white p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">2) SEO health (server check)</h2>
        {seoHealthError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800 text-sm mb-3">
            Error: {seoHealthError}
          </div>
        ) : null}
        {!seoHealth ? (
          <div className="text-sm text-gray-600">Laden...</div>
        ) : (
          <div className="space-y-3 text-sm">
            <div className="grid sm:grid-cols-2 gap-3">
              <div className="rounded-xl bg-gray-50 border border-black/5 p-3">
                <div className="text-xs text-gray-500">canonicalBase</div>
                <div className="font-mono break-all">{String(seoHealth.canonicalBase ?? '')}</div>
              </div>
              <div className="rounded-xl bg-gray-50 border border-black/5 p-3">
                <div className="text-xs text-gray-500">build</div>
                <div className="font-mono break-all">
                  {String(seoHealth?.build?.gitCommitSha ?? '(no sha)')}
                </div>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 border border-black/5 p-3">
              <div className="font-semibold text-gray-900 mb-1">robots.txt</div>
              <div className="font-mono break-all text-xs">
                ok={String(seoHealth?.robots?.ok)} status={String(seoHealth?.robots?.status)} tookMs=
                {String(seoHealth?.robots?.tookMs)} hasSitemapDirective=
                {String(seoHealth?.robots?.hasSitemapDirective)}
              </div>
              <div className="mt-2 flex flex-wrap gap-2">
                <Link className="text-emerald-700 hover:underline text-sm" href="/robots.txt">
                  Open /robots.txt
                </Link>
                <Link className="text-emerald-700 hover:underline text-sm" href="/sitemap.xml">
                  Open /sitemap.xml
                </Link>
              </div>
            </div>

            <div className="rounded-xl bg-gray-50 border border-black/5 p-3">
              <div className="font-semibold text-gray-900 mb-1">sitemap.xml</div>
              <div className="font-mono break-all text-xs">
                ok={String(seoHealth?.sitemap?.ok)} status={String(seoHealth?.sitemap?.status)} tookMs=
                {String(seoHealth?.sitemap?.tookMs)} urlCountSample={String(seoHealth?.sitemap?.urlCountSample)}
              </div>
            </div>
          </div>
        )}
      </section>

      <section className="rounded-2xl border border-black/5 bg-white p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">3) Analytics proof (client)</h2>
        <div className="grid sm:grid-cols-2 gap-3 text-sm">
          <div className="rounded-xl bg-gray-50 border border-black/5 p-3">
            <div className="text-xs text-gray-500">Consent</div>
            <div className="font-mono">{String(consent)}</div>
          </div>
          <div className="rounded-xl bg-gray-50 border border-black/5 p-3">
            <div className="text-xs text-gray-500">gtag type</div>
            <div className="font-mono">{String(gtagType)}</div>
          </div>
          <div className="rounded-xl bg-gray-50 border border-black/5 p-3">
            <div className="text-xs text-gray-500">GA ID</div>
            <div className="font-mono">{gaId ? gaId : '(missing)'}</div>
          </div>
          <div className="rounded-xl bg-gray-50 border border-black/5 p-3">
            <div className="text-xs text-gray-500">GTM ID</div>
            <div className="font-mono">{gtmId ? gtmId : '(missing)'}</div>
          </div>
        </div>

        <div className="mt-4 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={() => trackEvent('debug_visibility_test', { where: '/debug/visibility', tick: Date.now() })}
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition text-sm font-semibold"
          >
            Fire test event
          </button>
          <Link
            href="/?debugga=1"
            className="inline-flex items-center justify-center px-4 py-2 rounded-xl border border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-50 transition text-sm font-semibold"
          >
            Open GA debug badge
          </Link>
        </div>

        <div className="mt-4 rounded-2xl border border-black/5 bg-gray-50 p-3">
          <div className="font-semibold text-gray-900 mb-2">Last tracked events (in-memory)</div>
          {lastEvents.length === 0 ? (
            <div className="text-sm text-gray-600">(none yet)</div>
          ) : (
            <div className="space-y-2">
              {lastEvents.map((e) => (
                <div key={`${e.ts}-${e.event}`} className="rounded-xl bg-white border border-black/5 p-2">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="font-mono text-xs text-gray-600">{formatTs(e.ts)}</div>
                    <div className="font-mono text-xs font-semibold text-gray-900">{e.event}</div>
                  </div>
                  <pre className="mt-2 text-[11px] leading-relaxed whitespace-pre-wrap break-words font-mono text-gray-700">
                    {safeJson(e.params)}
                  </pre>
                </div>
              ))}
            </div>
          )}
          <div className="sr-only">tick {eventsTick}</div>
        </div>
      </section>

      <section className="rounded-2xl border border-black/5 bg-white p-4 sm:p-6">
        <h2 className="text-lg sm:text-xl font-semibold text-gray-900 mb-3">4) Quick checks</h2>
        <ul className="list-disc pl-5 space-y-2 text-sm text-gray-700">
          <li>
            Search Console: dien <code className="font-mono">/sitemap.xml</code> in.
          </li>
          <li>
            Google check: zoek op <code className="font-mono">site:tailtribe.be</code> (kan dagen/weken duren bij nieuwe
            content).
          </li>
          <li>
            Bekijk welke pagina’s Google kent via Search Console → Indexering → Pagina’s.
          </li>
        </ul>
      </section>
    </div>
  )
}

