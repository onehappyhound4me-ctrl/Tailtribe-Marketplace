import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Nieuwe aanvraag" />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-tt-lg p-12 max-w-2xl text-center">
        <div className="text-6xl mb-6">✅</div>
        <h1 className="text-4xl font-bold text-gray-900 mb-4">
          Aanvraag ontvangen!
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Bedankt voor je aanvraag. We nemen binnen 2 uur contact met je op om alles te bevestigen.
        </p>
        <div className="bg-green-50 border border-green-200 rounded-xl p-6 mb-8">
          <h3 className="font-semibold text-green-900 mb-2">Wat gebeurt er nu?</h3>
          <ul className="text-left text-green-800 space-y-2">
            <li>✓ We beoordelen je aanvraag</li>
            <li>✓ We zoeken de best passende verzorger</li>
            <li>✓ Je ontvangt een bevestiging per e-mail</li>
            <li>✓ We nemen telefonisch contact op</li>
          </ul>
        </div>
        <Link 
          href="/"
          className="inline-block btn-brand"
        >
          Terug naar Home
        </Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}

