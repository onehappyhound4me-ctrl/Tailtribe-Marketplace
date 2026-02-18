'use client'

import { useEffect, useRef } from 'react'
import { trackEvent } from '@/lib/analytics'
import { COOKIE_CONSENT_STORAGE_KEY } from '@/lib/cookie-consent'

function safeJsonParse(value: string | null): Record<string, any> | null {
  if (!value) return null
  try {
    const parsed = JSON.parse(value)
    if (parsed && typeof parsed === 'object' && !Array.isArray(parsed)) return parsed as any
    return null
  } catch {
    return null
  }
}

function classifyLeadHref(href: string) {
  const lower = href.toLowerCase()
  if (lower.startsWith('tel:')) return { kind: 'phone', value: href.replace(/^tel:/i, '') }
  if (lower.startsWith('mailto:')) return { kind: 'email', value: href.replace(/^mailto:/i, '') }
  if (lower.startsWith('whatsapp:')) return { kind: 'whatsapp', value: href }
  if (lower.includes('wa.me/')) return { kind: 'whatsapp', value: href }
  return null
}

function readUtm() {
  try {
    const sp = new URLSearchParams(window.location.search)
    const keys = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_term', 'utm_content'] as const
    const out: Record<string, string> = {}
    for (const k of keys) {
      const v = sp.get(k)
      if (v) out[k] = v
    }
    return out
  } catch {
    return {}
  }
}

function normalizeInternalPath(rawHref: string) {
  // Accept absolute same-origin, or relative hrefs; return a path beginning with "/".
  try {
    if (rawHref.startsWith('/')) return rawHref
    const u = new URL(rawHref, window.location.origin)
    if (u.origin !== window.location.origin) return null
    return u.pathname + (u.search || '')
  } catch {
    return null
  }
}

export function AnalyticsEventCapture() {
  const bookingStartSentRef = useRef(false)

  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      if (event.defaultPrevented) return
      if (event.button !== 0) return

      const target = event.target as HTMLElement | null
      if (!target) return

      const el = target.closest('[data-tt-event],a[href]') as HTMLElement | null
      if (!el) return

      const utm = readUtm()
      const consent = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)

      // Custom events via data attributes (preferred for CTAs).
      const customEvent = el.getAttribute('data-tt-event')
      if (customEvent) {
        const params = safeJsonParse(el.getAttribute('data-tt-params')) ?? {}
        trackEvent(customEvent, { ...params, ...utm })
        return
      }

      if (!(el instanceof HTMLAnchorElement)) return

      const hrefAttr = (el.getAttribute('href') || el.href || '').slice(0, 500)
      if (!hrefAttr) return

      // Lead clicks: email/phone/whatsapp.
      const lead = classifyLeadHref(hrefAttr)
      if (lead) {
        trackEvent('lead_click', {
          lead_type: lead.kind,
          lead_value: lead.value,
          href: hrefAttr,
          pathname: window.location.pathname,
          link_text: (el.textContent || '').trim().slice(0, 120),
          consent_accepted: consent === 'accepted',
          ...utm,
        })
        return
      }

      // Booking start: first time they navigate to /boeken
      const internal = normalizeInternalPath(hrefAttr)
      if (internal && internal.startsWith('/boeken') && !bookingStartSentRef.current) {
        bookingStartSentRef.current = true
        trackEvent('booking_start', {
          href: internal,
          link_text: (el.textContent || '').trim().slice(0, 120),
          ...utm,
        })
      }
    }

    document.addEventListener('click', onClickCapture, { capture: true })
    return () => document.removeEventListener('click', onClickCapture, { capture: true } as any)
  }, [])

  return null
}

