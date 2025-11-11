'use client'

import { useSession } from 'next-auth/react'
import { usePathname } from 'next/navigation'
import { useState, useEffect } from 'react'
import Link from 'next/link'

export function HeaderNav() {
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

  return (
    <div className="hidden md:flex items-center gap-3">
      <Link href={pathname?.startsWith('/nl') ? '/nl/about' : '/about'} prefetch={false} className="px-5 py-2.5 text-base font-semibold text-gray-700 hover:text-emerald-400 transition-colors duration-200 relative group">
        <span className="relative z-10 flex items-center gap-2">
          <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <span className="group-hover:text-emerald-400 transition-colors duration-200">Over ons</span>
        </span>
      </Link>
      {/* Only show "Zoek dierenverzorgers" for owners or logged out users */}
      {(!session || session.user.role === 'OWNER') && (
        <Link href={searchHref} prefetch={false} className="px-5 py-2.5 text-base font-semibold text-gray-700 hover:text-emerald-400 transition-colors duration-200 relative group">
          <span className="relative z-10 flex items-center gap-2">
            <svg className="w-4 h-4 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <span className="group-hover:text-emerald-400 transition-colors duration-200">Zoek dierenverzorgers</span>
          </span>
        </Link>
      )}
      
      {status === 'loading' ? (
        // Don't show anything while loading to prevent flash
        null
      ) : session ? (
        <>
          {/* Only show Dashboard if on dashboard page itself, hide everywhere else until onboarding complete */}
          {pathname?.startsWith('/dashboard') && (
            <Link 
              href={session.user.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner'} 
              prefetch={false} 
              className="px-5 py-2.5 text-base font-semibold text-gray-700 hover:text-emerald-400 transition-colors duration-200 relative group"
            >
              <span className="relative z-10 flex items-center gap-2">
                <svg className="w-4 h-4 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                <span className="group-hover:text-emerald-400 transition-colors duration-200">Dashboard</span>
              </span>
            </Link>
          )}
          <Link href="/auth/signout" className="ml-2 px-6 py-2.5 text-base font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border border-emerald-500/30 hover:border-emerald-400/50 transform hover:-translate-y-1 hover:scale-105">
            Uitloggen
          </Link>
        </>
      ) : (
        <Link href="/auth/signin" prefetch={false} className="ml-2 px-6 py-2.5 text-base font-bold text-white bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl border border-emerald-500/30 hover:border-emerald-400/50 transform hover:-translate-y-1 hover:scale-105">
          Inloggen
        </Link>
      )}
    </div>
  )
}

