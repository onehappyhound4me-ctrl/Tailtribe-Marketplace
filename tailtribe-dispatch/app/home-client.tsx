'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { DISPATCH_SERVICES } from '@/lib/services'
import { routes } from '@/lib/routes'
import { getPublicReviewsAggregateRating, GOOGLE_REVIEWS_URL, PUBLIC_REVIEWS } from '@/lib/reviews'
import { HOME_FEATURED_CARE, HOME_HERO, HOME_HOW_IMAGE, HOME_MID_BANNER } from '@/lib/home-photography'

const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'

function StarRow({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const clamped = Math.min(5, Math.max(0, value))
  const dim = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${clamped} van 5 sterren`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.min(1, Math.max(0, clamped - i))
        return (
          <span key={i} className={`relative inline-flex ${dim} shrink-0`}>
            <svg className={`${dim} text-slate-200`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d={STAR_PATH} />
            </svg>
            {fill > 0 ? (
              <span className="absolute left-0 top-0 h-full overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <svg className={`${dim} text-amber-400`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d={STAR_PATH} />
                </svg>
              </span>
            ) : null}
          </span>
        )
      })}
    </span>
  )
}

function VerifiedPill() {
  return (
    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-emerald-800 ring-1 ring-emerald-200/80">
      <svg className="h-3.5 w-3.5 text-emerald-600" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
        <path
          fillRule="evenodd"
          d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
          clipRule="evenodd"
        />
      </svg>
      Netwerk
    </span>
  )
}

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

function formatNlRating(rating: number) {
  return rating.toLocaleString('nl-BE', { minimumFractionDigits: 0, maximumFractionDigits: 1 })
}

export default function HomePageClient() {
  const { data: session } = useSession()
  const reviewAgg = getPublicReviewsAggregateRating()
  const ratingLabel = formatNlRating(reviewAgg.ratingValue)
  const googleReviewLine =
    'reviewCount' in reviewAgg && reviewAgg.reviewCount != null
      ? `${ratingLabel}/5 · ${reviewAgg.reviewCount} reviews op Google`
      : `${ratingLabel}/5 gemiddeld op Google`

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

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-50 via-white to-emerald-50/40">
      <SiteHeader primaryCtaHref={bookingHref} primaryCtaLabel="Boek Nu" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

      {/* Hero — full-bleed beeld, overlay, sterke hiërarchie */}
      <section className="relative w-full">
        <div className="relative min-h-[min(88vh,920px)] w-full overflow-hidden bg-gradient-to-br from-emerald-800 via-teal-900 to-slate-900">
          <Image
            src={HOME_HERO.src}
            alt={HOME_HERO.alt}
            fill
            priority
            unoptimized
            sizes="(max-width: 640px) 120vw, 100vw"
            className="z-0 object-cover object-[50%_34%] sm:object-[48%_28%]"
            referrerPolicy="no-referrer"
          />
          <div
            className="absolute inset-0 z-[1] bg-gradient-to-t from-black/55 via-black/30 to-black/15 motion-safe:transition-opacity"
            aria-hidden
          />
          <div
            className="absolute inset-0 z-[1] bg-gradient-to-r from-black/40 via-transparent to-transparent"
            aria-hidden
          />

          <div className="relative z-[2] mx-auto flex min-h-[min(88vh,920px)] max-w-7xl flex-col justify-end px-4 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-32 md:justify-center md:pb-20 md:pl-10 md:pr-8 lg:pl-14">
            <div className="max-w-2xl text-left">
              <p className="mb-2 text-sm font-semibold text-white/95 sm:text-base">
                Voor en door dierenverzorgers
              </p>
              <p className="mb-3 text-xs font-semibold uppercase tracking-[0.2em] text-emerald-200/95 sm:text-sm">
                Join our tribe
              </p>
              <h1 className="font-heading text-4xl font-bold leading-[1.08] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-7xl">
                De juiste{' '}
                <span className="bg-gradient-to-r from-emerald-200 to-teal-200 bg-clip-text text-transparent">
                  dierenoppasser
                </span>{' '}
                voor jouw maatje
              </h1>
              <p className="mt-5 max-w-xl text-base leading-relaxed text-white/90 sm:text-lg md:text-xl">
                Van uitlaat en oppas tot training en transport — aanvraag in enkele minuten, persoonlijke opvolging
                door heel België.
              </p>

              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-6 inline-flex flex-wrap items-center gap-3 rounded-2xl border border-white/15 bg-white/10 px-4 py-3 backdrop-blur-md transition duration-200 hover:border-white/25 hover:bg-white/15"
              >
                <StarRow value={reviewAgg.ratingValue} />
                <span className="text-sm font-medium text-white">{googleReviewLine}</span>
              </a>

              <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
                <Link
                  href={bookingHref}
                  className="group inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 px-7 py-3.5 text-base font-semibold text-white shadow-[0_12px_40px_rgba(16,185,129,0.35)] ring-1 ring-white/10 transition duration-200 hover:scale-[1.02] hover:from-emerald-400 hover:to-emerald-500 hover:shadow-[0_16px_44px_rgba(16,185,129,0.42)] motion-reduce:hover:scale-100 active:scale-[0.99]"
                >
                  Start je aanvraag
                  <svg
                    className="h-5 w-5 transition-transform duration-200 group-hover:translate-x-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    aria-hidden
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </Link>
                <Link
                  href="/verzorger-aanmelden"
                  className="inline-flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-6 py-3.5 text-base font-semibold text-white backdrop-blur-sm transition duration-200 hover:border-white/50 hover:bg-white/20"
                >
                  Word dierenoppasser
                </Link>
              </div>

              <div className="mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-white/85">
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                  Gescreend netwerk
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                  Snel antwoord
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.9)]" />
                  Maatwerk, geen standaard checkout
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Secundaire trust-strip */}
        <div className="border-b border-emerald-100/60 bg-white/80 backdrop-blur-sm">
          <div className="container mx-auto max-w-5xl px-4 py-6 sm:px-6">
            <p className="text-center text-sm font-medium leading-relaxed text-slate-600 sm:text-base">
              <span className="text-slate-900">Voor en door dierenverzorgers.</span>{' '}
              Van hondenuitlaat en kattenoppas tot zorg voor kleinvee en paarden — wij matchen en volgen op.
            </p>
          </div>
        </div>
      </section>

      {/* Diensten — pictogrammen (detailpagina toont de sfeerfoto’s) */}
      <section id="services" className="scroll-mt-28 py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-700">Aanbod</p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl">
              Ontdek onze diensten
            </h2>
            <p className="copy-pretty mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600 sm:text-lg">
              Elk pictogram staat voor een dienst. Klik door voor de volledige uitleg en foto’s op de dienstpagina.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-slate-600">
              <StarRow value={reviewAgg.ratingValue} />
              <span className="font-medium text-slate-800">
                {'reviewCount' in reviewAgg && reviewAgg.reviewCount != null
                  ? `${ratingLabel}/5 gemiddeld op Google (${reviewAgg.reviewCount} reviews)`
                  : `${ratingLabel}/5 gemiddeld op Google`}
              </span>
            </div>
          </div>

          <div className="mx-auto grid max-w-6xl grid-cols-1 gap-8 md:grid-cols-2 md:gap-9 lg:grid-cols-3">
            {DISPATCH_SERVICES.map((service, index) => {
              return (
                <Link
                  key={service.id}
                  href={routes.dienst(service.slug)}
                  data-nav="service"
                  data-component="HomePage.ServicesGrid"
                  data-service-id={service.id}
                  data-service-slug={service.slug}
                  className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] ring-1 ring-slate-100 transition duration-300 hover:-translate-y-1 hover:border-emerald-200/80 hover:shadow-[0_20px_50px_rgba(16,185,129,0.12)] motion-reduce:transition-none motion-reduce:hover:translate-y-0"
                >
                  <div className="relative flex aspect-[4/3] w-full items-center justify-center overflow-hidden bg-gradient-to-br from-emerald-200 via-emerald-50 to-emerald-900/12">
                    <Image
                      src={encodeURI(service.image)}
                      alt={service.name}
                      width={160}
                      height={160}
                      unoptimized
                      priority={index < 3}
                      className="h-28 w-28 object-contain transition duration-300 ease-out group-hover:scale-105 motion-reduce:group-hover:scale-100 sm:h-32 sm:w-32"
                    />
                  </div>
                  <div className="flex flex-1 flex-col gap-3 p-5 sm:p-6">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="text-lg font-bold text-slate-900 transition-colors group-hover:text-emerald-800 sm:text-xl">
                        {service.name}
                      </h3>
                      <VerifiedPill />
                    </div>
                    <p className="copy-pretty line-clamp-3 flex-1 text-sm leading-relaxed text-slate-600">
                      {service.desc}
                    </p>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-700">
                      Meer info
                      <svg className="h-4 w-4 transition group-hover:translate-x-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </span>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {/* Visuele ademruimte */}
      <section className="px-4 pb-16 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-7xl">
          <div className="relative aspect-[21/9] min-h-[200px] w-full overflow-hidden rounded-2xl bg-slate-800 shadow-[0_20px_50px_rgba(15,23,42,0.08)] ring-1 ring-slate-200/80 sm:aspect-[24/9] md:min-h-[280px]">
            <Image
              src={HOME_MID_BANNER.src}
              alt={HOME_MID_BANNER.alt}
              fill
              unoptimized
              sizes="(max-width: 1280px) 100vw, 1280px"
              className="object-cover object-[center_35%]"
              referrerPolicy="no-referrer"
            />
            <div
              className="absolute inset-0 z-[1] bg-gradient-to-r from-emerald-950/55 via-emerald-900/20 to-transparent"
              aria-hidden
            />
            <div className="absolute inset-y-0 left-0 z-[2] flex max-w-lg flex-col justify-center px-6 sm:px-10 md:px-12">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-emerald-200/95">Moment van zorg</p>
              <p className="mt-3 font-heading text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                Mensen en dieren, één team
              </p>
              <p className="mt-3 text-sm leading-relaxed text-white/90 sm:text-base">
                Dat is wat we visueel en in de communicatie willen uitstralen: warmte, duidelijkheid en vertrouwen.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Hoe werkt het — split layout */}
      <section className="bg-gradient-to-br from-emerald-50/80 via-white to-sky-50/50 py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl">
              Hoe werkt het?
            </h2>
            <p className="copy-pretty mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
              Drie duidelijke stappen — daarna nemen wij de match en opvolging voor onze rekening.
            </p>
          </div>

          <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
            <div className="relative order-2 aspect-[4/5] w-full max-w-md overflow-hidden rounded-2xl bg-slate-200 shadow-[0_24px_60px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/60 sm:max-w-none lg:order-1">
              <Image
                src={HOME_HOW_IMAGE.src}
                alt={HOME_HOW_IMAGE.alt}
                fill
                unoptimized
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover object-[center_30%]"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="order-1 space-y-6 lg:order-2">
              {[
                {
                  step: '1',
                  title: 'Vul je aanvraag in',
                  desc: 'Kies je dienst, vertel kort wat je nodig hebt — klaar in enkele minuten.',
                },
                {
                  step: '2',
                  title: 'Wij zoeken de juiste verzorger',
                  desc: 'We matchen op beschikbaarheid, regio en type zorg. Je hoort snel van ons.',
                },
                {
                  step: '3',
                  title: 'Afspraak met rust',
                  desc: 'Na bevestiging stem je samen met de verzorger de details af.',
                },
              ].map((item) => (
                <div
                  key={item.step}
                  className="flex gap-5 rounded-2xl border border-white/80 bg-white/90 p-6 shadow-[0_8px_30px_rgba(15,23,42,0.05)] backdrop-blur-sm transition duration-200 hover:border-emerald-100 hover:shadow-[0_12px_36px_rgba(16,185,129,0.08)]"
                >
                  <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-xl font-bold text-white shadow-lg">
                    {item.step}
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
                    <p className="copy-pretty mt-2 text-sm leading-relaxed text-slate-600 sm:text-base">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Waarom + featured zorg (beelden) */}
      <section className="py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <h2 className="font-heading text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl">Waarom TailTribe?</h2>
            <p className="copy-pretty mx-auto mt-4 max-w-2xl text-base text-slate-600 sm:text-lg">
              Minder gedoe, meer zekerheid — zodat jij je kan focussen op je huisdier.
            </p>
          </div>

          <div className="mb-16 grid gap-8 md:grid-cols-3">
            {[
              {
                title: 'Gescreend netwerk',
                desc: 'We werken met zorgvuldig geselecteerde verzorgers en zoeken de best passende match.',
              },
              {
                title: 'Snelle opvolging',
                desc: 'Je aanvraag krijgt prioriteit: we reageren rap en houden het persoonlijk.',
              },
              {
                title: 'Maatwerk',
                desc: 'Geen vaste checkout-flow: prijs en werkwijze stemmen we af op jouw situatie.',
              },
            ].map((benefit) => (
              <div
                key={benefit.title}
                className="rounded-2xl border border-slate-100 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_45px_rgba(15,23,42,0.09)] motion-reduce:hover:translate-y-0"
              >
                <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-md">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-slate-900">{benefit.title}</h3>
                <p className="copy-pretty mt-3 text-sm leading-relaxed text-slate-600 sm:text-base">{benefit.desc}</p>
              </div>
            ))}
          </div>

          <div className="mb-12 rounded-[20px] border border-emerald-100 bg-gradient-to-br from-white to-emerald-50/40 p-8 shadow-sm md:p-10">
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-emerald-800">Diergroepen</p>
            <h3 className="mt-3 font-heading text-2xl font-semibold text-slate-900 md:text-3xl">
              Meer dan honden en katten alleen
            </h3>
            <p className="mt-4 max-w-3xl text-base leading-relaxed text-slate-700">
              Ook voor vogels, kleine huisdieren, paarden, vissen en kleinvee kan je via TailTribe zorg op maat
              aanvragen — thuis of tijdens je afwezigheid.
            </p>
          </div>

          <p className="mb-8 text-center text-xs font-semibold uppercase tracking-[0.16em] text-slate-500">
            Zo voelt goede zorg
          </p>
          <div className="grid gap-8 md:grid-cols-3">
            {HOME_FEATURED_CARE.map((item) => (
              <div
                key={item.src}
                className="group flex flex-col overflow-hidden rounded-2xl border border-slate-200/80 bg-white shadow-[0_8px_30px_rgba(15,23,42,0.06)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_18px_48px_rgba(15,23,42,0.1)] motion-reduce:hover:translate-y-0"
              >
                <div className="relative aspect-[5/4] overflow-hidden bg-slate-200">
                  <Image
                    src={item.src}
                    alt={item.alt}
                    fill
                    unoptimized
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition duration-300 group-hover:scale-105 motion-reduce:group-hover:scale-100"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <div className="flex flex-1 flex-col gap-2 p-6">
                  <div className="flex items-center justify-between gap-2">
                    <h3 className="font-heading text-lg font-bold text-slate-900">{item.title}</h3>
                    <VerifiedPill />
                  </div>
                  <p className="text-sm leading-relaxed text-slate-600">{item.caption}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Reviews */}
      <section className="bg-slate-50/90 py-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-6xl">
          <div className="mx-auto mb-14 max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-emerald-800">Ervaringen</p>
            <h2 className="mt-3 font-heading text-3xl font-bold text-slate-900 sm:text-4xl md:text-5xl">
              Wat baasjes waarderen
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              Echte meningen over duidelijke communicatie, opvolging en zorg voor het dier.
            </p>
            <p className="mx-auto mt-5">
              <a
                href={GOOGLE_REVIEWS_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-800 underline decoration-emerald-800/30 underline-offset-4 transition hover:text-emerald-900"
              >
                Alle reviews op Google
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </a>
            </p>
          </div>

          <div className="mx-auto grid max-w-6xl gap-8 md:grid-cols-3">
            {PUBLIC_REVIEWS.map((review) => (
              <article
                key={review.name}
                className="group flex h-full flex-col rounded-2xl border border-slate-200/90 bg-white p-7 shadow-[0_8px_30px_rgba(15,23,42,0.05)] transition duration-300 hover:-translate-y-1 hover:border-emerald-200/60 hover:shadow-[0_20px_50px_rgba(16,185,129,0.1)] motion-reduce:hover:translate-y-0"
              >
                <div className="mb-4 flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-500 to-blue-600 text-lg font-bold text-white shadow-md">
                      {review.name.charAt(0)}
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900">{review.name}</p>
                      <p className="mt-1 inline-flex rounded-full bg-slate-100 px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-slate-600">
                        {review.sourceLabel}
                      </p>
                    </div>
                  </div>
                  <StarRow value={review.rating} />
                </div>
                <p className="flex-1 text-sm leading-relaxed text-slate-700 sm:text-[15px]">{review.quote}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Afsluitende CTA */}
      <section className="py-16 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 px-8 py-12 text-center shadow-[0_24px_60px_rgba(5,150,105,0.35)] sm:px-12 sm:py-14">
            <div className="pointer-events-none absolute -left-20 -top-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" aria-hidden />
            <div className="pointer-events-none absolute -bottom-24 -right-16 h-72 w-72 rounded-full bg-teal-400/20 blur-3xl" aria-hidden />
            <h2 className="relative font-heading text-2xl font-bold text-white sm:text-3xl md:text-4xl">
              Klaar om het verschil te voelen?
            </h2>
            <p className="relative mx-auto mt-4 max-w-2xl text-base text-emerald-50 sm:text-lg">
              Geen lange formulier-hel. Wel een duidelijke aanvraag en mensen die meedenken.
            </p>
            <div className="relative mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href={bookingHref}
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl bg-white px-8 py-3.5 text-base font-semibold text-emerald-800 shadow-lg transition duration-200 hover:scale-[1.03] hover:bg-emerald-50 motion-reduce:hover:scale-100"
              >
                Boek nu
              </Link>
              <Link
                href="/diensten"
                className="inline-flex min-h-[48px] items-center justify-center rounded-2xl border-2 border-white/40 px-8 py-3.5 text-base font-semibold text-white transition duration-200 hover:border-white hover:bg-white/10"
              >
                Bekijk alle diensten
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="container mx-auto max-w-5xl">
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.04)] sm:p-10">
            <h2 className="font-heading text-2xl font-bold text-slate-900 sm:text-3xl">Veelgestelde vragen</h2>
            <div className="mt-8 space-y-4">
              {HOME_FAQS.map((f) => (
                <div key={f.q} className="rounded-2xl border border-slate-100 bg-slate-50/50 p-6 transition hover:border-emerald-100/80">
                  <h3 className="font-semibold text-slate-900">{f.q}</h3>
                  <p className="mt-2 text-slate-700 leading-relaxed">{f.a}</p>
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
