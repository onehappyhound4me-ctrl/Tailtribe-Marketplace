'use client'

import { useEffect, useMemo, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { COOKIE_CONSENT_STORAGE_KEY } from '@/lib/cookie-consent'
import { recordEvent } from '@/lib/analytics'

function safeTitle() {
  try {
    return document.title
  } catch {
    return ''
  }
}

function readCookie(name: string) {
  try {
    const m = document.cookie.match(new RegExp(`(?:^|;\\s*)${name}=([^;]+)`))
    return m ? decodeURIComponent(m[1]) : null
  } catch {
    return null
  }
}

function getOrCreateClientId() {
  // Prefer GA cookie format: GA1.1.1541961393.1770992030 -> 1541961393.1770992030
  const ga = readCookie('_ga')
  if (ga) {
    const parts = ga.split('.')
    if (parts.length >= 4) return `${parts[2]}.${parts[3]}`
  }

  try {
    const key = 'tt_ga_cid'
    const existing = window.localStorage.getItem(key)
    if (existing) return existing
    const rand =
      typeof crypto !== 'undefined' && 'getRandomValues' in crypto
        ? String(crypto.getRandomValues(new Uint32Array(1))[0])
        : String(Math.floor(Math.random() * 1e9))
    const cid = `${rand}.${Date.now()}`
    window.localStorage.setItem(key, cid)
    return cid
  } catch {
    return `0.${Date.now()}`
  }
}

export function AnalyticsPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastSentRef = useRef<string | null>(null)
  const pendingRef = useRef<string | null>(null)
  const probeRanRef = useRef(false)

  const pagePath = useMemo(() => {
    const qs = searchParams?.toString?.() ?? ''
    return qs ? `${pathname}?${qs}` : pathname
  }, [pathname, searchParams])

  useEffect(() => {
    if (!pagePath) return

    pendingRef.current = pagePath

    const debugMode = new URLSearchParams(window.location.search).has('debugga')

    const ensureProbe = async () => {
      // If the debug badge already ran probes, reuse that result.
      const w = window as any
      if (w.__tt_ga_probe_status === 'ok' || w.__tt_ga_probe_status === 'blocked') return w.__tt_ga_probe_status
      if (probeRanRef.current) return w.__tt_ga_probe_status ?? 'unknown'
      probeRanRef.current = true
      try {
        await fetch('https://www.google-analytics.com/g/collect?v=2', { mode: 'no-cors', keepalive: true })
        w.__tt_ga_probe_status = 'ok'
      } catch {
        w.__tt_ga_probe_status = 'blocked'
      }
      return w.__tt_ga_probe_status
    }

    const sendViaProxy = async (p: string) => {
      const consent = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
      if (consent !== 'accepted') return

      try {
        const client_id = getOrCreateClientId()
        await fetch('/api/ga/collect', {
          method: 'POST',
          headers: { 'content-type': 'application/json' },
          keepalive: true,
          body: JSON.stringify({
            client_id,
            events: [
              {
                name: 'page_view',
                params: {
                  page_location: window.location.href,
                  page_path: p,
                  page_title: safeTitle(),
                  ...(debugMode ? { debug_mode: true } : {}),
                },
              },
            ],
          }),
        })
      } catch {
        // ignore
      }
    }

    const trySend = () => {
      const consent = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
      if (consent !== 'accepted') return false

      const gtag = (window as any).gtag as undefined | ((...args: any[]) => void)
      if (typeof gtag !== 'function') return false

      const p = pendingRef.current
      if (!p) return true

      // Avoid duplicates for same path.
      if (lastSentRef.current === p) return true
      lastSentRef.current = p

      // If GA endpoints are blocked by the client (adblock/privacy), fall back to our first-party proxy.
      // We still call gtag to keep behavior consistent for non-blocked clients.
      void ensureProbe().then((probe) => {
        if (probe === 'blocked') void sendViaProxy(p)
      })

      try {
        gtag('event', 'page_view', {
          page_location: window.location.href,
          page_path: p,
          page_title: safeTitle(),
          ...(debugMode ? { debug_mode: true } : {}),
        })
      } catch {
        // ignore
      }

      // Keep local proof buffer for /debug/visibility (without sending an extra GA hit).
      recordEvent('page_view', {
        page_location: window.location.href,
        page_path: p,
        page_title: safeTitle(),
        ...(debugMode ? { debug_mode: true } : {}),
      })

      return true
    }

    // Try immediately; if gtag isn't ready yet, retry briefly (gtag loads afterInteractive).
    if (trySend()) return
    const t0 = Date.now()
    const id = window.setInterval(() => {
      if (trySend()) {
        window.clearInterval(id)
        return
      }
      // Give up after ~8s to avoid infinite polling.
      if (Date.now() - t0 > 8000) window.clearInterval(id)
    }, 250)

    // Also try immediately after consent is changed.
    const onConsent = () => trySend()
    window.addEventListener('tailtribe:cookie-consent', onConsent)

    return () => {
      window.clearInterval(id)
      window.removeEventListener('tailtribe:cookie-consent', onConsent)
    }
  }, [pagePath])

  return null
}

