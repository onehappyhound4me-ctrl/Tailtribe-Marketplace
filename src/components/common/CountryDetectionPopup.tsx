'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export function CountryDetectionPopup() {
  const [isOpen, setIsOpen] = useState(false)
  const router = useRouter()

  useEffect(() => {
    // Check if user has already selected country
    const savedCountry = localStorage.getItem('userCountry')
    const countryPopupShown = localStorage.getItem('countryPopupShown')
    
    // Check current URL/pathname to see if user is already on a country-specific page
    const pathname = window.location.pathname
    const isOnCountryPage = pathname.startsWith('/nl') || pathname.startsWith('/be')
    const hostname = window.location.hostname
    const isOnCountryDomain = hostname.includes('tailtribe.nl') || hostname.includes('tailtribe.be')
    
    // Don't show popup if:
    // 1. Already shown before
    // 2. User is already on a country-specific page
    // 3. User is on a country-specific domain
    if (countryPopupShown || isOnCountryPage || isOnCountryDomain) {
      return
    }
    
    // Only show popup if not shown before AND user is on homepage
    if (!countryPopupShown && (pathname === '/' || pathname === '')) {
      // Detect country from IP (simplified - in production use proper API)
      detectCountryFromIP().then(detectedCountry => {
        // Auto-save if confident, otherwise show popup
        if (detectedCountry) {
          localStorage.setItem('userCountry', detectedCountry)
          localStorage.setItem('countryPopupShown', 'true')
        } else {
          // Show popup after 1 second delay
          setTimeout(() => setIsOpen(true), 1000)
        }
      })
    }
  }, [])

  const handleSelectCountry = (country: 'BE' | 'NL') => {
    // Save to localStorage
    localStorage.setItem('userCountry', country)
    localStorage.setItem('countryPopupShown', 'true')
    
    // Close popup
    setIsOpen(false)
    
    // Redirect to country-specific homepage
    if (country === 'NL') {
      router.push('/nl')
    } else {
      router.push('/be')
    }
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 animate-fadeIn" />
      
      {/* Popup */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8 animate-slideUp">
          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          {/* Title */}
          <h2 className="text-2xl font-bold text-center text-gray-900 mb-3">
            Waar woon je?
          </h2>
          <p className="text-center text-gray-600 mb-8">
            Kies je land om de beste dierenoppassers bij jou in de buurt te vinden
          </p>

          {/* Country Buttons */}
          <div className="space-y-3">
            <button
              onClick={() => handleSelectCountry('BE')}
              className="group w-full flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl hover:border-emerald-500 hover:bg-emerald-50 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">🇧🇪</span>
                <div className="text-left">
                  <p className="font-bold text-gray-900 text-lg">België</p>
                  <p className="text-sm text-gray-600">Antwerpen, Brussel, Gent...</p>
                </div>
              </div>
              <svg className="w-6 h-6 text-gray-400 group-hover:text-emerald-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>

            <button
              onClick={() => handleSelectCountry('NL')}
              className="group w-full flex items-center justify-between p-5 border-2 border-gray-200 rounded-xl hover:border-orange-500 hover:bg-orange-50 transition-all duration-200"
            >
              <div className="flex items-center gap-4">
                <span className="text-4xl">🇳🇱</span>
                <div className="text-left">
                  <p className="font-bold text-gray-900 text-lg">Nederland</p>
                  <p className="text-sm text-gray-600">Amsterdam, Rotterdam, Utrecht...</p>
                </div>
              </div>
              <svg className="w-6 h-6 text-gray-400 group-hover:text-orange-600 group-hover:translate-x-1 transition-all" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>

          {/* Skip */}
          <button
            onClick={() => {
              localStorage.setItem('countryPopupShown', 'true')
              setIsOpen(false)
            }}
            className="w-full mt-4 text-sm text-gray-500 hover:text-gray-700 transition-colors"
          >
            Later kiezen
          </button>
        </div>
      </div>
    </>
  )
}

async function detectCountryFromIP(): Promise<'BE' | 'NL' | null> {
  try {
    // Use ipapi.co for free IP geolocation
    const res = await fetch('https://ipapi.co/json/')
    const data = await res.json()
    
    if (data.country_code === 'BE') return 'BE'
    if (data.country_code === 'NL') return 'NL'
    
    return null
  } catch {
    return null
  }
}




