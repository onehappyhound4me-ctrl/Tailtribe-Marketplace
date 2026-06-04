import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { PublicReviewsSummary } from '@/components/PublicReviewsSummary'
import { DISPATCH_SERVICES } from '@/lib/services'
import { routes } from '@/lib/routes'
import { getPublicAppUrl } from '@/lib/env'
import { absoluteUrl, buildPageMetadata } from '@/lib/seo'

const appUrl = getPublicAppUrl()
const canonicalUrl = absoluteUrl('/diensten')

export const metadata: Metadata = buildPageMetadata({
  title: 'Hondenuitlaat, dierenoppas, hondentraining en opvang | TailTribe België',
  description:
    'Hondenuitlaat (dog walker), dierenoppas, hondentraining, hondenopvang, dagopvang voor honden, transport en verzorging aan huis in België. TailTribe matcht je aanvraag met gescreende verzorgers.',
  path: '/diensten',
  ogImageAlt: 'TailTribe diensten – hondenuitlaat en dierenoppas in België',
})

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

      <main className="container mx-auto px-4 py-10 sm:py-12 pb-16 sm:pb-20">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
        <div className="max-w-6xl mx-auto">
          <nav
            aria-label="Breadcrumb"
            className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs sm:text-sm text-gray-500 mb-5 sm:mb-6"
          >
            <Link href="/" className="hover:text-gray-700">
              Home
            </Link>
            <span aria-hidden="true">›</span>
            <span className="text-gray-900" aria-current="page">
              Diensten
            </span>
          </nav>

          <header className="text-center mb-10 sm:mb-12">
            <p className="text-[11px] sm:text-sm uppercase tracking-wide text-emerald-700 font-semibold mb-2">
              Dienstenoverzicht
            </p>
            <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3 sm:mb-4">Onze diensten</h1>
            <p className="copy-pretty text-sm sm:text-base md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Van honden en katten tot vogels, kleine huisdieren, paarden, vissen en kleinvee. Klik op een dienst voor
              meer uitleg. Wil je meteen boeken? Dien je aanvraag in en wij nemen contact op — aanvragen zijn mogelijk
              door heel België (postcode in je aanvraag). Meer voorbeelden per streek op{' '}
              <Link href="/be" className="font-medium text-emerald-800 underline-offset-4 hover:underline">
                de streekpagina&apos;s
              </Link>
              .
            </p>
            <div className="mt-6 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
              <Link href="/boeken" className="btn-brand-compact w-full sm:w-auto">
                Aanvraag indienen
              </Link>
              <Link href="/verzorger-aanmelden" className="btn-secondary-compact w-full sm:w-auto">
                Word dierenoppas
              </Link>
            </div>
            <div className="mt-6 flex justify-center">
              <PublicReviewsSummary />
            </div>
            <ul className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-sm text-gray-600">
              <li className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                Gescreend netwerk
              </li>
              <li className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                Persoonlijke opvolging
              </li>
              <li className="inline-flex items-center gap-2">
                <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" aria-hidden />
                Heel België
              </li>
            </ul>
          </header>

          <section aria-label="Alle diensten" className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mb-12">
            {visibleServices.map((service, index) => {
              return (
              <Link
                key={service.id}
                href={routes.dienst(service.slug)}
                aria-labelledby={`dienst-${service.slug}`}
                data-nav="service"
                data-component="DienstenPage.Cards"
                data-service-id={service.id}
                data-service-slug={service.slug}
                className="group bg-white rounded-2xl shadow-sm hover:shadow-tt border border-black/5 overflow-hidden transition-all duration-300 motion-safe:hover:-translate-y-0.5 motion-reduce:hover:translate-y-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
              >
                <div className="relative flex h-40 w-full items-center justify-center overflow-hidden bg-gradient-to-b from-slate-50 via-white to-emerald-50/35 px-4 py-5 sm:h-44 sm:px-5 sm:py-6">
                  <div className="flex h-32 w-32 items-center justify-center rounded-2xl bg-white p-4 shadow-[0_6px_24px_rgba(15,23,42,0.06)] ring-1 ring-emerald-200/55 sm:h-36 sm:w-36 sm:p-5">
                    <Image
                      src={encodeURI(service.image)}
                      alt=""
                      aria-hidden
                      width={120}
                      height={120}
                      unoptimized
                      priority={index < 3}
                      loading={index < 3 ? undefined : 'eager'}
                      sizes="(max-width: 640px) 84px, 96px"
                      className="h-[5.25rem] w-[5.25rem] object-contain transition-transform duration-300 motion-safe:md:group-hover:scale-[1.04] motion-reduce:transform-none sm:h-24 sm:w-24"
                    />
                  </div>
                </div>
                <div className="p-5 sm:p-6">
                  <h2
                    id={`dienst-${service.slug}`}
                    className="text-lg font-bold text-gray-900 group-hover:text-green-700 transition-colors mb-2"
                  >
                    {service.name}
                  </h2>
                  <p className="text-sm text-gray-600 line-clamp-3">{service.desc}</p>
                  <p className="mt-4 text-sm font-semibold text-emerald-700" aria-hidden="true">
                    Meer info →
                  </p>
                </div>
              </Link>
              )
            })}
          </section>

          <section className="mb-12 rounded-3xl border border-black/5 bg-white p-6 md:p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-800">Diergroepen</p>
            <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-gray-900">Niet alleen voor honden</h2>
            <p className="copy-pretty mt-4 max-w-3xl text-base leading-8 text-gray-700">
              Zoek je hulp voor een kat, konijn, hamster, vogel, paard, vis of kleinvee? Dan kun je hier ook terecht
              voor oppas en zorg op maat. Voor katten vind je alle info op onze{' '}
              <Link href="/diensten/kattenoppas" className="font-semibold text-emerald-800 underline underline-offset-4">
                kattenoppas pagina
              </Link>
              .
            </p>
          </section>

          <section className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/60 to-sky-50 p-6 md:p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-800">Veelgestelde vragen</p>
            <h2 className="mt-3 text-2xl md:text-3xl font-semibold text-gray-900">
              Vragen die huisdiereigenaars vaak eerst stellen
            </h2>
            <p className="copy-pretty mt-4 max-w-3xl text-base leading-8 text-gray-700">
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
                  href: '/blog/last-minute-hondenoppas-nodig-wat-kan-vandaag',
                  title: 'Last minute hondenoppas nodig: wat kan vandaag nog?',
                },
                {
                  href: '/blog/noodopvang-hond-wat-zijn-je-opties',
                  title: 'Noodopvang voor je hond: wat zijn je opties?',
                },
                {
                  href: '/blog/wat-kost-hondenoppas-aan-huis',
                  title: 'Wat kost hondenoppas aan huis?',
                },
                {
                  href: '/blog/wat-kost-hondenopvang',
                  title: 'Wat kost hondenopvang?',
                },
                {
                  href: '/blog/wat-is-beter-hondenopvang-of-hondenoppas-aan-huis',
                  title: 'Wat is beter: hondenopvang of hondenoppas aan huis?',
                },
                {
                  href: '/blog/hoe-lang-mag-een-hond-alleen-zijn',
                  title: 'Hoe lang mag een hond alleen zijn?',
                },
                {
                  href: '/blog/wat-doen-met-hond-tijdens-vakantie',
                  title: 'Wat doen met je hond tijdens vakantie?',
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
                  className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm transition hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2"
                >
                  <h3 className="text-base font-semibold leading-snug text-gray-900">{item.title}</h3>
                  <p className="mt-3 text-sm font-semibold text-emerald-700" aria-hidden="true">
                    Lees antwoord →
                  </p>
                </Link>
              ))}
            </div>
            <div className="mt-8 flex justify-center">
              <Link href="/blog" className="btn-secondary-compact">
                Meer tips op de blog
              </Link>
            </div>
          </section>

          <section className="mt-12 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/80 via-white to-blue-50/60 p-6 md:p-8 shadow-sm">
            <div className="mx-auto max-w-3xl text-center">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">
                Niet zeker welke dienst past?
              </h2>
              <p className="copy-pretty mt-3 text-base leading-relaxed text-gray-700">
                Dien je aanvraag in met je situatie (dier, regio, timing). We matchen je met een passende verzorger en
                volgen persoonlijk op — meestal dezelfde werkdag.
              </p>
              <div className="mt-6 flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3">
                <Link href="/boeken" className="btn-brand-compact w-full sm:w-auto">
                  Start je aanvraag
                </Link>
                <Link href="/over-ons" className="btn-secondary-compact w-full sm:w-auto">
                  Meer over TailTribe
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}




