'use client'

import { useEffect, useMemo, useState } from 'react'
import { COOKIE_CONSENT_STORAGE_KEY } from '@/lib/cookie-consent'

type Status = {
  show: boolean
  consent: string | null
  hasGaId: boolean
  gaId: string | null
  gtagType: string
  gtagScriptPresent: boolean
  gtagJsResourceSeen: boolean
  gtagJsLoadFlag: string
  collectResourceSeen: boolean
  dataLayerLen: number
  gaFetchProbe: 'unknown' | 'ok' | 'blocked'
  gaFetchProbeRegion1: 'unknown' | 'ok' | 'blocked'
  gaFetchProbeError: string | null
  lastCspViolation: string | null
  cspConnectSrc: string | null
  cspScriptSrc: string | null
  lastGtagCalls: number
}

export function AnalyticsDebugBadge() {
  const gaId = (process.env.NEXT_PUBLIC_GA_ID ?? '').trim()
  const hasGaId = Boolean(gaId)

  const [status, setStatus] = useState<Status>({
    show: false,
    consent: null,
    hasGaId,
    gaId: hasGaId ? gaId : null,
    gtagType: 'undefined',
    gtagScriptPresent: false,
    gtagJsResourceSeen: false,
    gtagJsLoadFlag: 'unknown',
    collectResourceSeen: false,
    dataLayerLen: 0,
    gaFetchProbe: 'unknown',
    gaFetchProbeRegion1: 'unknown',
    gaFetchProbeError: null,
    lastCspViolation: null,
    cspConnectSrc: null,
    cspScriptSrc: null,
    lastGtagCalls: 0,
  })

  const shouldShow = useMemo(() => {
    if (typeof window === 'undefined') return false
    return new URLSearchParams(window.location.search).has('debugga')
  }, [])

  useEffect(() => {
    if (!shouldShow) return

    const w = window as any

    // Expose a simple "force hit" function for manual testing.
    w.__tt_ga_test = () => {
      try {
        w.gtag?.('event', 'page_view', {
          page_location: window.location.href,
          page_path: window.location.pathname + window.location.search,
          page_title: document.title,
          debug_mode: true,
        })
      } catch (e) {
        console.warn('[analytics] __tt_ga_test failed', e)
      }
    }

    // Wrap gtag to record last calls (debug only).
    try {
      w.__tt_ga_calls = w.__tt_ga_calls ?? []
      if (typeof w.gtag === 'function' && !w.__tt_ga_wrapped) {
        const orig = w.gtag
        w.gtag = (...args: any[]) => {
          try {
            w.__tt_ga_calls.push({ ts: Date.now(), args })
            if (w.__tt_ga_calls.length > 5) w.__tt_ga_calls.splice(0, w.__tt_ga_calls.length - 5)
          } catch {
            // ignore
          }
          return orig(...args)
        }
        w.__tt_ga_wrapped = true
      }
    } catch {
      // ignore
    }

    // Listen for CSP violations to prove whether CSP is blocking GA.
    try {
      if (!w.__tt_csp_listener) {
        const onV = (e: any) => {
          const msg = `${String(e?.effectiveDirective ?? e?.violatedDirective ?? '')} blocked ${String(
            e?.blockedURI ?? ''
          )}`.trim()
          w.__tt_last_csp_violation = msg || 'unknown'
          console.warn('[csp] securitypolicyviolation', {
            blockedURI: e?.blockedURI,
            violatedDirective: e?.violatedDirective,
            effectiveDirective: e?.effectiveDirective,
          })
        }
        window.addEventListener('securitypolicyviolation', onV as any)
        w.__tt_csp_listener = true
      }
    } catch {
      // ignore
    }

    // Read EFFECTIVE CSP header from same-origin response (best effort).
    ;(async () => {
      try {
        const res = await fetch('/', { method: 'HEAD', cache: 'no-store' })
        const csp = res.headers.get('content-security-policy') || ''
        const pick = (directive: string) => {
          const re = new RegExp(`(?:^|;\\s*)${directive}\\s+([^;]+)`, 'i')
          const m = csp.match(re)
          return m?.[1]?.trim() ?? null
        }
        w.__tt_csp_connect_src = pick('connect-src')
        w.__tt_csp_script_src = pick('script-src')
      } catch {
        // ignore
      }
    })()

    // Probe whether the browser is allowed to initiate GA connections (CSP/adblock hint).
    // NOTE: This is not a valid measurement hit (no tid/cid); it's only a connectivity probe.
    ;(async () => {
      try {
        await fetch('https://www.google-analytics.com/g/collect?v=2', { mode: 'no-cors', keepalive: true })
        w.__tt_ga_probe_status = 'ok'
        w.__tt_ga_probe_error = null
      } catch (e) {
        w.__tt_ga_probe_status = 'blocked'
        w.__tt_ga_probe_error = String((e as any)?.message ?? e)
      }
    })()

    ;(async () => {
      try {
        await fetch('https://region1.google-analytics.com/g/collect?v=2', { mode: 'no-cors', keepalive: true })
        w.__tt_ga_probe_region1_status = 'ok'
      } catch {
        w.__tt_ga_probe_region1_status = 'blocked'
      }
    })()

    const read = () => {
      const consent = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
      const gtagType = typeof (window as any).gtag
      const gtagScriptPresent = Boolean(
        document.querySelector('script[src*="googletagmanager.com/gtag/js"]')
      )
      const dataLayerLen = Array.isArray((window as any).dataLayer) ? (window as any).dataLayer.length : 0

      // Check resource timing (best-effort): did the browser actually fetch gtag.js / g/collect?
      let gtagJsResourceSeen = false
      let collectResourceSeen = false
      try {
        const entries = performance.getEntriesByType?.('resource') ?? []
        for (const e of entries as any[]) {
          const name = String(e?.name ?? '')
          if (!gtagJsResourceSeen && name.includes('www.googletagmanager.com/gtag/js')) gtagJsResourceSeen = true
          if (!collectResourceSeen && name.includes('google-analytics.com/g/collect')) collectResourceSeen = true
          if (gtagJsResourceSeen && collectResourceSeen) break
        }
      } catch {
        // ignore
      }

      const gtagJsLoadFlag =
        (window as any).__tt_gtagjs_error ? 'error' : (window as any).__tt_gtagjs_loaded ? 'loaded' : 'unknown'

      const lastGtagCalls = Array.isArray((window as any).__tt_ga_calls) ? (window as any).__tt_ga_calls.length : 0
      setStatus({
        show: true,
        consent,
        hasGaId,
        gaId: hasGaId ? gaId : null,
        gtagType,
        gtagScriptPresent,
        gtagJsResourceSeen,
        gtagJsLoadFlag,
        collectResourceSeen,
        dataLayerLen,
        gaFetchProbe: (w.__tt_ga_probe_status as any) || 'unknown',
        gaFetchProbeRegion1: (w.__tt_ga_probe_region1_status as any) || 'unknown',
        gaFetchProbeError: (w.__tt_ga_probe_error as any) || null,
        lastCspViolation: (w.__tt_last_csp_violation as any) || null,
        cspConnectSrc: (w.__tt_csp_connect_src as any) || null,
        cspScriptSrc: (w.__tt_csp_script_src as any) || null,
        lastGtagCalls,
      })
    }

    read()
    const id = window.setInterval(read, 1000)
    return () => window.clearInterval(id)
  }, [shouldShow, hasGaId, gaId])

  if (!status.show) return null

  return (
    <div className="fixed top-3 right-3 z-[3000] rounded-xl border border-gray-200 bg-white/90 backdrop-blur px-3 py-2 shadow-sm text-xs text-gray-800">
      <div className="font-semibold text-gray-900">Analytics debug</div>
      <div className="mt-1 space-y-0.5">
        <div>
          GA env: <span className="font-mono">{status.hasGaId ? 'OK' : 'MISSING'}</span>
        </div>
        <div>
          consent: <span className="font-mono">{String(status.consent)}</span>
        </div>
        <div>
          gtag: <span className="font-mono">{status.gtagType}</span>
        </div>
        <div>
          gtag.js tag: <span className="font-mono">{status.gtagScriptPresent ? 'present' : 'missing'}</span>
        </div>
        <div>
          gtag.js load: <span className="font-mono">{status.gtagJsLoadFlag}</span>
        </div>
        <div>
          gtag.js net: <span className="font-mono">{status.gtagJsResourceSeen ? 'seen' : 'not-seen'}</span>
        </div>
        <div>
          dataLayer: <span className="font-mono">{status.dataLayerLen}</span>
        </div>
        <div>
          gtag calls: <span className="font-mono">{status.lastGtagCalls}</span>
        </div>
        <div>
          collect net: <span className="font-mono">{status.collectResourceSeen ? 'seen' : 'not-seen'}</span>
        </div>
        <div>
          GA probe: <span className="font-mono">{status.gaFetchProbe}</span>
        </div>
        <div>
          GA probe r1: <span className="font-mono">{status.gaFetchProbeRegion1}</span>
        </div>
        <div className="max-w-[280px]">
          CSP connect-src: <span className="font-mono break-all">{String(status.cspConnectSrc)}</span>
        </div>
        <div className="max-w-[280px]">
          CSP script-src: <span className="font-mono break-all">{String(status.cspScriptSrc)}</span>
        </div>
        <div className="max-w-[280px]">
          CSP violation: <span className="font-mono break-all">{String(status.lastCspViolation)}</span>
        </div>
      </div>
    </div>
  )
}

