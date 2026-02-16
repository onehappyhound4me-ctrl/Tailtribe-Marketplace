import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { ProviderSpotlight } from '@/components/ProviderSpotlight'
import { DISPATCH_SERVICES, getDispatchServiceBySlug } from '@/lib/services'
import { SERVICE_ICON_FILTER, withAssetVersion } from '@/lib/service-icons'
import { routes } from '@/lib/routes'

type Props = {
  params: { slug: string }
}

export function generateStaticParams() {
  return DISPATCH_SERVICES.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
  const service = getDispatchServiceBySlug(params.slug)
  if (!service) {
    return { title: 'Dienst niet gevonden', description: 'Deze dienst bestaat niet.' }
  }

  const pageTitle = service.detailTitle ?? service.name
  const canonicalUrl = `${baseUrl}/diensten/${service.slug}`

  return {
    title: pageTitle,
    description: `${service.desc}. Vraag eenvoudig een offerte aan — we nemen binnen 2 uur contact op.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: pageTitle,
      description: `${service.desc}. Vraag eenvoudig een offerte aan — we nemen binnen 2 uur contact op.`,
      url: canonicalUrl,
      siteName: 'TailTribe',
      locale: 'nl_BE',
      type: 'website',
    },
  }
}

export default function DienstDetailPage({ params }: Props) {
  const service = getDispatchServiceBySlug(params.slug)
  if (!service) notFound()

  const renderTextWithAutoBullets = (text: string) => {
    const lines = text
      .split(/\r?\n/)
      .map((l) => l.trim())
      .filter(Boolean)

    const bullets: string[] = []
    const paragraphs: string[] = []

    for (const line of lines) {
      const m = line.match(/^[-*•]\s+(.*)$/)
      if (m && m[1]) bullets.push(m[1].trim())
      else paragraphs.push(line)
    }

    // If it contains any explicit bullet lines, prefer rendering them as true bulletpoints.
    if (bullets.length > 0) {
      return (
        <div className="space-y-3">
          {paragraphs.length > 0 ? (
            <div className="space-y-3">
              {paragraphs.map((p, idx) => (
                <p
                  key={`${p}-${idx}`}
                  className="text-emerald-900/90 text-[15px] leading-7 md:text-base md:leading-relaxed"
                >
                  {p}
                </p>
              ))}
            </div>
          ) : null}

          <ul className="list-disc pl-5 space-y-3 md:space-y-2 text-emerald-900/90 text-[15px] md:text-base marker:text-emerald-600/80">
            {bullets.map((b) => (
              <li key={b}>{b}</li>
            ))}
          </ul>
        </div>
      )
    }

    // Otherwise: render as paragraphs (keeps existing whitespace-pre-line behavior).
    return (
      <p className="text-emerald-900/90 text-[15px] leading-7 md:text-base md:leading-relaxed whitespace-pre-line">
        {text}
      </p>
    )
  }

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
  const canonicalUrl = `${baseUrl}/diensten/${service.slug}`
  const imageUrl = `${baseUrl}${service.image}`

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.detailTitle ?? service.name,
    description: service.desc,
    serviceType: service.name,
    areaServed: { '@type': 'Country', name: 'België' },
    provider: {
      '@type': 'Organization',
      name: 'TailTribe',
      url: baseUrl,
    },
    url: canonicalUrl,
    image: imageUrl,
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Diensten', item: `${baseUrl}/diensten` },
      { '@type': 'ListItem', position: 3, name: service.name, item: canonicalUrl },
    ],
  }

  const related = DISPATCH_SERVICES.filter((s) => s.id !== service.id).slice(0, 6)

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />

      <main className="container mx-auto px-4 py-12 sm:py-14">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
        />
        <div className="max-w-6xl mx-auto">
          <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 mb-5 sm:mb-6">
            <Link href="/" className="hover:text-gray-700">
              Home
            </Link>
            <span>›</span>
            <Link href={routes.diensten} className="hover:text-gray-700">
              Diensten
            </Link>
            <span>›</span>
            <span className="text-gray-900">{service.name}</span>
          </nav>

          <header className="bg-white rounded-2xl shadow-sm border border-black/5 p-5 sm:p-8 md:p-10 flex flex-col md:flex-row gap-6 sm:gap-8 items-center">
            <div className="relative w-28 h-28 sm:w-40 sm:h-40 md:w-48 md:h-48 rounded-2xl overflow-hidden bg-gradient-to-br from-emerald-50 to-blue-50 border border-black/5 flex-shrink-0">
              {/* Use plain <img> for local /assets icons: more reliable on mobile Safari than Next/Image optimizer. */}
              <img
                src={withAssetVersion(service.image)}
                alt={service.name}
                loading="eager"
                decoding="async"
                className="h-full w-full object-contain p-3 md:[filter:hue-rotate(28deg)_saturate(0.62)_brightness(0.98)_contrast(1.08)]"
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                {service.detailTitle ?? service.name}
              </h1>
              <p className="text-sm sm:text-base md:text-lg leading-relaxed text-gray-600 max-w-2xl">
                {service.desc}
              </p>
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                <Link href={`/boeken?service=${service.id}`} className="btn-brand inline-block">
                  Aanvraag indienen
                </Link>
                <Link
                  href={routes.diensten}
                  className="inline-block px-6 py-3 rounded-tt border border-white/10 bg-white text-gray-900 hover:bg-gray-50 transition"
                >
                  Alle diensten
                </Link>
              </div>
            </div>
          </header>

          <section className="mt-8 md:mt-10 space-y-6 md:space-y-8">
            {service.providerSpotlight ? (
              <ProviderSpotlight
                name={service.providerSpotlight.name}
                href={service.providerSpotlight.href}
                label={service.providerSpotlight.label}
                areas={service.providerSpotlight.areas}
                availabilityText={service.providerSpotlight.availabilityText}
                ctaLabel={service.providerSpotlight.ctaLabel}
                note={service.providerSpotlight.note}
              />
            ) : null}
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-5 sm:p-6 md:p-8">
              <h2 className="text-xl sm:text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 mb-4">
                Waarom deze dienst?
              </h2>
              {service.longDescription?.whyText ? (
                renderTextWithAutoBullets(service.longDescription.whyText)
              ) : (
                <ul className="list-disc pl-5 space-y-3 md:space-y-2 text-emerald-900/90 text-[15px] md:text-base marker:text-emerald-600/80">
                  {(service.longDescription?.why ?? [
                    'We stemmen de details persoonlijk met je af.',
                    'Duidelijke afspraken vooraf, geen online betaling.',
                    'Snelle opvolging: binnen 2 uur contact.',
                  ]).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </div>

            {service.id === 'GROUP_DOG_WALKING' && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-green-500 via-emerald-400 to-blue-500 p-[3px] rounded-3xl shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
                  <div className="relative w-[88vw] max-w-[560px] sm:w-[65vw] md:w-[38vw] lg:w-[26vw] aspect-[4/3] bg-white rounded-[calc(1.5rem-3px)] overflow-hidden border border-white/60">
                  <img
                    src={withAssetVersion('/assets/groepsuitlaat-hero.jpg')}
                    alt="Groepsuitlaat in actie"
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full object-cover md:[filter:brightness(1.08)]"
                  />
                  </div>
                </div>
              </div>
            )}
            {service.id === 'DOG_WALKING' && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-green-500 via-emerald-400 to-blue-500 p-[3px] rounded-3xl shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
                  <div className="relative w-[88vw] max-w-[560px] sm:w-[65vw] md:w-[38vw] lg:w-[26vw] aspect-[4/3] bg-white rounded-[calc(1.5rem-3px)] overflow-hidden border border-white/60">
                    <img
                      src={withAssetVersion('/assets/hondenuitlaat-hero.jpg')}
                      alt="Hondenuitlaat in actie"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover md:[filter:brightness(1.08)]"
                    />
                  </div>
                </div>
              </div>
            )}
            {service.id === 'DOG_TRAINING' && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-green-500 via-emerald-400 to-blue-500 p-[3px] rounded-3xl shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
                  <div className="relative w-[88vw] max-w-[560px] sm:w-[65vw] md:w-[38vw] lg:w-[26vw] aspect-[4/3] bg-white rounded-[calc(1.5rem-3px)] overflow-hidden border border-white/60">
                    <img
                      src={withAssetVersion('/assets/dog-training-hero.jpg')}
                      alt="Hondentraining in actie"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover md:[filter:brightness(1.08)]"
                    />
                  </div>
                </div>
              </div>
            )}
            {service.id === 'PET_SITTING' && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-green-500 via-emerald-400 to-blue-500 p-[3px] rounded-3xl shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
                  <div className="relative w-[88vw] max-w-[560px] sm:w-[65vw] md:w-[38vw] lg:w-[26vw] aspect-[4/3] bg-white rounded-[calc(1.5rem-3px)] overflow-hidden border border-white/60">
                    <img
                      src={withAssetVersion('/assets/kat-hero.jpg')}
                      alt="Dierenoppas in actie"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover md:[filter:brightness(1.08)]"
                    />
                  </div>
                </div>
              </div>
            )}
            {service.id === 'PET_BOARDING' && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-green-500 via-emerald-400 to-blue-500 p-[3px] rounded-3xl shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
                  <div className="relative w-[88vw] max-w-[560px] sm:w-[65vw] md:w-[38vw] lg:w-[26vw] aspect-[4/3] bg-white rounded-[calc(1.5rem-3px)] overflow-hidden border border-white/60">
                    <img
                      src={withAssetVersion('/assets/cavia-hero.jpg')}
                      alt="Dierenopvang in actie"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover md:[filter:brightness(1.08)]"
                    />
                  </div>
                </div>
              </div>
            )}
            {service.id === 'HOME_CARE' && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-green-500 via-emerald-400 to-blue-500 p-[3px] rounded-3xl shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
                  <div className="relative w-[88vw] max-w-[560px] sm:w-[65vw] md:w-[38vw] lg:w-[26vw] aspect-[4/3] bg-white rounded-[calc(1.5rem-3px)] overflow-hidden border border-white/60">
                    <img
                      src={withAssetVersion('/assets/rabbit-hero.jpg')}
                      alt="Verzorging aan huis"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover md:[filter:brightness(1.08)]"
                    />
                  </div>
                </div>
              </div>
            )}
            {service.id === 'PET_TRANSPORT' && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-green-500 via-emerald-400 to-blue-500 p-[3px] rounded-3xl shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
                  <div className="relative w-[88vw] max-w-[560px] sm:w-[65vw] md:w-[38vw] lg:w-[26vw] aspect-[4/3] bg-white rounded-[calc(1.5rem-3px)] overflow-hidden border border-white/60">
                    <img
                      src={withAssetVersion('/assets/cat-eye-hero.jpg')}
                      alt="Transport huisdieren"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover md:[filter:brightness(1.08)]"
                    />
                  </div>
                </div>
              </div>
            )}
            {service.id === 'SMALL_ANIMAL_CARE' && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-green-500 via-emerald-400 to-blue-500 p-[3px] rounded-3xl shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
                  <div className="relative w-[88vw] max-w-[560px] sm:w-[65vw] md:w-[38vw] lg:w-[26vw] aspect-[4/3] bg-white rounded-[calc(1.5rem-3px)] overflow-hidden border border-white/60">
                    <img
                      src={withAssetVersion('/assets/horse-hero.jpg')}
                      alt="Verzorging van boerderijdieren"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover md:[filter:brightness(1.08)]"
                    />
                  </div>
                </div>
              </div>
            )}
            {service.id === 'EVENT_COMPANION' && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-green-500 via-emerald-400 to-blue-500 p-[3px] rounded-3xl shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
                  <div className="relative w-[72vw] max-w-[420px] sm:w-[40vw] md:w-[22vw] lg:w-[16vw] aspect-[3/4] bg-white rounded-[calc(1.5rem-3px)] overflow-hidden border border-white/60">
                    <img
                      src={withAssetVersion('/assets/wedding-hero.jpg')}
                      alt="Begeleiding events"
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-cover md:[filter:brightness(1.08)]"
                      style={{ objectPosition: '50% 20%' }}
                    />
                  </div>
                </div>
              </div>
            )}

            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8 mt-6">
              <h2 className="text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 mb-4">
                Wat houdt het in?
              </h2>
              {service.longDescription?.includesText ? (
                renderTextWithAutoBullets(service.longDescription.includesText)
              ) : (
                <ul className="list-disc pl-5 space-y-3 md:space-y-2 text-emerald-900/90 text-[15px] md:text-base marker:text-emerald-600/80">
                  {(service.longDescription?.includes ?? [
                    'We nemen je aanvraag door en stemmen de planning af.',
                    'We zoeken een passende verzorger en bevestigen de afspraak.',
                  ]).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </div>

            {service.longDescription?.tips?.length ? (
              <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 mb-4">
                  Praktische info
                </h2>
                <ul className="list-disc pl-5 space-y-3 md:space-y-2 text-emerald-900/90 text-[15px] md:text-base marker:text-emerald-600/80">
                  {service.longDescription.tips.map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl border border-black/5 p-7 md:p-8">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Hoe werkt TailTribe?</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                  { step: '1', title: 'Dien je aanvraag in', desc: 'Kies de service en geef je gegevens door.' },
                  { step: '2', title: 'Wij nemen contact op', desc: 'We stemmen details af en plannen de juiste verzorger.' },
                  { step: '3', title: 'Afspraak bevestigd', desc: 'Na bevestiging is alles duidelijk en kan je gerust zijn.' },
                ].map((i) => (
                  <div key={i.step} className="text-center bg-white rounded-2xl shadow-sm border border-black/5 p-6">
                    <div className="w-16 h-16 bg-gradient-to-br from-green-600 to-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-5">
                      {i.step}
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-2">{i.title}</h3>
                    <p className="text-gray-600">{i.desc}</p>
                  </div>
                ))}
              </div>
              <div className="text-center mt-8">
                <Link href="/boeken" className="btn-brand inline-block">
                  Start je aanvraag
                </Link>
              </div>
            </div>
          </section>

          <section className="mt-12 pb-10 md:pb-16">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-6">Andere diensten</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
              {related.map((s) => (
                <Link
                  key={s.id}
                  href={routes.dienst(s.slug)}
                  data-nav="service"
                  data-component="DienstDetailPage.Related"
                  data-service-id={s.id}
                  data-service-slug={s.slug}
                  className="group bg-white rounded-2xl shadow-sm hover:shadow-tt transition-all border border-black/5 overflow-hidden"
                >
                  <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-emerald-50 to-blue-50 flex items-center justify-center p-5">
                    <img
                      src={withAssetVersion(s.image)}
                      alt={s.name}
                      loading="lazy"
                      decoding="async"
                      className="h-full w-full object-contain group-hover:scale-105 transition-transform duration-300"
                      style={{ filter: SERVICE_ICON_FILTER }}
                    />
                  </div>
                  <div className="p-5">
                    <div className="font-semibold text-gray-900 group-hover:text-green-700 transition-colors">{s.name}</div>
                    <div className="text-sm text-gray-600 mt-2">{s.desc}</div>
                  </div>
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


