import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { getProvinceBySlug, getPlaceBySlugs } from '@/data/be-geo'

type Props = {
  params: { province: string; place: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
  const province = getProvinceBySlug(params.province)
  const place = getPlaceBySlugs(params.province, params.place)
  if (!province || !place) {
    return { title: 'Locatie niet gevonden', description: 'De opgevraagde locatie bestaat niet.' }
  }

  const canonicalUrl = `${baseUrl}/be/${province.slug}/${place.slug}`

  return {
    title: `Dierenverzorging in ${place.name} (${province.name}) | TailTribe`,
    description: `Vraag dierenverzorging aan in ${place.name}. Hondenuitlaat, dierenoppas, opvang en meer — we nemen binnen 2 uur contact op.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `Dierenverzorging in ${place.name} (${province.name}) | TailTribe`,
      description: `Vraag dierenverzorging aan in ${place.name}. Hondenuitlaat, dierenoppas, opvang en meer — we nemen binnen 2 uur contact op.`,
      url: canonicalUrl,
      siteName: 'TailTribe',
      locale: 'nl_BE',
      type: 'website',
    },
  }
}

export default function PlaceLandingPage({ params }: Props) {
  const province = getProvinceBySlug(params.province)
  const place = getPlaceBySlugs(params.province, params.place)
  if (!province || !place) notFound()

  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
  const canonicalUrl = `${baseUrl}/be/${province.slug}/${place.slug}`

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'België', item: `${baseUrl}/be` },
      { '@type': 'ListItem', position: 3, name: province.name, item: `${baseUrl}/be/${province.slug}` },
      { '@type': 'ListItem', position: 4, name: place.name, item: canonicalUrl },
    ],
  }

  const placeServiceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: `Dierenverzorging in ${place.name}`,
    description: `Dierenverzorging in ${place.name}, ${province.name}. Hondenuitlaat, dierenoppas, opvang en meer.`,
    serviceType: 'Dierenverzorging',
    areaServed: {
      '@type': 'AdministrativeArea',
      name: province.name,
      containedInPlace: {
        '@type': 'Place',
        name: place.name,
      },
    },
    provider: {
      '@type': 'Organization',
      name: 'TailTribe',
      url: baseUrl,
    },
    url: canonicalUrl,
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `Doen jullie ook last-minute aanvragen in ${place.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We bekijken de beschikbaarheid zo snel mogelijk en nemen binnen 2 uur contact op.',
        },
      },
      {
        '@type': 'Question',
        name: 'Moet ik mijn exacte adres doorgeven?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Je kan je adres of wijk doorgeven bij de aanvraag. We stemmen dit samen af.',
        },
      },
      {
        '@type': 'Question',
        name: 'Kan ik meerdere dieren opgeven?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ja, vermeld dit in je aanvraag zodat we de juiste verzorger kunnen inplannen.',
        },
      },
    ],
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(placeServiceJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <div className="max-w-4xl mx-auto">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-700">
              Home
            </Link>
            <span>›</span>
            <Link href="/be" className="hover:text-gray-700">
              België
            </Link>
            <span>›</span>
            <Link href={`/be/${province.slug}`} className="hover:text-gray-700">
              {province.name}
            </Link>
            <span>›</span>
            <span className="text-gray-900">{place.name}</span>
          </nav>

          <header className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Dierenverzorging in {place.name}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              TailTribe dispatch in {place.name}, {province.name}. Dien je aanvraag in en wij regelen de juiste verzorger.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href={`/be/${province.slug}`}
                className="inline-block px-6 py-3 rounded-tt border border-white/10 bg-white text-gray-900 hover:bg-gray-50 transition"
              >
                Bekijk {province.name}
              </Link>
            </div>
          </header>

          <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              Lokale dierenverzorging in {place.name}
            </h2>
            <p className="text-gray-700 leading-relaxed">
              We werken met lokale verzorgers in {place.name} en omgeving. Of je nu hondenuitlaat, dierenoppas,
              training of transport nodig hebt: we stemmen de details af op jouw timing en locatie.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              Na je aanvraag nemen we doorgaans binnen 2 uur contact op om alles te bevestigen en de juiste match te
              plannen.
            </p>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Hoe werkt het?</h2>
            <ol className="list-decimal pl-5 space-y-2 text-gray-700">
              <li>Vul je aanvraag in (dienst, datum, locatie en huisdierinfo).</li>
              <li>Wij nemen contact op en stemmen de details af.</li>
              <li>We plannen een geschikte verzorger in.</li>
            </ol>
            {/* Offerte/aanvraag CTA verwijderd op verzoek */}
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-8 mt-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Veelgestelde vragen</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <div className="font-semibold text-gray-900">
                  Doen jullie ook last-minute aanvragen in {place.name}?
                </div>
                <p>We bekijken de beschikbaarheid zo snel mogelijk en nemen binnen 2 uur contact op.</p>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Moet ik mijn exacte adres doorgeven?</div>
                <p>Je kan je adres of wijk doorgeven bij de aanvraag. We stemmen dit samen af.</p>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Kan ik meerdere dieren opgeven?</div>
                <p>Ja, vermeld dit in je aanvraag zodat we de juiste verzorger kunnen inplannen.</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}



