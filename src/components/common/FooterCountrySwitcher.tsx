'use client'

import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'

export function FooterCountrySwitcher() {
  const router = useRouter()
  const pathname = usePathname()

  const handleSwitch = (country: 'BE' | 'NL', e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault()
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('userCountry', country)
      // Dispatch custom event to notify other components
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
  }

  return (
    <div className="flex items-center justify-center gap-4 mb-3">
      <Link 
        href="/be" 
        onClick={(e) => handleSwitch('BE', e)}
        className="flex items-center gap-2 hover:text-white transition-colors"
      >
        <span>🇧🇪</span>
        <span>België</span>
      </Link>
      <span className="opacity-40">•</span>
      <Link 
        href="/nl"
        onClick={(e) => handleSwitch('NL', e)}
        className="flex items-center gap-2 hover:text-white transition-colors"
      >
        <span>🇳🇱</span>
        <span>Nederland</span>
      </Link>
    </div>
  )
}

