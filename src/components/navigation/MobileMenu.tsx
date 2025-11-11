'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

// Trigger redeploy to refresh cached mobile menu assets

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
          <span className={`block h-0.5 w-6 bg-gray-800 transition-all duration-300 ${isOpen ? 'rotate-45 translate-y-1' : ''}`} />
          <span className={`block h-0.5 w-6 bg-gray-800 transition-all duration-300 mt-1 ${isOpen ? 'opacity-0' : ''}`} />
          <span className={`block h-0.5 w-6 bg-gray-800 transition-all duration-300 mt-1 ${isOpen ? '-rotate-45 -translate-y-1' : ''}`} />
        </div>
      </button>

      {/* Mobile Menu Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[9999]">
          <div
            className="absolute inset-0 bg-black/60"
            onClick={closeMenu}
            aria-hidden="true"
          />
          <aside
            role="dialog"
            aria-modal="true"
            data-overlay-version="v3"
            className="absolute inset-0 bg-white flex flex-col"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="px-6 pt-5 pb-4 flex items-center justify-between border-b border-gray-200">
              <span className="text-2xl font-semibold text-gray-900">Menu</span>
              <button
                onClick={closeMenu}
                className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
                aria-label="Sluit menu"
              >
                <span className="block w-6 h-6 text-gray-600 text-xl leading-none">×</span>
              </button>
            </div>
            <nav className="flex-1 overflow-y-auto px-6 py-6 space-y-6 text-left">
              <div className="space-y-3">
                <Link
                  href="/"
                  onClick={closeMenu}
                  className="flex items-center gap-3 text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors"
                >
                  <span className="text-xl">🏠</span>
                  <span>Home</span>
                </Link>
                {(!session || session.user.role === 'OWNER') && (
                  <Link
                    href={searchHref}
                    onClick={closeMenu}
                    className="flex items-center gap-3 text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors"
                  >
                    <span className="text-xl">🔍</span>
                    <span>Zoek dierenverzorgers</span>
                  </Link>
                )}
                <Link
                  href="/about"
                  onClick={closeMenu}
                  className="flex items-center gap-3 text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors"
                >
                  <span className="text-xl">ℹ️</span>
                  <span>Over ons</span>
                </Link>
                {session && pathname?.startsWith('/dashboard') && (
                  <Link
                    href={session.user.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner'}
                    onClick={closeMenu}
                    className="flex items-center gap-3 text-lg font-semibold text-gray-900 hover:text-green-600 transition-colors"
                  >
                    <span className="text-xl">📊</span>
                    <span>Dashboard</span>
                  </Link>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-4">
                <h3 className="text-sm uppercase font-semibold tracking-wide text-gray-500">Account</h3>
                {status === 'loading' ? null : session ? (
                  <Link href="/auth/signout" onClick={closeMenu} className="block">
                    <Button variant="outline" className="w-full border-red-200 text-red-700 hover:bg-red-50">
                      Uitloggen
                    </Button>
                  </Link>
                ) : (
                  <>
                    <Link href="/auth/signin" onClick={closeMenu} className="block">
                      <Button variant="outline" className="w-full border-green-200 text-green-700 hover:bg-green-50">
                        Inloggen
                      </Button>
                    </Link>
                    <Link href="/auth/register" onClick={closeMenu} className="block">
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white">
                        Word dierenoppasser
                      </Button>
                    </Link>
                  </>
                )}
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-4">
                <h3 className="text-sm uppercase font-semibold tracking-wide text-gray-500">Populaire services</h3>
                <div className="space-y-3">
                  <Link
                    href={`${searchHref}?service=DOG_WALKING`}
                    onClick={closeMenu}
                    className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition-colors"
                  >
                    <span className="text-xl">🚶</span>
                    <span>Hondenuitlaat</span>
                  </Link>
                  <Link
                    href={`${searchHref}?service=PET_SITTING`}
                    onClick={closeMenu}
                    className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition-colors"
                  >
                    <span className="text-xl">🏠</span>
                    <span>Dierenoppas</span>
                  </Link>
                  <Link
                    href={`${searchHref}?service=DOG_TRAINING`}
                    onClick={closeMenu}
                    className="flex items-center gap-3 text-gray-700 hover:text-green-600 transition-colors"
                  >
                    <span className="text-xl">🎓</span>
                    <span>Hondentraining</span>
                  </Link>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6 space-y-3 pb-10">
                <h3 className="text-sm uppercase font-semibold tracking-wide text-gray-500">Contact</h3>
                <p className="text-sm text-gray-600">📧 info@tailtribe.be</p>
                <p className="text-sm text-gray-600">📞 +32 2 123 45 67</p>
                <p className="text-sm text-gray-600">🕒 Ma–Vr: 9:00-18:00</p>
              </div>
            </nav>
          </aside>
        </div>
      )}
    </div>
  )
}









