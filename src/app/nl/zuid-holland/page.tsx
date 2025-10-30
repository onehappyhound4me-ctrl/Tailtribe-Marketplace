import { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Dierenoppas Zuid-Holland - Rotterdam, Den Haag, Leiden',
  description: 'Vind betrouwbare dierenoppassers in Zuid-Holland. Hondenuitlaat en dierenoppas in Rotterdam, Den Haag, Leiden en omgeving.',
}

export default function ZuidHollandPage() {
  const cities = [
    'Rotterdam', 'Den Haag', 'Leiden', 'Dordrecht', 'Zoetermeer',
    'Delft', 'Alphen aan den Rijn', 'Westland', 'Katwijk', 'Gouda'
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Dierenoppassers in Zuid-Holland
            </h1>
            <p className="text-xl text-gray-600">
              Van Rotterdam tot Den Haag, vind de perfecte dierenoppasser bij jou in de buurt
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {cities.map((city) => (
              <Link
                key={city}
                href={`/nl/search?city=${city}`}
                className="bg-white rounded-xl p-6 shadow-md hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-200 hover:border-emerald-300"
              >
                <p className="font-bold text-gray-900 text-center">{city}</p>
              </Link>
            ))}
          </div>

          <div className="mt-12 text-center">
            <Link
              href="/nl/search"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-lg font-semibold hover:from-emerald-600 hover:to-teal-700 transition-all shadow-lg"
            >
              Zoek alle dierenoppassers in Nederland
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}



