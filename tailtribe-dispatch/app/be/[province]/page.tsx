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

  const placeLinks = places.slice(0, 6).map((place, index) => ({
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
    <div className="min-h-screen bg-slate-50/80">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />

      <main className="container mx-auto px-4 py-12 md:py-16">
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
        <div className="mx-auto max-w-5xl">
          <nav className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-800">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/be" className="hover:text-slate-800">
              België
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-900">{province.name}</span>
          </nav>

          <header className="mb-12 max-w-3xl text-left">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-emerald-800">
              TailTribe · {province.name}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl md:leading-tight">
              Dierenoppas in {province.name}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
              Hondenuitlaat, dierenoppas, opvang en verzorging aan huis: één duidelijke lijn van aanvraag naar match,
              zonder eindeloos zelf te vergelijken.
            </p>
            <p className="mt-5 text-sm text-slate-500">
              {['Betrouwbare matching', 'Aan huis waar mogelijk', 'Snelle terugkoppeling'].join(' · ')}
            </p>
          </header>

          {province.slug === 'antwerpen' ? (
            <section className="mb-12 rounded-2xl border border-slate-200/90 bg-white p-8 md:p-10">
              <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Regio Antwerpen</p>
              <h2 className="mt-2 text-xl font-semibold leading-snug text-slate-900 md:text-2xl">
                Hondenuitlaatservice aan huis in regio Antwerpen
              </h2>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
                Dien je aanvraag in; we bekijken wat haalbaar is voor jouw buurt, planning en hond. Ophalen aan huis,
                Antwerpen en rand, zorgvuldige matching en een korte intake.
              </p>
              <div className="mt-8">
                <Link href="/boeken?service=GROUP_DOG_WALKING" className="btn-brand-compact">
                  Bekijk beschikbaarheid aan huis
                </Link>
              </div>
            </section>
          ) : null}

          <section className="mb-12 rounded-2xl border border-slate-200/90 bg-white p-8 md:p-10">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Voor huisdiereigenaars</p>
            <h2 className="mt-2 text-xl font-semibold leading-snug text-slate-900 md:text-2xl">
              Huisdierenzorg in {province.name}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              In {province.name} helpen we je vanuit je nood en regio: hondenuitlaat, oppas, opvang, training of
              transport — wat praktisch en inhoudelijk past.
            </p>
            <ul className="mt-8 divide-y divide-slate-100 border-t border-slate-100">
              {[
                {
                  title: 'Minder zoekstress',
                  text: 'Je vertrekt niet vanuit een lange lijst die je zelf moet filteren.',
                },
                {
                  title: 'Praktische hulp',
                  text: 'We denken mee welke service haalbaar is voor timing, locatie en type huisdier.',
                },
                {
                  title: 'Meer vertrouwen',
                  text: 'Rust voor baasjes: weten dat je huisdier bij de juiste match zit.',
                },
              ].map((item) => (
                <li key={item.title} className="flex gap-4 py-5 first:pt-6">
                  <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-600" aria-hidden />
                  <div>
                    <h3 className="font-medium text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="mb-12 rounded-2xl border border-slate-200/90 bg-white p-8 md:p-10">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Populaire locaties</p>
            <h2 className="mt-2 text-xl font-semibold leading-snug text-slate-900 md:text-2xl">
              Snel naar een veelgevraagde plek in {province.name}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              Kies een locatie hieronder, of start meteen je aanvraag als je vooral snel hulp zoekt.
            </p>
            <div className="mt-8 grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              {places.slice(0, 6).map((place) => (
                <Link
                  key={place.slug}
                  href={`/be/${province.slug}/${place.slug}`}
                  className="group rounded-xl border border-slate-200/80 bg-slate-50/40 px-4 py-4 text-slate-800 transition hover:border-slate-300 hover:bg-white"
                >
                  <div className="font-medium leading-snug text-slate-900 group-hover:text-emerald-800 transition-colors">
                    {place.name}
                  </div>
                  <div className="mt-1 text-xs text-slate-500">Bekijk →</div>
                </Link>
              ))}
            </div>
            <div className="mt-8 flex flex-col gap-4 border-t border-slate-100 pt-8 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-sm leading-relaxed text-slate-600">
                Staat je stad er niet tussen? Vermeld je locatie in je aanvraag.
              </p>
              <Link href="/boeken" className="btn-brand-compact shrink-0">
                Dien je aanvraag in
              </Link>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/90 bg-white p-8 md:p-10">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Veelgestelde vragen</p>
            <h2 className="mt-2 text-xl font-semibold leading-snug text-slate-900 md:text-2xl">Veelgestelde vragen</h2>
            <div className="mt-8 grid gap-10 text-slate-600 md:grid-cols-3 md:gap-x-10">
              <div>
                <h3 className="font-medium leading-snug text-slate-900">
                  In welke gemeenten in {province.name} zijn jullie actief?
                </h3>
                <p className="mt-2 text-sm leading-relaxed">
                  We werken in heel {province.name}. Staat je gemeente niet in de lijst? Meld je locatie bij je aanvraag.
                </p>
              </div>
              <div>
                <h3 className="font-medium leading-snug text-slate-900">Hoe snel krijg ik bevestiging?</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  We nemen zo snel mogelijk contact op om de details en planning af te stemmen.
                </p>
              </div>
              <div>
                <h3 className="font-medium leading-snug text-slate-900">Welke diensten kan ik aanvragen?</h3>
                <p className="mt-2 text-sm leading-relaxed">
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


