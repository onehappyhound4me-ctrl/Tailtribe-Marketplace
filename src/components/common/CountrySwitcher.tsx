'use client'

import { useState, useEffect, useRef } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import { createPortal } from 'react-dom'
import { switchCountryDomain } from '@/lib/utils'

export function CountrySwitcher() {
  const router = useRouter()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const buttonRef = useRef<HTMLButtonElement>(null)
  const [dropdownPosition, setDropdownPosition] = useState({ top: 0, left: 0 })
  
  // Initialize from hostname or pathname
  const getInitialCountry = (): 'BE' | 'NL' => {
    if (typeof window !== 'undefined') {
      const hostname = window.location.hostname
      if (hostname.includes('tailtribe.nl') || hostname === 'tailtribe.nl') return 'NL'
      if (hostname.includes('tailtribe.be') || hostname === 'tailtribe.be') return 'BE'
    }
    return pathname?.startsWith('/nl') ? 'NL' : 'BE'
  }
  
  const [currentCountry, setCurrentCountry] = useState<'BE' | 'NL'>(getInitialCountry)

  useEffect(() => {
    setMounted(true)
    
    // Sync with hostname, localStorage and URL
    const getCountryFromHostname = (): 'BE' | 'NL' => {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname
        if (hostname.includes('tailtribe.nl') || hostname === 'tailtribe.nl') return 'NL'
        if (hostname.includes('tailtribe.be') || hostname === 'tailtribe.be') return 'BE'
      }
      return pathname?.startsWith('/nl') ? 'NL' : 'BE'
    }
    
    const countryFromHostname = getCountryFromHostname()
    const saved = localStorage.getItem('userCountry') as 'BE' | 'NL' | null
    
    // Prioritize hostname over localStorage
    if (countryFromHostname) {
      setCurrentCountry(countryFromHostname)
      if (typeof window !== 'undefined') {
        localStorage.setItem('userCountry', countryFromHostname)
      }
    } else if (saved) {
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
      const scrollX = window.scrollX || window.pageXOffset || 0
      const scrollY = window.scrollY || window.pageYOffset || 0
      
      // Calculate position: align right edge of dropdown with right edge of button
      const dropdownWidth = 120 // min-w-[120px]
      let left = rect.right + scrollX - dropdownWidth
      
      // Ensure dropdown doesn't go off-screen on the left
      if (left < scrollX) {
        left = rect.left + scrollX
      }
      
      // Ensure dropdown doesn't go off-screen on the right
      const maxLeft = scrollX + window.innerWidth - dropdownWidth
      if (left > maxLeft) {
        left = maxLeft
      }
      
      setDropdownPosition({
        top: rect.bottom + scrollY + 8,
        left: left
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
    
    // Use utility function to get correct domain and path
    const targetUrl = switchCountryDomain(pathname || '/', country)
    
    // Use window.location for hard navigation to switch domains
    if (typeof window !== 'undefined') {
      window.location.href = targetUrl
    } else {
      router.push(targetUrl)
      router.refresh()
    }
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
        className="fixed bg-white rounded-xl shadow-2xl border-2 border-gray-200 z-[99999] min-w-[120px] overflow-hidden"
        style={{
          top: `${dropdownPosition.top}px`,
          left: `${dropdownPosition.left}px`,
          position: 'fixed'
        }}
      >
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleSwitchCountry('BE')
          }}
          className={`w-full flex items-center justify-between px-5 py-4 text-gray-900 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200 border-b border-gray-100 ${
            currentCountry === 'BE' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'bg-white font-semibold'
          }`}
          style={{ minHeight: '56px' }}
        >
          <span className="text-base font-bold tracking-wider">BE</span>
          {currentCountry === 'BE' && (
            <svg className="w-5 h-5 text-emerald-700 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation()
            handleSwitchCountry('NL')
          }}
          className={`w-full flex items-center justify-between px-5 py-4 text-gray-900 hover:text-emerald-700 hover:bg-emerald-50 transition-all duration-200 ${
            currentCountry === 'NL' ? 'bg-emerald-50 text-emerald-700 font-bold' : 'bg-white font-semibold'
          }`}
          style={{ minHeight: '56px' }}
        >
          <span className="text-base font-bold tracking-wider">NL</span>
          {currentCountry === 'NL' && (
            <svg className="w-5 h-5 text-emerald-700 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
            </svg>
          )}
        </button>
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
          className="flex items-center gap-2.5 px-4 py-2.5 bg-white text-gray-800 hover:text-emerald-600 hover:border-emerald-300 rounded-lg font-semibold transition-all duration-200 border border-gray-300 shadow-sm hover:shadow-md"
        >
          <span className="text-sm font-bold tracking-wider">
            {currentCountry}
          </span>
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
