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

          <div className="mt-8 text-left">
            <div className="text-sm font-semibold text-gray-900 mb-3">Handige links</div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm">
              <Link href="/diensten" className="text-emerald-700 hover:underline">
                Dienstenoverzicht
              </Link>
              <Link href="/be/antwerpen" className="text-emerald-700 hover:underline">
                Dierenverzorging in Antwerpen
              </Link>
              <Link href="/be/antwerpen/kalmthout" className="text-emerald-700 hover:underline">
                Groepsuitlaat in Kalmthout
              </Link>
              <Link href="/contact" className="text-emerald-700 hover:underline">
                Contact
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}


