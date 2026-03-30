import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { DISPATCH_SERVICES } from '@/lib/services'
import { SERVICE_ICON_FILTER, withAssetVersion } from '@/lib/service-icons'
import { routes } from '@/lib/routes'
import { getPublicAppUrl } from '@/lib/env'

const appUrl = getPublicAppUrl()
const canonicalUrl = new URL('/diensten', appUrl).toString()
export const metadata: Metadata = {
  title: 'Diensten',
  description:
    'Ontdek onze diensten voor honden, katten, kleine huisdieren, paarden, vissen en kleinvee: hondenuitlaat, oppas, opvang, training, transport en verzorging aan huis.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Diensten',
    description:
      'Ontdek onze diensten voor honden, katten, kleine huisdieren, paarden, vissen en kleinvee: hondenuitlaat, oppas, opvang, training, transport en verzorging aan huis.',
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
      { '@type': 'ListItem', position: 1, name: 'Home', item: appUrl },
      { '@type': 'ListItem', position: 2, name: 'Diensten', item: canonicalUrl },
    ],
  }

  const visibleServices = DISPATCH_SERVICES.filter((service) => service.slug !== 'kattenoppas')

  const itemListJsonLd = {
    '@context': 'https://schema.org',
      '@type': 'ItemList',
      itemListElement: visibleServices.map((service, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: service.name,
      item: new URL(`/diensten/${service.slug}`, appUrl).toString(),
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
              Van honden en katten tot vogels, kleine huisdieren, paarden, vissen en kleinvee. Klik op een dienst voor
              meer uitleg. Wil je meteen boeken? Dien je aanvraag in en wij nemen contact op.
            </p>
            <div className="mt-6">
              <Link href="/boeken" className="btn-brand-compact">
                Aanvraag indienen
              </Link>
            </div>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {visibleServices.map((service) => (
              <Link
                key={service.id}
                href={routes.dienst(service.slug)}
                data-nav="service"
                data-component="DienstenPage.Cards"
                data-service-id={service.id}
                data-service-slug={service.slug}
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

          <section className="mb-12 rounded-3xl border border-black/5 bg-white p-6 md:p-8 shadow-sm">
            <div className="grid gap-6 md:grid-cols-[1.15fr_0.85fr] md:items-center">
              <div>
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-800">Diergroepen</p>
                <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-gray-900">Katten als tweede cluster, andere dieren zichtbaar in het platform</h2>
                <p className="mt-4 max-w-2xl text-base leading-8 text-gray-700">
                  TailTribe blijft breed als platform voor huisdierenservices, maar kattenoppas aan huis is na honden de
                  belangrijkste aparte landingspagina. Daarnaast blijven ook vogels, hamsters, konijnen, paarden,
                  vissen en kleinvee zichtbaar via bredere zorg- en oppasdiensten.
                </p>
                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <Link href="/diensten/kattenoppas" className="btn-brand-compact">
                    Bekijk kattenoppas
                  </Link>
                  <Link href="/blog/kattenoppas-aan-huis-wat-te-verwachten" className="btn-secondary-compact">
                    Lees kattenoppas artikel
                  </Link>
                </div>
              </div>
              <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
                <h3 className="text-lg font-semibold text-gray-900">Hoe we dit structureren</h3>
                <p className="mt-3 text-sm leading-7 text-gray-700">
                  Katten zoeken vaak anders dan hondenbaasjes. Daarom krijgt kattenoppas een eigen pijlerpagina en
                  aparte interne links, terwijl kleine huisdieren, paarden, vissen en kleinvee voorlopig vooral via
                  bredere zorgdiensten en long-tail zoekvragen zichtbaar blijven.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/60 to-sky-50 p-6 md:p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-800">Veelgestelde vragen</p>
            <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-gray-900">
              Vragen die huisdiereigenaars vaak eerst stellen
            </h2>
            <p className="mt-4 max-w-3xl text-base leading-8 text-gray-700">
              Veel mensen zoeken niet meteen op een dienstnaam, maar op hun concrete probleem. Daarom bundelen we hier
              vraaggerichte pagina&apos;s die helpen om sneller de juiste dienst te kiezen.
            </p>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {[
                {
                  href: '/blog/wie-kan-mijn-hond-uitlaten-als-ik-werk',
                  title: 'Wie kan mijn hond uitlaten als ik werk?',
                },
                {
                  href: '/blog/wat-kost-hondenoppas-aan-huis',
                  title: 'Wat kost hondenoppas aan huis?',
                },
                {
                  href: '/blog/wat-is-beter-hondenopvang-of-hondenoppas-aan-huis',
                  title: 'Wat is beter: hondenopvang of hondenoppas aan huis?',
                },
                {
                  href: '/blog/wat-doet-een-hondentrainer-aan-huis',
                  title: 'Wat doet een hondentrainer aan huis?',
                },
                {
                  href: '/blog/hondenschool-of-prive-hondentraining-wat-past-beter',
                  title: 'Hondenschool of prive hondentraining: wat past beter?',
                },
                {
                  href: '/blog/kan-iemand-mijn-hond-ophalen-en-terugbrengen-in-antwerpen',
                  title: 'Kan iemand mijn hond ophalen en terugbrengen in Antwerpen?',
                },
              ].map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm transition hover:shadow-md"
                >
                  <h3 className="text-base font-semibold leading-snug text-gray-900">{item.title}</h3>
                  <p className="mt-3 text-sm font-semibold text-emerald-700">Lees antwoord →</p>
                </Link>
              ))}
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}




