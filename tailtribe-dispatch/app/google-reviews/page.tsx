import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { getPublicAppUrl } from '@/lib/env'
import { GOOGLE_REVIEWS_URL, PUBLIC_REVIEWS } from '@/lib/reviews'

const baseUrl = getPublicAppUrl()
const canonicalUrl = new URL('/google-reviews', baseUrl).toString()

export const metadata: Metadata = {
  title: 'Reviews over TailTribe',
  description: 'Lees reviews over TailTribe, bekijk ervaringen van baasjes en ga door naar onze Google reviews.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Reviews over TailTribe',
    description: 'Lees reviews over TailTribe, bekijk ervaringen van baasjes en ga door naar onze Google reviews.',
    url: canonicalUrl,
    siteName: 'TailTribe',
    locale: 'nl_BE',
    type: 'website',
  },
}

export default function GoogleReviewsPage() {
  const reviewsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: 'Reviews over TailTribe',
    url: canonicalUrl,
    mainEntity: { '@id': `${baseUrl}/#organization` },
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(reviewsJsonLd) }} />
      <main className="px-4 py-14">
        <div className="mx-auto w-full max-w-5xl space-y-8">
          <div className="rounded-3xl border border-emerald-100 bg-white shadow-sm p-6 sm:p-8 md:p-10 text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-800">Reviews</p>
            <h1 className="mt-3 text-3xl sm:text-4xl font-bold text-gray-900">Wat baasjes over TailTribe zeggen</h1>
            <p className="mt-4 mx-auto max-w-2xl text-base leading-8 text-gray-700">
              Vertrouwen is alles wanneer je hulp zoekt voor je hond, kat of ander huisdier. Daarom tonen we hier
              enkele zichtbare reviews en linken we ook door naar onze Google reviews.
            </p>
            <div className="mt-8">
              <a
                href={GOOGLE_REVIEWS_URL}
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
          </div>

          <section className="grid gap-6 md:grid-cols-3">
            {PUBLIC_REVIEWS.map((review) => (
              <article key={review.name} className="flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm">
                <div className="mb-5 flex items-start justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 font-bold text-white shadow-sm">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900">{review.name}</p>
                      <p className="mt-1 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-600">
                        {review.sourceLabel}
                      </p>
                    </div>
                  </div>
                  <svg className="h-8 w-8 flex-shrink-0 text-emerald-200" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                    <path d="M10.5 14C10.5 9.857 13.857 6.5 18 6.5h1v4h-1A3.5 3.5 0 0 0 14.5 14v.25A3.25 3.25 0 0 1 17.75 17.5v1A5.5 5.5 0 0 1 12.25 24H11v-4h1.25a1.5 1.5 0 0 0 1.5-1.5v-1a.75.75 0 0 0-.75-.75H10.5V14Zm11 0C21.5 9.857 24.857 6.5 29 6.5h1v4h-1a3.5 3.5 0 0 0-3.5 3.5v.25a3.25 3.25 0 0 1 3.25 3.25v1A5.5 5.5 0 0 1 23.25 24H22v-4h1.25a1.5 1.5 0 0 0 1.5-1.5v-1a.75.75 0 0 0-.75-.75H21.5V14Z" />
                  </svg>
                </div>
                <p className="flex-1 text-sm leading-7 text-slate-700">{review.quote}</p>
              </article>
            ))}
          </section>

          <div className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-2xl font-semibold text-gray-900">Waarom deze reviews belangrijk zijn</h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-gray-700">
              Wie zoekt naar hondenuitlaat, hondenoppas, kattenoppas of hondenopvang wil vooral weten of een platform
              betrouwbaar aanvoelt. Deze reviews geven extra zekerheid naast onze uitleg op de dienstpagina&apos;s en de
              ervaringen op Google.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Link href="/diensten" className="btn-secondary-compact">
                Bekijk alle diensten
              </Link>
              <Link href="/boeken" className="btn-brand-compact">
                Dien je aanvraag in
              </Link>
            </div>
          </div>

          <div className="text-center">
            <Link href="/" className="text-sm font-semibold text-emerald-800 underline hover:text-emerald-900">
              Terug naar TailTribe
            </Link>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}
