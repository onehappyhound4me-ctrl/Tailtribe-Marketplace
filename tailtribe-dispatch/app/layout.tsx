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
import { getOrganizationReviewSchema } from '@/lib/reviews'

const appUrl = getPublicAppUrl()
const ogImageUrl = `${appUrl}/assets/hero-marketplace.jpg`
const orgLogoUrl = `${appUrl}/tailtribe_logo_masked_1751977129022.png`
const organizationReviews = getOrganizationReviewSchema()

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'Hondenuitlaat, hondenoppas en kattenoppas in België | TailTribe',
    template: '%s | TailTribe',
  },
  description:
    'Vraag hondenuitlaat, hondenoppas, kattenoppas, hondenopvang en dierenverzorging aan in België via TailTribe.',
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
    title: 'Hondenuitlaat, hondenoppas en kattenoppas in België | TailTribe',
    description: 'Vraag hondenuitlaat, hondenoppas, kattenoppas, hondenopvang en dierenverzorging aan in België.',
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
    title: 'Hondenuitlaat, hondenoppas en kattenoppas in België | TailTribe',
    description: 'Vraag hondenuitlaat, hondenoppas, kattenoppas, hondenopvang en dierenverzorging aan in België.',
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
                '@graph': [
                  {
                    '@type': ['Organization', 'LocalBusiness'],
                    '@id': `${appUrl}/#organization`,
                    name: 'TailTribe',
                    url: appUrl,
                    logo: orgLogoUrl,
                    description:
                      'TailTribe is een Belgisch platform voor hondenuitlaat, dierenoppas, opvang en verzorging aan huis. We matchen aanvragen met gescreende verzorgers en volgen elke aanvraag persoonlijk op — met focus op duidelijke afspraken en vertrouwen.',
                    areaServed: { '@type': 'Country', name: 'België' },
                    slogan:
                      'Persoonlijke matching met gescreende dierenverzorgers in België — geen anonieme marktplaats.',
                    sameAs: ['https://www.instagram.com/tailtribe_/'],
                    contactPoint: [
                      {
                        '@type': 'ContactPoint',
                        contactType: 'customer support',
                        email: 'steven@tailtribe.be',
                        availableLanguage: ['nl', 'en'],
                      },
                    ],
                    ...organizationReviews,
                  },
                  {
                    '@type': 'WebSite',
                    '@id': `${appUrl}/#website`,
                    url: appUrl,
                    name: 'TailTribe',
                    inLanguage: 'nl-BE',
                    publisher: { '@id': `${appUrl}/#organization` },
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
