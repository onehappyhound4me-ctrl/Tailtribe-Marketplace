import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { getProvinceBySlug, getPlacesByProvince } from '@/data/be-geo'
import { getPublicAppUrl } from '@/lib/env'

type Props = {
  params: { province: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = getPublicAppUrl()
  const province = getProvinceBySlug(params.province)
  if (!province) {
    return { title: 'Streek niet gevonden', description: 'De opgevraagde streek bestaat niet.' }
  }

  const canonicalUrl = `${baseUrl}/be/${province.slug}`

  return {
    title: `Dierenverzorging in ${province.name} | TailTribe`,
    description: `Vraag dierenverzorging aan in ${province.name}. Hondenuitlaat, dierenoppas, opvang en meer — binnen 2 uur bevestiging.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `Dierenverzorging in ${province.name} | TailTribe`,
      description: `Vraag dierenverzorging aan in ${province.name}. Hondenuitlaat, dierenoppas, opvang en meer — binnen 2 uur bevestiging.`,
      url: canonicalUrl,
      siteName: 'TailTribe',
      locale: 'nl_BE',
      type: 'website',
    },
  }
}

export default function ProvinceLandingPage({ params }: Props) {
  const province = getProvinceBySlug(params.province)
  if (!province) notFound()

  const places = getPlacesByProvince(params.province)
  const baseUrl = getPublicAppUrl()
  const canonicalUrl = `${baseUrl}/be/${province.slug}`

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: baseUrl },
      { '@type': 'ListItem', position: 2, name: 'België', item: `${baseUrl}/be` },
      { '@type': 'ListItem', position: 3, name: province.name, item: canonicalUrl },
    ],
  }

  const placeLinks = places.slice(0, 16).map((place, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: place.name,
    item: `${baseUrl}/be/${province.slug}/${place.slug}`,
  }))

  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    itemListElement: placeLinks.map((entry, index) => ({
      ...entry,
      position: index + 1,
    })),
  }

  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `In welke gemeenten in ${province.name} zijn jullie actief?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `We werken in heel ${province.name}. Staat je gemeente niet in de lijst? Dien je aanvraag in en vermeld je locatie.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Hoe snel krijg ik bevestiging?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'We nemen meestal binnen 2 uur contact op om de details te bevestigen en een verzorger in te plannen.',
        },
      },
      {
        '@type': 'Question',
        name: 'Welke diensten kan ik aanvragen?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Hondenuitlaat, dierenoppas, opvang, training en transport. We stemmen af op je timing en locatie.',
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <div className="max-w-5xl mx-auto">
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-6">
            <Link href="/" className="hover:text-gray-700">
              Home
            </Link>
            <span>›</span>
            <Link href="/be" className="hover:text-gray-700">
              België
            </Link>
            <span>›</span>
            <span className="text-gray-900">{province.name}</span>
          </nav>

          <header className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Dierenverzorging in {province.name}
            </h1>
            {/* Offerte CTA verwijderd op verzoek */}
          </header>

          {province.slug === 'antwerpen' ? (
            <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 mb-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-2">Groepsuitlaat in Antwerpen</h2>
              <p className="text-gray-700 leading-relaxed">
                Actief in Groot Antwerpen (+rand) en Antwerpen Noord (Kapellen–Brasschaat–Kalmthout).
                Kies je gemeente hieronder of lees eerst meer over de service.
              </p>
              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <Link href="/boeken?service=GROUP_DOG_WALKING" className="btn-brand inline-flex">
                  Boek groepsuitlaat
                </Link>
                <Link
                  href="/diensten/groepsuitlaat"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-tt border border-emerald-200 bg-white text-emerald-900 hover:bg-emerald-50 transition"
                >
                  Info over groepsuitlaat
                </Link>
              </div>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { slug: 'antwerpen', label: 'Antwerpen' },
                  { slug: 'berchem', label: 'Berchem' },
                  { slug: 'wilrijk', label: 'Wilrijk' },
                  { slug: 'brasschaat', label: 'Brasschaat' },
                  { slug: 'kapellen', label: 'Kapellen' },
                  { slug: 'kalmthout', label: 'Kalmthout' },
                ].map((p) => (
                  <Link
                    key={p.slug}
                    href={`/be/antwerpen/${p.slug}`}
                    className="group bg-gray-50 rounded-xl border border-black/5 px-4 py-3 text-gray-800 hover:bg-white hover:shadow-sm transition"
                  >
                    <div className="font-semibold group-hover:text-green-700 transition-colors">{p.label}</div>
                    <div className="text-xs text-gray-500 mt-1">Groepsuitlaat →</div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Lokale verzorgers in {province.name}</h2>
            <p className="text-gray-700 leading-relaxed">
              We koppelen je aan een geschikte verzorger in {province.name}. Denk aan hondenuitlaat, dierenoppas,
              opvang, training of transport. Je krijgt snel duidelijkheid over beschikbaarheid en planning.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              Vermeld je gewenste dienst, datum en locatie. We nemen doorgaans binnen 2 uur contact op om alles te
              bevestigen en de juiste match te maken.
            </p>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Populaire steden en gemeenten in {province.name}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {places.slice(0, 16).map((place) => (
                <Link
                  key={place.slug}
                  href={`/be/${province.slug}/${place.slug}`}
                  className="group bg-gray-50 rounded-xl border border-black/5 px-4 py-3 text-gray-800 hover:bg-white hover:shadow-sm transition"
                >
                  <div className="font-medium group-hover:text-green-700 transition-colors">
                    {place.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Bekijk →</div>
                </Link>
              ))}
            </div>
            <p className="text-sm text-gray-600 mt-4">
              Staat je stad er niet tussen? Geen probleem — dien je aanvraag in en vermeld je locatie.
            </p>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 mt-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Veelgestelde vragen</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <div className="font-semibold text-gray-900">
                  In welke gemeenten in {province.name} zijn jullie actief?
                </div>
                <p>We werken in heel {province.name}. Staat je gemeente niet in de lijst? Meld je locatie bij je aanvraag.</p>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Hoe snel krijg ik bevestiging?</div>
                <p>We nemen meestal binnen 2 uur contact op om de details en planning af te stemmen.</p>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Welke diensten kan ik aanvragen?</div>
                <p>Hondenuitlaat, dierenoppas, opvang, training en transport — afgestemd op jouw situatie.</p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}


