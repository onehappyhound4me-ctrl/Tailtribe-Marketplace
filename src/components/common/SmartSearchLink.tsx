'use client'

import { usePathname } from 'next/navigation'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ReactNode } from 'react'
import { slugToServiceCode } from '../../../lib/services'

interface SmartSearchLinkProps {
  service?: string // This can be either a slug (e.g., "hondenuitlaat") or code (e.g., "DOG_WALKING")
  children: ReactNode
  className?: string
}

export function SmartSearchLink({ service, children, className }: SmartSearchLinkProps) {
  const pathname = usePathname()
  const [country, setCountry] = useState<'BE' | 'NL'>('BE')
  
  useEffect(() => {
    const updateCountry = () => {
      // First check if we're on NL path
      if (pathname?.startsWith('/nl')) {
        setCountry('NL')
        if (typeof window !== 'undefined') {
          localStorage.setItem('userCountry', 'NL')
        }
      } 
      // Then check localStorage (for when on /diensten or other shared pages)
      else if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('userCountry') as 'BE' | 'NL' | null
        setCountry(saved || 'BE')
      }
    }
    
    updateCountry()
    
    // Listen for country changes
    const handleCountryChange = (e: any) => {
      setCountry(e.detail)
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('countryChanged', handleCountryChange)
      return () => window.removeEventListener('countryChanged', handleCountryChange)
    }
  }, [pathname])
  
  const baseHref = country === 'NL' ? '/nl/search' : '/search'
  
  // Convert slug to service code if needed (e.g., "hondenuitlaat" → "DOG_WALKING")
  let serviceCode = service
  if (service && slugToServiceCode[service]) {
    serviceCode = slugToServiceCode[service]
  }
  
  const href = serviceCode ? `${baseHref}?service=${serviceCode}` : baseHref
  
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}

