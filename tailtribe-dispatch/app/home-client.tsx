'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { DISPATCH_SERVICES } from '@/lib/services'
import { withAssetVersion } from '@/lib/service-icons'
import { routes } from '@/lib/routes'
import { getPublicAppUrl } from '@/lib/env'
import { GOOGLE_REVIEWS_URL, PUBLIC_REVIEWS, getPublicReviewsAggregateRating } from '@/lib/reviews'

const HERO_IMG_PRIMARY = '/assets/hero-marketplace.jpg?v=1'
const HERO_IMG_URL = encodeURI(HERO_IMG_PRIMARY)
const APP_URL = getPublicAppUrl()

const HOME_FAQS = [
  {
    q: 'In welke regio werken jullie?',
    a: 'Beschikbaarheid kan per dienst en regio verschillen; na je aanvraag bevestigen we snel wat haalbaar is.',
  },
  {
    q: 'Hoe snel nemen jullie contact op?',
    a: 'Na je aanvraag nemen we zo snel mogelijk contact op om alles af te stemmen (meestal dezelfde werkdag).',
  },
  {
    q: 'Is er online betaling?',
    a: 'Nee. We spreken prijs en details af na contact. Zo blijft elke aanvraag op maat (duur, frequentie, locatie, extra zorg).',
  },
  {
    q: 'Doen jullie ook dierenoppas aan huis?',
    a: 'Ja. Dierenoppas en verzorging aan huis kan voor honden, katten en kleine huisdieren, met duidelijke afspraken rond routine en toegang.',
  },
  {
    q: 'Kan ik last-minute boeken?',
    a: 'Soms wel, afhankelijk van capaciteit. Vermeld “spoed” in je aanvraag, dan kijken we meteen wat haalbaar is.',
  },
] as const

