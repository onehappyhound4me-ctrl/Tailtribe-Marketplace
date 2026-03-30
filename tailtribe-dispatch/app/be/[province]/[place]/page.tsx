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
  const nearbyPlaces = getPlacesByProvince(province.slug).filter((pl) => pl.slug !== place.slug).slice(0, 6)
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

          <header className="mb-10 text-center">
            <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
              TailTribe in {place.name}
            </p>
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {focus ? `Hondenuitlaatservice aan huis in ${place.name}` : `Dierenoppas in ${place.name}`}
            </h1>
            <p className="mx-auto max-w-2xl text-lg leading-8 text-gray-600 md:text-xl">
              {focus
                ? `Zoek je hondenuitlaatservice aan huis in ${place.name}? Wij helpen met sociale daguitstappen, ophalen en terugbrengen, en een zorgvuldige planning voor honden die graag samen op pad gaan.`
                : `Zoek je een betrouwbare dierenoppasser in ${place.name}? Van hondenuitlaat en dierenoppas tot dierenopvang en verzorging aan huis: hier vind je sneller de juiste match voor je huisdier.`}
            </p>
            <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
              {trustPillars.map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm"
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-6 flex flex-col items-center gap-4">
              {focus ? (
                <>
                  <Link href="/boeken?service=GROUP_DOG_WALKING" className="btn-brand-compact">
                    Bekijk beschikbaarheid aan huis
                  </Link>
                  <Link href="/diensten/hondenuitlaatservice" className="text-sm font-medium text-gray-600 hover:text-gray-900">
                    Meer over hondenuitlaatservice
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/boeken" className="btn-brand-compact">
                    Vind de juiste service voor je huisdier
                  </Link>
                  <Link href={`/be/${province.slug}`} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                    Bekijk meer in {province.name}
                  </Link>
                </>
              )}
            </div>
          </header>

          <section className="mb-8 rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/70 to-sky-50 p-6 shadow-sm md:p-10">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-800">
              {focus ? 'Lokale focus' : 'Voor huisdiereigenaars'}
            </p>
            <h2 className="mt-3 max-w-2xl text-2xl font-semibold leading-tight text-gray-900 md:text-3xl">
              {focus
                ? `Hondenuitlaatservice aan huis in ${place.name}, helder en praktisch geregeld`
                : `Snel duidelijkheid over de juiste hulp voor je huisdier in ${place.name}`}
            </h2>
            <p className="mt-4 max-w-2xl text-base leading-8 text-gray-700">
              {focus
                ? `Voor honden in ${place.name} en omgeving die graag samen op pad gaan, zorgen we voor een duidelijke planning, veilige routes en een aanpak die past bij karakter en energie. We halen je hond aan huis op en bevestigen pas wanneer alles praktisch goed zit.`
                : `We bekijken je aanvraag en zoeken de juiste match in jouw regio. Van hondenuitlaat en dierenoppas tot dierenopvang en verzorging aan huis: je krijgt een voorstel dat past bij je dier, je planning en je locatie.`}
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {(focus
                ? ['Aan huis ophalen', 'Sociale daguitstappen', 'Zorgvuldige matching', 'Veilige routes']
                : ['Hondenuitlaat', 'Dierenoppas', 'Dierenopvang', 'Verzorging aan huis']
              ).map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center rounded-full border border-emerald-100 bg-white/90 px-3 py-1.5 text-sm font-medium text-gray-700"
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-6">
              <Link href={focus ? '/boeken?service=GROUP_DOG_WALKING' : '/boeken'} className="btn-brand-compact">
                {focus ? 'Bekijk beschikbaarheid aan huis' : 'Vind de juiste service voor je huisdier'}
              </Link>
            </div>
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {(focus
                ? [
                    {
                      title: 'Duidelijke intake',
                      text: `We luisteren eerst naar het karakter, ritme en de noden van je hond in ${place.name}.`,
                    },
                    {
                      title: 'Heldere planning',
                      text: 'Ophalen, terugbrengen en praktische afspraken worden vooraf duidelijk afgestemd.',
                    },
                    {
                      title: 'Rust voor baasjes',
                      text: 'Je hoeft niet zelf eindeloos te zoeken of te twijfelen wat het best past.',
                    },
                  ]
                : [
                    {
                      title: 'Lokale matching',
                      text: `We zoeken hulp die praktisch haalbaar is in ${place.name} en omgeving.`,
                    },
                    {
                      title: 'Gerichte hulp',
                      text: 'Je krijgt geen overload aan keuzes, maar duidelijke hulp op basis van je aanvraag.',
                    },
                    {
                      title: 'Vertrouwen voorop',
                      text: 'Voor veel baasjes telt vooral rust: iemand vinden die goed voelt voor hun huisdier.',
                    },
                  ]
              ).map((item) => (
                <div key={item.title} className="rounded-2xl border border-white/80 bg-white/90 p-5 shadow-sm">
                  <h3 className="text-base font-semibold leading-snug text-gray-900">{item.title}</h3>
                  <p className="mt-2 text-sm leading-7 text-gray-700">{item.text}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mb-6 rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Waarom TailTribe</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-gray-900">
              {focus ? `Waarom kiezen baasjes in ${place.name} voor TailTribe?` : `Dierenoppas en huisdierenzorg in ${place.name}`}
            </h2>
            {focus ? (
              <>
                <p className="mb-6 mt-4 max-w-2xl text-base leading-8 text-gray-700">
                  Je zoekt niet zomaar een dienst, maar een dierenoppasser die betrouwbaar voelt en praktisch werkt voor
                  jouw weekplanning. Daarom houden we de aanvraag eenvoudig en de opvolging persoonlijk.
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      title: 'Ophalen aan huis',
                      text: `We stemmen af waar en wanneer we je hond in ${place.name} ophalen en terugbrengen.`,
                    },
                    {
                      title: 'Kleine passende groep',
                      text: 'We kijken eerst naar karakter, energie en compatibiliteit voor we een hond laten meedraaien.',
                    },
                    {
                      title: 'Veilige routes',
                      text: 'We kiezen routes en daguitstappen met aandacht voor rust, veiligheid en voldoende beweging.',
                    },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
                      <h3 className="text-base font-semibold leading-snug text-gray-900">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-gray-700">{item.text}</p>
                    </div>
                  ))}
                </div>
                <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/80 p-5 text-sm leading-7 text-slate-700">
                  <span className="font-semibold text-slate-900">Regio:</span> Groot Antwerpen (+rand) en Antwerpen Noord
                  (Kapellen, Brasschaat, Kalmthout). Zoek je vooral een betrouwbare dierenoppasser voor uitlaatmomenten
                  aan huis, dan zit je hier op de juiste pagina.
                </div>
              </>
            ) : (
              <>
                <p className="mb-6 mt-4 max-w-2xl text-base leading-8 text-gray-700">
                  In {place.name} en omgeving helpen we baasjes die op zoek zijn naar een betrouwbare dierenoppasser of
                  andere huisdierenzorg. Je hoeft niet zelf uit te zoeken welke dienst het best past: we denken mee op
                  basis van je dier, je planning en je locatie.
                </p>
                <div className="grid gap-4 md:grid-cols-3">
                  {[
                    {
                      title: 'Minder zoekwerk',
                      text: 'Je start met een korte aanvraag en hoeft niet zelf tientallen profielen te vergelijken.',
                    },
                    {
                      title: 'Passende service',
                      text: 'We denken mee of hondenuitlaat, dierenoppas, opvang of zorg aan huis het best past.',
                    },
                    {
                      title: 'Meer vertrouwen',
                      text: `Voor baasjes in ${place.name} telt vooral rust: weten dat hun huisdier goed zit.`,
                    },
                  ].map((item) => (
                    <div key={item.title} className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                      <h3 className="text-base font-semibold leading-snug text-gray-900">{item.title}</h3>
                      <p className="mt-2 text-sm leading-7 text-gray-700">{item.text}</p>
                    </div>
                  ))}
                </div>
              </>
            )}
          </section>

          <section className="rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Zo werkt het</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-gray-900">Hoe werkt het?</h2>
            <p className="mb-6 mt-4 max-w-2xl text-base leading-8 text-gray-700">
              Een aanvraag indienen hoeft niet zwaar te voelen. We houden het bewust eenvoudig zodat je snel weet wat
              haalbaar is in {place.name}.
            </p>
            {focus ? (
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    step: '01',
                    title: 'Vertel kort wat je zoekt',
                    text: 'Geef door waar je woont, wanneer je hulp nodig hebt en wat voor hond je hebt.',
                  },
                  {
                    step: '02',
                    title: 'We bekijken wat haalbaar is',
                    text: 'We checken of hondenuitlaatservice aan huis in jouw zone praktisch en inhoudelijk past.',
                  },
                  {
                    step: '03',
                    title: 'We plannen alles duidelijk in',
                    text: 'Na akkoord leggen we de eerste uitlaatmomenten en afspraken rond ophalen vast.',
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-black/5 bg-slate-50/70 p-6">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-base font-semibold text-emerald-900">
                      {item.step}
                    </div>
                    <h3 className="text-base font-semibold leading-snug text-gray-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-gray-700">{item.text}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  {
                    step: '01',
                    title: 'Dien je aanvraag in',
                    text: 'Vertel welke hulp je zoekt, waar je woont en wat voor huisdier je hebt.',
                  },
                  {
                    step: '02',
                    title: 'We denken met je mee',
                    text: 'We nemen contact op en bekijken welke oplossing het best past bij jouw situatie.',
                  },
                  {
                    step: '03',
                    title: 'Je krijgt een passend voorstel',
                    text: 'Daarna ontvang je een voorstel dat klopt voor je dier, je planning en je regio.',
                  },
                ].map((item) => (
                  <div key={item.title} className="rounded-2xl border border-black/5 bg-slate-50/70 p-6">
                    <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-100 text-base font-semibold text-emerald-900">
                      {item.step}
                    </div>
                    <h3 className="text-base font-semibold leading-snug text-gray-900">{item.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-gray-700">{item.text}</p>
                  </div>
                ))}
              </div>
            )}
            {focus ? (
              <div className="mt-8 flex flex-col items-center justify-center gap-3 rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5 text-center">
                <p className="text-sm leading-6 text-gray-700">
                  Klaar om te bekijken of hondenuitlaatservice aan huis past in jouw regio?
                </p>
                <Link href="/boeken?service=GROUP_DOG_WALKING" className="btn-brand w-full sm:w-auto">
                  Bekijk beschikbaarheid aan huis
                </Link>
              </div>
            ) : null}
          </section>

          <section className="mt-6 rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Diensten</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-gray-900">
              Populaire hulp voor huisdiereigenaars in {place.name}
            </h2>
            <p className="mb-6 mt-4 max-w-2xl text-base leading-8 text-gray-700">
              Dit zijn de meest gevraagde diensten door baasjes in {place.name}. Zo kom je sneller bij de juiste info
              zonder eerst door een lange lijst te moeten.
            </p>
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {visibleServices.map((service) => (
                <div key={service.id} className="flex h-full flex-col rounded-2xl border border-black/5 bg-slate-50/60 p-5">
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    {service.name}
                  </h3>
                  {service.id === 'DOG_WALKING' ? (
                    <p className="text-sm leading-7 text-gray-700">
                      Hondenuitlaat aan huis in {place.name}, met rustige wandelingen in {localDogWalkingHighlight}.
                    </p>
                  ) : null}
                  {service.id === 'GROUP_DOG_WALKING' ? (
                    <p className="text-sm leading-7 text-gray-700">
                      Hondenuitlaatservice aan huis met sociale daguitstappen, ophalen en terugbrengen in {place.name}.
                    </p>
                  ) : null}
                  {service.id === 'DOG_TRAINING' ? (
                    <p className="text-sm leading-7 text-gray-700">
                      Praktische hondentraining in {place.name}, afgestemd op je hond en je dagelijkse leven.
                    </p>
                  ) : null}
                  {service.id === 'PET_SITTING' ? (
                    <p className="text-sm leading-7 text-gray-700">
                      Dierenoppas en hondenoppas aan huis in {place.name}, zodat je huisdier in de vertrouwde omgeving kan blijven.
                    </p>
                  ) : null}
                  {service.id === 'PET_BOARDING' ? (
                    <p className="text-sm leading-7 text-gray-700">
                      Hondenopvang en dierenopvang in {place.name} wanneer je tijdelijk een veilige plek zoekt voor je huisdier.
                    </p>
                  ) : null}
                  {service.id === 'HOME_CARE' ? (
                    <p className="text-sm leading-7 text-gray-700">
                      Verzorging aan huis in {place.name} voor dieren die liefst in hun eigen omgeving blijven.
                    </p>
                  ) : null}
                  {service.id === 'PET_TRANSPORT' || service.id === 'SMALL_ANIMAL_CARE' || service.id === 'EVENT_COMPANION' ? (
                    <p className="text-sm leading-7 text-gray-700">
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

          <section className="mt-6 rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Vertrouwen</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-gray-900">Waarom dit vertrouwen geeft</h2>
            <div className="grid gap-4 md:grid-cols-3">
              {ownerTestimonials.map((item) => (
                <div key={item.name} className="rounded-2xl border border-emerald-100 bg-emerald-50/50 p-5">
                  <p className="text-sm leading-7 text-gray-700">&quot;{item.quote}&quot;</p>
                  <p className="mt-4 text-sm font-semibold text-gray-900">{item.name}</p>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-6 rounded-2xl border border-black/5 bg-white p-8 shadow-sm">
            <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Veelgestelde vragen</p>
            <h2 className="mt-3 text-2xl font-semibold leading-tight text-gray-900">Veelgestelde vragen</h2>
            <div className="mt-6 grid gap-4 text-gray-700 md:grid-cols-2">
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="font-semibold leading-snug text-gray-900">
                  Wat kost een hondenuitlaat in {place.name}?
                </div>
                <p className="mt-2 text-sm leading-7">
                  De prijs hangt af van de duur, het type wandeling (solo of kleine groep) en je exacte locatie. Na je
                  aanvraag bekijken we wat er nodig is en ontvang je een voorstel op maat, zodat je vooraf een duidelijk
                  beeld hebt van de kosten.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="font-semibold leading-snug text-gray-900">Hoe werkt een hondenuitlaatservice?</div>
                <p className="mt-2 text-sm leading-7">
                  Bij een hondenuitlaatservice gaat je hond mee met een zorgvuldig geselecteerde groep sociale honden. We
                  stemmen vooraf af of je hond hiervoor geschikt is, plannen ophalen en terugbrengen en zorgen voor
                  veilige routes met voldoende rustmomenten.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="font-semibold leading-snug text-gray-900">Kan ik ook een betrouwbare dierenoppasser aanvragen?</div>
                <p className="mt-2 text-sm leading-7">
                  Ja. Ook wanneer je start vanuit hondenuitlaatservice bekijken we of een betrouwbare dierenoppasser of
                  een andere vorm van hulp aan huis beter past bij jouw hond, planning en locatie in {place.name}.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
                <div className="font-semibold leading-snug text-gray-900">Hoe boek ik een dierenoppas via TailTribe?</div>
                <p className="mt-2 text-sm leading-7">
                  Je vult online een korte aanvraag in met data, locatie en info over je huisdier. Daarna nemen we
                  contact op om je wensen te bespreken en koppelen we je aan een passende dierenverzorger in of rond{' '}
                  {place.name}.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-5 md:col-span-2">
                <div className="font-semibold leading-snug text-gray-900">
                  Welke diensten biedt TailTribe in {place.name}?
                </div>
                <p className="mt-2 text-sm leading-7">
                  In deze regio kun je onder andere terecht voor hondenuitlaat, hondenuitlaatservice, hondentraining,
                  dierenoppas, kattenoppas, dierenopvang, verzorging aan huis, transport van huisdieren en – indien
                  relevant – verzorging van boerderijdieren en begeleiding tijdens events.
                </p>
              </div>
            </div>
          </section>

          {nearbyPlaces.length > 0 ? (
            <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-8 mt-6">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">Diensten in de buurt</h2>
              <p className="text-gray-700 leading-relaxed mb-4">
                Woon je net buiten {place.name} of zoek je een verzorger in een naburige gemeente? Bekijk ook onze
                diensten in de buurt.
              </p>
              <div className="flex flex-wrap gap-2">
                {nearbyPlaces.map((pl) => (
                  <Link
                    key={pl.slug}
                    href={`/be/${province.slug}/${pl.slug}`}
                    className="inline-flex items-center px-3 py-1.5 rounded-full border border-emerald-100 bg-emerald-50 text-sm font-medium text-emerald-900 hover:bg-emerald-100 transition"
                  >
                    {pl.name}
                  </Link>
                ))}
              </div>
            </section>
          ) : null}

          <section className="mt-6 rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/60 to-sky-50 p-6 shadow-sm md:p-10">
            <div className="mx-auto max-w-3xl text-center">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-800">Laatste stap</p>
              <h2 className="mt-3 text-2xl font-semibold leading-tight text-gray-900 md:text-3xl">
                Klaar om de juiste match in {place.name} te vinden?
              </h2>
              <p className="mt-4 text-base leading-8 text-gray-700">
                {focus
                  ? `Vertel ons waar je woont en wat je hond nodig heeft. Daarna bekijken we of hondenuitlaatservice aan huis in ${place.name} past bij jouw situatie.`
                  : `Vertel ons wat je nodig hebt voor je huisdier. Daarna bekijken we welke dienst en welke verzorger het best aansluiten bij jouw situatie.`}
              </p>
              <div className="mt-6 flex justify-center">
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



