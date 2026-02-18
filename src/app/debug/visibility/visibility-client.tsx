'use client'

import { useEffect, useMemo, useState } from 'react'

type SeoHealth = {
  ok: boolean
  canonicalBase: string
  endpoints: { robotsUrl: string; sitemapUrl: string }
  robots: { ok: boolean; status: number; tookMs: number; bytes: number }
  sitemap: { ok: boolean; status: number; tookMs: number; bytes: number }
  build?: Record<string, string | null>
  now: string
}

type DebugEvent = { ts: number; event: string; params?: Record<string, any> }

declare global {
  interface Window {
    __tt_debug_events?: DebugEvent[]
  }
}

function readUtm() {
  if (typeof window === 'undefined') return {}
  const p = new URLSearchParams(window.location.search)
  const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content', 'gclid', 'fbclid', 'msclkid']
  const out: Record<string, string> = {}
  for (const k of keys) {
    const v = p.get(k)
    if (v) out[k] = v.slice(0, 120)
  }
  return out
}

function recordDebugEvent(event: string, params: Record<string, any> = {}) {
  if (typeof window === 'undefined') return
  const list = Array.isArray(window.__tt_debug_events) ? window.__tt_debug_events : []
  const next: DebugEvent[] = [{ ts: Date.now(), event, params }, ...list].slice(0, 20)
  window.__tt_debug_events = next
}

export function VisibilityDebugClient() {
  const [seo, setSeo] = useState<SeoHealth | null>(null)
  const [seoError, setSeoError] = useState<string | null>(null)
  const [clientInfo, setClientInfo] = useState<{ href: string; referrer: string } | null>(null)

  const utm = useMemo(() => readUtm(), [])

  useEffect(() => {
    if (typeof window === 'undefined') return
    setClientInfo({ href: window.location.href, referrer: document.referrer || '' })
  }, [])

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const res = await fetch('/api/health/seo', { cache: 'no-store' })
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const json = (await res.json()) as SeoHealth
        if (!cancelled) setSeo(json)
      } catch (e: any) {
        if (!cancelled) setSeoError(String(e?.message ?? e ?? 'unknown error'))
      }
    })()
    return () => {
      cancelled = true
    }
  }, [])

  const events = typeof window === 'undefined' ? [] : (window.__tt_debug_events ?? [])

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        <div className="rounded-xl border border-black/5 p-4">
          <div className="text-sm font-semibold text-gray-900 mb-2">Client</div>
          <div className="text-sm text-gray-700 space-y-1">
            <div>
              <span className="text-gray-500">URL</span>: <span className="font-mono break-all">{clientInfo?.href ?? '...'}</span>
            </div>
            <div>
              <span className="text-gray-500">Referrer</span>:{' '}
              <span className="font-mono break-all">{clientInfo?.referrer ?? '(none)'}</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-black/5 p-4">
          <div className="text-sm font-semibold text-gray-900 mb-2">UTM / Ads params</div>
          <pre className="text-xs bg-gray-50 rounded-lg p-3 overflow-auto border border-black/5">
            {JSON.stringify(utm, null, 2)}
          </pre>
        </div>
      </div>

      <div className="rounded-xl border border-black/5 p-4">
        <div className="text-sm font-semibold text-gray-900 mb-2">SEO health</div>
        {seoError ? <div className="text-sm text-red-700">Error: {seoError}</div> : null}
        {!seo && !seoError ? <div className="text-sm text-gray-600">Loading...</div> : null}
        {seo ? (
          <div className="text-sm text-gray-700 space-y-2">
            <div>
              <span className="text-gray-500">ok</span>: <span className={seo.ok ? 'text-emerald-700' : 'text-red-700'}>{String(seo.ok)}</span>
            </div>
            <div>
              <span className="text-gray-500">canonicalBase</span>: <span className="font-mono">{seo.canonicalBase}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <div className="rounded-lg bg-gray-50 border border-black/5 p-3">
                <div className="font-semibold">robots.txt</div>
                <div>
                  status: <span className="font-mono">{seo.robots.status}</span> ({seo.robots.tookMs}ms)
                </div>
                <div>
                  url: <span className="font-mono break-all">{seo.endpoints.robotsUrl}</span>
                </div>
              </div>
              <div className="rounded-lg bg-gray-50 border border-black/5 p-3">
                <div className="font-semibold">sitemap.xml</div>
                <div>
                  status: <span className="font-mono">{seo.sitemap.status}</span> ({seo.sitemap.tookMs}ms)
                </div>
                <div>
                  url: <span className="font-mono break-all">{seo.endpoints.sitemapUrl}</span>
                </div>
              </div>
            </div>
            <details className="mt-2">
              <summary className="cursor-pointer text-gray-800">Build info</summary>
              <pre className="text-xs bg-gray-50 rounded-lg p-3 overflow-auto border border-black/5 mt-2">
                {JSON.stringify(seo.build ?? {}, null, 2)}
              </pre>
            </details>
          </div>
        ) : null}
      </div>

      <div className="rounded-xl border border-black/5 p-4">
        <div className="flex items-center justify-between gap-3">
          <div className="text-sm font-semibold text-gray-900">Debug events (local)</div>
          <button
            type="button"
            className="px-3 py-2 rounded-lg text-sm font-medium bg-emerald-600 text-white hover:bg-emerald-700"
            onClick={() => recordDebugEvent('test_event', { where: '/debug/visibility', ...utm })}
          >
            Fire test event
          </button>
        </div>
        <div className="mt-3">
          <pre className="text-xs bg-gray-50 rounded-lg p-3 overflow-auto border border-black/5">
            {JSON.stringify(events, null, 2)}
          </pre>
        </div>
      </div>
    </div>
  )
}

