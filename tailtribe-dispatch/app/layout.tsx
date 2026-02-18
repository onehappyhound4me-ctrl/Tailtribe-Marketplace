import type { Metadata } from 'next'
import './globals.css'
import { Suspense } from 'react'
import { SessionProvider } from '@/components/SessionProvider'
import { BackButtonFloating } from '@/components/BackButtonFloating'
import { CookieConsent } from '@/components/CookieConsent'
import { NavigationClickGuards } from '@/components/NavigationClickGuards'
import { AnalyticsLoader } from '../components/AnalyticsLoader'
import { AnalyticsPageView } from '@/components/AnalyticsPageView'
import { AnalyticsDebugBadge } from '@/components/AnalyticsDebugBadge'
import { AnalyticsEventCapture } from '@/components/AnalyticsEventCapture'
import { getPublicAppUrl } from '@/lib/env'

const appUrl = getPublicAppUrl()
const ogImageUrl = `${appUrl}/assets/hero-marketplace.jpg`
const orgLogoUrl = `${appUrl}/tailtribe_logo_masked_1751977129022.png`

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'TailTribe – Professionele dierenverzorging in België',
    template: '%s | TailTribe',
  },
  description: 'Vraag betrouwbare dierenverzorging aan in België. Hondenuitlaat, dierenoppas, opvang en meer.',
  manifest: '/manifest.webmanifest',
  themeColor: '#10b981',
  icons: {
    // Make favicon explicit so browsers don't fall back to Vercel's default.
    icon: ['/favicon.svg', '/tailtribe_logo_masked_1751977129022.png'],
    shortcut: ['/favicon.svg'],
  },
  alternates: {
    canonical: '/',
    languages: {
      'nl-BE': '/',
      'x-default': '/',
    },
  },
  openGraph: {
    type: 'website',
    url: '/',
    siteName: 'TailTribe',
    title: 'TailTribe – Professionele dierenverzorging in België',
    description: 'Vraag betrouwbare dierenverzorging aan in België. Hondenuitlaat, dierenoppas, opvang en meer.',
    locale: 'nl_BE',
    images: [
      {
        url: ogImageUrl,
        width: 1200,
        height: 630,
        alt: 'TailTribe – Professionele dierenverzorging in België',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TailTribe – Professionele dierenverzorging in België',
    description: 'Vraag betrouwbare dierenverzorging aan in België. Hondenuitlaat, dierenoppas, opvang en meer.',
    images: [ogImageUrl],
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="nl-BE" className="h-full">
      <body className="h-full antialiased font-sans">
        <SessionProvider>
          <NavigationClickGuards />
          <AnalyticsLoader />
          <AnalyticsEventCapture />
          <Suspense fallback={null}>
            <AnalyticsPageView />
          </Suspense>
          <AnalyticsDebugBadge />
          <BackButtonFloating />
          <CookieConsent />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': ['Organization', 'LocalBusiness'],
                name: 'TailTribe',
                url: appUrl,
                logo: orgLogoUrl,
                description: 'Professionele dierenverzorging in België.',
                areaServed: { '@type': 'Country', name: 'België' },
                sameAs: ['https://www.instagram.com/1happyhound/?hl=nl'],
                contactPoint: [
                  {
                    '@type': 'ContactPoint',
                    contactType: 'customer support',
                    email: 'steven@tailtribe.be',
                    availableLanguage: ['nl', 'en'],
                  },
                ],
              }),
            }}
          />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
