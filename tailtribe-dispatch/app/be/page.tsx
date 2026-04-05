import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { PROVINCES } from '@/data/be-geo'
import { getPublicAppUrl } from '@/lib/env'

const appUrl = getPublicAppUrl()
const canonicalUrl = new URL('/be', appUrl).toString()

export const metadata: Metadata = {
  title: 'Dierenoppas en hondenuitlaat per streek in België | TailTribe',
  description:
    'Bekijk dierenoppas, hondenuitlaat, hondenoppas en huisdierenzorg per streek in België. Kies je provincie en vind sneller de juiste hulp voor je huisdier.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Dierenoppas en hondenuitlaat per streek in België | TailTribe',
    description:
      'Bekijk dierenoppas, hondenuitlaat, hondenoppas en huisdierenzorg per streek in België. Kies je provincie en vind sneller de juiste hulp voor je huisdier.',
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
    <div className="min-h-screen bg-slate-50/80">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />

      <main className="container mx-auto px-4 py-12 md:py-16">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
        <div className="mx-auto max-w-5xl">
          <header className="mb-12 max-w-3xl">
            <h1 className="text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl md:leading-tight">
              Dierenoppas per streek in België
            </h1>
            <p className="copy-pretty mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
              Van hondenuitlaat en dierenoppas tot opvang en verzorging aan huis. Kies je provincie voor steden en
              gemeenten.
            </p>
          </header>

          <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PROVINCES.map((p) => (
              <Link
                key={p.slug}
                href={`/be/${p.slug}`}
                className="group rounded-2xl border border-slate-200/90 bg-white p-6 transition hover:border-slate-300"
              >
                <div className="flex items-start justify-between gap-3">
                  <h2 className="text-lg font-semibold text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {p.name}
                  </h2>
                  <span className="shrink-0 text-xs text-slate-500">{p.region}</span>
                </div>
                <p className="mt-3 text-sm leading-relaxed text-slate-600">
                  Steden en gemeenten in {p.name} →
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



