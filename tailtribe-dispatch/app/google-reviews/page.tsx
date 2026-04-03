import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { getPublicAppUrl } from '@/lib/env'
import { GOOGLE_REVIEWS_URL, PUBLIC_REVIEWS, REVIEW_SUMMARY, getOrganizationReviewSchema } from '@/lib/reviews'

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
    mainEntity: {
      '@type': 'Organization',
      '@id': `${baseUrl}/#organization`,
      name: 'TailTribe',
      ...getOrganizationReviewSchema(baseUrl),
    },
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
            <div className="mt-6 flex flex-wrap justify-center gap-3 text-sm">
              <div className="rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 font-semibold text-emerald-900">
                {REVIEW_SUMMARY.ratingValue}/5 score
              </div>
              <div className="rounded-full border border-emerald-200 bg-white px-4 py-2 font-semibold text-gray-700">
                {REVIEW_SUMMARY.reviewCount} zichtbare reviews
              </div>
            </div>
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
              <article key={review.name} className="rounded-2xl border border-emerald-100 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 font-bold text-white">
                    {review.name.charAt(0)}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900">{review.name}</p>
                    <p className="text-xs text-gray-500">{review.sourceLabel}</p>
                  </div>
                </div>
                <div className="mt-4 flex items-center gap-1 text-amber-400">
                  {Array.from({ length: review.rating }).map((_, i) => (
                    <svg key={i} xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4 fill-current">
                      <path d="M12 3.75 14.6 9l5.15.41c.36.03.5.49.23.73l-3.9 3.42 1.17 5.01c.09.36-.3.66-.62.46L12 16.98l-4.63 2.85c-.32.2-.71-.1-.62-.46l1.17-5.01-3.9-3.42a.44.44 0 0 1 .23-.73L9.4 9 12 3.75Z" />
                    </svg>
                  ))}
                </div>
                <p className="mt-4 text-sm leading-7 text-gray-700">{review.quote}</p>
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
