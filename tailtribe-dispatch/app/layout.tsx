import type { Metadata } from 'next'
import './globals.css'
import { SessionProvider } from '@/components/SessionProvider'
import { BackButtonFloating } from '@/components/BackButtonFloating'
import { CookieConsent } from '@/components/CookieConsent'
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
  icons: {
    // Make favicon explicit so browsers don't fall back to Vercel's default.
    icon: ['/tailtribe_logo_masked_1751977129022.png'],
    shortcut: ['/tailtribe_logo_masked_1751977129022.png'],
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
    <html lang="nl" className="h-full">
      <body className="h-full antialiased font-sans">
        <SessionProvider>
          <BackButtonFloating />
          <CookieConsent />
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                '@context': 'https://schema.org',
                '@type': 'Organization',
                name: 'TailTribe',
                url: appUrl,
                logo: orgLogoUrl,
                description: 'Professionele dierenverzorging in België.',
              }),
            }}
          />
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
