import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-tt p-10 text-center">
          <div className="text-sm font-semibold text-gray-500 mb-2">404</div>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Pagina niet gevonden</h1>
          <p className="text-gray-600 mb-8">
            Deze pagina bestaat niet (meer). Je kan terug naar de homepagina of meteen een aanvraag indienen.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/boeken" className="btn-brand inline-block">
              Start je aanvraag
            </Link>
            <Link
              href="/"
              className="inline-block px-6 py-3 rounded-tt border border-white/10 bg-white text-gray-900 hover:bg-gray-50 transition"
            >
              Terug naar home
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}


