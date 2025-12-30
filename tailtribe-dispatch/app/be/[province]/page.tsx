import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { getProvinceBySlug, getPlacesByProvince } from '@/data/be-geo'

type Props = {
  params: { province: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const province = getProvinceBySlug(params.province)
  if (!province) {
    return { title: 'Streek niet gevonden', description: 'De opgevraagde streek bestaat niet.' }
  }

  return {
    title: `Dierenverzorging in ${province.name} | TailTribe`,
    description: `Vraag dierenverzorging aan in ${province.name}. Hondenuitlaat, dierenoppas, opvang en meer — binnen 2 uur bevestiging.`,
  }
}

export default function ProvinceLandingPage({ params }: Props) {
  const province = getProvinceBySlug(params.province)
  if (!province) notFound()

  const places = getPlacesByProvince(params.province)

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />

      <main className="container mx-auto px-4 py-12">
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
              Dierenverzorging in {province.name}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              Vraag snel een offerte aan. We nemen binnen 2 uur contact op om de details af te stemmen.
            </p>
            <div className="mt-6">
              <Link href="/boeken" className="btn-brand inline-block">
                Vraag een offerte aan
              </Link>
            </div>
          </header>

          <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
            <h2 className="text-2xl font-semibold text-gray-900 mb-4">
              Populaire steden en gemeenten in {province.name}
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
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
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}


