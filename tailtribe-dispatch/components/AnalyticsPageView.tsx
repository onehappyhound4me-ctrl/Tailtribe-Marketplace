'use client'

import { useEffect, useMemo, useRef } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'
import { COOKIE_CONSENT_STORAGE_KEY } from '@/lib/cookie-consent'

function safeTitle() {
  try {
    return document.title
  } catch {
    return ''
  }
}

export function AnalyticsPageView() {
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const lastSentRef = useRef<string | null>(null)
  const pendingRef = useRef<string | null>(null)

  const pagePath = useMemo(() => {
    const qs = searchParams?.toString?.() ?? ''
    return qs ? `${pathname}?${qs}` : pathname
  }, [pathname, searchParams])

  useEffect(() => {
    if (!pagePath) return

    pendingRef.current = pagePath

    const debugMode = new URLSearchParams(window.location.search).has('debugga')

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

      gtag('event', 'page_view', {
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

