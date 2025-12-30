'use client'

import Link from 'next/link'
import Image from 'next/image'

type Props = {
  primaryCtaHref?: string
  primaryCtaLabel?: string
}

export function SiteHeader({ primaryCtaHref = '/boeken', primaryCtaLabel = 'Boek Nu' }: Props) {
  return (
    <header className="bg-gradient-to-r from-blue-50/95 via-teal-50/85 to-emerald-100/80 backdrop-blur-lg shadow-md border-b border-emerald-200/50 sticky top-0 z-[999] relative overflow-visible">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_55%,rgba(255,255,255,0.34),transparent_62%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_52%,rgba(59,130,246,0.12),transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_50%,rgba(16,185,129,0.08),transparent_60%)]" />

      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 overflow-visible">
        <div className="flex items-center justify-between h-20 md:h-24 py-4">
          <Link
            href="/"
            className="flex items-center hover:opacity-95 transition-all duration-300 select-none transform hover:scale-105 no-underline ml-0 sm:ml-0 md:-ml-20 lg:-ml-32"
          >
            <div className="w-[240px] sm:w-[280px] md:w-[320px] lg:w-[350px] h-auto overflow-hidden relative">
              <Image
                src="/tailtribe_logo_masked_1751977129022.png"
                alt="TailTribe Logo"
                width={700}
                height={700}
                priority
                sizes="(max-width: 480px) 200px, (max-width: 768px) 240px, 350px"
                className="w-full h-auto object-contain scale-110 relative z-10 transition-transform duration-300 hover:scale-[1.12]"
                style={{
                  filter:
                    'drop-shadow(0 6px 12px rgba(0,0,0,0.15)) brightness(1.15) contrast(1.15) saturate(1.1)',
                }}
              />
            </div>
          </Link>

          <div className="flex items-center gap-4 md:gap-8">
            <Link
              href="/#services"
              className="hidden md:block text-gray-700 hover:text-green-700 font-medium transition"
            >
              Services
            </Link>
            <Link
              href={primaryCtaHref}
              className="bg-gradient-to-r from-green-600 to-blue-600 text-white px-6 py-2.5 rounded-full font-semibold hover:from-green-700 hover:to-blue-700 transition shadow-lg hover:shadow-xl"
            >
              {primaryCtaLabel}
            </Link>
          </div>
        </div>
      </nav>
    </header>
  )
}



