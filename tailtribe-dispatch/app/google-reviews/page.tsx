'use client'

import { useCallback, useMemo, useState } from 'react'

const GOOGLE_REVIEWS_SEARCH_URL =
  'https://www.google.com/search?hl=nl&gl=BE&q=One%20Happy%20Hound%20reviews'

const GOOGLE_MAPS_CID = '3943987553262873468'

// Use maps.google.com variant; tends to behave better with universal links.
const GOOGLE_MAPS_WEB_URL = `https://maps.google.com/?cid=${GOOGLE_MAPS_CID}&hl=nl&gl=BE`

const GOOGLE_MAPS_SEARCH_URL =
  'https://www.google.com/maps/search/?api=1&query=One%20Happy%20Hound'

export default function GoogleReviewsRedirectPage() {
  const [copied, setCopied] = useState(false)

  const chromeMapsUrl = useMemo(() => {
    // iOS Chrome deep link: googlechromes:// for https
    return `googlechromes://${GOOGLE_MAPS_WEB_URL.replace(/^https?:\/\//, '')}`
  }, [])

  const googleMapsAppUrl = useMemo(() => {
    // iOS URL scheme (Google Maps app). If the app is installed, this should open it.
    // Using `q=cid:` targets the place by CID.
    return `comgooglemaps://?q=cid:${GOOGLE_MAPS_CID}`
  }, [])

  const openGoogleMapsApp = useCallback(() => {
    // iOS Safari sometimes shows a blank page for Google web views,
    // especially when a Google account is involved.
    // Try opening the Google Maps app first; if it's not installed, fall back to the web URL.
    const appUrl = googleMapsAppUrl

    // Attempt app open
    window.location.href = appUrl

    // Fallback to web after a short delay
    window.setTimeout(() => {
      window.location.href = GOOGLE_MAPS_WEB_URL
    }, 900)
  }, [googleMapsAppUrl])

  const openInChrome = useCallback(() => {
    // If Chrome is installed, this often avoids Safari/Google white-screen issues.
    window.location.href = chromeMapsUrl

    // Fallback to normal web URL after a short delay
    window.setTimeout(() => {
      window.location.href = GOOGLE_MAPS_WEB_URL
    }, 900)
  }, [chromeMapsUrl])

  const copyLink = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(GOOGLE_MAPS_WEB_URL)
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1500)
    } catch {
      // Fallback: open the URL so user can share/copy from address bar
      window.location.href = GOOGLE_MAPS_WEB_URL
    }
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 px-4 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-6 shadow-sm text-center">
        <div className="text-lg font-semibold text-gray-900">Google reviews openen</div>
        <div className="mt-2 text-sm text-gray-600">
          Op iPhone kan Google soms een wit scherm geven (zeker met account). De betrouwbaarste optie is openen in de Google Maps app.
        </div>

        <div className="mt-5 space-y-3">
          <button
            type="button"
            onClick={openGoogleMapsApp}
            className="w-full rounded-xl bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-3 text-sm font-semibold transition min-h-[44px] flex items-center justify-center shadow-md hover:from-green-700 hover:to-blue-700"
          >
            Open in Google Maps app (aanbevolen)
          </button>

          <button
            type="button"
            onClick={openInChrome}
            className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900 hover:bg-blue-100 transition min-h-[44px] flex items-center justify-center"
          >
            Open in Chrome app
          </button>

          <button
            type="button"
            onClick={copyLink}
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-50 transition min-h-[44px] flex items-center justify-center"
          >
            {copied ? 'Gekopieerd!' : 'Kopieer link'}
          </button>

          <a
            href={GOOGLE_REVIEWS_SEARCH_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition min-h-[44px] flex items-center justify-center"
          >
            Open reviews (Google Search) — nieuw tabblad
          </a>

          <a
            href={GOOGLE_MAPS_WEB_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition min-h-[44px] flex items-center justify-center"
          >
            Open in browser (Google Maps) — nieuw tabblad
          </a>

          <a
            href={GOOGLE_MAPS_SEARCH_URL}
            target="_blank"
            rel="noreferrer noopener"
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition min-h-[44px] flex items-center justify-center"
          >
            Zoek in Google Maps — nieuw tabblad
          </a>
        </div>

        <div className="mt-4 text-xs text-gray-500 break-words">{GOOGLE_MAPS_WEB_URL}</div>

        <div className="mt-6 text-sm">
          <a className="text-emerald-800 font-semibold underline" href="/">
            Terug naar TailTribe
          </a>
        </div>
      </div>
    </div>
  )
}

