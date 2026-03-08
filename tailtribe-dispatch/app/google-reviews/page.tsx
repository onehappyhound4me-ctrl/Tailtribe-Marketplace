import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { ExternalLink } from '@/components/ExternalLink'

// One Happy Hound Google Business (Place CID) – directe link naar de bedrijfspagina met reviews
const GOOGLE_MAPS_CID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_CID || '3943987553262873468'
const GOOGLE_MAPS_WEB_URL = `https://maps.google.com/?cid=${GOOGLE_MAPS_CID}&hl=nl&gl=BE`
const GOOGLE_REVIEWS_SEARCH_URL = 'https://www.google.com/search?hl=nl&gl=BE&q=One%20Happy%20Hound%20reviews'
const GOOGLE_MAPS_APP_URL = `comgooglemapsurl://maps.google.com/?cid=${GOOGLE_MAPS_CID}&hl=nl&gl=BE`

export default function GoogleReviewsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />
      <main className="px-4 py-14">
        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bekijk onze Google reviews</h1>
            <p className="mt-2 text-gray-700 leading-relaxed">
              One Happy Hound op Google. Op iPhone kan Google soms wit blijven in Safari; gebruik dan de Google Maps-app of Chrome.
            </p>

            <div className="mt-6 space-y-3">
              <ExternalLink
                href={GOOGLE_MAPS_WEB_URL}
                className="w-full rounded-xl bg-gradient-to-r from-green-600 to-blue-600 text-white px-5 py-3 text-sm font-semibold transition min-h-[44px] flex items-center justify-center gap-2 shadow-md hover:from-green-700 hover:to-blue-700"
              >
                Bekijk reviews op Google (aanbevolen)
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </ExternalLink>

              <ExternalLink
                href={GOOGLE_MAPS_APP_URL}
                target="_self"
                className="w-full rounded-xl border border-emerald-200 bg-emerald-50 px-5 py-3 text-sm font-semibold text-emerald-900 hover:bg-emerald-100 transition min-h-[44px] flex items-center justify-center"
                aria-label="Open in Google Maps app"
              >
                Open in Google Maps-app (iPhone)
              </ExternalLink>

              <ExternalLink
                href={GOOGLE_REVIEWS_SEARCH_URL}
                className="w-full rounded-xl border border-gray-200 bg-gray-50 px-5 py-3 text-sm font-semibold text-gray-900 hover:bg-gray-100 transition min-h-[44px] flex items-center justify-center"
              >
                Open via Google Zoeken
              </ExternalLink>
            </div>

            <div className="mt-6 flex justify-center">
              <Link
                href="/"
                className="text-sm text-emerald-800 font-semibold underline hover:text-emerald-900"
              >
                Terug naar TailTribe
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
