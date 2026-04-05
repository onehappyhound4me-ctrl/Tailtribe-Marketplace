import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { allPlaceTriples, getPlaceBySlugs, getProvinceBySlug } from '@/data/be-geo'
import { DISPATCH_SERVICES, getDispatchServiceBySlug } from '@/lib/services'
import { getPublicAppUrl } from '@/lib/env'
import { routes } from '@/lib/routes'
import { localServiceLocationDescription } from '@/lib/local-service-landing'

type Props = {
  params: { slug: string; province: string; place: string }
}

/** Alleen vooraf gegenereerde combinaties (geen dunne fallbacks op willekeurige URL’s). */
export const dynamicParams = false

export function generateStaticParams() {
  const triples = allPlaceTriples()
  return DISPATCH_SERVICES.flatMap((s) =>
    triples.map(({ province, place }) => ({
      slug: s.slug,
      province,
      place,
    }))
  )
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = getPublicAppUrl()
  const service = getDispatchServiceBySlug(params.slug)
  const province = getProvinceBySlug(params.province)
  const place = getPlaceBySlugs(params.province, params.place)
  if (!service || !province || !place) {
    return { title: 'Pagina niet gevonden', description: 'Deze pagina bestaat niet.' }
  }

  const canonicalUrl = `${baseUrl}/diensten/${service.slug}/${province.slug}/${place.slug}`
  const title = `${service.name} – ${place.name} (${province.name}) | TailTribe`
  const description = localServiceLocationDescription(service, place, province)

  return {
    title,
    description,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title,
      description,
      url: canonicalUrl,
      siteName: 'TailTribe',
      locale: 'nl_BE',
      type: 'website',
    },
  }
}

export default function LocalServicePlacePage({ params }: Props) {
  const baseUrl = getPublicAppUrl()
  const service = getDispatchServiceBySlug(params.slug)
  const province = getProvinceBySlug(params.province)
  const place = getPlaceBySlugs(params.province, params.place)
  if (!service || !province || !place) notFound()

  const canonicalUrl = `${baseUrl}/diensten/${service.slug}/${province.slug}/${place.slug}`
  const servicePageUrl = `${baseUrl}/diensten/${service.slug}`

  const faqs = [
    {
      q: `Kan ik ${service.name.toLowerCase()} in ${place.name} aanvragen?`,
      a: `Ja. Dien je aanvraag in met je postcode en wensen. We matchen je vraag met verzorgers die praktisch haalbaar zijn in of rond ${place.name} (regio ${province.name}).`,
    },
    {
      q: 'Moet ik zelf profielen vergelijken?',
      a: 'Nee. TailTribe neemt je aanvraag persoonlijk op en werkt naar een duidelijke match — zonder eindeloos te scrollen door losse profielen.',
    },
  ]

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'Diensten', item: `${baseUrl}/diensten` },
      { '@type': 'ListItem', position: 3, name: service.name, item: servicePageUrl },
      { '@type': 'ListItem', position: 4, name: place.name, item: canonicalUrl },
    ],
  }

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `${service.name} in ${place.name}`,
    serviceType: service.name,
    description: localServiceLocationDescription(service, place, province),
    url: canonicalUrl,
    areaServed: {
      '@type': 'AdministrativeArea',
      name: `${place.name}, ${province.name}, België`,
    },
    provider: {
      '@type': 'Organization',
      name: 'TailTribe',
      url: baseUrl,
    },
  }

  return (
    <div className="min-h-screen bg-slate-50/80">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />

      <main className="container mx-auto px-4 py-12 md:py-16">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(serviceJsonLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        <article className="mx-auto max-w-3xl">
          <nav className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-800">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <Link href={routes.diensten} className="hover:text-slate-800">
              Diensten
            </Link>
            <span className="text-slate-300">/</span>
            <Link href={routes.dienst(service.slug)} className="hover:text-slate-800">
              {service.name}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-900">
              {place.name}
            </span>
          </nav>

          <header className="mb-10">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-emerald-800">
              Lokale aanvraag · {province.name}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl md:leading-tight">
              {service.name} – {place.name}
            </h1>
            <p className="copy-pretty mt-4 text-base leading-relaxed text-slate-600 md:text-lg">
              Zoek je <strong className="font-medium text-slate-800">{service.name.toLowerCase()}</strong> in{' '}
              {place.name} of de ruime regio {province.name}? Via TailTribe geef je je situatie en timing door; we
              koppelen je aanvraag aan gescreende dierenverzorgers die in jouw buurt zinvol zijn.
            </p>
            <p className="copy-pretty mt-4 text-base leading-relaxed text-slate-600">
              Op de landelijke <Link href={routes.dienst(service.slug)} className="font-medium text-emerald-800 underline-offset-2 hover:underline">uitlegpagina over {service.name.toLowerCase()}</Link> vind je meer detail over wat
              typisch inbegrepen is. Op de{' '}
              <Link href={`/be/${province.slug}/${place.slug}`} className="font-medium text-emerald-800 underline-offset-2 hover:underline">
                streekpagina {place.name}
              </Link>{' '}
              zie je het bredere aanbod voor baasjes in jouw omgeving.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
              <Link href={`/boeken?service=${service.id}`} className="btn-brand-compact">
                Aanvraag voor {place.name}
              </Link>
              <Link href={routes.dienst(service.slug)} className="btn-secondary-compact sm:inline-flex">
                Meer over {service.name.toLowerCase()}
              </Link>
            </div>
          </header>

          <section className="mb-10 rounded-2xl border border-slate-200/90 bg-white p-8 md:p-10">
            <h2 className="text-xl font-semibold text-slate-900">Veelgestelde vragen</h2>
            <div className="mt-6 space-y-6">
              {faqs.map((f) => (
                <div key={f.q} className="border-t border-slate-100 pt-6 first:border-t-0 first:pt-0">
                  <h3 className="font-medium text-slate-900">{f.q}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-slate-600">{f.a}</p>
                </div>
              ))}
            </div>
          </section>

          <p className="text-center text-sm text-slate-500">
            <Link
              href={`/be/${province.slug}/${place.slug}`}
              className="text-emerald-800 underline-offset-2 hover:underline"
            >
              Alle diensten in {place.name} op één pagina
            </Link>
          </p>
        </article>
      </main>

      <SiteFooter />
    </div>
  )
}
