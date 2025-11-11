'use client'

import { useRouter, usePathname } from 'next/navigation'
import { switchCountryPath } from '@/lib/utils'

export function FooterCountrySwitcher() {
  const router = useRouter()
  const pathname = usePathname()

  const handleSwitch = (country: 'BE' | 'NL', e: React.MouseEvent<HTMLElement>) => {
    e.preventDefault()
    e.stopPropagation()
    
    // Save to localStorage
    if (typeof window !== 'undefined') {
      localStorage.setItem('userCountry', country)
      // Dispatch custom event to notify other components
      window.dispatchEvent(new CustomEvent('countryChanged', { detail: country }))
    }
    
    // Use utility function to get correct path
    const targetPath = switchCountryPath(pathname || '/', country)
    
    // Use window.location for hard navigation to ensure country switch works
    if (typeof window !== 'undefined') {
      window.location.href = targetPath
    } else {
      router.push(targetPath)
      router.refresh()
    }
  }

  const currentCountry = pathname?.startsWith('/nl') ? 'NL' : 'BE'

  return (
    <div className="flex items-center justify-center gap-4 mb-3">
      <button
        type="button"
        onClick={(e) => handleSwitch('BE', e)}
        className={`flex items-center gap-2 transition-colors cursor-pointer ${
          currentCountry === 'BE' 
            ? 'text-white font-semibold' 
            : 'text-slate-300 hover:text-white'
        }`}
      >
        <span>🇧🇪</span>
        <span>België</span>
      </button>
      <span className="opacity-40">•</span>
      <button
        type="button"
        onClick={(e) => handleSwitch('NL', e)}
        className={`flex items-center gap-2 transition-colors cursor-pointer ${
          currentCountry === 'NL' 
            ? 'text-white font-semibold' 
            : 'text-slate-300 hover:text-white'
        }`}
      >
        <span>🇳🇱</span>
        <span>Nederland</span>
      </button>
    </div>
  )
}

