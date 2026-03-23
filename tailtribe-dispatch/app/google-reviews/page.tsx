import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { getPublicAppUrl } from '@/lib/env'

const GOOGLE_MAPS_CID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_CID || '3943987553262873468'
const GOOGLE_MAPS_WEB_URL = `https://maps.google.com/?cid=${GOOGLE_MAPS_CID}&hl=nl&gl=BE`

const baseUrl = getPublicAppUrl()
const canonicalUrl = new URL('/google-reviews', baseUrl).toString()

export const metadata: Metadata = {
  title: 'Google reviews',
  description: 'Lees wat klanten over TailTribe zeggen en bekijk onze reviews op Google Maps.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'TailTribe — Google reviews',
    description: 'Lees wat klanten over TailTribe zeggen en bekijk onze reviews op Google Maps.',
    url: canonicalUrl,
    siteName: 'TailTribe',
    locale: 'nl_BE',
    type: 'website',
  },
}

export default function GoogleReviewsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />
      <main className="px-4 py-14">
        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-6 sm:p-8 text-center">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bekijk onze Google reviews</h1>

            <div className="mt-6">
              <a
                href={GOOGLE_MAPS_WEB_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-3 text-sm font-semibold shadow-md hover:from-green-700 hover:to-blue-700 transition min-h-[44px]"
              >
                Bekijk reviews op Google
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </div>

            <div className="mt-6">
              <Link href="/" className="text-sm text-emerald-800 font-semibold underline hover:text-emerald-900">
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
