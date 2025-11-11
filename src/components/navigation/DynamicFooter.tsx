'use client'

import { usePathname } from 'next/navigation'
import Link from 'next/link'
import { useEffect, useState } from 'react'

export function DynamicFooterLinks() {
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false)
  const [currentCountry, setCurrentCountry] = useState<'BE' | 'NL'>('BE')
  
  useEffect(() => {
    setMounted(true)
    
    // Determine country from pathname or localStorage
    const updateCountry = () => {
      if (pathname?.startsWith('/nl')) {
        setCurrentCountry('NL')
        if (typeof window !== 'undefined') {
          localStorage.setItem('userCountry', 'NL')
        }
      } else if (typeof window !== 'undefined') {
        const saved = localStorage.getItem('userCountry') as 'BE' | 'NL' | null
        setCurrentCountry(saved || 'BE')
      }
    }
    
    updateCountry()
    
    // Listen for country changes (when switched via header or footer)
    const handleCountryChange = (e: any) => {
      console.log('🔄 Footer detected country change:', e.detail)
      setCurrentCountry(e.detail)
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('countryChanged', handleCountryChange)
      return () => window.removeEventListener('countryChanged', handleCountryChange)
    }
  }, [pathname])
  
  // Prevent hydration mismatch
  if (!mounted) {
    return (
      <>
        <div>
          <h4 className="font-semibold text-white mb-2 md:mb-3 text-sm md:text-base">Populaire steden</h4>
          <ul className="space-y-1.5 md:space-y-2 text-sm">
            <li className="h-5 bg-slate-700/50 rounded animate-pulse w-32"></li>
            <li className="h-5 bg-slate-700/50 rounded animate-pulse w-36"></li>
            <li className="h-5 bg-slate-700/50 rounded animate-pulse w-28"></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-2 md:mb-3 text-sm md:text-base">Diensten</h4>
          <ul className="space-y-1.5 md:space-y-2 text-sm">
            <li className="h-5 bg-slate-700/50 rounded animate-pulse w-32"></li>
            <li className="h-5 bg-slate-700/50 rounded animate-pulse w-36"></li>
          </ul>
        </div>
      </>
    )
  }
  
  const isNL = currentCountry === 'NL'

  if (isNL) {
    return (
      <>
        <div>
          <h4 className="font-semibold text-white mb-2 md:mb-3 text-sm md:text-base">Populaire steden</h4>
          <ul className="space-y-1.5 md:space-y-2 text-sm">
            <li><Link href="/nl/search?city=Amsterdam" prefetch={false} className="text-slate-300 hover:text-white transition-colors">Amsterdam</Link></li>
            <li><Link href="/nl/search?city=Rotterdam" prefetch={false} className="text-slate-300 hover:text-white transition-colors">Rotterdam</Link></li>
            <li><Link href="/nl/search?city=Utrecht" prefetch={false} className="text-slate-300 hover:text-white transition-colors">Utrecht</Link></li>
            <li><Link href="/nl/search?city=Den+Haag" prefetch={false} className="text-slate-300 hover:text-white transition-colors">Den Haag</Link></li>
            <li><Link href="/nl/search" prefetch={false} className="text-emerald-300 hover:text-white font-medium transition-colors">Alle steden →</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-white mb-2 md:mb-3 text-sm md:text-base">Diensten</h4>
          <ul className="space-y-1.5 md:space-y-2 text-sm">
            <li><Link href="/nl/diensten" prefetch={false} className="text-emerald-300 hover:text-white font-medium transition-colors">Alle diensten →</Link></li>
          </ul>
        </div>
      </>
    )
  }

  return (
    <>
      <div>
        <h4 className="font-semibold text-white mb-2 md:mb-3 text-sm md:text-base">Populaire steden</h4>
        <ul className="space-y-1.5 md:space-y-2 text-sm">
          <li><Link href="/search?city=Antwerpen" prefetch={false} className="text-slate-300 hover:text-white transition-colors">Antwerpen</Link></li>
          <li><Link href="/search?city=Gent" prefetch={false} className="text-slate-300 hover:text-white transition-colors">Gent</Link></li>
          <li><Link href="/search?city=Brussel-Stad" prefetch={false} className="text-slate-300 hover:text-white transition-colors">Brussel</Link></li>
          <li><Link href="/search?city=Leuven" prefetch={false} className="text-slate-300 hover:text-white transition-colors">Leuven</Link></li>
          <li><Link href="/search" prefetch={false} className="text-emerald-300 hover:text-white font-medium transition-colors">Alle steden →</Link></li>
        </ul>
      </div>
      
      <div>
        <h4 className="font-semibold text-white mb-2 md:mb-3 text-sm md:text-base">Diensten</h4>
        <ul className="space-y-1.5 md:space-y-2 text-sm">
          <li><Link href="/diensten" prefetch={false} className="text-emerald-300 hover:text-white font-medium transition-colors">Alle diensten →</Link></li>
        </ul>
      </div>
    </>
  )
}

