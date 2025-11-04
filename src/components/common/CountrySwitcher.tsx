'use client'

import { useState, useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'

export function CountrySwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  
  // Initialize from pathname only (server-safe)
  const [currentCountry, setCurrentCountry] = useState<'BE' | 'NL'>(() => {
    return pathname?.startsWith('/nl') ? 'NL' : 'BE'
  })

  useEffect(() => {
    setMounted(true)
    
    // Sync with localStorage and URL
    const saved = localStorage.getItem('userCountry') as 'BE' | 'NL' | null
    if (saved) {
      setCurrentCountry(saved)
    } else {
      const country = pathname?.startsWith('/nl') ? 'NL' : 'BE'
      setCurrentCountry(country)
    }
  }, [pathname])
  
  // Prevent hydration mismatch
  if (!mounted) {
    const tempCountry = pathname?.startsWith('/nl') ? 'NL' : 'BE'
    const current = tempCountry === 'NL' ? { code: 'NL', flag: '🇳🇱', name: 'Nederland' } : { code: 'BE', flag: '🇧🇪', name: 'België' }
    
    return (
      <div className="relative group">
        <button
          disabled
          className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 rounded-lg font-medium border border-gray-300 shadow-sm"
        >
          <span className="text-xl leading-none">{current.flag}</span>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
          </svg>
        </button>
      </div>
    )
  }

  const handleSwitchCountry = (country: 'BE' | 'NL') => {
    // Save to localStorage
    localStorage.setItem('userCountry', country)
    setCurrentCountry(country)
    setIsOpen(false)
    
    // Dispatch custom event to notify other components
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('countryChanged', { detail: country }))
    }
    
    // Smart redirect: maintain the current page type
    let targetPath = '/'
    
    if (pathname?.includes('/search')) {
      // If on search page, go to search page of other country
      targetPath = country === 'NL' ? '/nl/search' : '/search'
      // Preserve query params
      if (typeof window !== 'undefined') {
        const searchParams = new URLSearchParams(window.location.search)
        if (searchParams.toString()) {
          targetPath += '?' + searchParams.toString()
        }
      }
    } else if (pathname?.startsWith('/nl')) {
      // If on NL site, switch to BE
      targetPath = country === 'BE' ? '/' : '/nl'
    } else {
      // If on BE site, switch to NL
      targetPath = country === 'NL' ? '/nl' : '/'
    }
    
    router.push(targetPath)
    router.refresh()
  }

  const countries = [
    { code: 'BE', flag: '🇧🇪', name: 'België' },
    { code: 'NL', flag: '🇳🇱', name: 'Nederland' }
  ]

  const current = countries.find(c => c.code === currentCountry) || countries[0]

  return (
    <div className="relative group z-50">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 hover:text-green-600 hover:border-green-300 rounded-lg font-medium transition-all duration-200 border border-gray-300 shadow-sm hover:shadow-md relative z-50"
      >
        <span className="text-xl leading-none">{current.flag}</span>
        <svg 
          className={`w-4 h-4 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Overlay */}
          <div 
            className="fixed inset-0 z-[45]" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute top-full mt-2 right-0 bg-white rounded-xl shadow-2xl border-2 border-gray-200 overflow-visible z-[60] min-w-[200px] py-2">
            {countries.map((country) => (
              <button
                key={country.code}
                onClick={() => handleSwitchCountry(country.code as 'BE' | 'NL')}
                className={`w-full flex items-center gap-3 px-4 py-3 text-gray-900 hover:text-green-700 hover:bg-green-50 transition-colors duration-150 relative z-[61] ${
                  currentCountry === country.code ? 'bg-green-50 text-green-700 font-bold' : 'bg-white font-semibold'
                }`}
              >
                <span className="text-xl leading-none flex-shrink-0">{country.flag}</span>
                <span className="text-base font-semibold flex-1 text-left whitespace-nowrap">{country.name}</span>
                {currentCountry === country.code && (
                  <svg className="w-5 h-5 text-green-700 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  )
}




