import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { PROVINCES } from '@/data/be-geo'
import { getPublicAppUrl } from '@/lib/env'

const appUrl = getPublicAppUrl()
const canonicalUrl = new URL('/be', appUrl).toString()

export const metadata: Metadata = {
  title: 'Dierenverzorging per streek in België | TailTribe',
  description:
    'Bekijk dierenverzorging per streek in België. Kies je provincie en vraag snel een offerte aan voor hondenuitlaat, dierenoppas, opvang en meer.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Dierenverzorging per streek in België | TailTribe',
    description:
      'Bekijk dierenverzorging per streek in België. Kies je provincie en vraag snel een offerte aan voor hondenuitlaat, dierenoppas, opvang en meer.',
    url: canonicalUrl,
    siteName: 'TailTribe',
    locale: 'nl_BE',
    type: 'website',
  },
}

export default function BelgiumLandingPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: appUrl },
      { '@type': 'ListItem', position: 2, name: 'België', item: canonicalUrl },
    ],
  }

  const provinceList = PROVINCES.map((province, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: province.name,
    item: new URL(`/be/${province.slug}`, appUrl).toString(),
  }))

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: provinceList,
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />

      <main className="container mx-auto px-4 py-12">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
        <div className="max-w-5xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Dierenverzorging per streek in België
            </h1>
            {/* Offerte CTA tekst verwijderd op verzoek */}
          </header>

          <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {PROVINCES.map((p) => (
              <Link
                key={p.slug}
                href={`/be/${p.slug}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-tt transition-all border border-black/5 p-6"
              >
                <div className="flex items-center justify-between gap-3">
                  <h2 className="text-xl font-semibold text-gray-900 group-hover:text-green-700 transition-colors">
                    {p.name}
                  </h2>
                  <span className="text-sm text-gray-500">{p.region}</span>
                </div>
                <p className="text-gray-600 mt-2">
                  Bekijk steden en gemeenten in {p.name} →
                </p>
              </Link>
            ))}
          </section>

          {/* Offerte knop verwijderd */}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}



