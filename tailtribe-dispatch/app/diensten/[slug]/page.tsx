import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { ProviderSpotlight } from '@/components/ProviderSpotlight'
import { ExternalLink } from '@/components/ExternalLink'
import { DISPATCH_SERVICES, getDispatchServiceBySlug } from '@/lib/services'
import { withAssetVersion } from '@/lib/service-icons'
import { routes } from '@/lib/routes'
import { getPublicAppUrl } from '@/lib/env'
import { GOOGLE_REVIEWS_URL, getServiceReviews } from '@/lib/reviews'
import { topPlacesForLocalServiceLinks } from '@/lib/local-service-landing'

type Props = {
  params: { slug: string }
}

export function generateStaticParams() {
  return DISPATCH_SERVICES.map((s) => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const baseUrl = getPublicAppUrl()
  const service = getDispatchServiceBySlug(params.slug)
  if (!service) {
    return { title: 'Dienst niet gevonden', description: 'Deze dienst bestaat niet.' }
  }

  const pageTitle = service.detailTitle ?? service.name
  const canonicalUrl = new URL(`/diensten/${service.slug}`, baseUrl).toString()
  const pageDescription =
    service.metaDescription ??
    `${service.desc} Via TailTribe in heel België: korte aanvraag en persoonlijke opvolging.`

  return {
    title: pageTitle,
    description: pageDescription,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: pageTitle,
      description: pageDescription,
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

  const baseUrl = getPublicAppUrl()
  const canonicalUrl = new URL(`/diensten/${service.slug}`, baseUrl).toString()
  const imageUrl = new URL(service.image, baseUrl).toString()

  const serviceJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Service',
    name: service.detailTitle ?? service.name,
    description: service.metaDescription ?? service.desc,
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
  const serviceReviews = getServiceReviews(service.id).slice(0, 3)
  const localPlaceLinks = topPlacesForLocalServiceLinks(18)

  const localIntro =
    service.id === 'DOG_WALKING'
      ? 'Zoek je een hondenuitlater of dog walker aan huis? We stemmen tempo, duur en routine af op jouw hond en bekijken welke formule het best past bij jouw regio en weekplanning.'
      : service.id === 'GROUP_DOG_WALKING'
        ? 'Zoek je hondenuitlaatservice aan huis voor een sociale hond die graag samen wandelt? We bekijken of kleine groepsuitstappen, ophalen en een vaste routine passen bij jouw hond en locatie.'
        : service.id === 'DOG_TRAINING'
          ? 'Op zoek naar een hondentrainer aan huis of een praktisch alternatief voor de klassieke hondenschool? We bekijken training op maat van jouw hond, gedrag en dagelijks leven.'
        : service.id === 'PET_SITTING'
          ? 'Zoek je hondenoppas, een hondenoppasser of een betrouwbare dog sitter aan huis? Dierenoppas aan huis is ideaal als je huisdier het best in de eigen omgeving blijft. We volgen jouw routine en spreken duidelijke afspraken af voor voeding, wandelen en updates.'
          : service.id === 'PET_BOARDING'
            ? 'Hondenopvang of dierenopvang nodig in een veilige omgeving? We maken afspraken op maat rond routine, voeding, rust en verblijfsduur. Geschikt voor vakantie, langere periodes of extra ondersteuning.'
            : service.id === 'HOME_CARE'
              ? 'Dierenverzorging aan huis of aan huis dierenoppas nodig? Deze dienst is ideaal voor huisdieren die liefst thuis blijven, met bezoekmomenten op maat en duidelijke afspraken.'
              : service.id === 'PET_TRANSPORT'
                ? 'Transport van dieren nodig, zoals transport van een hond of kat naar dierenarts, opvang of afspraak? We spreken timing, veiligheid en praktische details op voorhand duidelijk af.'
                : service.id === 'SMALL_ANIMAL_CARE'
                  ? 'Verzorging van kleinvee, paarden of andere dieren met vaste routine? We stemmen voeding, check-ins en praktische taken af op jouw stal of erf — handig wanneer je even weg bent.'
                  : service.id === 'EVENT_COMPANION'
                    ? 'Hond mee naar je trouwfeest of een druk event? Begeleiding op maat houdt je dier rustig en veilig, terwijl jij van je dag geniet.'
                    : null

  const faqs =
    service.id === 'DOG_WALKING'
      ? [
          {
            q: 'Wat is inbegrepen in de hondenuitlaatservice?',
            a: 'Een wandeling op maat (duur/tempo), veilige handling en duidelijke afspraken. Op verzoek een korte update na afloop.',
          },
          {
            q: 'Doen jullie vaste dagen (wekelijks)?',
            a: 'Ja, dat kan. Vermeld je voorkeur (dagen/tijdsblokken) in je aanvraag, dan plannen we zo consistent mogelijk.',
          },
          {
            q: 'Kan mijn hond met andere honden mee?',
            a: 'Soms, als het past bij karakter en veiligheid. Bij twijfel kiezen we voor solo of een klein, passend duo.',
          },
          {
            q: 'In welke regio werken jullie?',
            a: 'Beschikbaarheid hangt af van je locatie, planning en type hulp. Na je aanvraag bekijken we snel wat haalbaar is in jouw regio.',
          },
        ]
      : service.id === 'GROUP_DOG_WALKING'
        ? [
            {
              q: 'Voor welke honden is hondenuitlaatservice geschikt?',
              a: 'Voor sociale honden die vlot omgaan met andere honden en prikkels. We bekijken dit via intake en (indien nodig) een testmoment.',
            },
            {
              q: 'In welke regio gaat hondenuitlaatservice door?',
              a: 'Beschikbaarheid hangt af van locatie en planning. Momenteel ligt de sterkste focus op Groot Antwerpen en Antwerpen Noord, maar we bekijken per aanvraag wat haalbaar is.',
            },
            {
              q: 'Hoe zit het met veiligheid en loslopen?',
              a: 'Veiligheid staat voorop. Loslopen gebeurt alleen waar het mag en wanneer het veilig is, met aandacht voor de groep en omgeving.',
            },
            {
              q: 'Hoe start ik?',
              a: 'Dien je aanvraag in of boek via de partnerlink. Daarna stemmen we intake, planning en verwachtingen af.',
            },
          ]
        : service.id === 'DOG_TRAINING'
          ? [
              {
                q: 'Wat doet een hondentrainer aan huis precies?',
                a: 'Een hondentrainer aan huis bekijkt gedrag in jouw dagelijkse context en werkt met oefeningen die meteen toepasbaar zijn thuis, op straat of tijdens wandelingen.',
              },
              {
                q: 'Is hondentraining aan huis een alternatief voor hondenschool?',
                a: 'Ja. Voor veel honden is training aan huis een praktisch alternatief of aanvulling op hondenschool, zeker wanneer gedrag sterk samenhangt met de thuisomgeving of routine.',
              },
              {
                q: 'Welke problemen kunnen jullie aanpakken?',
                a: 'Denk aan trekken aan de lijn, opspringen, focus, basiscommando’s, prikkelgevoeligheid, alleen thuis en andere gedrags- of trainingsvragen.',
              },
              {
                q: 'Hoe start ik met hondentraining?',
                a: 'Dien je aanvraag in met info over je hond, je doel en je locatie. Daarna bekijken we welke training of begeleiding het best past.',
              },
            ]
        : service.id === 'PET_SITTING'
          ? [
              {
                q: 'Komt de dierenoppas bij mij thuis?',
                a: 'Ja. Dierenoppas gebeurt in het comfort van je eigen woonst, volgens jouw routine en afspraken.',
              },
              {
                q: 'Doen jullie ook hondenoppas aan huis?',
                a: 'Ja. Hondenoppas aan huis valt binnen deze dienst. We bekijken je routine, wandelingen, voeding en de praktische afspraken rond aanwezigheid en updates.',
              },
              {
                q: 'Krijg ik updates?',
                a: 'Op verzoek sturen we een korte update (bericht/foto) na het bezoek of op afgesproken momenten.',
              },
              {
                q: 'Wat moet ik klaarleggen?',
                a: 'Voeding, (eventuele) medicatie-instructies, contactgegevens en duidelijke afspraken rond toegang/sleutel.',
              },
              {
                q: 'Doen jullie ook kattenoppas?',
                a: 'Ja. We plannen bezoeken op maat (voeding, water, kattenbak, aandacht en controle).',
              },
            ]
          : service.id === 'PET_BOARDING'
            ? [
                {
                  q: 'Waaruit bestaat hondenopvang?',
                  a: 'Hondenopvang betekent opvang met aandacht voor routine, rust, veiligheid en het profiel van je hond. We stemmen vooraf voeding, planning, beweging en praktische afspraken af.',
                },
                {
                  q: 'Doen jullie ook bredere dierenopvang?',
                  a: 'Ja. Naast hondenopvang bekijken we ook dierenopvang voor andere huisdieren, afhankelijk van je vraag, planning en de zorg die nodig is.',
                },
                {
                  q: 'Is hondenopvang geschikt voor vakantie of langere periodes?',
                  a: 'Ja. Geef je data en wensen door, dan bekijken we wat haalbaar is en hoe we het best plannen voor vakantie, herstel of een langere opvangperiode.',
                },
                {
                  q: 'Wat met medicatie of speciale zorgen?',
                  a: 'Meld dit in je aanvraag. We bespreken vooraf wat nodig is zodat er geen verrassingen zijn.',
                },
                {
                  q: 'Hoe start ik een aanvraag?',
                  a: 'Klik “Aanvraag indienen” en geef je planning, locatie en info over je huisdier door.',
                },
              ]
            : service.id === 'HOME_CARE'
              ? [
                  {
                    q: 'Wat is het verschil tussen verzorging aan huis en dierenoppas?',
                    a: 'Verzorging aan huis zijn meestal kortere bezoeken (voeding, kattenbak, check-in, eventueel korte wandeling). Dierenoppas is bredere oppas in jouw woning over langere periodes. Beide plannen we via dezelfde intake.',
                  },
                  {
                    q: 'Kunnen jullie ook katten en kleinere huisdieren helpen?',
                    a: 'Ja. We stemmen het ritme af op je dier (katten, kleinvee in huis, vogels, …) en volgen jouw instructies nauwkeurig.',
                  },
                  {
                    q: 'Hoe geef ik toegang tot mijn woning?',
                    a: 'Sleuteloverdracht, code, buur of sleutelkluis: we leggen vooraf vast wat voor jou het beste werkt.',
                  },
                  {
                    q: 'Werken jullie in heel België?',
                    a: 'We matchen per regio. Na je aanvraag bekijken we snel welke verzorger praktisch haalbaar is voor jouw postcode.',
                  },
                ]
              : service.id === 'PET_TRANSPORT'
                ? [
                    {
                      q: 'Vervoeren jullie zowel honden als katten?',
                      a: 'Ja. We stemmen bench, harnas en rit af op je dier en de bestemming.',
                    },
                    {
                      q: 'Kan transport naar de dierenarts of naar opvang?',
                      a: 'Ja, dat zijn veelvoorkomende routes. Geef bestemming, timing en bijzonderheden door in je aanvraag.',
                    },
                    {
                      q: 'Wat heb ik klaar te leggen?',
                      a: 'Een passende bench of draagmand, papieren indien nodig, en duidelijke instructies rond medicatie of stress-triggers.',
                    },
                    {
                      q: 'Dekken jullie heel België?',
                      a: 'Beschikbaarheid hangt af van rit en planning. Na je aanvraag zie je snel wat haalbaar is.',
                    },
                  ]
                : service.id === 'SMALL_ANIMAL_CARE'
                  ? [
                      {
                        q: 'Welke dieren vallen onder deze dienst?',
                        a: 'Kleinvee, paarden (basiszorg op afspraak), stalhongen en vergelijkbare routines. We werken met een duidelijke checklist per bezoek.',
                      },
                      {
                        q: 'Kan dit bij vakantie of ziekte?',
                        a: 'Ja. Veel aanvragen zijn tijdelijke vervanging van jouw vaste routine (voeding, water, stalcontrole).',
                      },
                      {
                        q: 'Wat moet ik vooraf doorgeven?',
                        a: 'Hoeveelheden voeding per diersoort, medische aandachtspunten, noodcontacten en wie toegang heeft tot de locatie.',
                      },
                      {
                        q: 'Zijn jullie actief in alle streken?',
                        a: 'We matchen lokaal. Vermeld je gemeente in de aanvraag zodat we meteen de juiste regio inschatten.',
                      },
                    ]
                  : service.id === 'EVENT_COMPANION'
                    ? [
                        {
                          q: 'Is mijn hond geschikt voor een trouwfeest?',
                          a: 'Dat hangt af van karakter, prikkels en programma. We stemmen vooraf rustmomenten, looplijn en een Plan B af.',
                        },
                        {
                          q: 'Blijven jullie de hele dag ter plaatse?',
                          a: 'We plannen mee met jouw timing (foto’s, ceremonie, receptie) en voorzien pauzes voor je hond.',
                        },
                        {
                          q: 'Wat als de locatie streng is voor honden?',
                          a: 'We bekijken samen regels van de locatie en zorgen voor een veilige, haalbare invulling.',
                        },
                        {
                          q: 'Hoe vroeg moet ik boeken?',
                          a: 'Hoe eerder hoe beter voor drukke data. Dien je aanvraag in met datum en locatie; we bevestigen de haalbaarheid.',
                        },
                      ]
                    : null

  const faqJsonLd = faqs
    ? {
        '@context': 'https://schema.org',
        '@type': 'FAQPage',
        mainEntity: faqs.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a },
        })),
      }
    : null

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
        {faqJsonLd ? (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
        ) : null}
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
            <div className="relative h-28 w-28 sm:h-40 sm:w-40 md:h-48 md:w-48 flex-shrink-0 overflow-hidden rounded-2xl border border-black/5 bg-gradient-to-br from-emerald-50 to-blue-50">
              <Image
                src={withAssetVersion(service.image)}
                alt={service.name}
                width={192}
                height={192}
                priority
                sizes="(max-width: 640px) 112px, (max-width: 768px) 160px, 192px"
                className="h-full w-full object-contain p-3 md:[filter:hue-rotate(28deg)_saturate(0.62)_brightness(0.98)_contrast(1.08)]"
              />
            </div>
            <div className="text-center md:text-left">
              <h1 className="text-2xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3">
                {service.detailTitle ?? service.name}
              </h1>
              <p className="copy-pretty text-sm sm:text-base md:text-lg leading-relaxed text-gray-600 max-w-2xl">
                {service.desc}
              </p>
              {localIntro ? (
                <p className="copy-pretty mt-3 text-sm sm:text-base leading-relaxed text-emerald-900/85 max-w-2xl">
                  {localIntro}
                </p>
              ) : null}
              <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center md:justify-start">
                {service.id === 'GROUP_DOG_WALKING' && service.providerSpotlight ? (
                  <ExternalLink
                    href={service.providerSpotlight.href}
                    className="btn-brand-compact"
                    data-nav="external"
                    data-component="DienstDetailPage.HeaderProviderCta"
                  >
                    {service.providerSpotlight.ctaLabel ?? `Bezoek ${service.providerSpotlight.label ?? 'website'}`}
                  </ExternalLink>
                ) : null}
                <Link href={`/boeken?service=${service.id}`} className="btn-brand-compact">
                  Aanvraag indienen
                </Link>
                <Link
                  href={routes.diensten}
                  className="btn-secondary-compact"
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
                showCta={service.id !== 'GROUP_DOG_WALKING'}
              />
            ) : null}
            <div className="overflow-hidden rounded-3xl border border-slate-200/80 bg-white shadow-sm">
              <div className="border-b border-slate-100 bg-gradient-to-r from-slate-50 via-white to-emerald-50/60 px-6 py-6 md:px-8">
                <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-800">Ervaringen</p>
                <h2 className="mt-2 text-2xl md:text-3xl font-semibold text-gray-900">Hoe baasjes TailTribe ervaren</h2>
                <p className="mt-3 max-w-2xl text-base leading-8 text-gray-700">
                  Voor veel klanten draait de keuze vooral om vertrouwen, duidelijke communicatie en een aanpak die
                  professioneel aanvoelt van aanvraag tot opvolging.
                </p>
              </div>
              <div className="grid gap-0 md:grid-cols-3">
                {serviceReviews.map((review, index) => (
                  <article
                    key={`${service.id}-${review.name}`}
                    className={`p-6 md:p-7 ${index < serviceReviews.length - 1 ? 'border-b border-slate-100 md:border-b-0 md:border-r' : ''}`}
                  >
                    <div className="mb-5 flex items-start justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-500 to-blue-600 font-bold text-white shadow-sm">
                          {review.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{review.name}</p>
                          <p className="mt-1 inline-flex rounded-full bg-slate-100 px-2.5 py-1 text-[11px] font-medium uppercase tracking-[0.08em] text-slate-600">
                            {review.sourceLabel}
                          </p>
                        </div>
                      </div>
                      <svg className="h-8 w-8 flex-shrink-0 text-emerald-200" viewBox="0 0 32 32" fill="currentColor" aria-hidden="true">
                        <path d="M10.5 14C10.5 9.857 13.857 6.5 18 6.5h1v4h-1A3.5 3.5 0 0 0 14.5 14v.25A3.25 3.25 0 0 1 17.75 17.5v1A5.5 5.5 0 0 1 12.25 24H11v-4h1.25a1.5 1.5 0 0 0 1.5-1.5v-1a.75.75 0 0 0-.75-.75H10.5V14Zm11 0C21.5 9.857 24.857 6.5 29 6.5h1v4h-1a3.5 3.5 0 0 0-3.5 3.5v.25a3.25 3.25 0 0 1 3.25 3.25v1A5.5 5.5 0 0 1 23.25 24H22v-4h1.25a1.5 1.5 0 0 0 1.5-1.5v-1a.75.75 0 0 0-.75-.75H21.5V14Z" />
                      </svg>
                    </div>
                    <p className="text-sm leading-7 text-slate-700">{review.quote}</p>
                  </article>
                ))}
              </div>
              <div className="border-t border-slate-100 bg-slate-50/60 px-6 py-4 text-center md:px-8">
                <a
                  href={GOOGLE_REVIEWS_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-800 underline decoration-emerald-800/30 underline-offset-4 transition hover:text-emerald-900 hover:decoration-emerald-800"
                >
                  Meer reviews op Google
                  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                  </svg>
                </a>
              </div>
            </div>
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
                    'Snelle opvolging: we reageren zo spoedig mogelijk.',
                  ]).map((t) => (
                    <li key={t}>{t}</li>
                  ))}
                </ul>
              )}
            </div>

            {service.id === 'GROUP_DOG_WALKING' && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-green-500 via-emerald-400 to-blue-500 p-[3px] rounded-3xl shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
                  <div className="relative aspect-[4/3] w-[88vw] max-w-[560px] overflow-hidden rounded-[calc(1.5rem-3px)] border border-white/60 bg-white sm:w-[65vw] md:w-[38vw] lg:w-[26vw]">
                    <Image
                      src={withAssetVersion('/assets/groepsuitlaat-hero.jpg')}
                      alt="Hondenuitlaatservice in actie"
                      fill
                      sizes="(max-width: 640px) 88vw, (max-width: 1024px) 65vw, 560px"
                      className="object-cover md:[filter:brightness(1.08)]"
                    />
                  </div>
                </div>
              </div>
            )}
            {service.id === 'DOG_WALKING' && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-green-500 via-emerald-400 to-blue-500 p-[3px] rounded-3xl shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
                  <div className="relative aspect-[4/3] w-[88vw] max-w-[560px] overflow-hidden rounded-[calc(1.5rem-3px)] border border-white/60 bg-white sm:w-[65vw] md:w-[38vw] lg:w-[26vw]">
                    <Image
                      src={withAssetVersion('/assets/hondenuitlaat-hero.jpg')}
                      alt="Hondenuitlaat in actie"
                      fill
                      sizes="(max-width: 640px) 88vw, (max-width: 1024px) 65vw, 560px"
                      className="object-cover md:[filter:brightness(1.08)]"
                    />
                  </div>
                </div>
              </div>
            )}
            {service.id === 'DOG_TRAINING' && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-green-500 via-emerald-400 to-blue-500 p-[3px] rounded-3xl shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
                  <div className="relative aspect-[4/3] w-[88vw] max-w-[560px] overflow-hidden rounded-[calc(1.5rem-3px)] border border-white/60 bg-white sm:w-[65vw] md:w-[38vw] lg:w-[26vw]">
                    <Image
                      src={withAssetVersion('/assets/dog-training-hero.jpg')}
                      alt="Hondentraining in actie"
                      fill
                      sizes="(max-width: 640px) 88vw, (max-width: 1024px) 65vw, 560px"
                      className="object-cover md:[filter:brightness(1.08)]"
                    />
                  </div>
                </div>
              </div>
            )}
            {service.id === 'PET_SITTING' && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-green-500 via-emerald-400 to-blue-500 p-[3px] rounded-3xl shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
                  <div className="relative aspect-[4/3] w-[88vw] max-w-[560px] overflow-hidden rounded-[calc(1.5rem-3px)] border border-white/60 bg-white sm:w-[65vw] md:w-[38vw] lg:w-[26vw]">
                    <Image
                      src={withAssetVersion('/assets/kat-hero.jpg')}
                      alt="Dierenoppas in actie"
                      fill
                      sizes="(max-width: 640px) 88vw, (max-width: 1024px) 65vw, 560px"
                      className="object-cover md:[filter:brightness(1.08)]"
                    />
                  </div>
                </div>
              </div>
            )}
            {service.id === 'PET_BOARDING' && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-green-500 via-emerald-400 to-blue-500 p-[3px] rounded-3xl shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
                  <div className="relative aspect-[4/3] w-[88vw] max-w-[560px] overflow-hidden rounded-[calc(1.5rem-3px)] border border-white/60 bg-white sm:w-[65vw] md:w-[38vw] lg:w-[26vw]">
                    <Image
                      src={withAssetVersion('/assets/cavia-hero.jpg')}
                      alt="Dierenopvang in actie"
                      fill
                      sizes="(max-width: 640px) 88vw, (max-width: 1024px) 65vw, 560px"
                      className="object-cover md:[filter:brightness(1.08)]"
                    />
                  </div>
                </div>
              </div>
            )}
            {service.id === 'HOME_CARE' && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-green-500 via-emerald-400 to-blue-500 p-[3px] rounded-3xl shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
                  <div className="relative aspect-[4/3] w-[88vw] max-w-[560px] overflow-hidden rounded-[calc(1.5rem-3px)] border border-white/60 bg-white sm:w-[65vw] md:w-[38vw] lg:w-[26vw]">
                    <Image
                      src={withAssetVersion('/assets/rabbit-hero.jpg')}
                      alt="Verzorging aan huis"
                      fill
                      sizes="(max-width: 640px) 88vw, (max-width: 1024px) 65vw, 560px"
                      className="object-cover md:[filter:brightness(1.08)]"
                    />
                  </div>
                </div>
              </div>
            )}
            {service.id === 'PET_TRANSPORT' && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-green-500 via-emerald-400 to-blue-500 p-[3px] rounded-3xl shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
                  <div className="relative aspect-[4/3] w-[88vw] max-w-[560px] overflow-hidden rounded-[calc(1.5rem-3px)] border border-white/60 bg-white sm:w-[65vw] md:w-[38vw] lg:w-[26vw]">
                    <Image
                      src={withAssetVersion('/assets/cat-eye-hero.jpg')}
                      alt="Transport huisdieren"
                      fill
                      sizes="(max-width: 640px) 88vw, (max-width: 1024px) 65vw, 560px"
                      className="object-cover md:[filter:brightness(1.08)]"
                    />
                  </div>
                </div>
              </div>
            )}
            {service.id === 'SMALL_ANIMAL_CARE' && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-green-500 via-emerald-400 to-blue-500 p-[3px] rounded-3xl shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
                  <div className="relative aspect-[4/3] w-[88vw] max-w-[560px] overflow-hidden rounded-[calc(1.5rem-3px)] border border-white/60 bg-white sm:w-[65vw] md:w-[38vw] lg:w-[26vw]">
                    <Image
                      src={withAssetVersion('/assets/horse-hero.jpg')}
                      alt="Verzorging van boerderijdieren"
                      fill
                      sizes="(max-width: 640px) 88vw, (max-width: 1024px) 65vw, 560px"
                      className="object-cover md:[filter:brightness(1.08)]"
                    />
                  </div>
                </div>
              </div>
            )}
            {service.id === 'EVENT_COMPANION' && (
              <div className="flex justify-end">
                <div className="bg-gradient-to-br from-green-500 via-emerald-400 to-blue-500 p-[3px] rounded-3xl shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
                  <div className="relative aspect-[3/4] w-[72vw] max-w-[420px] overflow-hidden rounded-[calc(1.5rem-3px)] border border-white/60 bg-white sm:w-[40vw] md:w-[22vw] lg:w-[16vw]">
                    <Image
                      src={withAssetVersion('/assets/wedding-hero.jpg')}
                      alt="Begeleiding events"
                      fill
                      sizes="(max-width: 640px) 72vw, (max-width: 1024px) 40vw, 420px"
                      className="object-cover object-[50%_20%] md:[filter:brightness(1.08)]"
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
                <Link href="/boeken" className="btn-brand-compact">
                  Start je aanvraag
                </Link>
              </div>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
              <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-2">
                {service.name} in België — vaak gekozen regio&apos;s
              </h2>
              <p className="text-gray-600 mb-6 max-w-2xl leading-relaxed">
                Kies je stad: je krijgt een pagina over deze dienst in die gemeente, met links naar de streekpagina en
                de volledige uitleg op één plek.
              </p>
              <ul className="flex flex-wrap gap-2">
                {localPlaceLinks.map((l) => (
                  <li key={`${l.province}-${l.place}`}>
                    <Link
                      href={`/diensten/${service.slug}/${l.province}/${l.place}`}
                      data-nav="local-service-place"
                      data-service-slug={service.slug}
                      className="inline-flex rounded-full border border-slate-200 bg-slate-50 px-3 py-1.5 text-sm text-gray-800 transition hover:border-emerald-300 hover:bg-emerald-50/60"
                    >
                      {service.name} — {l.placeName}
                    </Link>
                  </li>
                ))}
              </ul>
              <p className="mt-5 text-sm text-gray-600 leading-relaxed">
                Gemeente niet in de lijst?{' '}
                <Link href="/be" className="font-medium text-emerald-800 underline-offset-2 hover:underline">
                  Alle provincies
                </Link>{' '}
                of start je aanvraag met postcode — we matchen op jouw echte locatie.
              </p>
            </div>

            {faqs ? (
              <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
                <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">Veelgestelde vragen</h2>
                <div className="space-y-4 text-gray-700">
                  {faqs.map((f) => (
                    <div key={f.q} className="rounded-xl border border-black/5 p-5">
                      <h3 className="font-semibold text-gray-900 mb-2">{f.q}</h3>
                      <p className="leading-relaxed">{f.a}</p>
                    </div>
                  ))}
                </div>
                {service.id !== 'GROUP_DOG_WALKING' ? (
                  <div className="mt-6">
                    <Link href={`/boeken?service=${service.id}`} className="btn-brand-compact">
                      Start je aanvraag
                    </Link>
                  </div>
                ) : null}
              </div>
            ) : null}
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
                  <div className="relative h-36 w-full overflow-hidden bg-gradient-to-br from-emerald-50 to-blue-50 p-5">
                    <Image
                      src={withAssetVersion(s.image)}
                      alt={s.name}
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                      className="object-contain transition-transform duration-300 [filter:hue-rotate(28deg)_saturate(0.62)_brightness(0.98)_contrast(1.08)] group-hover:scale-105"
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


