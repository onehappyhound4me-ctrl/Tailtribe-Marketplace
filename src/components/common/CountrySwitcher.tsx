'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createPortal } from 'react-dom'

export function CountrySwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, right: 0 })
  
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

  // Update dropdown position when opened
  useEffect(() => {
    if (isOpen && buttonRef.current && typeof window !== 'undefined') {
      const rect = buttonRef.current.getBoundingClientRect()
      setDropdownPosition({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right + window.scrollX
      })
    }
  }, [isOpen])

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

  // Prevent hydration mismatch
  if (!mounted) {
    const tempCountry = pathname?.startsWith('/nl') ? 'NL' : 'BE'
    const current = tempCountry === 'NL' ? { code: 'NL', flag: '🇳🇱', name: 'Nederland' } : { code: 'BE', flag: '🇧🇪', name: 'België' }
    
    return (
      <div className="relative">
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

  // Dropdown content to be rendered in portal
  const dropdownContent = isOpen && typeof window !== 'undefined' ? (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 z-[99998]" 
        onClick={() => setIsOpen(false)}
        style={{ backgroundColor: 'transparent' }}
      />
      
      {/* Dropdown - rendered in portal outside header */}
      <div 
        className="fixed bg-white rounded-xl shadow-2xl border-2 border-gray-300 z-[99999] min-w-[220px]"
        style={{
          top: `${dropdownPosition.top}px`,
          right: `${dropdownPosition.right}px`,
          position: 'fixed'
        }}
      >
            {countries.map((country) => (
              <button
                key={country.code}
                onClick={(e) => {
                  e.stopPropagation()
                  handleSwitchCountry(country.code as 'BE' | 'NL')
                }}
                className={`w-full flex items-center gap-3 px-5 py-4 text-gray-900 hover:text-green-700 hover:bg-green-50 transition-colors duration-150 ${
                  country.code === 'BE' ? 'border-b border-gray-200' : ''
                } ${
                  currentCountry === country.code ? 'bg-green-50 text-green-700 font-bold' : 'bg-white font-semibold'
                }`}
                style={{ minHeight: '56px' }}
              >
                <span className="text-2xl leading-none flex-shrink-0">{country.flag}</span>
                <span className="text-lg font-semibold flex-1 text-left tracking-wide">{country.name}</span>
                {currentCountry === country.code && (
                  <svg className="w-5 h-5 text-green-700 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                  </svg>
                )}
              </button>
            ))}
      </div>
    </>
  ) : null

  return (
    <>
      <div className="relative">
        <button
          ref={buttonRef}
          onClick={() => {
            setIsOpen(!isOpen)
          }}
          className="flex items-center gap-2 px-3 py-2 bg-white text-gray-700 hover:text-green-600 hover:border-green-300 rounded-lg font-medium transition-all duration-200 border border-gray-300 shadow-sm hover:shadow-md"
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
      </div>
      
      {/* Render dropdown in portal to body, outside header */}
      {typeof window !== 'undefined' && dropdownContent && createPortal(dropdownContent, document.body)}
    </>
  )
}
