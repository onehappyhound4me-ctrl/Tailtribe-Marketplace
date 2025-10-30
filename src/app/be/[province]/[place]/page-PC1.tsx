import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProvinceBySlug, getPlaceBySlugs } from '@/data/be-geo'
import { generatePageMetadata, breadcrumbsJsonLd, faqJsonLd, localBusinessJsonLd } from '@/lib/seo'

export const revalidate = 86400 // 24 hours

interface Props {
  params: {
    province: string
    place: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const province = getProvinceBySlug(params.province)
  const place = getPlaceBySlugs(params.province, params.place)
  
  if (!province || !place) {
    return {
      title: 'Locatie niet gevonden',
      description: 'De opgevraagde locatie bestaat niet.'
    }
  }

  return generatePageMetadata({
    title: `Dierenverzorging ${place.name} - Lokale oppas en hondenuitlaat`,
    description: `Vind betrouwbare dierenverzorgers in ${place.name}, ${province.name}. Professionele hondenuitlaat, dierenoppas en meer services bij jou in de buurt.`,
    path: `/be/${province.slug}/${place.slug}`
  })
}

export default async function PlacePage({ params }: Props) {
  const province = getProvinceBySlug(params.province)
  const place = getPlaceBySlugs(params.province, params.place)
  
  if (!province || !place) {
    notFound()
  }

  // Demo caregivers (database connection requires .env file)
  const caregivers = [
    {
      id: '1',
      name: 'Emma Willems',
      city: place.name,
      services: ['DOG_WALKING', 'PET_SITTING'],
      ratePerHour: 15,
      rating: 4.9,
      reviewCount: 23,
      bio: 'Ervaren dierenverzorger met passie voor honden en katten.',
      avatar: null
    },
    {
      id: '2', 
      name: 'Sarah De Jong',
      city: place.name,
      services: ['DOG_WALKING', 'TRAINING'],
      ratePerHour: 18,
      rating: 4.8,
      reviewCount: 15,
      bio: 'Professionele hondentrainer en uitlaatservice.',
      avatar: null
    }
  ]

  const breadcrumbs = breadcrumbsJsonLd([
    { name: 'Home', item: '/' },
    { name: 'België', item: '/be' },
    { name: province.name, item: `/be/${province.slug}` },
    { name: place.name, item: `/be/${province.slug}/${place.slug}` }
  ])

  // Local FAQ for this city
  const localFAQ = faqJsonLd([
    {
      question: `Hoeveel kost dierenverzorging in ${place.name}?`,
      answer: `De kosten voor dierenverzorging in ${place.name} variëren afhankelijk van de service. Hondenuitlaat kost gemiddeld €15-25 per wandeling, dierenoppas €25-40 per dag. Alle prijzen zijn transparant vermeld op het profiel van de verzorger.`
    },
    {
      question: `Hoe vind ik een betrouwbare dierenverzorger in ${place.name}?`,
      answer: `Alle verzorgers op TailTribe zijn gescreend en goedgekeurd. Je kunt reviews lezen van andere eigenaren, foto's bekijken en direct contact opnemen. Boek alleen via ons platform voor volledige bescherming.`
    },
    {
      question: `Wat voor services zijn beschikbaar in ${place.name}?`,
      answer: `In ${place.name} kun je terecht voor hondenuitlaat, dierenoppas (thuis of bij de verzorger), gedragstraining en transport van huisdieren. Elke verzorger heeft zijn eigen specialiteiten.`
    },
    {
      question: `Hoe is mijn huisdier beschermd tijdens de oppas?`,
      answer: `Alle verzorgers zijn geverifieerd via e-mail. Maak duidelijke afspraken in de chat en boek via het platform voor transparantie en opvolging.`
    }
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(localFAQ) }}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <span>›</span>
            <Link href="/be" className="hover:text-gray-700">België</Link>
            <span>›</span>
            <Link href={`/be/${province.slug}`} className="hover:text-gray-700">{province.name}</Link>
            <span>›</span>
            <span className="text-gray-900">{place.name}</span>
          </nav>

          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Dierenverzorging in {place.name}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              Ontdek {caregivers.length} goedgekeurde dierenverzorgers in {place.name}, {province.name}. 
              Van hondenuitlaat tot volledige dierenoppas, vind de perfecte match voor jouw huisdier.
            </p>
            
            {/* Removed action buttons by request */}
          </header>

          {/* Caregivers Grid */}
          {caregivers.length > 0 && (
            <section className="mb-16">
              <h2 className="text-2xl font-semibold text-gray-900 mb-8">
                Verzorgers in {place.name}
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {caregivers.map((caregiver) => {
                  const avgRating = typeof caregiver.rating === 'number' ? caregiver.rating : 0
                  const reviewCount = typeof caregiver.reviewCount === 'number' ? caregiver.reviewCount : 0

                  return (
                    <Link
                      key={caregiver.id}
                      href={`/search?city=${encodeURIComponent(place.name)}`}
                      className="group bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
                    >
                      <div className="aspect-video bg-gray-100 relative">
                        {Array.isArray((caregiver as any).photos) && (caregiver as any).photos.length > 0 ? (
                          <img
                            src={(caregiver as any).photos?.[0] || ''}
                            alt={`${caregiver.name} - dierenverzorger`}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-4xl">
                            🐾
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6">
                        <h3 className="font-semibold text-gray-900 mb-2 group-hover:text-blue-600">
                          {caregiver.name}
                        </h3>
                        
                        <div className="flex items-center mb-2">
                          {avgRating > 0 && (
                            <>
                              <div className="flex items-center">
                                {[...Array(5)].map((_, i) => (
                                  <span
                                    key={i}
                                    className={i < Math.round(avgRating) ? 'text-yellow-400' : 'text-gray-300'}
                                  >
                                    ⭐
                                  </span>
                                ))}
                              </div>
                              {reviewCount > 0 && (
                                <span className="text-sm text-gray-500 ml-2">({reviewCount})</span>
                              )}
                            </>
                          )}
                        </div>
                        
                        <div className="flex items-center justify-between">
                          <div className="text-sm text-gray-600">
                            {Array.isArray(caregiver.services) ? caregiver.services.length : 0} service{Array.isArray(caregiver.services) && caregiver.services.length !== 1 ? 's' : ''}
                          </div>
                          <div className="font-semibold text-blue-600">
                            €{caregiver.ratePerHour}/uur
                          </div>
                        </div>
                        
                        {caregiver.bio && (
                          <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                            {caregiver.bio}
                          </p>
                        )}
                      </div>
                    </Link>
                  )
                })}
              </div>
              
              {caregivers.length >= 12 && (
                <div className="text-center mt-8">
                  <Link
                    href={`/search?city=${place.name}`}
                    className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                  >
                    Bekijk alle verzorgers in {place.name}
                  </Link>
                </div>
              )}
            </section>
          )}

          {/* FAQ Section */}
          <section className="bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-8 text-center">
              Veelgestelde vragen over dierenverzorging in {place.name}
            </h2>
            
            <div className="space-y-6 max-w-3xl mx-auto">
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Hoeveel kost dierenverzorging in {place.name}?
                </h3>
                <p className="text-gray-600">
                  De kosten variëren per service en verzorger. Hondenuitlaat kost gemiddeld €15-25 per wandeling, 
                  dierenoppas €25-40 per dag. Alle prijzen zijn transparant vermeld op het profiel.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Hoe vind ik een betrouwbare verzorger?
                </h3>
                <p className="text-gray-600">
                  Alle verzorgers zijn geverifieerd via e-mail. Lees reviews, bekijk foto's en neem direct contact op. 
                  Boek via ons platform voor een veilige en betrouwbare ervaring.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6">
                <h3 className="font-semibold text-gray-900 mb-3">
                  Welke services zijn beschikbaar?
                </h3>
                <p className="text-gray-600">
                  In {place.name} vind je hondenuitlaat, dierenoppas (thuis of bij verzorger), 
                  gedragstraining en transport. Elke verzorger heeft eigen specialiteiten.
                </p>
              </div>
              
              <div className="bg-white rounded-lg p-6">
              <h3 className="font-semibold text-gray-900 mb-3">
                Hoe is mijn huisdier beschermd?
              </h3>
              <p className="text-gray-600">
                Alle verzorgers zijn geverifieerd via e-mail. Maak duidelijke afspraken in de chat en boek via het platform voor transparantie en opvolging.
              </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}




