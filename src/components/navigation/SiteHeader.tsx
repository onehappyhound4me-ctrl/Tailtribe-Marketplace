'use client'

import { SmartLogoLink } from '@/components/brand/SmartLogoLink'
import { CountrySwitcher } from '@/components/common/CountrySwitcher'
import { HeaderNav } from '@/components/navigation/HeaderNav'
import { useNav } from '@/components/navigation/NavContext'

export function SiteHeader() {
  const { isMobileMenuOpen, toggleMobileMenu } = useNav()

  return (
    <header className="bg-gradient-to-r from-blue-50/95 via-teal-50/85 to-emerald-100/80 backdrop-blur-lg shadow-md border-b border-emerald-200/50 sticky top-0 z-[999] relative overflow-visible">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_55%,rgba(255,255,255,0.34),transparent_62%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_28%_52%,rgba(59,130,246,0.12),transparent_65%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_78%_50%,rgba(16,185,129,0.08),transparent_60%)]" />

      <nav className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10 overflow-visible">
        <div className="flex items-center justify-between h-20 md:h-24 py-4">
          <SmartLogoLink />

          <div className="flex items-center gap-4 md:gap-8">
            <HeaderNav />
            <div className="hidden md:block">
              <CountrySwitcher />
            </div>

            <button
              type="button"
              onClick={toggleMobileMenu}
              aria-label={isMobileMenuOpen ? 'Sluit menu' : 'Open navigatie'}
              aria-expanded={isMobileMenuOpen}
              className="p-2 rounded-lg hover:bg-green-50 transition-colors md:hidden"
            >
              <div className="w-6 h-6 flex flex-col justify-center items-center">
                <span
                  className={`block h-0.5 w-6 bg-gray-800 transition-all duration-300 ${
                    isMobileMenuOpen ? 'rotate-45 translate-y-1' : ''
                  }`}
                />
                <span
                  className={`block h-0.5 w-6 bg-gray-800 transition-all duration-300 mt-1 ${
                    isMobileMenuOpen ? 'opacity-0' : ''
                  }`}
                />
                <span
                  className={`block h-0.5 w-6 bg-gray-800 transition-all duration-300 mt-1 ${
                    isMobileMenuOpen ? '-rotate-45 -translate-y-1' : ''
                  }`}
                />
              </div>
            </button>
          </div>
        </div>
      </nav>
    </header>
  )
}

