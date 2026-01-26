'use client'

import { useEffect, useRef } from 'react'
import { ExternalLink } from '@/components/ExternalLink'

const GOOGLE_REVIEWS_SEARCH_URL = 'https://www.google.com/search?hl=nl&gl=BE&q=One%20Happy%20Hound%20reviews'
const GOOGLE_MAPS_CID = '3943987553262873468'
const GOOGLE_MAPS_APP_URL = `comgooglemapsurl://maps.google.com/?cid=${GOOGLE_MAPS_CID}&hl=nl&gl=BE`

export default function GoogleReviewsPage() {
  const fallbackTimer = useRef<number | null>(null)

  useEffect(() => {
    const clear = () => {
      if (fallbackTimer.current !== null) {
        window.clearTimeout(fallbackTimer.current)
        fallbackTimer.current = null
      }
    }

    const onVisibilityChange = () => {
      // If the Maps app opens, the page becomes hidden; don't fire the fallback redirect.
      if (document.hidden) clear()
    }

    document.addEventListener('visibilitychange', onVisibilityChange)

    // Try to open the Google Maps app first (best UX on iPhone).
    // If that doesn't work, fall back to Google Search reviews (less "open in Maps" banners).
    try {
      window.location.href = GOOGLE_MAPS_APP_URL
    } catch {
      // Ignore and let fallback handle it.
    }

    fallbackTimer.current = window.setTimeout(() => {
      if (!document.hidden) window.location.href = GOOGLE_REVIEWS_SEARCH_URL
    }, 900)

    return () => {
      clear()
      document.removeEventListener('visibilitychange', onVisibilityChange)
    }
  }, [])

  return (
    <div className="min-h-screen bg-white px-4 flex items-center justify-center" aria-hidden="true">
      {/* Keep UI minimal to avoid "background explanation" flashes on iPhone. */}
      <div className="sr-only">Google reviews openen…</div>
      <div className="w-full max-w-md space-y-2">
        <a
          href={GOOGLE_MAPS_APP_URL}
          className="w-full rounded-xl bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-3 text-sm font-semibold transition min-h-[44px] flex items-center justify-center shadow-md hover:from-green-700 hover:to-blue-700"
        >
          Open Google reviews
        </a>
        <ExternalLink
          href={GOOGLE_REVIEWS_SEARCH_URL}
          className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition min-h-[44px] flex items-center justify-center"
        >
          Lukt het niet? Open in browser
        </ExternalLink>
        <a className="block text-center text-xs text-gray-500 underline" href="/">
          Terug naar TailTribe
        </a>
      </div>
    </div>
  )
}

