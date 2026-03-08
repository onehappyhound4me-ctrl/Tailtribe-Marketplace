import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

const GOOGLE_REVIEWS_URL =
  process.env.NEXT_PUBLIC_GOOGLE_REVIEWS_URL ||
  'https://www.google.com/search?q=TailTribe+reviews'

export default function GoogleReviewsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-emerald-50/40 to-blue-50/40">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />
      <main className="px-4 py-14">
        <div className="mx-auto w-full max-w-xl">
          <div className="rounded-2xl border border-emerald-100 bg-white shadow-sm p-6 sm:p-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Bekijk onze Google reviews</h1>
            <p className="mt-2 text-gray-700 leading-relaxed">
              Lees wat andere baasjes zeggen over TailTribe. Op iPhone kan je de Google Maps-app of Chrome gebruiken als de link in Safari niet goed opent.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-green-600 to-blue-600 text-white px-5 py-3 text-sm font-semibold transition min-h-[44px] shadow-md hover:from-green-700 hover:to-blue-700"
              >
                Bekijk reviews op Google
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
              <Link
                href="/"
                className="inline-flex items-center justify-center rounded-xl border border-emerald-200 bg-white px-5 py-3 text-sm font-semibold text-emerald-900 hover:bg-emerald-50 transition min-h-[44px]"
              >
                Terug naar start
              </Link>
            </div>
          </div>

          <div className="mt-6 text-center text-xs text-gray-500">
            <Link href="/" className="underline hover:text-gray-700">
              Naar de homepage
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

