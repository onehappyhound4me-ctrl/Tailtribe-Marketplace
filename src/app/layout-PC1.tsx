import type { Metadata } from 'next'
import { Providers } from '@/components/providers'
import { Toaster } from 'sonner'
import Link from 'next/link'
import Image from 'next/image'
import { HeaderBrand } from '@/components/brand/HeaderBrand'
import { MobileMenu } from '@/components/navigation/MobileMenu'
import './globals.css'


export const metadata: Metadata = {
  title: 'TailTribe - Betrouwbare dierenverzorging in België',
  description: 'Vind vertrouwde dierenverzorgers in België. Van hondenuitlaat tot dierenoppas, verbind met lokale professionals voor de beste zorg.',
  keywords: 'dierenverzorging, hondenuitlaat, dierenoppas, huisdieren, België, Vlaanderen, Wallonië, Brussel, hondentraining, dierenopvang, verzorging aan huis',
  authors: [{ name: 'TailTribe' }],
  creator: 'TailTribe',
  publisher: 'TailTribe',
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
    url: 'https://tailtribe.be',
    siteName: 'TailTribe',
    title: 'TailTribe - Betrouwbare dierenverzorging in België',
    description: 'Vind vertrouwde dierenverzorgers in België. Van hondenuitlaat tot dierenoppas, verbind met lokale professionals.',
    images: [
      {
        url: '/assets/tailtribe-logo.png',
        width: 1200,
        height: 630,
        alt: 'TailTribe - Dierenverzorging België',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TailTribe - Betrouwbare dierenverzorging in België',
    description: 'Vind vertrouwde dierenverzorgers in België. Van hondenuitlaat tot dierenoppas.',
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
              <body className={`h-full antialiased font-sans`}>
        <Providers>
          <div className="min-h-full flex flex-col">
            <header className="bg-white/95 backdrop-blur-lg shadow-lg border-b border-gray-200/50 h-24 sticky top-0 z-50">
              <nav className="container mx-auto px-4 h-full">
                <div className="flex items-center justify-between h-full">
                  <Link href="/" className="hover:opacity-80 transition-opacity select-none">
                    <HeaderBrand />
                  </Link>
                  
                  <div className="hidden md:flex items-center space-x-8">
                    <Link href="/about" prefetch={false} className="text-gray-700 hover:text-green-700 font-medium transition-colors duration-200 relative group">
                      Over ons
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full"></span>
                    </Link>
                    <Link href="/search" prefetch={false} className="text-gray-700 hover:text-green-700 font-medium transition-colors duration-200 relative group">
                      Zoek verzorgers
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full"></span>
                    </Link>
                    <Link href="/auth/signin" prefetch={false} className="text-gray-700 hover:text-green-700 font-medium transition-colors duration-200 relative group">
                      Inloggen
                      <span className="absolute -bottom-1 left-0 w-0 h-0.5 bg-green-600 transition-all duration-200 group-hover:w-full"></span>
                    </Link>
                    {/* Verwijderd: 'Word verzorger' knop */}
                  </div>

                  {/* Mobile Menu */}
                  <MobileMenu />
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
                        style={{ clipPath: 'inset(0 6% 0 0)' }}
                      />
                    </div>
                    {/* Removed descriptive text under logo as requested */}
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-1">Populaire provincies</h4>
                    <ul className="space-y-0.5 text-sm">
                      <li><Link href="/be/antwerpen" prefetch={false} className="text-slate-300 hover:text-white">Antwerpen</Link></li>
                      <li><Link href="/be/oost-vlaanderen" prefetch={false} className="text-slate-300 hover:text-white">Oost-Vlaanderen</Link></li>
                      <li><Link href="/be/vlaams-brabant" prefetch={false} className="text-slate-300 hover:text-white">Vlaams-Brabant</Link></li>
                      <li><Link href="/be/brussel" prefetch={false} className="text-slate-300 hover:text-white">Brussel</Link></li>
                      <li><Link href="/be" prefetch={false} className="text-slate-200 hover:text-white font-medium">Meer plaatsen in België →</Link></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-1">Diensten</h4>
                    <ul className="space-y-0.5 text-sm">
                      <li><Link href="/diensten" prefetch={false} className="text-slate-300 hover:text-white">Alle diensten</Link></li>
                      <li><Link href="/diensten/hondenuitlaat" prefetch={false} className="text-slate-300 hover:text-white">Hondenuitlaat</Link></li>
                      <li><Link href="/diensten/groepsuitlaat" prefetch={false} className="text-slate-300 hover:text-white">Groepsuitlaat</Link></li>
                      <li><Link href="/diensten/hondentraining" prefetch={false} className="text-slate-300 hover:text-white">Hondentraining</Link></li>
                      <li><Link href="/diensten/dierenoppas" prefetch={false} className="text-slate-300 hover:text-white">Dierenoppas</Link></li>
                      <li><Link href="/diensten/dierenopvang" prefetch={false} className="text-slate-300 hover:text-white">Dierenopvang</Link></li>
                      <li><Link href="/diensten/verzorging-aan-huis" prefetch={false} className="text-slate-300 hover:text-white">Verzorging aan huis</Link></li>
                      <li><Link href="/diensten/begeleiding-events" prefetch={false} className="text-slate-300 hover:text-white">Begeleiding events</Link></li>
                      <li><Link href="/diensten/transport-huisdieren" prefetch={false} className="text-slate-300 hover:text-white">Transport huisdieren</Link></li>
                      <li><Link href="/diensten/verzorging-kleinvee" prefetch={false} className="text-slate-300 hover:text-white">Verzorging kleinvee</Link></li>
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-white mb-1">Ondersteuning</h4>
                    <ul className="space-y-0.5 text-sm">
                      <li><Link href="/help" prefetch={false} className="text-slate-300 hover:text-white">FAQ</Link></li>
                      <li><Link href="/contact" prefetch={false} className="text-slate-300 hover:text-white">Contact</Link></li>
                    </ul>
                  </div>
                </div>
                
                <div className="border-t border-slate-700 mt-4 pt-4 pb-4 text-center text-sm text-slate-300">
                  <div className="flex flex-wrap items-center justify-center gap-3 mb-2">
                    <Link href="/terms" prefetch={false} className="hover:text-white">Algemene Voorwaarden</Link>
                    <span className="opacity-40">|</span>
                    <Link href="/privacy" prefetch={false} className="hover:text-white">Privacybeleid</Link>
                    <span className="opacity-40">|</span>
                    <Link href="/cookies" prefetch={false} className="hover:text-white">Cookiebeleid</Link>
                  </div>
                  <p>&copy; 2024. Alle rechten voorbehouden.</p>
                </div>
              </div>
            </footer>
          </div>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
