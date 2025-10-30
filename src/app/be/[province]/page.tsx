import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getProvinceBySlug, getPlacesByProvince } from '@/data/be-geo'
import { generatePageMetadata, breadcrumbsJsonLd } from '@/lib/seo'

export const revalidate = 86400 // 24 hours

interface Props {
  params: {
    province: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const province = getProvinceBySlug(params.province)
  
  if (!province) {
    return {
      title: 'Provincie niet gevonden',
      description: 'De opgevraagde provincie bestaat niet.'
    }
  }

  return generatePageMetadata({
    title: `Dierenverzorging in ${province.name} - Vind lokale oppas`,
    description: `Ontdek professionele dierenverzorgers in ${province.name}. Betrouwbare hondenuitlaat, dierenoppas en meer services in jouw regio.`,
    path: `/be/${province.slug}`
  })
}

export default async function ProvincePage({ params }: Props) {
  const province = getProvinceBySlug(params.province)
  
  if (!province) {
    notFound()
  }

  const places = getPlacesByProvince(params.province)
  
  // Demo caregiver count (database connection requires .env file)
  const caregiverCount = 3

  const breadcrumbs = breadcrumbsJsonLd([
    { name: 'Home', item: '/' },
    { name: 'België', item: '/be' },
    { name: province.name, item: `/be/${province.slug}` }
  ])

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbs) }}
      />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <span>›</span>
            <Link href="/be" className="hover:text-gray-700">België</Link>
            <span>›</span>
            <span className="text-gray-900">{province.name}</span>
          </nav>

          <header className="text-center mb-12">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Dierenverzorging in {province.name}
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
              Vind betrouwbare dierenverzorgers in {province.name}. 
              {caregiverCount > 0 && (
                <> Momenteel {caregiverCount} goedgekeurde verzorgers beschikbaar.</>
              )}
            </p>
            
            <div className="flex justify-center space-x-4">
              <Link
                href={`/search?province=${province.slug}`}
                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Zoek verzorgers
              </Link>
              <Link
                href="/auth/signin?callbackUrl=/dashboard"
                className="bg-white text-blue-600 px-6 py-3 rounded-lg font-medium border border-blue-600 hover:bg-blue-50 transition-colors"
              >
                Word verzorger
              </Link>
            </div>
          </header>

          {/* Cities Grid */}
          <section>
            <h2 className="text-2xl font-semibold text-gray-900 mb-8">
              Steden en gemeenten in {province.name}
            </h2>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {places.map((place) => (
                <Link
                  key={place.slug}
                  href={`/be/${province.slug}/${place.slug}`}
                  className="group bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-all hover:border-blue-300"
                >
                  <h3 className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                    {place.name}
                  </h3>
                  <div className="mt-2 text-sm text-gray-500">
                    Bekijk verzorgers →
                  </div>
                </Link>
              ))}
            </div>
          </section>

          {/* Services Info */}
          <section className="mt-16 bg-gray-50 rounded-lg p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-6 text-center">
              Beschikbare services in {province.name}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  🐕
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Hondenuitlaat</h3>
                <p className="text-sm text-gray-600">
                  Dagelijkse wandelingen voor jouw hond
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  🏠
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Dierenoppas</h3>
                <p className="text-sm text-gray-600">
                  Thuisoppas of opvang bij de verzorger
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  🎓
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Training</h3>
                <p className="text-sm text-gray-600">
                  Gedragstraining en gehoorzaamheid
                </p>
              </div>
              
              <div className="text-center">
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                  🚗
                </div>
                <h3 className="font-medium text-gray-900 mb-2">Transport</h3>
                <p className="text-sm text-gray-600">
                  Veilig vervoer van jouw huisdier
                </p>
              </div>
            </div>
          </section>
        </div>
      </div>
    </>
  )
}





