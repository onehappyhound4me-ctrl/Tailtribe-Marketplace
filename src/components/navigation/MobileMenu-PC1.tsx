'use client'

import { useState, useEffect } from 'react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { useSession } from 'next-auth/react'

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const pathname = usePathname()
  const { data: session } = useSession()
  const [searchHref, setSearchHref] = useState('/search')
  
  useEffect(() => {
    // Detect if user is on NL site
    if (pathname?.startsWith('/nl')) {
      setSearchHref('/nl/search')
      if (typeof window !== 'undefined') {
        localStorage.setItem('userCountry', 'NL')
      }
    } else if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userCountry')
      setSearchHref(saved === 'NL' ? '/nl/search' : '/search')
    }
    
    // Listen for country changes
    const handleCountryChange = (e: any) => {
      setSearchHref(e.detail === 'NL' ? '/nl/search' : '/search')
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('countryChanged', handleCountryChange)
      return () => window.removeEventListener('countryChanged', handleCountryChange)
    }
  }, [pathname])

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="p-2 rounded-lg hover:bg-green-50 transition-colors"
        aria-label="Toggle menu"
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <span className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1' : ''}`} />
          <span className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 mt-1 ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 mt-1 ${isOpen ? '-rotate-45 -translate-y-1' : ''}`} />
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-50" onClick={closeMenu}>
          <div className="fixed right-0 top-0 h-full w-80 bg-white shadow-xl transform transition-transform duration-300">
            <div className="p-6">
              {/* Close Button */}
              <div className="flex justify-end mb-8">
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Close menu"
                >
                  <span className="block w-6 h-6 text-gray-600 text-xl">×</span>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-6">
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="block text-lg font-medium text-gray-900 hover:text-green-600 transition-colors py-2"
                >
                  🏠 Home
                </Link>
                <Link
                  href={searchHref}
                  onClick={closeMenu}
                  className="block text-lg font-medium text-gray-900 hover:text-green-600 transition-colors py-2"
                >
                  🔍 Zoek dierenverzorgers
                </Link>
                <Link
                  href="/be"
                  onClick={closeMenu}
                  className="block text-lg font-medium text-gray-900 hover:text-green-600 transition-colors py-2"
                >
                  📍 Locaties
                </Link>
                {/* Only show Dashboard if already on dashboard page */}
                {session && pathname?.startsWith('/dashboard') && (
                  <Link
                    href="/dashboard"
                    onClick={closeMenu}
                    className="block text-lg font-medium text-gray-900 hover:text-green-600 transition-colors py-2"
                  >
                    📊 Dashboard
                  </Link>
                )}
                
                <div className="border-t border-gray-200 pt-6">
                  <Link
                    href="/auth/signin"
                    onClick={closeMenu}
                    className="block w-full"
                  >
                    <Button variant="outline" className="w-full mb-3 border-green-200 text-green-700 hover:bg-green-50">
                      Inloggen
                    </Button>
                  </Link>
                  <Link
                    href="/auth/register"
                    onClick={closeMenu}
                    className="block w-full"
                  >
                    <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                      Word verzorger
                    </Button>
                  </Link>
                </div>

                {/* Quick Actions */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                    Populaire services
                  </h3>
                  <div className="space-y-3">
                    <Link
                      href={`${searchHref}?service=DOG_WALKING`}
                      onClick={closeMenu}
                      className="block text-gray-700 hover:text-green-600 transition-colors"
                    >
                      🚶 Hondenuitlaat
                    </Link>
                    <Link
                      href={`${searchHref}?service=PET_SITTING`}
                      onClick={closeMenu}
                      className="block text-gray-700 hover:text-green-600 transition-colors"
                    >
                      🏠 Dierenoppas
                    </Link>
                    <Link
                      href={`${searchHref}?service=TRAINING`}
                      onClick={closeMenu}
                      className="block text-gray-700 hover:text-green-600 transition-colors"
                    >
                      🎓 Training
                    </Link>
                  </div>
                </div>

                {/* Contact Info */}
                <div className="border-t border-gray-200 pt-6">
                  <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-4">
                    Contact
                  </h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div>📧 steven@tailtribe.be</div>
                    <div>📞 +32 2 123 45 67</div>
                    <div>🕒 Ma-Vr: 9:00-18:00</div>
                  </div>
                </div>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}









