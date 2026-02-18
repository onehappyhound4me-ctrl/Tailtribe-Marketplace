import type { Metadata } from 'next'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { VisibilityDebugClient } from './visibility-client'

export const metadata: Metadata = {
  title: 'Visibility debug',
  description: 'Debugpagina voor SEO/analytics zichtbaarheid. Geen persoonlijke data.',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
}

export default function VisibilityDebugPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/" primaryCtaLabel="Home" />
      <main className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-tt border border-black/5 p-5 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Visibility / SEO / Analytics debug</h1>
          <p className="text-sm sm:text-base text-gray-600 mb-6">
            Deze pagina helpt objectief te checken of <code className="font-mono">robots.txt</code>,{' '}
            <code className="font-mono">sitemap.xml</code> en analytics events werken. Geen login nodig.
          </p>
          <VisibilityDebugClient />
        </div>
      </main>
      <SiteFooter />
    </div>
  )
}

