import type { Metadata } from 'next'
import { VisibilityDebugClient } from './visibility-client'

export const metadata: Metadata = {
  title: 'Visibility debug',
  description: 'Debugpagina voor SEO zichtbaarheid. Geen persoonlijke data.',
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
}

export default function VisibilityDebugPage() {
  return (
    <div className="container mx-auto px-4 py-10">
      <div className="max-w-4xl mx-auto bg-white rounded-2xl shadow-sm border border-black/5 p-5 sm:p-8">
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Visibility / SEO debug</h1>
        <p className="text-sm sm:text-base text-gray-600 mb-6">
          Deze pagina helpt objectief te checken of <code className="font-mono">robots.txt</code> en{' '}
          <code className="font-mono">sitemap.xml</code> bereikbaar zijn en welke omgeving je ziet.
        </p>
        <VisibilityDebugClient />
      </div>
    </div>
  )
}

