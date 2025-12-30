'use client'

import Link from 'next/link'
import { useEffect } from 'react'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export default function ErrorPage({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />

      <main className="container mx-auto px-4 py-16">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-tt p-10 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Er ging iets mis</h1>
          <p className="text-gray-600 mb-8">
            Probeer opnieuw. Als het probleem blijft terugkomen, contacteer ons dan via de contactpagina.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button type="button" onClick={reset} className="btn-brand">
              Opnieuw proberen
            </button>
            <Link
              href="/contact"
              className="inline-block px-6 py-3 rounded-tt border border-white/10 bg-white text-gray-900 hover:bg-gray-50 transition"
            >
              Contact
            </Link>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}


