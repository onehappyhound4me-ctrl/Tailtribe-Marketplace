import type { Metadata } from 'next'
import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { SmartLogoLink } from '@/components/brand/SmartLogoLink'
import { HeaderNav } from '@/components/navigation/HeaderNav'
import { MobileMenu } from '@/components/navigation/MobileMenu'
import { CookieConsent } from '@/components/common/CookieConsent'
import { CountryDetectionPopup } from '@/components/common/CountryDetectionPopup'
import { CountrySwitcher } from '@/components/common/CountrySwitcher'
import { FooterCountrySwitcher } from '@/components/common/FooterCountrySwitcher'
import { DynamicFooterLinks } from '@/components/navigation/DynamicFooter'
import './globals.css'

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
      <body className={`h-full antialiased font-sans overflow-x-hidden`}>
        <Providers>
          <div className="min-h-full flex flex-col">
            <header className="bg-gradient-to-r from-blue-50/95 via-teal-50/85 to-emerald-100/80 backdrop-blur-lg shadow-md border-b border-emerald-200/50 sticky top-0 z-[999] relative overflow-visible">
              {/* Subtle radial tints, no visible boxes */}
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_55%,rgba(255,255,255,0.34),transparent_62%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_52%,rgba(59,130,246,0.12),transparent_65%)]"></div>
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_50%,rgba(16,185,129,0.08),transparent_60%)]"></div>
              
              <nav className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 overflow-visible">
                <div className="flex items-center justify-between h-20 md:h-24 py-4">
                  <SmartLogoLink />
                  
                    <div className="flex items-center gap-4 md:gap-8">
                    {/* Desktop Navigation */}
                    <HeaderNav />
                    
                    {/* Country Switcher */}
                    <div className="hidden md:block">
                      <CountrySwitcher />
                    </div>

                    {/* Mobile Menu */}
                    <MobileMenu />
                  </div>
                </div>
              </nav>
            </header>
            
            <main className="flex-1">
              {children}
            </main>
            
            <footer className="bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 text-slate-100 border-t border-slate-700">
              <div className="container mx-auto px-4 py-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-1 pt-4 pb-4">
                  <div>
                    <div className="mt-0 flex items-center mb-0 overflow-hidden">
                      <Image 
                        src="/assets/tailtribe-logo.png" 
                        alt="Logo" 
                        width={180}
                        height={90}
                        className="object-contain object-left filter brightness-110 contrast-110 drop-shadow"
                        style={{ clipPath: 'inset(0 10% 10% 0)' }}
                      />
                    </div>
                    {/* Removed descriptive text under logo as requested */}
                  </div>
                  
                  {/* Dynamic Content: BE or NL based on current page */}
                  <DynamicFooterLinks />
                  
                  <div>
                    <h4 className="font-semibold text-white mb-1">Ondersteuning</h4>
                    <ul className="space-y-0.5 text-sm">
                      <li><Link href="/help" prefetch={false} className="text-slate-300 hover:text-white">FAQ</Link></li>
                      <li><Link href="/contact" prefetch={false} className="text-slate-300 hover:text-white">Contact</Link></li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-t border-slate-700 mt-4 pt-4 pb-4 text-sm text-slate-300">
                  <div className="flex flex-wrap items-center justify-center gap-3 mb-3">
                    <Link href="/terms" prefetch={false} className="hover:text-white">Algemene Voorwaarden</Link>
                    <span className="opacity-40">|</span>
                    <Link href="/privacy" prefetch={false} className="hover:text-white">Privacybeleid</Link>
                    <span className="opacity-40">|</span>
                    <Link href="/cookies" prefetch={false} className="hover:text-white">Cookiebeleid</Link>
                  </div>
                  
                  {/* Country Links */}
                  <FooterCountrySwitcher />
                  
                  <p className="text-center">&copy; 2024 TailTribe. Alle rechten voorbehouden.</p>
                </div>
              </div>
            </footer>
          </div>
          <Toaster position="top-right" />
          <CookieConsent />
          <CountryDetectionPopup />
        </Providers>
      </body>
    </html>
  )
}
