'use client'

export type AnalyticsParams = Record<string, string | number | boolean | undefined | null>

type TrackedEvent = {
  ts: number
  event: string
  params: AnalyticsParams
  page_location?: string
  page_path?: string
}

declare global {
  interface Window {
    gtag?: (...args: any[]) => void
    dataLayer?: any[]
    __tt_last_events?: TrackedEvent[]
  }
}

export function recordEvent(event: string, params: AnalyticsParams = {}) {
  if (typeof window === 'undefined') return
  // Always keep a local, in-memory buffer for debugging (/debug/visibility).
  try {
    const buf = (window.__tt_last_events = window.__tt_last_events ?? [])
    buf.push({
      ts: Date.now(),
      event,
      params,
      page_location: typeof window.location !== 'undefined' ? window.location.href : undefined,
      page_path:
        typeof window.location !== 'undefined'
          ? window.location.pathname + (window.location.search || '')
          : undefined,
    })
    if (buf.length > 50) buf.splice(0, buf.length - 50)
  } catch {
    // ignore
  }
}

export function getLastTrackedEvents(limit = 20): TrackedEvent[] {
  if (typeof window === 'undefined') return []
  const buf = window.__tt_last_events ?? []
  const n = Math.max(1, limit)
  return buf.slice(Math.max(0, buf.length - n))
}

export function trackEvent(event: string, params: AnalyticsParams = {}) {
  if (typeof window === 'undefined') return

  recordEvent(event, params)

  if (typeof window.gtag === 'function') {
    window.gtag('event', event, params)
    return
  }

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push({ event, ...params })
  }
}
