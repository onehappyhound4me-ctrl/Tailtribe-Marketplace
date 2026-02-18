'use client'

import { useEffect, useRef } from 'react'
import { trackEvent } from '@/lib/analytics'

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

function classifyLeadHref(href: string) {
  const lower = href.toLowerCase()
  if (lower.startsWith('tel:')) return { kind: 'tel', value: href.replace(/^tel:/i, '') }
  if (lower.startsWith('mailto:')) return { kind: 'mail', value: href.replace(/^mailto:/i, '') }
  if (lower.startsWith('whatsapp:')) return { kind: 'whatsapp', value: href }
  if (lower.includes('wa.me/')) return { kind: 'whatsapp', value: href }
  return null
}

export function AnalyticsEventCapture() {
  const bookingStartSentRef = useRef(false)

  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      // Only left-click.
      if (event.button !== 0) return
      if (event.defaultPrevented) return

      const target = event.target as HTMLElement | null
      if (!target) return
      const a = target.closest('a') as HTMLAnchorElement | null
      if (!a) return

      const hrefAttr = a.getAttribute('href') || ''
      if (!hrefAttr) return

      // Lead clicks: tel/mail/whatsapp
      const lead = classifyLeadHref(hrefAttr)
      if (lead) {
        trackEvent('lead_click', {
          lead_type: lead.kind,
          lead_value: lead.value,
          href: hrefAttr,
          link_text: (a.textContent || '').trim().slice(0, 120),
        })
        return
      }

      // Booking start: first time they navigate to /boeken
      const internal = normalizeInternalPath(hrefAttr)
      if (internal && internal.startsWith('/boeken') && !bookingStartSentRef.current) {
        bookingStartSentRef.current = true
        trackEvent('booking_start', {
          href: internal,
          link_text: (a.textContent || '').trim().slice(0, 120),
        })
      }
    }

    document.addEventListener('click', onClickCapture, { capture: true })
    return () => document.removeEventListener('click', onClickCapture, { capture: true } as any)
  }, [])

  return null
}

'use client'

import { useEffect } from 'react'
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
  const h = href.toLowerCase()
  if (h.startsWith('mailto:')) return { type: 'email', value: href.slice('mailto:'.length) }
  if (h.startsWith('tel:')) return { type: 'phone', value: href.slice('tel:'.length) }
  if (h.includes('wa.me') || h.includes('whatsapp')) return { type: 'whatsapp', value: href }
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

export function AnalyticsEventCapture() {
  useEffect(() => {
    const onClickCapture = (event: MouseEvent) => {
      if (event.defaultPrevented) return
      if (event.button !== 0) return

      const target = event.target as HTMLElement | null
      if (!target) return

      const el = target.closest('[data-tt-event],a[href^="mailto:"],a[href^="tel:"],a[href*="wa.me"],a[href*="whatsapp"]') as
        | HTMLElement
        | null
      if (!el) return

      // Custom events via data attributes (preferred for CTAs).
      const customEvent = el.getAttribute('data-tt-event')
      if (customEvent) {
        const params = safeJsonParse(el.getAttribute('data-tt-params')) ?? {}
        trackEvent(customEvent, params)
        return
      }

      // Lead clicks: email/phone/whatsapp.
      if (el instanceof HTMLAnchorElement) {
        const lead = classifyLeadHref(el.href)
        if (!lead) return

        // Only meaningful to push to GA when consent is accepted (gtag itself won't be loaded otherwise),
        // but we still track in-memory for debug purposes.
        const consent = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
        const hrefAttr = (el.getAttribute('href') || el.href || '').slice(0, 200)
        const utm = readUtm()
        trackEvent('lead_click', {
          method: lead.type,
          href: hrefAttr,
          pathname: window.location.pathname,
          lead_value: lead.value,
          consent_accepted: consent === 'accepted',
          ...utm,
        })
      }
    }

    document.addEventListener('click', onClickCapture, { capture: true })
    return () => document.removeEventListener('click', onClickCapture, { capture: true } as any)
  }, [])

  return null
}

