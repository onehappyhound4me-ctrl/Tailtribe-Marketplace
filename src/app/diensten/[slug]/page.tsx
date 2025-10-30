import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import { services, getServiceBySlug, getRelatedServices, Service } from '../../../../lib/services'
import { generateServiceSchema, generateBreadcrumbSchema } from '../../../../lib/seo/jsonld'
import { SmartSearchLink } from '@/components/common/SmartSearchLink'

interface Props {
  params: { slug: string }
}

export async function generateStaticParams() {
  return services.map((service: Service) => ({
    slug: service.slug,
  }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const service = getServiceBySlug(params.slug)
  
  if (!service) {
    return {
      title: 'Dienst niet gevonden | TailTribe',
    }
  }

  return {
    title: service.metaTitle,
    description: service.metaDescription,
    openGraph: {
      title: service.metaTitle,
      description: service.metaDescription,
      type: 'article',
      url: `https://tailtribe.be/diensten/${service.slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: service.metaTitle,
      description: service.metaDescription,
    },
    alternates: {
      canonical: `https://tailtribe.be/diensten/${service.slug}`,
    },
    robots: {
      index: true,
      follow: true,
    },
  }
}

export default function ServicePage({ params }: Props) {
  const service = getServiceBySlug(params.slug)
  
  if (!service) {
    notFound()
  }

  const relatedServices: Service[] = getRelatedServices(service)
  const serviceSchema = generateServiceSchema(service)
  const breadcrumbSchema = generateBreadcrumbSchema(service.title, service.slug)

  return (
    <>
      {/* JSON-LD Schema */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(serviceSchema),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(breadcrumbSchema),
        }}
      />

      <div className="min-h-screen bg-gray-50">
        {/* Breadcrumbs */}
        <nav className="bg-white border-b border-gray-200 py-4">
          <div className="container mx-auto px-4">
            <ol className="flex items-center space-x-2 text-sm text-gray-600">
              <li>
                <Link href="/" className="hover:text-emerald-600 transition-colors">
                  Home
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li>
                <Link href="/diensten" className="hover:text-emerald-600 transition-colors">
                  Diensten
                </Link>
              </li>
              <li className="text-gray-400">/</li>
              <li className="text-gray-900 font-medium">{service.title}</li>
            </ol>
          </div>
        </nav>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white py-16">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <div className="mb-8 flex items-center justify-center">
                {service.imageSrc ? (
                  <div className="relative">
                    <div className="absolute inset-0 bg-white/20 rounded-3xl blur-xl"></div>
                    <div className="relative bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border border-white/50">
                      <Image
                        src={service.imageSrc}
                        alt={service.imageAlt || service.title}
                        width={120}
                        height={120}
                        className="w-30 h-30 object-contain"
                        loading="lazy"
                        sizes="120px"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="text-7xl">{service.icon}</div>
                )}
              </div>
              <h1 className="text-4xl md:text-5xl font-bold mb-6">
                {service.title}
              </h1>
              <p className="text-xl md:text-2xl text-emerald-100 leading-relaxed">
                {service.shortDescription}
              </p>
            </div>
          </div>
        </section>

        {/* Content Sections */}
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            {/* Waarom kiezen voor deze dienst */}
            <section className="mb-16 mt-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-10">
                Waarom kiezen voor {service.title.toLowerCase()}?
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="text-lg leading-relaxed mb-6">
                  {getServiceContent(service.slug).whyChoose}
                </p>
                <p className="text-lg leading-relaxed mb-6">
                  {getServiceContent(service.slug).whyChoose2}
                </p>
                <p className="text-lg leading-relaxed">
                  {getServiceContent(service.slug).whyChoose3}
                </p>
              </div>
            </section>

            {/* Wat houdt het in */}
            <section className="mb-16 mt-4">
              <h2 className="text-3xl font-bold text-gray-900 mb-10">
                Wat houdt {service.title.toLowerCase()} in?
              </h2>
              <div className="prose prose-lg max-w-none text-gray-700">
                <p className="text-lg leading-relaxed mb-6">
                  {getServiceContent(service.slug).whatItIncludes}
                </p>
                <p className="text-lg leading-relaxed">
                  {getServiceContent(service.slug).whatItIncludes2}
                </p>
              </div>
            </section>

            {/* Hoe werkt TailTribe */}
            <section className="mb-16 mt-4">
              <h2 className="text-3xl font-bold text-gray-900 mb-10">
                Hoe werkt TailTribe?
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-emerald-600">1</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Zoek en vergelijk</h3>
                  <p className="text-gray-600">Bekijk verzorgers in jouw buurt en vergelijk hun profielen, ervaring en tarieven.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-emerald-600">2</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Boek en betaal</h3>
                  <p className="text-gray-600">Maak direct een afspraak en betaal veilig via ons platform.</p>
                </div>
                <div className="text-center">
                  <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-emerald-600">3</span>
                  </div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">Geniet van de zorg</h3>
                  <p className="text-gray-600">Jouw huisdier krijgt de beste zorg terwijl jij gerust bent.</p>
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="bg-emerald-600 text-white rounded-2xl p-8 text-center mb-16 mt-4">
              <h2 className="text-3xl font-bold mb-6">
                Klaar om te beginnen?
              </h2>
              <p className="text-xl text-emerald-100 mb-6">
                Vind de perfecte verzorger voor jouw huisdier in jouw buurt.
              </p>
              <SmartSearchLink
                service={service.code}
                className="inline-flex items-center px-8 py-4 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600"
              >
                Bekijk verzorgers
                <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </SmartSearchLink>
            </section>

            {/* Gerelateerde diensten */}
            {relatedServices.length > 0 && (
              <section className="mt-6 pb-16">
                <h2 className="text-3xl font-bold text-gray-900 mb-10">
                  Gerelateerde diensten
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {relatedServices.map((relatedService: Service) => (
                    <Link
                      key={relatedService.slug}
                      href={`/diensten/${relatedService.slug}`}
                      className="group block bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 overflow-hidden"
                    >
                      <div className="relative h-40 w-full overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 flex items-center justify-center p-4">
                        {relatedService.imageSrc ? (
                          <Image 
                            src={relatedService.imageSrc} 
                            alt={relatedService.title}
                            fill
                            className="object-contain group-hover:scale-105 transition-transform duration-300"
                          />
                        ) : (
                          <div className="text-6xl">{relatedService.icon}</div>
                        )}
                      </div>
                      <div className="p-6">
                        <h3 className="text-xl font-bold text-gray-900 mb-3 text-center group-hover:text-emerald-600 transition-colors">
                          {relatedService.title}
                        </h3>
                        <p className="text-gray-600 text-center leading-relaxed text-sm">
                          {relatedService.shortDescription}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

// Service content per dienst
function getServiceContent(slug: string) {
  const contentMap: Record<string, {
    whyChoose: string
    whyChoose2: string
    whyChoose3: string
    whatItIncludes: string
    whatItIncludes2: string
  }> = {
    'hondenuitlaat': {
      whyChoose: 'Regelmatige wandelingen zijn essentieel voor de gezondheid en het welzijn van jouw hond. Onze geverifieerde hondenuitlaters zorgen voor voldoende beweging, socialisatie en mentale stimulatie.',
      whyChoose2: 'Je hoeft je geen zorgen te maken over het missen van wandelingen door werk of andere verplichtingen. Onze betrouwbare uitlaters houden zich aan vaste tijden en routes.',
      whyChoose3: 'Ervaren hondenuitlaters kennen de beste wandelroutes in jouw buurt en weten perfect om te gaan met verschillende hondentypes en gedragingen.',
      whatItIncludes: 'Hondenuitlaat omvat dagelijkse wandelingen op vaste tijden, volledig aangepast aan de behoeften van jouw hond. Je uitlater houdt je op de hoogte met updates en foto\'s van elke wandeling.',
      whatItIncludes2: 'We zorgen voor veilige routes, de juiste wandelduur en speciale aandacht voor oudere honden of honden met specifieke behoeften.'
    },
    'groepsuitlaat': {
      whyChoose: 'Groepswandelingen bieden jouw hond de kans om te socialiseren met andere honden, wat belangrijk is voor hun ontwikkeling en geluk.',
      whyChoose2: 'Honden die regelmatig in groepen wandelen, zijn vaak socialer, zelfverzekerder en hebben minder gedragsproblemen.',
      whyChoose3: 'Groepswandelingen bieden extra variatie, plezier en sociale interactie voor jouw hond in een veilige groepsomgeving.',
      whatItIncludes: 'Groepsuitlaat organiseert wandelingen met honden die zorgvuldig worden samengesteld op basis van grootte, leeftijd en temperament.',
      whatItIncludes2: 'Je uitlater zorgt voor veilige en plezierige interacties tussen alle honden, kiest geschikte routes en geeft elke hond voldoende aandacht en ruimte om te spelen.'
    },
    'hondentraining': {
      whyChoose: 'Hondentraining helpt bij het oplossen van gedragsproblemen en versterkt de band tussen jou en jouw hond.',
      whyChoose2: 'Goed getrainde honden zijn veiliger, socialer en kunnen beter functioneren in verschillende situaties en omgevingen.',
      whyChoose3: 'Training verhoogt het zelfvertrouwen van jouw hond en vermindert stress en angst bij zowel hond als baasje.',
      whatItIncludes: 'Hondentraining omvat gedragsanalyse, persoonlijke trainingssessies en praktische oefeningen, volledig aangepast aan de behoeften van jouw hond.',
      whatItIncludes2: 'We werken met positieve bekrachtiging en moderne trainingsmethoden, waarbij we rekening houden met de verschillende ras eigenschappen en het unieke karakter van jouw hond.'
    },
    'dierenoppas': {
      whyChoose: 'Dierenoppas in de vertrouwde thuisomgeving zorgt voor minimale stress voor jouw huisdier en behoudt hun dagelijkse routine.',
      whyChoose2: 'Jouw huisdier blijft in hun eigen omgeving met vertrouwde geuren, speelgoed en gewoontes, wat hun welzijn ten goede komt.',
      whyChoose3: 'Ervaren dierenoppassers zorgen voor volledige aandacht, beweging en verzorging terwijl jij weg bent, zonder de stress van een vreemde omgeving.',
      whatItIncludes: 'Dierenoppas aan huis omvat dagelijkse verzorging, voeding, beweging en persoonlijke aandacht voor jouw huisdier in jouw eigen woning.',
      whatItIncludes2: 'Je oppas houdt je op de hoogte met foto\'s en dagelijkse updates, en kan desgewenst ook planten water geven en post ophalen.'
    },
    'dierenopvang': {
      whyChoose: 'Dierenopvang bij een betrouwbaar gastgezin biedt een veilige, huiselijke omgeving waar jouw huisdier kan verblijven tijdens jouw afwezigheid.',
      whyChoose2: 'Opvang in een warme thuisomgeving is veel minder stressvol dan traditionele kennels en biedt jouw huisdier persoonlijke aandacht en gezelligheid.',
      whyChoose3: 'Geverifieerde gastgezinnen hebben ruime ervaring met verschillende huisdieren en respecteren graag speciale behoeften en dieetwensen.',
      whatItIncludes: 'Dierenopvang omvat 24/7 zorg in een liefdevol huis met voldoende ruimte om te spelen, te rusten en zich thuis te voelen.',
      whatItIncludes2: 'Je gastgezin zorgt voor dagelijkse verzorging, voeding, beweging en kan ook medicatie toedienen indien nodig.'
    },
    'verzorging-aan-huis': {
      whyChoose: 'Verzorging aan huis is perfect voor kortere periodes wanneer je weg bent voor werk, vakantie of andere verplichtingen.',
      whyChoose2: 'Jouw huisdier blijft in hun vertrouwde omgeving en behoudt hun dagelijkse routine en gewoontes.',
      whyChoose3: 'Flexibele verzorging aangepast aan jouw schema en de behoeften van jouw huisdier, zonder langdurige verplichtingen.',
      whatItIncludes: 'Onze verzorging aan huis omvat dagelijkse bezoeken voor voeding, beweging, aandacht en basisverzorging.',
      whatItIncludes2: 'Verzorgers kunnen ook planten water geven, post ophalen en de woning beveiligen tijdens jouw afwezigheid.'
    },
    'begeleiding-events': {
      whyChoose: 'Speciale evenementen zoals bruiloften verdienen speciale aandacht voor jouw huisdier, zodat jij volledig kunt genieten van de dag.',
      whyChoose2: 'Een ervaren begeleider zorgt ervoor dat jouw huisdier comfortabel en veilig is tijdens drukke evenementen.',
      whyChoose3: 'Onze begeleiders weten precies hoe om te gaan met stressvolle situaties en zorgen voor een rustige, veilige omgeving voor jouw huisdier.',
      whatItIncludes: 'Event begeleiding omvat speciale zorg en begeleiding tijdens bruiloften, feesten en andere belangrijke momenten.',
      whatItIncludes2: 'Je begeleider zorgt voor een rustige omgeving, voldoende beweging en aandacht, en kan indien nodig ook transport verzorgen.'
    },
    'transport-huisdieren': {
      whyChoose: 'Veilig transport van huisdieren is essentieel voor dierenartsenbezoeken, verhuizingen of andere belangrijke afspraken.',
      whyChoose2: 'Betrouwbaar en comfortabel transport zorgt voor een stressvrije reis voor jouw huisdier.',
      whyChoose3: 'Ervaren chauffeurs kennen de beste routes en weten precies hoe om te gaan met verschillende huisdieren en hun specifieke behoeften.',
      whatItIncludes: 'Transport voor huisdieren biedt veilig en comfortabel vervoer naar elke bestemming in België, met persoonlijke aandacht onderweg.',
      whatItIncludes2: 'We zorgen voor geschikte transportmiddelen, veiligheidsmaatregelen en een comfortabele reis voor jouw huisdier.'
    },
    'verzorging-kleinvee': {
      whyChoose: 'Kleinvee zoals kippen, konijnen en andere boerderijdieren hebben speciale verzorging nodig die niet iedereen kan bieden.',
      whyChoose2: 'Verzorging van kleinvee vereist specifieke kennis van voeding, huisvesting en gezondheidszorg - kennis die onze verzorgers bezitten.',
      whyChoose3: 'Geverifieerde verzorgers hebben ruime ervaring met verschillende soorten kleinvee en respecteren graag speciale behoeften en dieetwensen.',
      whatItIncludes: 'Verzorging van kleinvee omvat onder andere dagelijkse voeding, fris drinkwater, gezondheidscontrole en onderhoud van verblijven.',
      whatItIncludes2: 'Je verzorger zorgt voor geschikte voeding, schone verblijven en kan ook medische aandacht bieden indien nodig.'
    }
  }

  return contentMap[slug] || {
    whyChoose: 'Kwalitatieve verzorging volledig aangepast aan de behoeften van jouw huisdier.',
    whyChoose2: 'Betrouwbare en ervaren verzorgers die jouw huisdier de beste zorg bieden met hart voor dieren.',
    whyChoose3: 'Flexibele dienstverlening die perfect past bij jouw schema en de specifieke behoeften van jouw huisdier.',
    whatItIncludes: 'Volledige verzorging op maat, aangepast aan de unieke behoeften van jouw huisdier.',
    whatItIncludes2: 'Persoonlijke aandacht, zorg en dagelijkse updates door ervaren en geverifieerde verzorgers.'
  }
}
