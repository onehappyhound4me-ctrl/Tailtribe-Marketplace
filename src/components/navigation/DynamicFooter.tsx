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
          <h4 className="font-semibold text-white mb-1">Populaire steden</h4>
          <ul className="space-y-0.5 text-sm">
            <li className="h-5 bg-slate-700/50 rounded animate-pulse w-32"></li>
            <li className="h-5 bg-slate-700/50 rounded animate-pulse w-36"></li>
            <li className="h-5 bg-slate-700/50 rounded animate-pulse w-28"></li>
          </ul>
        </div>
        <div>
          <h4 className="font-semibold text-white mb-1">Diensten</h4>
          <ul className="space-y-0.5 text-sm">
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
          <h4 className="font-semibold text-white mb-1">Populaire steden</h4>
          <ul className="space-y-0.5 text-sm">
            <li><Link href="/nl/search?city=Amsterdam" prefetch={false} className="text-slate-300 hover:text-white">Amsterdam</Link></li>
            <li><Link href="/nl/search?city=Rotterdam" prefetch={false} className="text-slate-300 hover:text-white">Rotterdam</Link></li>
            <li><Link href="/nl/search?city=Utrecht" prefetch={false} className="text-slate-300 hover:text-white">Utrecht</Link></li>
            <li><Link href="/nl/search?city=Den+Haag" prefetch={false} className="text-slate-300 hover:text-white">Den Haag</Link></li>
            <li><Link href="/nl/search" prefetch={false} className="text-slate-200 hover:text-white font-medium">Alle steden →</Link></li>
          </ul>
        </div>
        
        <div>
          <h4 className="font-semibold text-white mb-1">Diensten</h4>
          <ul className="space-y-0.5 text-sm">
            <li><Link href="/diensten" prefetch={false} className="text-slate-300 hover:text-white" onClick={() => typeof window !== 'undefined' && localStorage.setItem('userCountry', 'NL')}>Alle diensten</Link></li>
            <li><Link href="/diensten/hondenuitlaat" prefetch={false} className="text-slate-300 hover:text-white" onClick={() => typeof window !== 'undefined' && localStorage.setItem('userCountry', 'NL')}>Hondenuitlaat</Link></li>
            <li><Link href="/diensten/groepsuitlaat" prefetch={false} className="text-slate-300 hover:text-white" onClick={() => typeof window !== 'undefined' && localStorage.setItem('userCountry', 'NL')}>Groepsuitlaat</Link></li>
            <li><Link href="/diensten/hondentraining" prefetch={false} className="text-slate-300 hover:text-white" onClick={() => typeof window !== 'undefined' && localStorage.setItem('userCountry', 'NL')}>Hondentraining</Link></li>
            <li><Link href="/diensten/dierenoppas" prefetch={false} className="text-slate-300 hover:text-white" onClick={() => typeof window !== 'undefined' && localStorage.setItem('userCountry', 'NL')}>Dierenoppas</Link></li>
            <li><Link href="/diensten/dierenopvang" prefetch={false} className="text-slate-300 hover:text-white" onClick={() => typeof window !== 'undefined' && localStorage.setItem('userCountry', 'NL')}>Dierenopvang</Link></li>
            <li><Link href="/diensten/verzorging-aan-huis" prefetch={false} className="text-slate-300 hover:text-white" onClick={() => typeof window !== 'undefined' && localStorage.setItem('userCountry', 'NL')}>Verzorging aan huis</Link></li>
            <li><Link href="/diensten/begeleiding-events" prefetch={false} className="text-slate-300 hover:text-white" onClick={() => typeof window !== 'undefined' && localStorage.setItem('userCountry', 'NL')}>Begeleiding events</Link></li>
            <li><Link href="/diensten/transport-huisdieren" prefetch={false} className="text-slate-300 hover:text-white" onClick={() => typeof window !== 'undefined' && localStorage.setItem('userCountry', 'NL')}>Transport huisdieren</Link></li>
            <li><Link href="/diensten/verzorging-kleinvee" prefetch={false} className="text-slate-300 hover:text-white" onClick={() => typeof window !== 'undefined' && localStorage.setItem('userCountry', 'NL')}>Verzorging kleinvee</Link></li>
          </ul>
        </div>
      </>
    )
  }

  return (
    <>
      <div>
        <h4 className="font-semibold text-white mb-1">Populaire steden</h4>
        <ul className="space-y-0.5 text-sm">
          <li><Link href="/search?city=Antwerpen" prefetch={false} className="text-slate-300 hover:text-white">Antwerpen</Link></li>
          <li><Link href="/search?city=Gent" prefetch={false} className="text-slate-300 hover:text-white">Gent</Link></li>
          <li><Link href="/search?city=Brussel-Stad" prefetch={false} className="text-slate-300 hover:text-white">Brussel</Link></li>
          <li><Link href="/search?city=Leuven" prefetch={false} className="text-slate-300 hover:text-white">Leuven</Link></li>
          <li><Link href="/search" prefetch={false} className="text-slate-200 hover:text-white font-medium">Alle steden →</Link></li>
        </ul>
      </div>
      
      <div>
        <h4 className="font-semibold text-white mb-1">Diensten</h4>
        <ul className="space-y-0.5 text-sm">
          <li><Link href="/diensten" prefetch={false} className="text-slate-300 hover:text-white" onClick={() => typeof window !== 'undefined' && localStorage.setItem('userCountry', 'BE')}>Alle diensten</Link></li>
          <li><Link href="/diensten/hondenuitlaat" prefetch={false} className="text-slate-300 hover:text-white" onClick={() => typeof window !== 'undefined' && localStorage.setItem('userCountry', 'BE')}>Hondenuitlaat</Link></li>
          <li><Link href="/diensten/groepsuitlaat" prefetch={false} className="text-slate-300 hover:text-white" onClick={() => typeof window !== 'undefined' && localStorage.setItem('userCountry', 'BE')}>Groepsuitlaat</Link></li>
          <li><Link href="/diensten/hondentraining" prefetch={false} className="text-slate-300 hover:text-white" onClick={() => typeof window !== 'undefined' && localStorage.setItem('userCountry', 'BE')}>Hondentraining</Link></li>
          <li><Link href="/diensten/dierenoppas" prefetch={false} className="text-slate-300 hover:text-white" onClick={() => typeof window !== 'undefined' && localStorage.setItem('userCountry', 'BE')}>Dierenoppas</Link></li>
          <li><Link href="/diensten/dierenopvang" prefetch={false} className="text-slate-300 hover:text-white" onClick={() => typeof window !== 'undefined' && localStorage.setItem('userCountry', 'BE')}>Dierenopvang</Link></li>
          <li><Link href="/diensten/verzorging-aan-huis" prefetch={false} className="text-slate-300 hover:text-white" onClick={() => typeof window !== 'undefined' && localStorage.setItem('userCountry', 'BE')}>Verzorging aan huis</Link></li>
          <li><Link href="/diensten/begeleiding-events" prefetch={false} className="text-slate-300 hover:text-white" onClick={() => typeof window !== 'undefined' && localStorage.setItem('userCountry', 'BE')}>Begeleiding events</Link></li>
          <li><Link href="/diensten/transport-huisdieren" prefetch={false} className="text-slate-300 hover:text-white" onClick={() => typeof window !== 'undefined' && localStorage.setItem('userCountry', 'BE')}>Transport huisdieren</Link></li>
          <li><Link href="/diensten/verzorging-kleinvee" prefetch={false} className="text-slate-300 hover:text-white" onClick={() => typeof window !== 'undefined' && localStorage.setItem('userCountry', 'BE')}>Verzorging kleinvee</Link></li>
        </ul>
      </div>
    </>
  )
}

