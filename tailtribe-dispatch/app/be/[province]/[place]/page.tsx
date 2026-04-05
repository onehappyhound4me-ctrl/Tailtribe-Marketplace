import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { getProvinceBySlug, getPlaceBySlugs, getPlacesByProvince } from '@/data/be-geo'
import { getPublicAppUrl } from '@/lib/env'

type Props = {
  params: { province: string; place: string }
}

function isGroepsuitlaatFocus(provinceSlug: string, placeSlug: string) {
  if (provinceSlug !== 'antwerpen') return false
  return [
    'kalmthout',
    'kapellen',
    'brasschaat',
    'antwerpen',
    // Antwerp city districts
    'berchem',
    'wilrijk',
    'deurne',
    'borgerhout',
    'merksem',
    'hoboken',
    'ekeren',
  ].includes(placeSlug)
}

const SERVICE_SECTIONS = [
  { id: 'DOG_WALKING', name: 'Hondenuitlaat', slug: 'hondenuitlaat' },
  { id: 'GROUP_DOG_WALKING', name: 'Hondenuitlaatservice', slug: 'hondenuitlaatservice' },
  { id: 'DOG_TRAINING', name: 'Hondentraining', slug: 'hondentraining' },
  { id: 'PET_SITTING', name: 'Dierenoppas (incl. kattenoppas)', slug: 'dierenoppas' },
  { id: 'PET_BOARDING', name: 'Dierenopvang', slug: 'dierenopvang' },
  { id: 'HOME_CARE', name: 'Verzorging aan huis', slug: 'verzorging-aan-huis' },
  { id: 'PET_TRANSPORT', name: 'Transport huisdieren', slug: 'transport-huisdieren' },
  { id: 'SMALL_ANIMAL_CARE', name: 'Verzorging van boerderijdieren', slug: 'verzorging-boerderijdieren' },
  { id: 'EVENT_COMPANION', name: 'Begeleiding events', slug: 'begeleiding-events' },
]

const PRIMARY_SERVICE_IDS = new Set([
  'DOG_WALKING',
  'GROUP_DOG_WALKING',
  'PET_SITTING',
  'PET_BOARDING',
  'HOME_CARE',
])

