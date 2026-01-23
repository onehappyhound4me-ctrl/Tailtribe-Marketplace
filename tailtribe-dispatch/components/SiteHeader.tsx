'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useSession, signOut } from 'next-auth/react'

type Props = {
  primaryCtaHref?: string
  primaryCtaLabel?: string
}

export function SiteHeader({ primaryCtaHref = '/boeken', primaryCtaLabel = 'Boek Nu' }: Props) {
  const { data: session } = useSession()
  const canSeeCommunity = session?.user?.role === 'CAREGIVER' || session?.user?.role === 'ADMIN'

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
            <div className="w-[210px] sm:w-[260px] md:w-[320px] lg:w-[360px] h-auto overflow-hidden relative">
              <Image
                src="/tailtribe_logo_masked_1751977129022.png"
                alt="TailTribe Logo"
                width={700}
                height={700}
                priority
                sizes="(max-width: 480px) 210px, (max-width: 768px) 260px, (max-width: 1024px) 320px, 360px"
                className="w-full h-auto object-contain relative z-10 transition-transform duration-300 hover:scale-[1.02]"
                style={{
                  filter: 'sepia(0.08) saturate(1.08) hue-rotate(-4deg) brightness(1.08)',
                }}
              />
            </div>
          </Link>

          <div className="flex items-center gap-2 md:gap-4 lg:gap-6">
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
              <Link
                href="/blog"
                className="inline-flex md:hidden items-center px-4 py-2.5 rounded-full border border-emerald-200 bg-white text-gray-900 hover:bg-emerald-50 text-sm font-semibold transition"
              >
                Blog
              </Link>
              {canSeeCommunity && (
                <Link
                  href="/community"
                  className="inline-flex md:hidden items-center px-4 py-2.5 rounded-full border border-emerald-200 bg-white text-gray-900 hover:bg-emerald-50 text-sm font-semibold transition"
                >
                  Community
                </Link>
              )}
              {/* Mobile Session Links - alleen op mobile */}
              {session && (
                <Link
                  href="/dashboard"
                  className="inline-flex md:hidden items-center px-4 py-2.5 rounded-full border border-blue-200 bg-white text-gray-900 hover:bg-blue-50 text-sm font-semibold transition"
                >
                  Dashboard
                </Link>
              )}
              
              {session ? (
                <button
                  onClick={handleLogout}
                  className="inline-flex md:hidden items-center px-4 py-2.5 rounded-full border border-red-200 bg-white text-gray-900 hover:bg-red-50 text-sm font-semibold transition"
                >
                  Uitloggen
                </button>
              ) : (
                <Link
                  href="/login"
                  className="inline-flex md:hidden items-center px-4 py-2.5 rounded-full border border-emerald-200 bg-white text-gray-900 hover:bg-emerald-50 text-sm font-semibold transition"
                >
                  Inloggen
                </Link>
              )}
              
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
    </header>
  )
}



