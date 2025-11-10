'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false)
  const { data: session, status } = useSession()
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  
  // Initialize from pathname only (server-safe)
  const [searchHref, setSearchHref] = useState(() => {
    return pathname?.startsWith('/nl') ? '/nl/search' : '/search'
  })
  
  useEffect(() => {
    setMounted(true)
    
    // Sync with localStorage and URL
    const saved = localStorage.getItem('userCountry')
    if (saved === 'NL') {
      setSearchHref('/nl/search')
    } else {
      const country = pathname?.startsWith('/nl') ? 'NL' : 'BE'
      setSearchHref(country === 'NL' ? '/nl/search' : '/search')
    }
    
    // Listen for country changes
    const handleCountryChange = (e: any) => {
      setSearchHref(e.detail === 'NL' ? '/nl/search' : '/search')
    }
    
    window.addEventListener('countryChanged', handleCountryChange)
    return () => window.removeEventListener('countryChanged', handleCountryChange)
  }, [pathname])

  const toggleMenu = () => setIsOpen(!isOpen)
  const closeMenu = () => setIsOpen(false)

  return (
    <div className="md:hidden">
      {/* Hamburger Button */}
      <button
        onClick={toggleMenu}
        className="p-2 rounded-lg hover:bg-green-50 transition-colors"
        aria-label="Open navigatie"
        aria-expanded={isOpen}
      >
        <div className="w-6 h-6 flex flex-col justify-center items-center">
          <span className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1' : ''}`} />
          <span className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 mt-1 ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-gray-600 transition-all duration-300 mt-1 ${isOpen ? '-rotate-45 -translate-y-1' : ''}`} />
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/60" onClick={closeMenu} aria-hidden="true" />
          <aside
            role="dialog"
            aria-modal="true"
            className="relative ml-auto h-full w-full max-w-sm bg-white shadow-xl transform transition-transform duration-200 md:duration-300 overflow-y-auto"
          >
            <div className="px-6 pt-6 pb-12 sm:px-7">
              {/* Close Button */}
              <div className="flex justify-between items-center mb-6">
                <span className="text-lg font-semibold text-gray-900">Menu</span>
                <button
                  onClick={closeMenu}
                  className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  aria-label="Sluit menu"
                >
                  <span className="block w-6 h-6 text-gray-600 text-xl leading-none">×</span>
                </button>
              </div>

              {/* Navigation Links */}
              <nav className="space-y-6 pb-10">
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="block text-lg font-medium text-gray-900 hover:text-green-600 transition-colors py-2"
                >
                  🏠 Home
                </Link>
                {/* Only show "Zoek dierenverzorgers" for owners or logged out users */}
                {(!session || session.user.role === 'OWNER') && (
                  <Link
                    href={searchHref}
                    onClick={closeMenu}
                    className="block text-lg font-medium text-gray-900 hover:text-green-600 transition-colors py-2"
                  >
                    🔍 Zoek dierenverzorgers
                  </Link>
                )}
                <Link
                  href="/about"
                  onClick={closeMenu}
                  className="block text-lg font-medium text-gray-900 hover:text-green-600 transition-colors py-2"
                >
                  ℹ️ Over ons
                </Link>
                {/* Only show Dashboard if already on dashboard page */}
                {session && pathname?.startsWith('/dashboard') && (
                  <Link
                    href={session.user.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner'}
                    onClick={closeMenu}
                    className="block text-lg font-medium text-gray-900 hover:text-green-600 transition-colors py-2"
                  >
                    📊 Dashboard
                  </Link>
                )}
                
                <div className="border-t border-gray-200 pt-6">
                  {status === 'loading' ? (
                    // Don't show anything while loading to prevent flash
                    null
                  ) : session ? (
                    <Link
                      href="/auth/signout"
                      onClick={closeMenu}
                      className="block w-full"
                    >
                      <Button variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-50">
                        Uitloggen
                      </Button>
                    </Link>
                  ) : (
                    <>
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
                          Word dierenoppasser
                        </Button>
                      </Link>
                    </>
                  )}
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
                    <div>📧 info@tailtribe.be</div>
                    <div>📞 +32 2 123 45 67</div>
                    <div>🕒 Ma-Vr: 9:00-18:00</div>
                  </div>
                </div>
              </nav>
            </div>
          </aside>
        </div>
      )}
    </div>
  )
}









