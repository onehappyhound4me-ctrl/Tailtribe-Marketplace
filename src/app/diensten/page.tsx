import { Metadata } from 'next'
import ServicesGrid from '../(marketing)/components/ServicesGrid'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Diensten | Dierenoppas & Huisdierverzorging in België',
  description: 'Ontdek alle diensten: hondenuitlaat, dierenoppas, hondentraining, transport en meer. Professionele dierenoppassers voor jouw huisdier in België.',
  openGraph: {
    title: 'Diensten | Dierenoppas België',
    description: 'Professionele dierenoppassers voor elke behoefte. Ontdek alle diensten.',
    type: 'website',
    url: 'https://tailtribe.be/diensten',
  },
  alternates: {
    canonical: 'https://tailtribe.be/diensten',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function DienstenPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section - Only visible on desktop (md and up) */}
      <section className="hidden md:block bg-gradient-to-br from-emerald-600 to-teal-700 text-white py-16">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-4xl mx-auto">
            <h1 className="text-4xl md:text-5xl font-bold mb-6">
              Onze diensten
            </h1>
            <p className="text-xl md:text-2xl text-emerald-100 leading-relaxed">
              Professionele dierenoppas voor elke behoefte. Kies de dienst die het beste bij jouw situatie past.
            </p>
          </div>
        </div>
      </section>

      {/* Services Grid - showAll={true} ensures NO duplicate title/description */}
      <ServicesGrid showAll={true} className="bg-white" />

      {/* CTA Section */}
      <section className="bg-emerald-600 text-white py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Klaar om te beginnen?
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-2xl mx-auto">
            Vind de perfecte dierenoppas voor jouw huisdier in jouw buurt.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/search"
              className="inline-flex items-center px-8 py-4 bg-white text-emerald-600 rounded-lg font-semibold hover:bg-emerald-50 transition-colors focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-emerald-600"
            >
              Zoek dierenoppassers
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </Link>
            <a
              href="/auth/register?role=caregiver"
              className="inline-flex items-center px-8 py-4 bg-emerald-700 text-white rounded-lg font-semibold hover:bg-emerald-800 transition-colors focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:ring-offset-2 focus:ring-offset-emerald-600"
            >
              Word dierenoppasser
              <svg className="ml-2 w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
              </svg>
            </a>
          </div>
        </div>
      </section>
    </div>
  )
}
