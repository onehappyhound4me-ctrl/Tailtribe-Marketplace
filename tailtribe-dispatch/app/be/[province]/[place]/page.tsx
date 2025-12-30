import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { getProvinceBySlug, getPlaceBySlugs } from '@/data/be-geo'

type Props = {
  params: { province: string; place: string }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const province = getProvinceBySlug(params.province)
  const place = getPlaceBySlugs(params.province, params.place)
  if (!province || !place) {
    return { title: 'Locatie niet gevonden', description: 'De opgevraagde locatie bestaat niet.' }
  }

  return {
    title: `Dierenverzorging in ${place.name} (${province.name}) | TailTribe`,
    description: `Vraag dierenverzorging aan in ${place.name}. Hondenuitlaat, dierenoppas, opvang en meer — we nemen binnen 2 uur contact op.`,
  }
}

export default function PlaceLandingPage({ params }: Props) {
  const province = getProvinceBySlug(params.province)
  const place = getPlaceBySlugs(params.province, params.place)
  if (!province || !place) notFound()

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />

      <main className="container mx-auto px-4 py-12">
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
              Dierenverzorging in {place.name}
            </h1>
            <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
              TailTribe dispatch in {place.name}, {province.name}. Dien je aanvraag in en wij regelen de juiste verzorger.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/boeken" className="btn-brand inline-block">
                Vraag een offerte aan
              </Link>
              <Link
                href={`/be/${province.slug}`}
                className="inline-block px-6 py-3 rounded-tt border border-white/10 bg-white text-gray-900 hover:bg-gray-50 transition"
              >
                Bekijk {province.name}
              </Link>
            </div>
          </header>

          <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-8">
            <h2 className="text-2xl font-semibold text-gray-900 mb-3">Hoe werkt het?</h2>
            <ol className="list-decimal pl-5 space-y-2 text-gray-700">
              <li>Vul je aanvraag in (service, datum, locatie en huisdierinfo).</li>
              <li>Wij nemen contact op en stemmen de details af.</li>
              <li>We plannen een geschikte verzorger in.</li>
            </ol>
            <div className="mt-6">
              <Link href="/boeken" className="btn-brand inline-block">
                Start je aanvraag
              </Link>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}



