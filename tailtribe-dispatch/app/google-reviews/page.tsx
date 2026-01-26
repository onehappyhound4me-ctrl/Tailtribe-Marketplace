import { ExternalLink } from '@/components/ExternalLink'

const GOOGLE_REVIEWS_SEARCH_URL = 'https://www.google.com/search?hl=nl&gl=BE&q=One%20Happy%20Hound%20reviews'
const GOOGLE_MAPS_CID = '3943987553262873468'
const GOOGLE_MAPS_WEB_URL = `https://maps.google.com/?cid=${GOOGLE_MAPS_CID}&hl=nl&gl=BE`
const GOOGLE_MAPS_SEARCH_URL = 'https://www.google.com/maps/search/?api=1&query=One%20Happy%20Hound'
const GOOGLE_MAPS_APP_URL = `comgooglemapsurl://maps.google.com/?cid=${GOOGLE_MAPS_CID}&hl=nl&gl=BE`
const GOOGLE_CHROME_MAPS_URL = `googlechromes://${GOOGLE_MAPS_WEB_URL.replace(/^https?:\/\//, '')}`

export default function GoogleReviewsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 px-4 flex items-center justify-center">
      <div className="w-full max-w-md rounded-2xl border border-black/5 bg-white p-6 shadow-sm text-center">
        <div className="text-lg font-semibold text-gray-900">Google reviews openen</div>
        <div className="mt-2 text-sm text-gray-600">
          Op iPhone Safari kan Google soms wit blijven (zeker met account). Deze opties werken het meest betrouwbaar.
        </div>

        <div className="mt-5 space-y-3">
          <ExternalLink
            href={GOOGLE_MAPS_APP_URL}
            target="_self"
            className="w-full rounded-xl bg-gradient-to-r from-green-600 to-blue-600 text-white px-4 py-3 text-sm font-semibold transition min-h-[44px] flex items-center justify-center shadow-md hover:from-green-700 hover:to-blue-700"
            aria-label="Open Google reviews in Google Maps app"
          >
            Open in Google Maps app (aanbevolen)
          </ExternalLink>

          <ExternalLink
            href={GOOGLE_CHROME_MAPS_URL}
            target="_self"
            className="w-full rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-900 hover:bg-blue-100 transition min-h-[44px] flex items-center justify-center"
            aria-label="Open Google reviews in Chrome app"
          >
            Open in Chrome app
          </ExternalLink>

          <ExternalLink
            href={GOOGLE_REVIEWS_SEARCH_URL}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition min-h-[44px] flex items-center justify-center"
            aria-label="Open Google reviews in a new tab"
          >
            Open reviews (Google Search) — nieuw tabblad
          </ExternalLink>

          <ExternalLink
            href={GOOGLE_MAPS_WEB_URL}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition min-h-[44px] flex items-center justify-center"
            aria-label="Open Google Maps place in a new tab"
          >
            Open in browser (Google Maps) — nieuw tabblad
          </ExternalLink>

          <ExternalLink
            href={GOOGLE_MAPS_SEARCH_URL}
            className="w-full rounded-xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition min-h-[44px] flex items-center justify-center"
            aria-label="Search in Google Maps in a new tab"
          >
            Zoek in Google Maps — nieuw tabblad
          </ExternalLink>
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

