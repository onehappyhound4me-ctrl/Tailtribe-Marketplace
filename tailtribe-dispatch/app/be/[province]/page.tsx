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
    description: `Vind een betrouwbare dierenoppasser in ${province.name} voor hondenuitlaat, dierenoppas, dierenopvang en verzorging aan huis. TailTribe helpt je sneller naar de juiste match voor je huisdier.`,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: `Dierenoppas in ${province.name} | TailTribe`,
      description: `Vind een betrouwbare dierenoppasser in ${province.name} voor hondenuitlaat, dierenoppas, dierenopvang en verzorging aan huis. TailTribe helpt je sneller naar de juiste match voor je huisdier.`,
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

  const placeLinks = places.slice(0, 8).map((place, index) => ({
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

          <header className="mb-10 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              TailTribe in {province.name}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Dierenoppas in {province.name}
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-8 text-gray-600 md:text-xl">
              Vind een betrouwbare dierenoppasser in {province.name} voor hondenuitlaat, dierenoppas, dierenopvang en
              verzorging aan huis. We helpen je sneller naar de juiste match voor je huisdier.
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {['Betrouwbare dierenoppasser', 'Aan huis mogelijk', 'Snelle terugkoppeling', 'Match op maat'].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm"
                >
                  {label}
                </span>
              ))}
            </div>
          </header>

          {province.slug === 'antwerpen' ? (
            <section className="mb-6 rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/60 to-sky-50 p-6 shadow-sm md:p-10">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-800">Regiofocus</p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-gray-900 md:text-3xl">
                Hondenuitlaatservice aan huis in regio Antwerpen
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-8 text-gray-700">
                Zoek je hondenuitlaatservice aan huis in regio Antwerpen? Dien je aanvraag in en we bekijken meteen wat
                praktisch haalbaar is voor jouw buurt, planning en hond.
              </p>
              <div className="mt-4 flex flex-wrap gap-2">
                {['Aan huis ophalen', 'Antwerpen + rand', 'Zorgvuldige matching', 'Snelle intake'].map((label) => (
                  <span
                    key={label}
                    className="inline-flex items-center rounded-full border border-emerald-100 bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-700"
                  >
                    {label}
                  </span>
                ))}
              </div>
              <div className="mt-5">
                <Link href="/boeken?service=GROUP_DOG_WALKING" className="btn-brand-compact">
                  Bekijk beschikbaarheid aan huis
                </Link>
              </div>
              <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                {[
                  { slug: 'antwerpen', label: 'Antwerpen' },
                  { slug: 'berchem', label: 'Berchem' },
                  { slug: 'wilrijk', label: 'Wilrijk' },
                  { slug: 'brasschaat', label: 'Brasschaat' },
                  { slug: 'kapellen', label: 'Kapellen' },
                ].map((p) => (
                  <Link
                    key={p.slug}
                    href={`/be/antwerpen/${p.slug}`}
                    className="group rounded-2xl border border-white/80 bg-white/90 px-4 py-3 text-gray-800 shadow-sm transition hover:bg-white hover:shadow-md"
                  >
                    <div className="font-semibold group-hover:text-green-700 transition-colors">{p.label}</div>
                    <div className="text-xs text-gray-500 mt-1">Bekijk regio →</div>
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mb-6 rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Voor huisdiereigenaars</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-gray-900">Huisdierenzorg in {province.name}</h2>
            <p className="mb-6 mt-4 max-w-2xl text-base leading-8 text-gray-700">
              In {province.name} helpen we baasjes die op zoek zijn naar een betrouwbare dierenoppasser of andere
              huisdierenzorg. Van hondenuitlaat en dierenoppas tot opvang, training of transport: we bekijken wat jij en
              je dier nodig hebben.
            </p>
            <div className="grid gap-4 md:grid-cols-3">
              {[
                {
                  title: 'Minder zoekstress',
                  text: 'Je vertrekt vanuit je nood en regio, niet vanuit een lange lijst die je zelf moet filteren.',
                },
                {
                  title: 'Praktische hulp',
                  text: 'We denken mee welke service haalbaar is voor je timing, locatie en type huisdier.',
                },
                {
                  title: 'Meer vertrouwen',
                  text: 'Voor veel baasjes telt vooral rust: weten dat hun huisdier goed zit bij de juiste match.',
                },
              ].map((item) => (
                <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                  <h3 className="text-base font-semibold leading-snug text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-gray-700">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Populaire locaties</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-gray-900">
              Snel naar een veelgevraagde plek in {province.name}
            </h2>
            <p className="mb-6 mt-4 max-w-2xl text-base leading-8 text-gray-700">
              Kies hieronder een locatie of dien meteen je aanvraag in als je vooral snel hulp voor je huisdier zoekt.
            </p>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-4">
              {places.slice(0, 8).map((place) => (
                <Link
                  key={place.slug}
                  href={`/be/${province.slug}/${place.slug}`}
                  className="group rounded-2xl border border-black/5 bg-gray-50 px-4 py-4 text-gray-800 transition hover:bg-white hover:shadow-sm"
                >
                  <div className="font-medium leading-snug group-hover:text-green-700 transition-colors">
                    {place.name}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">Bekijk →</div>
                </Link>
              ))}
            </div>
            <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-7 text-gray-600">Staat je stad er niet tussen? Vermeld je locatie gewoon in je aanvraag.</p>
              <Link href="/boeken" className="btn-brand-compact">
                Dien je aanvraag in
              </Link>
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Veelgestelde vragen</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-gray-900">Veelgestelde vragen</h2>
            <div className="mt-6 grid gap-4 text-gray-700 md:grid-cols-3">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="font-semibold leading-snug text-gray-900">
                  In welke gemeenten in {province.name} zijn jullie actief?
                </div>
                <p className="mt-2 text-sm leading-7">
                  We werken in heel {province.name}. Staat je gemeente niet in de lijst? Meld je locatie bij je aanvraag.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="font-semibold leading-snug text-gray-900">Hoe snel krijg ik bevestiging?</div>
                <p className="mt-2 text-sm leading-7">We nemen zo snel mogelijk contact op om de details en planning af te stemmen.</p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="font-semibold leading-snug text-gray-900">Welke diensten kan ik aanvragen?</div>
                <p className="mt-2 text-sm leading-7">
                  Hondenuitlaat, dierenoppas, opvang, training en transport — afgestemd op jouw situatie.
                </p>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}


