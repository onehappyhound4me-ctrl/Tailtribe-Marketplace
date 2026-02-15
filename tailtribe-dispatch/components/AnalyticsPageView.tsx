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

  const pagePath = useMemo(() => {
    const qs = searchParams?.toString?.() ?? ''
    return qs ? `${pathname}?${qs}` : pathname
  }, [pathname, searchParams])

  useEffect(() => {
    if (!pagePath) return

    // Only after consent accepted.
    const consent = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    if (consent !== 'accepted') return

    const gtag = (window as any).gtag as undefined | ((...args: any[]) => void)
    if (typeof gtag !== 'function') return

    // Avoid duplicates for same path.
    if (lastSentRef.current === pagePath) return
    lastSentRef.current = pagePath

    const debugMode = new URLSearchParams(window.location.search).has('debugga')

    // App Router does not automatically send page_view on client navigations.
    gtag('event', 'page_view', {
      page_location: window.location.href,
      page_path: pagePath,
      page_title: safeTitle(),
      ...(debugMode ? { debug_mode: true } : {}),
    })
  }, [pagePath])

  return null
}

