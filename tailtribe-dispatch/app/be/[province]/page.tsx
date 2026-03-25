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
    title: `Dierenoppas in ${province.name} | TailTribe`,
    description: `Van hondenuitlaat en dierenoppas tot dierenopvang en verzorging aan huis in ${province.name}. Voor en door dierenverzorgers: hier vind je de juiste match voor je huisdier.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `Dierenoppas in ${province.name} | TailTribe`,
      description: `Van hondenuitlaat en dierenoppas tot dierenopvang en verzorging aan huis in ${province.name}. Voor en door dierenverzorgers: hier vind je de juiste match voor je huisdier.`,
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
          text: 'We nemen zo snel mogelijk contact op om de details te bevestigen en een verzorger in te plannen.',
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
              Dierenoppas in {province.name}
            </h1>
            <p className="mx-auto max-w-3xl text-lg md:text-xl leading-relaxed text-gray-600">
              Van hondenuitlaat en dierenoppas tot dierenopvang en verzorging aan huis. Voor en door dierenverzorgers:
              hier vind je de juiste match voor je huisdier in {province.name}.
            </p>
          </header>

          {province.slug === 'antwerpen' ? (
            <section className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/60 to-sky-50 p-6 md:p-8 shadow-sm mb-6">
              <p className="text-sm font-semibold tracking-[0.02em] text-emerald-800">Regiofocus</p>
              <h2 className="mt-2 text-2xl font-semibold text-gray-900 mb-2">Hondenuitlaatservice in regio Antwerpen</h2>
              <p className="text-gray-700 leading-relaxed max-w-3xl">
                Actief in Groot Antwerpen (+rand) en Antwerpen Noord (Kapellen–Brasschaat–Kalmthout). Kies hieronder je
                gemeente als je specifiek op zoek bent naar hondenuitlaatservice in jouw buurt.
              </p>
              <div className="mt-5">
                <Link href="/boeken?service=GROUP_DOG_WALKING" className="btn-brand-compact">
                  Bekijk beschikbaarheid voor hondenuitlaatservice
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
                    <div className="text-xs text-gray-500 mt-1">Bekijk regio →</div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Huisdierenzorg in {province.name}</h2>
            <p className="text-gray-700 leading-relaxed">
              In {province.name} helpen we baasjes die op zoek zijn naar een betrouwbare dierenoppasser of andere
              huisdierenzorg. Van hondenuitlaat en dierenoppas tot opvang, training of transport: we bekijken wat jij en
              je dier nodig hebben.
            </p>
            <p className="text-gray-700 leading-relaxed mt-3">
              Na je aanvraag nemen we zo snel mogelijk contact op om de details te bevestigen en de juiste match voor je
              huisdier te maken.
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
                <p>We nemen zo snel mogelijk contact op om de details en planning af te stemmen.</p>
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


