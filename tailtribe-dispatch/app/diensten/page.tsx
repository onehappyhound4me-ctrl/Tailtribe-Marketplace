import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { DISPATCH_SERVICES } from '@/lib/services'
import { SERVICE_ICON_FILTER, withAssetVersion } from '@/lib/service-icons'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
const canonicalUrl = `${baseUrl}/diensten`
export const metadata: Metadata = {
  title: 'Diensten',
  description:
    'Ontdek onze diensten: hondenuitlaat, dierenoppas, hondentraining, transport en meer.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Diensten',
    description:
      'Ontdek onze diensten: hondenuitlaat, dierenoppas, hondentraining, transport en meer.',
    url: canonicalUrl,
    siteName: 'TailTribe',
    locale: 'nl_BE',
    type: 'website',
  },
}

export default function DienstenPage() {
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Diensten', item: canonicalUrl },
    ],
  }

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: DISPATCH_SERVICES.map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: service.name,
      item: `${baseUrl}/diensten/${service.slug}`,
    })),
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />

      <main className="container mx-auto px-4 py-12 pb-28">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
        <div className="max-w-6xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">Onze diensten</h1>
            <p className="text-sm sm:text-base md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Klik op een dienst voor meer uitleg. Wil je meteen boeken? Dien je aanvraag in en wij nemen contact op.
            </p>
            <div className="mt-6">
              <Link href="/boeken" className="btn-brand inline-block">
                Aanvraag indienen
              </Link>
            </div>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {DISPATCH_SERVICES.map((service) => (
              <Link
                key={service.id}
                href={`/diensten/${service.slug}`}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-tt transition-all border border-black/5 overflow-hidden"
              >
                <div className="relative h-36 sm:h-40 w-full overflow-hidden bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-3 sm:p-4">
                  {/* Use plain <img> for local /assets icons: more reliable on mobile Safari than Next/Image optimizer. */}
                  <img
                    src={withAssetVersion(service.image)}
                    alt={service.name}
                    loading="eager"
                    decoding="async"
                    className="block h-full w-full max-w-full object-contain md:group-hover:scale-105 md:transition-transform md:duration-300 md:[filter:hue-rotate(28deg)_saturate(0.62)_brightness(0.98)_contrast(1.08)]"
                  />
                </div>
                <div className="p-5 sm:p-6">
                  <h2 className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors mb-2">
                    {service.name}
                  </h2>
                  <p className="text-sm text-gray-600 line-clamp-3">{service.desc}</p>
                  <div className="mt-4 text-sm font-semibold text-emerald-700">Meer info →</div>
                </div>
              </Link>
            ))}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}




