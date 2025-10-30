'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { HeaderBrand } from './HeaderBrand'

export function SmartLogoLink() {
  const pathname = usePathname()
  const [homeHref, setHomeHref] = useState('/')
  
  useEffect(() => {
    const updateHref = () => {
      if (pathname?.startsWith('/nl')) {
        setHomeHref('/nl')
        if (typeof window !== 'undefined') {
          localStorage.setItem('userCountry', 'NL')
        }
      } else if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('userCountry')
        setHomeHref(saved === 'NL' ? '/nl' : '/')
      }
    }
    
    updateHref()
    
    // Listen for country changes
    const handleCountryChange = (e: any) => {
      setHomeHref(e.detail === 'NL' ? '/nl' : '/')
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('countryChanged', handleCountryChange)
      return () => window.removeEventListener('countryChanged', handleCountryChange)
    }
  }, [pathname])
  
  return (
    <Link href={homeHref} className="flex items-center hover:opacity-95 transition-all duration-300 select-none transform hover:scale-105">
      <HeaderBrand />
    </Link>
  )
}




