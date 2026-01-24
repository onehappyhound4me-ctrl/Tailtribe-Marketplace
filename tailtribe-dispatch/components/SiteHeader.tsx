'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useState } from 'react'
import { useSession, signOut } from 'next-auth/react'

type Props = {
  primaryCtaHref?: string
  primaryCtaLabel?: string
}

export function SiteHeader({ primaryCtaHref = '/boeken', primaryCtaLabel = 'Boek Nu' }: Props) {
  const { data: session } = useSession()
  const canSeeCommunity = session?.user?.role === 'CAREGIVER' || session?.user?.role === 'ADMIN'
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  const handleLogout = async () => {
    await signOut({ callbackUrl: '/', redirect: true })
  }

  return (
    <header className="bg-gradient-to-r from-blue-200/95 via-teal-200/90 to-emerald-300/82 backdrop-blur-lg shadow-md border-b border-emerald-300/60 sticky top-0 z-[999] relative overflow-visible">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_55%,rgba(241,248,255,0.55),transparent_58%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_52%,rgba(37,99,235,0.18),transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_50%,rgba(16,185,129,0.16),transparent_60%)]" />

      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 overflow-visible">
        <div className="flex items-center justify-between h-20 md:h-24 py-4">
          <Link
            href="/"
            className="flex items-center hover:opacity-95 transition-all duration-300 select-none transform hover:scale-[1.02] no-underline"
          >
            {/* Smaller on mobile to prevent right-side overflow */}
            <div className="w-[160px] sm:w-[220px] md:w-[320px] lg:w-[360px] h-auto overflow-hidden relative">
              <Image
                src="/tailtribe_logo_masked_1751977129022.png"
                alt="TailTribe Logo"
                width={700}
                height={700}
                priority
                sizes="(max-width: 480px) 160px, (max-width: 768px) 220px, (max-width: 1024px) 320px, 360px"
                className="w-full h-auto object-contain relative z-10 transition-transform duration-300 hover:scale-[1.02]"
                style={{
                  filter: 'sepia(0.08) saturate(1.08) hue-rotate(-4deg) brightness(1.08)',
                  // Crop tiny artifact/smear in the bottom-right of the source image (header).
                  clipPath: 'inset(0 4% 10% 0)',
                }}
              />
            </div>
          </Link>

          <div className="flex items-center gap-2 md:gap-4 lg:gap-6 min-w-0">
            {/* Desktop Menu - alleen zichtbaar op md en groter */}
            <Link
              href="/#services"
              className="hidden md:block text-gray-700 hover:text-green-700 font-medium transition whitespace-nowrap"
            >
              Diensten
            </Link>
            <Link
              href="/over-ons"
              className="hidden md:block text-gray-700 hover:text-green-700 font-medium transition whitespace-nowrap"
            >
              Over ons
            </Link>
            <Link
              href="/blog"
              className="hidden md:block text-gray-700 hover:text-green-700 font-medium transition whitespace-nowrap"
            >
              Blog
            </Link>
            {canSeeCommunity && (
              <Link
                href="/community"
                className="hidden md:block text-gray-700 hover:text-green-700 font-medium transition whitespace-nowrap"
              >
                Community
              </Link>
            )}
            
            {/* Desktop Session Links - alleen op md en groter */}
            <div className="hidden md:flex md:items-center md:gap-3 lg:gap-4">
              {session && (
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-blue-600 font-medium transition whitespace-nowrap"
                >
                  Dashboard
                </Link>
              )}
              
              {session ? (
                <button
                  onClick={handleLogout}
                  className="text-gray-700 hover:text-red-600 font-medium transition whitespace-nowrap"
                >
                  Uitloggen
                </button>
              ) : (
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-green-700 font-medium transition whitespace-nowrap"
                >
                  Inloggen
                </Link>
              )}
            </div>
            
            {/* Mobile & Shared Buttons */}
            <div className="flex items-center gap-2 md:gap-3">
              {/* Mobile menu toggle */}
              <button
                type="button"
                onClick={() => setMobileMenuOpen((v) => !v)}
                aria-label="Menu"
                aria-expanded={mobileMenuOpen}
                className="inline-flex md:hidden items-center justify-center rounded-full border border-emerald-200 bg-white/80 backdrop-blur px-3 py-2 text-gray-900 hover:bg-white transition shadow-sm"
              >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-5 h-5 fill-current">
                  <path d="M4 6h16v2H4V6Zm0 5h16v2H4v-2Zm0 5h16v2H4v-2Z" />
                </svg>
              </button>
              
              {/* Primary CTA - altijd zichtbaar */}
              <Link
                href={primaryCtaHref}
                className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-5 py-2.5 md:px-6 rounded-full font-semibold hover:from-green-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl text-sm md:text-base"
              >
                {primaryCtaLabel}
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Mobile dropdown menu */}
      {mobileMenuOpen && (
        <div className="md:hidden relative z-20 border-t border-emerald-200/70 bg-white/85 backdrop-blur">
          <div className="container mx-auto px-4 sm:px-6 py-3">
            <div className="grid grid-cols-2 gap-2">
              <Link
                href="/#services"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-emerald-50 transition"
              >
                Diensten
              </Link>
              <Link
                href="/over-ons"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-emerald-50 transition"
              >
                Over ons
              </Link>
              <Link
                href="/blog"
                onClick={() => setMobileMenuOpen(false)}
                className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-emerald-50 transition"
              >
                Blog
              </Link>
              {canSeeCommunity ? (
                <Link
                  href="/community"
                  onClick={() => setMobileMenuOpen(false)}
                  className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-emerald-50 transition"
                >
                  Community
                </Link>
              ) : (
                <span className="rounded-lg border border-transparent px-3 py-2 text-sm text-gray-500" />
              )}

              {session ? (
                <>
                  <Link
                    href="/dashboard"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg border border-blue-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-blue-50 transition"
                  >
                    Dashboard
                  </Link>
                  <button
                    type="button"
                    onClick={() => {
                      setMobileMenuOpen(false)
                      void handleLogout()
                    }}
                    className="rounded-lg border border-red-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-red-50 transition text-left"
                  >
                    Uitloggen
                  </button>
                </>
              ) : (
                <>
                  <Link
                    href="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="rounded-lg border border-emerald-200 bg-white px-3 py-2 text-sm font-semibold text-gray-900 hover:bg-emerald-50 transition"
                  >
                    Inloggen
                  </Link>
                  <span className="rounded-lg border border-transparent px-3 py-2 text-sm text-gray-500" />
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  )
}



