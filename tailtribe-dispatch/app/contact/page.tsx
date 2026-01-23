import type { Metadata } from 'next'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
const canonicalUrl = `${baseUrl}/contact`

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
        <div className="max-w-2xl mx-auto bg-white rounded-2xl shadow-tt p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Contact</h1>
          <p className="text-gray-600 mb-6">
            Heb je een vraag over je aanvraag? Neem gerust contact met ons op.
          </p>
          <div className="space-y-3 text-gray-800">
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



