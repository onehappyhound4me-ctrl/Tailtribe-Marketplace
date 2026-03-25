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
    ? `Hondenuitlaatservice en dierenoppas in ${place.name} | TailTribe`
    : `Dierenoppas in ${place.name} | TailTribe`
  const description = focus
    ? `Van hondenuitlaatservice en dierenoppas tot dierenopvang en verzorging aan huis in ${place.name}. Voor en door dierenverzorgers: hier vind je de juiste match voor je huisdier.`
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
    name: `Dierenoppas en huisdierenzorg in ${place.name}`,
    description: focus
      ? `Hondenuitlaatservice en dierenoppas in ${place.name}, ${province.name}. Vind via TailTribe de juiste match voor je huisdier.`
      : `Dierenoppas en huisdierenzorg in ${place.name}, ${province.name}. Hondenuitlaat, dierenoppas, opvang en meer.`,
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

          <header className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              {focus ? `Hondenuitlaatservice en dierenoppas in ${place.name}` : `Dierenoppas in ${place.name}`}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              {focus
                ? `Van hondenuitlaatservice en dierenoppas tot dierenopvang en verzorging aan huis. Voor en door dierenverzorgers: hier vind je de juiste match voor je huisdier in ${place.name}.`
                : `Van hondenuitlaat en dierenoppas tot dierenopvang en verzorging aan huis. Voor en door dierenverzorgers: hier vind je de juiste match voor je huisdier in ${place.name}.`}
            </p>
            <div className="mt-6 flex flex-col items-center gap-4">
              <Link href="/boeken" className="btn-brand-compact">
                Vind de juiste service voor je huisdier
              </Link>
              <Link href={`/be/${province.slug}`} className="text-sm font-medium text-gray-600 hover:text-gray-900">
                Bekijk meer in {province.name}
              </Link>
            </div>
          </header>

          <section className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/60 to-sky-50 p-6 md:p-8 mb-8 shadow-sm">
            <p className="text-sm font-semibold tracking-[0.02em] text-emerald-800">Voor en door dierenverzorgers</p>
            <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-gray-900">
              Hier vind je de juiste service voor je huisdier in {place.name}
            </h2>
            <p className="mt-3 max-w-3xl text-base leading-relaxed text-gray-700">
              We bekijken je aanvraag en zoeken de juiste match in jouw regio. Van hondenuitlaat en dierenoppas tot
              dierenopvang en verzorging aan huis: je krijgt een voorstel dat past bij je dier, je planning en je locatie.
            </p>
            <div className="mt-5 flex flex-wrap gap-2">
              {['Hondenuitlaat', 'Dierenoppas', 'Dierenopvang', 'Verzorging aan huis'].map((label) => (
                <span
                  key={label}
                  className="inline-flex items-center rounded-full border border-emerald-100 bg-white/85 px-3 py-1.5 text-sm font-medium text-gray-700"
                >
                  {label}
                </span>
              ))}
            </div>
            <div className="mt-6">
              <Link href="/boeken" className="btn-brand-compact">
                Vind de juiste service voor je huisdier
              </Link>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-8 mb-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">
              {focus ? `Waarom kiezen baasjes in ${place.name} voor TailTribe?` : `Dierenoppas en huisdierenzorg in ${place.name}`}
            </h2>
            {focus ? (
              <>
                <p className="text-gray-700 leading-relaxed">
                  We bieden in {place.name} een combinatie van hondenuitlaatservice, dierenoppas en andere huisdierenzorg
                  op maat. We kijken naar karakter, routine en praktische haalbaarheid, zodat jij niet zelf hoeft te
                  zoeken tussen losse aanbieders.
                </p>
                <div className="mt-4 rounded-xl border border-emerald-100 bg-emerald-50/60 p-4 text-sm text-emerald-900">
                  <div className="font-semibold">Regio</div>
                  <div>Actief in Groot Antwerpen (+rand) en Antwerpen Noord (Kapellen–Brasschaat–Kalmthout).</div>
                </div>
                <p className="text-gray-700 leading-relaxed mt-4">
                  Dien je aanvraag in via TailTribe. We nemen contact op om je locatie, planning en praktische details af
                  te stemmen en zoeken vervolgens de juiste match voor jouw hond of huisdier.
                </p>
              </>
            ) : (
              <>
                <p className="text-gray-700 leading-relaxed">
                  In {place.name} en omgeving helpen we baasjes die op zoek zijn naar een betrouwbare dierenoppasser of
                  andere huisdierenzorg. Je hoeft niet zelf uit te zoeken welke dienst het best past: we denken mee op
                  basis van je dier, je planning en je locatie.
                </p>
                <p className="text-gray-700 leading-relaxed mt-3">
                  Van hondenuitlaat en dierenoppas tot dierenopvang en verzorging aan huis: we nemen zo snel mogelijk
                  contact op en stellen een passende oplossing voor.
                </p>
              </>
            )}
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Hoe werkt het?</h2>
            {focus ? (
              <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                <li>Vul je aanvraag in (hondenuitlaatservice, locatie en info over je hond).</li>
                <li>We nemen contact op om compatibiliteit, planning en praktische details af te stemmen.</li>
                <li>Na akkoord plannen we een kennismaking/testmoment in en bevestigen we de uitlaatmomenten.</li>
              </ol>
            ) : (
              <ol className="list-decimal pl-5 space-y-2 text-gray-700">
                <li>Vul je aanvraag in (dienst, datum, locatie en huisdierinfo).</li>
                <li>Wij nemen contact op en stemmen de details af.</li>
                <li>We plannen een geschikte verzorger in.</li>
              </ol>
            )}
            {focus ? (
              <div className="mt-6">
                <Link href="/boeken" className="btn-brand-compact">
                  Vind de juiste service voor je huisdier
                </Link>
              </div>
            ) : null}
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-8 mt-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Huisdierenservices in {place.name}</h2>
            <p className="text-gray-700 leading-relaxed mb-5">
              In en rond {place.name} kun je verschillende diensten combineren: van dagelijkse hondenuitlaat tot
              dierenoppas, kattenoppas, opvang, verzorging aan huis en transport. Hieronder vind je een overzicht van de
              belangrijkste services die via TailTribe beschikbaar zijn in jouw regio.
            </p>
            <div className="space-y-6">
              {SERVICE_SECTIONS.map((service) => (
                <div key={service.id} className="border-t border-emerald-50 pt-5 first:border-t-0 first:pt-0">
                  <h3 className="text-xl font-semibold text-gray-900 mb-1">
                    {service.name} in {place.name}
                  </h3>
                  {service.id === 'DOG_WALKING' ? (
                    <p className="text-gray-700 leading-relaxed">
                      Onze hondenuitlaters halen je hond thuis op in {place.name} en zorgen voor rustige, veilige
                      wandelingen in {localDogWalkingHighlight}. We stemmen tempo, duur en frequentie af op leeftijd,
                      conditie en karakter van je hond, zodat hij zowel fysiek als mentaal voldoende uitdaging krijgt
                      zonder overprikkeling. Updates of foto&apos;s zijn mogelijk in overleg, zodat je met een gerust
                      hart weet hoe het is verlopen.
                    </p>
                  ) : null}
                  {service.id === 'GROUP_DOG_WALKING' ? (
                    <p className="text-gray-700 leading-relaxed">
                      Bij hondenuitlaatservice gaat je hond mee met een kleine, zorgvuldig samengestelde groep sociale honden
                      uit {place.name} en omliggende gemeenten. Er is aandacht voor compatibiliteit, duidelijke
                      afspraken rond ophalen en terugbrengen en voldoende rustmomenten tussendoor. Ideaal voor honden
                      die graag samen op pad gaan en na afloop moe maar tevreden thuis aankomen.
                    </p>
                  ) : null}
                  {service.id === 'DOG_TRAINING' ? (
                    <p className="text-gray-700 leading-relaxed">
                      Hondentraining in {place.name} richt zich op praktische situaties uit jouw dagelijkse leven:
                      wandelen zonder trekken, bezoek ontvangen, alleen thuis blijven of omgaan met prikkels op straat.
                      We werken beloningsgericht en stemmen tempo en oefeningen af op jou en je hond. Zo krijg je geen
                      standaardpakket, maar begeleiding die echt past bij jullie situatie.
                    </p>
                  ) : null}
                  {service.id === 'PET_SITTING' ? (
                    <p className="text-gray-700 leading-relaxed">
                      Met dierenoppas in {place.name} blijft je huisdier in zijn vertrouwde omgeving terwijl jij weg
                      bent. De verzorger komt langs volgens afgesproken momenten voor voeding, wandelen, spelen en
                      basiszorg. Dit is ideaal voor honden en kleine huisdieren die het best functioneren in hun eigen
                      woonst en routine. Voor katten is er daarnaast een aparte kattenoppasdienst met extra aandacht
                      voor rust, territorium en kattenbakonderhoud.
                    </p>
                  ) : null}
                  {service.id === 'CAT_SITTING' ? (
                    <p className="text-gray-700 leading-relaxed">
                      Met kattenoppas in {place.name} blijft je kat in haar eigen, vertrouwde omgeving. De verzorger
                      komt langs voor voeding, vers water, kattenbak, spel en een korte welzijnscheck. Dit is
                      stressarmer dan een pension en ideaal voor katten die gehecht zijn aan hun eigen territorium.
                    </p>
                  ) : null}
                  {service.id === 'PET_BOARDING' ? (
                    <p className="text-gray-700 leading-relaxed">
                      Dierenopvang is bedoeld voor situaties waarin je huisdier tijdelijk op een andere plek verblijft,
                      bijvoorbeeld tijdens vakantie of een drukke periode. We stemmen op voorhand afspraken af rond
                      voeding, rust, eventuele medicatie en contactmomenten, zodat je exact weet wat je dier kan
                      verwachten en jij met een gerust hart kan vertrekken.
                    </p>
                  ) : null}
                  {service.id === 'HOME_CARE' ? (
                    <p className="text-gray-700 leading-relaxed">
                      Verzorging aan huis in {place.name} is geschikt voor dieren die het liefst thuis blijven. Een
                      verzorger komt langs voor voeding, water, kattenbak of kooi, een korte wandeling of gewoon wat
                      extra aandacht. Je kiest zelf hoe vaak en hoe lang de bezoeken duren, zodat het ritme van je dier
                      zo min mogelijk verstoord wordt.
                    </p>
                  ) : null}
                  {service.id === 'PET_TRANSPORT' ? (
                    <p className="text-gray-700 leading-relaxed">
                      Transport van huisdieren vanuit {place.name} kan handig zijn voor dierenartsbezoeken, verhuis,
                      opvang of het ophalen en terugbrengen van je huisdier. We werken met duidelijke afspraken rond
                      timing, veiligheid en eventuele documenten, zodat de verplaatsing zo rustig en voorspelbaar
                      mogelijk verloopt.
                    </p>
                  ) : null}
                  {service.id === 'SMALL_ANIMAL_CARE' ? (
                    <p className="text-gray-700 leading-relaxed">
                      Voor boerderijdieren en kleinvee in en rond {place.name} voorzien we basisverzorging volgens een
                      duidelijke checklist: voeding, water, controle van hokken/stallen en een korte welzijnscheck. Dit
                      is interessant wanneer je even weg bent maar de routine voor je dieren wél moet blijven
                      doorlopen.
                    </p>
                  ) : null}
                  {service.id === 'EVENT_COMPANION' ? (
                    <p className="text-gray-700 leading-relaxed">
                      Begeleiding tijdens events zorgt ervoor dat je huisdier aanwezig kan zijn op bijzondere momenten,
                      zonder dat jij overal tegelijk hoeft te zijn. Denk aan een huwelijk, fotoshoot of ander event in
                      of rond {place.name}. We begeleiden je dier tussen de verschillende momenten door, voorzien rust
                      en water en stemmen alles af met jou en de locatie.
                    </p>
                  ) : null}
                  <div className="mt-3">
                    <Link
                      href={`/diensten/${service.slug}`}
                      className="inline-flex items-center text-sm font-semibold text-emerald-800 hover:text-emerald-900"
                    >
                      Lees meer over {service.name}
                      <span aria-hidden className="ml-1">
                        →
                      </span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-8 mt-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">Veelgestelde vragen</h2>
            <div className="space-y-4 text-gray-700">
              <div>
                <div className="font-semibold text-gray-900">
                  Wat kost een hondenuitlaat in {place.name}?
                </div>
                <p>
                  De prijs hangt af van de duur, het type wandeling (solo of kleine groep) en je exacte locatie. Na je
                  aanvraag bekijken we wat er nodig is en ontvang je een voorstel op maat, zodat je vooraf een duidelijk
                  beeld hebt van de kosten.
                </p>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Hoe werkt een hondenuitlaatservice?</div>
                <p>
                  Bij een hondenuitlaatservice gaat je hond mee met een zorgvuldig geselecteerde groep sociale honden. We
                  stemmen vooraf af of je hond hiervoor geschikt is, plannen ophalen en terugbrengen en zorgen voor
                  veilige routes met voldoende rustmomenten.
                </p>
              </div>
              <div>
                <div className="font-semibold text-gray-900">Hoe boek ik een dierenoppas via TailTribe?</div>
                <p>
                  Je vult online een korte aanvraag in met data, locatie en info over je huisdier. Daarna nemen we
                  contact op om je wensen te bespreken en koppelen we je aan een passende dierenverzorger in of rond{' '}
                  {place.name}.
                </p>
              </div>
              <div>
                <div className="font-semibold text-gray-900">
                  Welke diensten biedt TailTribe in {place.name}?
                </div>
                <p>
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

          <section className="rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/60 to-sky-50 p-6 md:p-8 mt-6 shadow-sm">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl md:text-2xl font-semibold mb-1 text-gray-900">
                  Klaar om de juiste match in {place.name} te vinden?
                </h2>
                <p className="text-sm md:text-base text-gray-700">
                  Vertel ons wat je nodig hebt voor je huisdier. Daarna bekijken we welke dienst en welke verzorger het
                  best aansluiten bij jouw situatie.
                </p>
              </div>
              <div>
                <Link href="/boeken" className="btn-brand-compact">
                  Vind de juiste service voor je huisdier
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