export default function HomePageClient() {
  const { data: session } = useSession()

  const bookingHref =
    session?.user?.role === 'OWNER' ? '/dashboard/owner/new-booking' : '/boeken'

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: HOME_FAQS.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const homepageAgg = getPublicReviewsAggregateRating()
  const homepageReviewsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${APP_URL}/#organization`,
    name: 'TailTribe',
    ...(homepageAgg ? { aggregateRating: homepageAgg } : {}),
    review: PUBLIC_REVIEWS.map((review) => ({
      '@type': 'Review',
      author: { '@type': 'Person', name: review.name },
      reviewRating: { '@type': 'Rating', ratingValue: review.rating, bestRating: 5 },
      reviewBody: review.quote,
    })),
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref={bookingHref} primaryCtaLabel="Boek Nu" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(homepageReviewsJsonLd) }} />

      <section className="w-full">
        <div className="w-full">
          <div className="relative w-full aspect-[16/9] overflow-hidden bg-gradient-to-b from-green-50 via-white to-blue-50">
            <Image
              src={HERO_IMG_URL}
              alt="TailTribe — dierenverzorging in België: hondenuitlaat, dierenoppas en verzorging aan huis"
              fill
              priority
              sizes="100vw"
              className="object-contain [filter:brightness(1.08)_saturate(1.04)_blur(0.6px)]"
            />
            <div className="absolute inset-0 bg-black/12" />

            <div className="absolute inset-x-0 top-4 sm:top-6 md:top-8 lg:top-10 z-10 px-4 sm:px-8 md:px-12">
              <div className="mx-auto text-center max-w-5xl">
                <h1
                  className="text-3xl sm:text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white"
                  style={{ textShadow: '0 3px 12px rgba(0,0,0,0.55)' }}
                >
                  Vind de juiste{' '}
                  <span className="text-green-200 transition-colors duration-200 hover:text-white hover:drop-shadow-[0_0_12px_rgba(74,222,128,0.85)]">
                    dierenoppasser
                  </span>{' '}
                  voor je huisdier
                </h1>
              </div>
            </div>
          </div>
        </div>

        <div className="container mx-auto px-4 sm:px-6 pt-8 sm:pt-10 pb-14 sm:pb-16">
          <div className="max-w-5xl mx-auto">
            <div className="mx-auto max-w-4xl">
              <div className="rounded-3xl bg-white/70 backdrop-blur-sm border border-emerald-100/70 shadow-[0_12px_40px_rgba(16,185,129,0.10)] px-5 py-6 sm:px-8 sm:py-7">
                <div className="text-center">
                  <p className="copy-pretty text-base font-heading font-medium text-gray-900 leading-relaxed tracking-[-0.01em] sm:hidden">
                    Van hondenuitlaat en kattenoppas tot verzorging voor kleine huisdieren, paarden, vissen en
                    kleinvee. Wij regelen de match en opvolging.
                  </p>
                  <p className="copy-pretty hidden sm:block sm:text-lg md:text-xl font-heading font-medium text-gray-900 leading-relaxed tracking-[-0.01em]">
                    Van hondenuitlaat en kattenoppas tot verzorging voor kleine huisdieren, paarden, vissen en
                    kleinvee. Wij regelen de match en opvolging.
                  </p>
                  <p className="mt-2 text-sm sm:text-base md:text-lg text-emerald-950/90 font-semibold tracking-[-0.01em]">
                    Voor en door dierenverzorgers
                  </p>
                </div>

                <div className="mt-6 sm:mt-7 flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-stretch sm:items-center">
                  <Link
                    href={bookingHref}
                    className="group relative w-full sm:w-auto inline-flex items-center justify-center gap-1.5 overflow-hidden rounded-full bg-gradient-to-r from-emerald-600 to-green-600 px-5 sm:px-6 py-3 text-[14px] font-semibold text-white shadow-md ring-1 ring-emerald-600/20 transition-all duration-200 hover:-translate-y-0.5 hover:from-emerald-500 hover:to-green-500 hover:shadow-lg active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-emerald-300 min-h-[44px]"
                  >
                    <span className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.18),transparent_55%)]" />
                    Boek Nu
                    <svg
                      className="h-4 w-4 opacity-90 transition-transform duration-200 group-hover:translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </Link>

                  <Link
                    href="/verzorger-aanmelden"
                    className="group w-full sm:w-auto inline-flex items-center justify-center gap-1.5 rounded-full bg-emerald-50 border border-emerald-200 px-5 sm:px-6 py-3 text-[14px] font-semibold text-emerald-800 shadow-sm ring-1 ring-emerald-200/80 transition-all duration-200 hover:bg-emerald-100 hover:border-emerald-300 hover:ring-emerald-300/80 active:translate-y-0 focus:outline-none focus:ring-2 focus:ring-emerald-200 min-h-[44px]"
                  >
                    <span className="sm:whitespace-nowrap">Join our tribe: werk met dieren</span>
                    <svg
                      className="h-4 w-4 text-emerald-700 transition-transform duration-200 group-hover:translate-x-0.5"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>

                <div className="mt-4 flex flex-wrap items-center justify-center gap-x-4 gap-y-2 text-xs sm:text-sm text-gray-600">
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Gescreende verzorgers
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Snelle bevestiging
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Afspraak op maat
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section id="services" className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-gray-800">
              Ontdek onze diensten
            </h2>
            <p className="copy-pretty text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Van honden en katten tot vogels, konijnen, paarden, vissen en kleinvee
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 md:gap-10 max-w-6xl mx-auto">
            {DISPATCH_SERVICES.map((service, index) => (
              <Link
                key={service.id}
                href={routes.dienst(service.slug)}
                data-nav="service"
                data-component="HomePage.ServicesGrid"
                data-service-id={service.id}
                data-service-slug={service.slug}
                className="group bg-gradient-to-br from-white via-white to-emerald-50 rounded-2xl shadow-md hover:shadow-2xl transition-all duration-300 overflow-hidden border border-emerald-100 hover:border-emerald-200 transform hover:-translate-y-1"
              >
                <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-emerald-50 to-blue-50 p-3 sm:h-40 sm:p-4">
                  <Image
                    src={withAssetVersion(service.image)}
                    alt={service.name}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    priority={index < 3}
                    className="object-contain transition-transform duration-300 md:group-hover:scale-105 md:[filter:hue-rotate(28deg)_saturate(0.62)_brightness(0.98)_contrast(1.08)]"
                  />
                </div>
                <div className="p-5 sm:p-6 pt-6">
                  <h3 className="text-lg font-bold mb-2 text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 group-hover:from-emerald-600 group-hover:to-blue-600 transition-colors">
                    {service.name}
                  </h3>
                  <p className="copy-pretty text-sm text-emerald-900/90 leading-relaxed line-clamp-3">{service.desc}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-green-50">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-gray-800">
              Hoe werkt het?
            </h2>
            <p className="copy-pretty text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              In 3 eenvoudige stappen naar de perfecte dierenoppas
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto items-stretch">
            {[
              {
                step: '1',
                title: 'Vul je aanvraag in',
                desc: 'Kies je dienst en datum, vul kort je gegevens in; klaar in 2 minuten',
              },
              {
                step: '2',
                title: 'Wij plannen de juiste verzorger',
                desc: 'We matchen je aanvraag, stemmen kort af en plannen de juiste verzorger',
              },
              {
                step: '3',
                title: 'Relax & Geniet',
                desc: 'Na bevestiging komt de verzorger langs; samen stemmen jullie planning en afspraken af',
              },
            ].map((item) => (
              <div
                key={item.step}
                className="text-center flex flex-col items-center h-full bg-white/70 rounded-2xl p-6 shadow-sm border border-emerald-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-xl font-bold mb-2 text-gray-800">{item.title}</h3>
                <p className="copy-pretty text-gray-600 text-center text-sm sm:text-base leading-relaxed px-2">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-blue-50 to-purple-50">
        <div className="container mx-auto max-w-6xl">
          <div className="max-w-3xl mx-auto text-center mb-12">
            <h2 className="text-2xl sm:text-4xl md:text-5xl font-bold mb-3 sm:mb-4 text-gray-800">
              Waarom TailTribe?
            </h2>
            <p className="copy-pretty text-sm sm:text-base md:text-xl text-gray-600 max-w-2xl mx-auto leading-relaxed">
              Jij vraagt aan, wij nemen je gemoedsrust op ons: we regelen en volgen op met zorg
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {[
              {
                title: 'Gescreende verzorgers',
                desc: 'We werken met betrouwbare verzorgers en zoeken de beste match voor jouw aanvraag',
              },
              {
                title: 'Snelle bevestiging',
                desc: 'We reageren snel: we bevestigen je aanvraag en stemmen de details kort af',
              },
              {
                title: 'Afspraak op maat',
                desc: 'Geen online betaling: we spreken prijs en details af op basis van jouw situatie',
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="group bg-white rounded-2xl p-6 sm:p-8 shadow-md hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100"
              >
                <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  {benefit.title === 'Gescreende verzorgers' && (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  {benefit.title === 'Snelle bevestiging' && (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                      />
                    </svg>
                  )}
                  {benefit.title === 'Afspraak op maat' && (
                    <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                      />
                    </svg>
                  )}
                </div>
                <h3 className="text-xl sm:text-2xl font-bold mb-3 text-gray-800">{benefit.title}</h3>
                <p className="copy-pretty text-gray-600 text-sm sm:text-base leading-relaxed">{benefit.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-10 rounded-3xl border border-emerald-100 bg-white/80 p-6 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-800">Voor welke dieren?</p>
            <h3 className="mt-3 text-2xl font-semibold text-gray-900">Zorg voor meer dan alleen honden en katten</h3>
            <p className="mt-4 max-w-3xl text-base leading-8 text-gray-700">
              TailTribe helpt bij services voor honden, katten, vogels, kleine huisdieren zoals hamsters en konijnen,
              paarden, vissen en kleinvee. Zo kun je ook voor andere dieren rekenen op zorg op maat, thuis of tijdens
              je afwezigheid.
            </p>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-800">Ervaringen</p>
            <h2 className="mt-3 text-2xl sm:text-4xl md:text-5xl font-bold text-gray-800">
              Wat baasjes waarderen aan TailTribe
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-sm leading-relaxed text-gray-600 sm:text-base md:text-xl">
              Echte feedback van klanten die duidelijkheid, opvolging en zorg voor hun huisdier belangrijk vinden.
            </p>
            <p className="mx-auto mt-5 max-w-2xl text-center">
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-800 underline decoration-emerald-800/30 underline-offset-4 transition hover:text-emerald-900 hover:decoration-emerald-800"
              >
                Meer reviews op Google
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-6 md:grid-cols-3">
            {PUBLIC_REVIEWS.map((review) => (
              <article
                key={review.name}
                className="group flex h-full flex-col rounded-3xl border border-slate-200/80 bg-white p-7 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
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
                <p className="flex-1 text-sm leading-7 text-slate-700 sm:text-base">{review.quote}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="pb-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 sm:p-8">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-4">Veelgestelde vragen</h2>
            <div className="space-y-4">
              {HOME_FAQS.map((f) => (
                <div key={f.q} className="rounded-xl border border-black/5 p-5">
                  <h3 className="font-semibold text-gray-900 mb-2">{f.q}</h3>
                  <p className="text-gray-700 leading-relaxed">{f.a}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  )
}
