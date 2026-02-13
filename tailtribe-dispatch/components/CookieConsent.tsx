'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { COOKIE_CONSENT_STORAGE_KEY } from '@/lib/cookie-consent'

type ConsentValue = 'accepted' | 'declined'

export function CookieConsent() {
  const [consent, setConsent] = useState<ConsentValue | null>(null)
  const [ready, setReady] = useState(false)
  const bannerRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const stored = window.localStorage.getItem(COOKIE_CONSENT_STORAGE_KEY)
    if (stored === 'accepted' || stored === 'declined') {
      setConsent(stored)
      setReady(true)
      return
    }
    setConsent(null)
    setReady(true)
  }, [])

  // Prevent the fixed banner from blocking important UI on small screens
  // (e.g. the hero CTA). While visible, reserve space at the bottom of the page.
  useEffect(() => {
    if (!ready || consent) return

    const el = bannerRef.current
    if (!el) return

    const applyOffset = () => {
      const rect = el.getBoundingClientRect()
      // +16px for the outer "bottom-4" gap.
      const offset = Math.ceil(rect.height + 16)
      document.body.style.paddingBottom = `${offset}px`
    }

    applyOffset()

    const ro = typeof ResizeObserver !== 'undefined' ? new ResizeObserver(applyOffset) : null
    ro?.observe(el)
    window.addEventListener('resize', applyOffset)

    return () => {
      ro?.disconnect()
      window.removeEventListener('resize', applyOffset)
      document.body.style.paddingBottom = ''
    }
  }, [consent, ready])

  // Avoid "flash": don't render until we've checked localStorage on the client.
  if (!ready) return null
  if (consent) return null

  const handleChoice = (value: ConsentValue) => {
    window.localStorage.setItem(COOKIE_CONSENT_STORAGE_KEY, value)
    setConsent(value)
    // Let other components (e.g. AnalyticsLoader) react immediately without requiring a reload.
    try {
      window.dispatchEvent(new Event('tailtribe:cookie-consent'))
    } catch {
      // ignore
    }
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-[2000]">
      <div
        ref={bannerRef}
        className="mx-auto max-w-4xl rounded-2xl border border-emerald-100 bg-white shadow-lg px-4 sm:px-5 py-3 sm:py-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between"
      >
        <div className="text-xs sm:text-sm text-gray-700 leading-relaxed">
          We gebruiken enkel essentiële cookies om de site correct te laten werken. Voor analytische cookies vragen we eerst
          toestemming.{' '}
          <Link href="/cookies" className="text-emerald-700 hover:underline">
            Lees meer
          </Link>
          .
        </div>
        <div className="flex flex-wrap gap-2 justify-start">
          <button
            onClick={() => handleChoice('declined')}
            className="px-4 py-2 text-sm rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 min-h-[44px]"
          >
            Weigeren
          </button>
          <button
            onClick={() => handleChoice('accepted')}
            className="px-4 py-2 text-sm rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 min-h-[44px]"
          >
            Akkoord
          </button>
        </div>
      </div>
    </div>
  )
}
