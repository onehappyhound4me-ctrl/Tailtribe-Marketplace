import type { Metadata } from 'next'
import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { NavProvider } from '@/components/navigation/NavContext'
import { SiteHeader } from '@/components/navigation/SiteHeader'
import { MobileMenu } from '@/components/navigation/MobileMenu'
import { CookieConsent } from '@/components/common/CookieConsent'
import { CountryDetectionPopup } from '@/components/common/CountryDetectionPopup'
import { FooterCountrySwitcher } from '@/components/common/FooterCountrySwitcher'
import { DynamicFooterLinks } from '@/components/navigation/DynamicFooter'
import { VercelAnalytics } from '@/components/analytics/VercelAnalytics'
import { ErrorBoundary } from '@/components/error-boundary/ErrorBoundary'
import './globals.css'
// cache-bust: 2025-11-11

const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'


export const viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export const metadata: Metadata = {
  metadataBase: new URL(appUrl),
  title: {
    default: 'TailTribe – Dierenoppas België & Nederland',
    template: '%s | TailTribe',
  },
  description: 'TailTribe verbindt diereneigenaars met professionele dierenoppassers in België en Nederland voor hondenuitlaat, dierenopvang en verzorging aan huis.',
  keywords: [
    'dierenoppas',
    'dierenoppasser',
    'hondenoppas',
    'kattenoppas',
    'hondenuitlaat',
    'dierenopvang',
    'dierenverzorging',
    'België',
    'Nederland',
    'TailTribe',
  ],
  authors: [{ name: 'TailTribe' }],
  creator: 'TailTribe',
  publisher: 'TailTribe',
  alternates: {
    canonical: '/',
    languages: {
      'nl-BE': '/',
      'nl-NL': '/nl',
    },
  },
  icons: {
    icon: '/assets/tailtribe-logo.png',
    shortcut: '/assets/tailtribe-logo.png',
    apple: '/assets/tailtribe-logo.png',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'nl_BE',
    alternateLocale: ['nl_NL'],
    url: '/',
    siteName: 'TailTribe',
    title: 'TailTribe – Dierenoppas België & Nederland',
    description: 'Vind vertrouwde dierenoppassers voor wandelingen, opvang en verzorging in België en Nederland.',
    images: [
      {
        url: '/assets/tailtribe-logo.png',
        width: 1200,
        height: 630,
        alt: 'TailTribe – Dierenoppassers België & Nederland',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TailTribe – Dierenoppas België & Nederland',
    description: 'Verbind met lokale dierenoppassers voor hondenuitlaat, opvang en verzorging.',
    images: ['/assets/tailtribe-logo.png'],
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="nl" className="h-full">
      <body className="h-full antialiased font-sans overflow-x-hidden">
        <Providers>
          <NavProvider>
            <ErrorBoundary>
              <SiteHeader />
              <MobileMenu />
              <div className="min-h-full flex flex-col">
                <main className="flex-1">
                  {children}
                </main>
              
              <footer className="bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 text-slate-100 border-t border-slate-700">
                <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4 md:gap-6">
                    {/* Logo Column */}
                    <div className="flex items-start justify-start md:justify-start">
                      <Image 
                        src="/assets/tailtribe-logo.png" 
                        alt="TailTribe Logo" 
                        width={120}
                        height={60}
                        className="object-contain object-left filter brightness-110 contrast-110 drop-shadow"
                        style={{ clipPath: 'inset(0 10% 10% 0)' }}
                      />
                    </div>
                    
                    {/* Dynamic Links */}
                    <DynamicFooterLinks />
                    
                    {/* Support Column */}
                    <div>
                      <h4 className="font-semibold text-white mb-2 md:mb-3 text-sm md:text-base">Ondersteuning</h4>
                      <ul className="space-y-1.5 md:space-y-2 text-sm">
                        <li><Link href="/help" prefetch={false} className="text-slate-300 hover:text-white transition-colors">FAQ</Link></li>
                        <li><Link href="/contact" prefetch={false} className="text-slate-300 hover:text-white transition-colors">Contact</Link></li>
                      </ul>
                    </div>
                  </div>
                  
                  {/* Bottom Section */}
                  <div className="border-t border-slate-700 mt-4 md:mt-6 pt-4 md:pt-6 pb-3 md:pb-4">
                    <div className="flex flex-wrap items-center justify-center gap-3 mb-4 text-sm text-slate-300">
                      <Link href="/terms" prefetch={false} className="hover:text-white transition-colors">Algemene Voorwaarden</Link>
                      <span className="opacity-40">|</span>
                      <Link href="/privacy" prefetch={false} className="hover:text-white transition-colors">Privacybeleid</Link>
                      <span className="opacity-40">|</span>
                      <Link href="/cookies" prefetch={false} className="hover:text-white transition-colors">Cookiebeleid</Link>
                    </div>
                    
                    <div className="mb-4">
                      <FooterCountrySwitcher />
                    </div>
                    
                    <p className="text-center text-sm text-slate-400">&copy; 2024 TailTribe. Alle rechten voorbehouden.</p>
                  </div>
                </div>
              </footer>
            </div>
            <Toaster position="top-right" />
            <CookieConsent />
            <CountryDetectionPopup />
            <VercelAnalytics />
            </ErrorBoundary>
          </NavProvider>
        </Providers>
      </body>
    </html>
  )
}
