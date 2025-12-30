import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export default function CaregiverApplyThanksPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/" primaryCtaLabel="Terug naar site" />
      <div className="flex items-center justify-center px-4 py-12">
        <div className="bg-white rounded-2xl shadow-tt-lg p-12 max-w-2xl text-center">
          <div className="text-6xl mb-6">✅</div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Aanmelding ontvangen!</h1>
          <p className="text-xl text-gray-600 mb-8">
            Bedankt voor je aanmelding als dierenverzorger. We nemen contact met je op zodra we je aanmelding bekeken
            hebben.
          </p>
          <Link href="/" className="inline-block btn-brand">
            Terug naar Home
          </Link>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}


