import type { Metadata } from 'next'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { getPublicAppUrl } from '@/lib/env'

const appUrl = getPublicAppUrl()
const canonicalUrl = new URL('/contact', appUrl).toString()

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contacteer TailTribe voor vragen over je aanvraag of dierenverzorging.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Contact',
    description: 'Contacteer TailTribe voor vragen over je aanvraag of dierenverzorging.',
    url: canonicalUrl,
    siteName: 'TailTribe',
    locale: 'nl_BE',
    type: 'website',
  },
}

export default function ContactPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-tt p-5 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-3">Contact</h1>
          <p className="text-gray-600 mb-6 text-sm sm:text-base leading-relaxed">
            Heb je een vraag over je aanvraag? Neem gerust contact met ons op.
          </p>
          <div className="space-y-3 text-gray-800 text-sm sm:text-base">
            <div>
              <span className="font-semibold">E-mail:</span>{' '}
              <a href="mailto:steven@tailtribe.be" className="text-emerald-700 hover:underline">
                steven@tailtribe.be
              </a>
            </div>
            <div className="text-sm text-gray-600 pt-2">
              We reageren doorgaans binnen 24 uur op werkdagen.
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}