const ANTWERP_DOG_WALKING_PARKS: Record<string, string> = {
  antwerpen: 'Stadspark, Middelheimpark en omliggende parken',
  deurne: 'het Rivierenhof en omliggende groenzones',
  brasschaat: 'het Park van Brasschaat en de omliggende bossen',
  kalmthout: 'de Kalmthoutse Heide en omliggende natuur',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = getPublicAppUrl()
  const province = getProvinceBySlug(params.province)
  const place = getPlaceBySlugs(params.province, params.place)
  if (!province || !place) {
    return { title: 'Locatie niet gevonden', description: 'De opgevraagde locatie bestaat niet.' }
  }

  const canonicalUrl = `${baseUrl}/be/${province.slug}/${place.slug}`
  const focus = isGroepsuitlaatFocus(province.slug, place.slug)
  const title = focus
    ? `Hondenuitlaatservice aan huis in ${place.name} | Betrouwbare dierenoppasser | TailTribe`
    : `Dierenoppas in ${place.name} | TailTribe`
  const description = focus
    ? `Hondenuitlaatservice aan huis in ${place.name} via een betrouwbare dierenoppasser: sociale daguitstappen, ophalen en terugbrengen, zorgvuldige matching en veilige routes in ${place.name} en omgeving.`
    : `Van hondenuitlaat en dierenoppas tot dierenopvang en verzorging aan huis in ${place.name}. Voor en door dierenverzorgers: hier vind je de juiste match voor je huisdier.`

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

export default function PlaceLandingPage({ params }: Props) {
  const province = getProvinceBySlug(params.province)
  const place = getPlaceBySlugs(params.province, params.place)
  if (!province || !place) notFound()

  const baseUrl = getPublicAppUrl()
  const canonicalUrl = `${baseUrl}/be/${province.slug}/${place.slug}`
  const focus = isGroepsuitlaatFocus(province.slug, place.slug)
  const visibleServices = SERVICE_SECTIONS.filter((service) => PRIMARY_SERVICE_IDS.has(service.id))
  const trustPillars = focus
    ? ['Betrouwbare dierenoppasser', 'Aan huis ophalen', 'Antwerpen + rand', 'Snelle terugkoppeling']
    : ['Betrouwbare dierenoppasser', 'Aan huis mogelijk', 'Snelle terugkoppeling', 'Match op maat']
  const ownerTestimonials = focus
    ? [
        {
          name: 'Sophie',
          quote: 'Ik zocht vooral iemand die ik echt kon vertrouwen met mijn hond. De match en opvolging voelden meteen professioneel aan.',
        },
        {
          name: 'Annika',
          quote: 'Heel vlot geregeld. Het gaf rust dat ophalen en planning duidelijk op voorhand afgestemd werden.',
        },
        {
          name: 'Ann',
          quote: 'Snelle reactie, duidelijke afspraken en vooral een fijne ervaring voor onze hond.',
        },
      ]
    : [
        {
          name: 'Sophie',
          quote: 'Ik wou vooral een betrouwbare dierenoppasser vinden zonder eindeloos te moeten zoeken. Dat voelde hier veel eenvoudiger.',
        },
        {
          name: 'Annika',
          quote: 'De aanvraag was snel gedaan en ik kreeg vlot duidelijkheid over wat haalbaar was in mijn regio.',
        },
        {
          name: 'Ann',
          quote: 'Professioneel, duidelijk en vooral geruststellend als je iemand zoekt voor je huisdier.',
        },
      ]

  const localDogWalkingHighlight =
    province.slug === 'antwerpen' && ANTWERP_DOG_WALKING_PARKS[place.slug]
      ? ANTWERP_DOG_WALKING_PARKS[place.slug]
      : `parken, wandelroutes en groenzones in en rond ${place.name}`

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
    name: focus ? `Hondenuitlaatservice aan huis in ${place.name}` : `Dierenoppas en huisdierenzorg in ${place.name}`,
    description: focus
      ? `Hondenuitlaatservice aan huis in ${place.name}, ${province.name}, via een betrouwbare dierenoppasser. Sociale daguitstappen, ophalen en terugbrengen en veilige routes via TailTribe.`
      : `Dierenoppas en huisdierenzorg in ${place.name}, ${province.name}. Hondenuitlaat, dierenoppas, opvang en meer via TailTribe.`,
    serviceType:
      'Dog walking, group dog walking, dog training, pet sitting, pet boarding, in-home pet care, pet transport, farm animal care, event companion services',
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
        name: `Wat kost een hondenuitlaat in ${place.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Het tarief hangt af van de duur, het type wandeling (solo of in kleine groep) en jouw locatie in of rond de stad. Na je aanvraag ontvang je eerst een voorstel op maat, zodat je vooraf duidelijk weet waar je aan toe bent.',
        },
      },
      {
        '@type': 'Question',
        name: 'Hoe werkt een hondenuitlaatservice?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Bij een hondenuitlaatservice gaat je hond mee met een kleine, zorgvuldig samengestelde groep sociale honden. We stemmen vooraf karakter, energie en praktische zaken af en voorzien voldoende rustmomenten en veilige wandelroutes.',
        },
      },
      {
        '@type': 'Question',
        name: 'Kan ik ook een betrouwbare dierenoppasser aanvragen?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Ja. Ook wanneer je start vanuit hondenuitlaatservice bekijken we of een betrouwbare dierenoppasser of een andere vorm van hulp aan huis beter past bij jouw hond, planning en locatie in ${place.name}.`,
        },
      },
      {
        '@type': 'Question',
        name: 'Hoe boek ik een dierenoppas via TailTribe?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Je vult online een korte aanvraag in met je wensen, data en locatie. Daarna nemen we contact op om alles te bespreken en koppelen we je aan een passende dierenverzorger in jouw buurt.',
        },
      },
      {
        '@type': 'Question',
        name: `Welke diensten biedt TailTribe in ${place.name}?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'In deze regio kun je onder meer terecht voor hondenuitlaat, hondenuitlaatservice, hondentraining, dierenoppas, dierenopvang, verzorging aan huis, transport van huisdieren en – waar van toepassing – verzorging van boerderijdieren en begeleiding tijdens events.',
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
          dangerouslySetInnerHTML={{ __html: JSON.stringify(placeServiceJsonLd) }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
        />
        <div className="mx-auto max-w-3xl">
          <nav className="mb-8 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-slate-500">
            <Link href="/" className="hover:text-slate-800">
              Home
            </Link>
            <span className="text-slate-300">/</span>
            <Link href="/be" className="hover:text-slate-800">
              België
            </Link>
            <span className="text-slate-300">/</span>
            <Link href={`/be/${province.slug}`} className="hover:text-slate-800">
              {province.name}
            </Link>
            <span className="text-slate-300">/</span>
            <span className="font-medium text-slate-900">{place.name}</span>
          </nav>

          <header className="mb-12 text-left">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-emerald-800">
              TailTribe · {place.name}
            </p>
            <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 md:text-4xl md:leading-tight">
              {focus ? `Hondenuitlaatservice aan huis in ${place.name}` : `Dierenoppas in ${place.name}`}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600 md:text-lg">
              {focus
                ? `Hondenuitlaatservice aan huis: sociale daguitstappen, ophalen en terugbrengen, en duidelijke planning voor honden die graag samen op pad gaan.`
                : `Van hondenuitlaat en dierenoppas tot opvang en verzorging aan huis. We matchen je aanvraag met passende zorg in jouw regio.`}
            </p>
            <p className="mt-5 text-sm text-slate-500">
              {trustPillars.join(' · ')}
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
              {focus ? (
                <>
                  <Link href="/boeken?service=GROUP_DOG_WALKING" className="btn-brand-compact">
                    Bekijk beschikbaarheid aan huis
                  </Link>
                  <Link href="/diensten/hondenuitlaatservice" className="btn-secondary-compact sm:inline-flex">
                    Meer over hondenuitlaatservice
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/boeken" className="btn-brand-compact">
                    Vind de juiste service voor je huisdier
                  </Link>
                  <Link href="/diensten" className="btn-secondary-compact sm:inline-flex">
                    Bekijk alle diensten
                  </Link>
                </>
              )}
            </div>
          </header>

          <section className="mb-12 rounded-2xl border border-slate-200/90 bg-white p-8 md:p-10">
            <h2 className="text-xl font-semibold leading-snug text-slate-900 md:text-2xl">
              {focus
                ? `Hoe we hondenuitlaatservice aan huis in ${place.name} aanpakken`
                : `Wat je van TailTribe in ${place.name} mag verwachten`}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              {focus
                ? `We plannen helder, kiezen veilige routes en stemmen de groep en het tempo af op jouw hond. Ophalen en terugbrengen gebeurt in overleg; je krijgt geen vaag voorstel maar concrete afspraken.`
                : `We lezen je aanvraag, nemen contact op en stellen een voorstel voor dat past bij dier, agenda en locatie. Geen eindeloos vergelijken: één duidelijke lijn naar de juiste hulp.`}
            </p>
            <ul className="mt-8 divide-y divide-slate-100 border-t border-slate-100">
              {(focus
                ? [
                    {
                      title: 'Intake op maat',
                      text: `Karakter, ritme en praktische details van je hond in ${place.name}.`,
                    },
                    {
                      title: 'Planning en ophalen',
                      text: 'Afspraken over momenten en adres worden vooraf vastgelegd.',
                    },
                    {
                      title: 'Minder zoekstress',
                      text: 'Wij brengen structuur in je aanvraag zodat jij minder hoeft te gokken.',
                    },
                  ]
                : [
                    {
                      title: 'Match in jouw regio',
                      text: `Hulp die haalbaar is rond ${place.name}.`,
                    },
                    {
                      title: 'Passende dienst',
                      text: 'Uitlaat, oppas, opvang of zorg aan huis: wat echt bij je past.',
                    },
                    {
                      title: 'Persoonlijke opvolging',
                      text: 'Korte lijnen na je aanvraag.',
                    },
                  ]
              ).map((item) => (
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
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Waarom TailTribe</p>
            <h2 className="mt-2 text-xl font-semibold leading-snug text-slate-900 md:text-2xl">
              {focus ? `Waar baasjes in ${place.name} op rekenen` : `Dierenoppas en zorg in ${place.name}`}
            </h2>
            {focus ? (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
                Je zoekt iemand die betrouwbaar aanvoelt en past bij je week. Ophalen aan huis, een kleine groep die
                inhoudelijk klopt en routes met aandacht voor rust en veiligheid: alles wordt afgestemd voordat je hond
                mee is.
              </p>
            ) : (
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
                In {place.name} en omgeving helpen we je zonder profiel-doolhof: korte aanvraag, duidelijke opvolging, en
                een voorstel dat past bij je dier en je planning.
              </p>
            )}
          </section>

          <section className="mb-12 rounded-2xl border border-slate-200/90 bg-white p-8 md:p-10">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Zo werkt het</p>
            <h2 className="mt-2 text-xl font-semibold leading-snug text-slate-900 md:text-2xl">In drie stappen</h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              Kort en overzichtelijk, zodat je snel weet wat haalbaar is in {place.name}.
            </p>
            <ol className="mt-8 space-y-6 border-t border-slate-100 pt-6">
              {(focus
                ? [
                    {
                      step: '1',
                      title: 'Vertel kort wat je zoekt',
                      text: 'Waar je woont, wanneer je hulp nodig hebt en wat voor hond je hebt.',
                    },
                    {
                      step: '2',
                      title: 'We bekijken wat haalbaar is',
                      text: 'We checken of hondenuitlaatservice aan huis in jouw zone praktisch en inhoudelijk past.',
                    },
                    {
                      step: '3',
                      title: 'We leggen het vast',
                      text: 'Na akkoord plannen we de eerste momenten en afspraken rond ophalen.',
                    },
                  ]
                : [
                    {
                      step: '1',
                      title: 'Dien je aanvraag in',
                      text: 'Welke hulp je zoekt, waar je woont en wat voor huisdier je hebt.',
                    },
                    {
                      step: '2',
                      title: 'We denken mee',
                      text: 'We nemen contact op en bekijken welke oplossing het best past.',
                    },
                    {
                      step: '3',
                      title: 'Je krijgt een voorstel',
                      text: 'Een voorstel afgestemd op dier, planning en regio.',
                    },
                  ]
              ).map((item) => (
                <li key={item.title} className="flex gap-4">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-slate-50 text-sm font-medium text-slate-800">
                    {item.step}
                  </span>
                  <div>
                    <h3 className="font-medium text-slate-900">{item.title}</h3>
                    <p className="mt-1 text-sm leading-relaxed text-slate-600">{item.text}</p>
                  </div>
                </li>
              ))}
            </ol>
          </section>

          <section className="mb-12 rounded-2xl border border-slate-200/90 bg-white p-8 md:p-10">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Diensten</p>
            <h2 className="mt-2 text-xl font-semibold leading-snug text-slate-900 md:text-2xl">
              Populaire hulp voor huisdiereigenaars in {place.name}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-relaxed text-slate-600">
              Dit zijn de meest gevraagde diensten door baasjes in {place.name}. Zo kom je sneller bij de juiste info
              zonder eerst door een lange lijst te moeten.
            </p>
            <div className="mt-8 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleServices.map((service) => (
                <div key={service.id} className="flex h-full flex-col rounded-xl border border-slate-200/80 bg-slate-50/40 p-5">
                  <h3 className="mb-2 text-lg font-semibold text-slate-900">
                    {service.name}
                  </h3>
                  {service.id === 'DOG_WALKING' ? (
                    <p className="text-sm leading-relaxed text-slate-600">
                      Hondenuitlaat aan huis in {place.name}, met rustige wandelingen in {localDogWalkingHighlight}.
                    </p>
                  ) : null}
                  {service.id === 'GROUP_DOG_WALKING' ? (
                    <p className="text-sm leading-relaxed text-slate-600">
                      Hondenuitlaatservice aan huis met sociale daguitstappen, ophalen en terugbrengen in {place.name}.
                    </p>
                  ) : null}
                  {service.id === 'DOG_TRAINING' ? (
                    <p className="text-sm leading-relaxed text-slate-600">
                      Praktische hondentraining in {place.name}, afgestemd op je hond en je dagelijkse leven.
                    </p>
                  ) : null}
                  {service.id === 'PET_SITTING' ? (
                    <p className="text-sm leading-relaxed text-slate-600">
                      Dierenoppas en hondenoppas aan huis in {place.name}, zodat je huisdier in de vertrouwde omgeving kan blijven.
                    </p>
                  ) : null}
                  {service.id === 'PET_BOARDING' ? (
                    <p className="text-sm leading-relaxed text-slate-600">
                      Hondenopvang en dierenopvang in {place.name} wanneer je tijdelijk een veilige plek zoekt voor je huisdier.
                    </p>
                  ) : null}
                  {service.id === 'HOME_CARE' ? (
                    <p className="text-sm leading-relaxed text-slate-600">
                      Verzorging aan huis in {place.name} voor dieren die liefst in hun eigen omgeving blijven.
                    </p>
                  ) : null}
                  {service.id === 'PET_TRANSPORT' || service.id === 'SMALL_ANIMAL_CARE' || service.id === 'EVENT_COMPANION' ? (
                    <p className="text-sm leading-relaxed text-slate-600">
                      Ook beschikbaar in {place.name}, afhankelijk van je vraag en de juiste match.
                    </p>
                  ) : null}
                  <div className="mt-5">
                    <Link
                      href={`/diensten/${service.slug}`}
                      className="btn-secondary-compact"
                    >
                      Bekijk {service.name}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12 rounded-2xl border border-slate-200/90 bg-white p-8 md:p-10">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Vertrouwen</p>
            <h2 className="mt-2 text-xl font-semibold leading-snug text-slate-900 md:text-2xl">Wat baasjes zeggen</h2>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {ownerTestimonials.map((item) => (
                <div key={item.name} className="rounded-xl border border-slate-200/80 bg-slate-50/30 p-5">
                  <p className="text-sm leading-relaxed text-slate-600">&quot;{item.quote}&quot;</p>
                  <p className="mt-4 text-sm font-medium text-slate-900">{item.name}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-12 rounded-2xl border border-slate-200/90 bg-white p-8 md:p-10">
            <p className="text-xs font-medium uppercase tracking-[0.12em] text-slate-500">Veelgestelde vragen</p>
            <h2 className="mt-2 text-xl font-semibold leading-snug text-slate-900 md:text-2xl">Veelgestelde vragen</h2>
            <div className="mt-8 grid gap-10 text-slate-600 md:grid-cols-2 md:gap-x-12">
              <div>
                <h3 className="font-medium leading-snug text-slate-900">
                  Wat kost een hondenuitlaat in {place.name}?
                </h3>
                <p className="mt-2 text-sm leading-relaxed">
                  De prijs hangt af van de duur, het type wandeling (solo of kleine groep) en je exacte locatie. Na je
                  aanvraag bekijken we wat er nodig is en ontvang je een voorstel op maat, zodat je vooraf een duidelijk
                  beeld hebt van de kosten.
                </p>
              </div>
              <div>
                <h3 className="font-medium leading-snug text-slate-900">Hoe werkt een hondenuitlaatservice?</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  Bij een hondenuitlaatservice gaat je hond mee met een zorgvuldig geselecteerde groep sociale honden. We
                  stemmen vooraf af of je hond hiervoor geschikt is, plannen ophalen en terugbrengen en zorgen voor
                  veilige routes met voldoende rustmomenten.
                </p>
              </div>
              <div>
                <h3 className="font-medium leading-snug text-slate-900">Kan ik ook een betrouwbare dierenoppasser aanvragen?</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  Ja. Ook wanneer je start vanuit hondenuitlaatservice bekijken we of een betrouwbare dierenoppasser of
                  een andere vorm van hulp aan huis beter past bij jouw hond, planning en locatie in {place.name}.
                </p>
              </div>
              <div>
                <h3 className="font-medium leading-snug text-slate-900">Hoe boek ik een dierenoppas via TailTribe?</h3>
                <p className="mt-2 text-sm leading-relaxed">
                  Je vult online een korte aanvraag in met data, locatie en info over je huisdier. Daarna nemen we
                  contact op om je wensen te bespreken en koppelen we je aan een passende dierenverzorger in of rond{' '}
                  {place.name}.
                </p>
              </div>
              <div className="md:col-span-2 md:max-w-3xl">
                <h3 className="font-medium leading-snug text-slate-900">
                  Welke diensten biedt TailTribe in {place.name}?
                </h3>
                <p className="mt-2 text-sm leading-relaxed">
                  In deze regio kun je onder andere terecht voor hondenuitlaat, hondenuitlaatservice, hondentraining,
                  dierenoppas, kattenoppas, dierenopvang, verzorging aan huis, transport van huisdieren en – indien
                  relevant – verzorging van boerderijdieren en begeleiding tijdens events.
                </p>
              </div>
            </div>
          </section>

          <section className="rounded-2xl border border-slate-200/90 bg-white p-8 md:p-10">
            <div className="mx-auto max-w-xl text-left md:text-center">
              <h2 className="text-xl font-semibold leading-snug text-slate-900 md:text-2xl">
                Klaar om de juiste match in {place.name} te vinden?
              </h2>
              <p className="mt-4 text-base leading-relaxed text-slate-600">
                {focus
                  ? `Laat weten waar je woont en wat je hond nodig heeft. We bekijken of hondenuitlaatservice aan huis in ${place.name} bij je situatie past.`
                  : `Beschrijf kort wat je nodig hebt. We koppelen je aan de dienst en opvolging die bij je past.`}
              </p>
              <div className="mt-8 md:flex md:justify-center">
                <Link href={focus ? '/boeken?service=GROUP_DOG_WALKING' : '/boeken'} className="btn-brand w-full sm:w-auto">
                  {focus ? 'Bekijk beschikbaarheid aan huis' : 'Vind de juiste service voor je huisdier'}
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



