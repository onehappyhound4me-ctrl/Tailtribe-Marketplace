'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getCurrentCountry } from '@/lib/utils'
import { serviceCodeToSlugFn, serviceSlugToCodeFn } from '@/lib/service-slugs'

interface SearchFiltersProps {
  onFiltersChange?: (filters: SearchFilters) => void
}

export interface SearchFilters {
  city: string
  service: string
  availability: string
}

const belgianCities = [
  'Antwerpen', 'Gent', 'Brussel-Stad', 'Leuven', 'Brugge', 'Hasselt',
  'Charleroi', 'Liège', 'Namur', 'Mons', 'Mechelen', 'Aalst'
]

const dutchCities = [
  'Amsterdam', 'Rotterdam', 'Utrecht', 'Den Haag', 'Eindhoven', 'Groningen',
  'Tilburg', 'Almere', 'Breda', 'Nijmegen', 'Haarlem', 'Maastricht'
]

const services = [
  { value: 'DOG_WALKING', label: 'Hondenuitlaat' },
  { value: 'GROUP_DOG_WALKING', label: 'Groepsuitlaat' },
  { value: 'DOG_TRAINING', label: 'Hondentraining' },
  { value: 'PET_SITTING', label: 'Dierenoppas' },
  { value: 'PET_BOARDING', label: 'Dierenopvang' },
  { value: 'HOME_CARE', label: 'Verzorging aan huis' },
  { value: 'PET_TRANSPORT', label: 'Transport huisdieren' },
  { value: 'SMALL_ANIMAL_CARE', label: 'Verzorging kleinvee' },
  { value: 'EVENT_COMPANION', label: 'Begeleiding events' }
]

export function SearchFilters({ onFiltersChange }: SearchFiltersProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [searchPath, setSearchPath] = useState('/search')
  const [currentCountry, setCurrentCountry] = useState<'BE' | 'NL'>('BE')
  
  // Convert URL slug to service code for internal use
  const serviceParam = searchParams.get('service') || ''
  const serviceCode = serviceParam ? serviceSlugToCodeFn(serviceParam) : ''
  
  const [filters, setFilters] = useState<SearchFilters>({
    city: searchParams.get('city') || '',
    service: serviceCode, // Store as code internally
    availability: searchParams.get('availability') || ''
  })
  
  // Detect country from hostname or pathname
  useEffect(() => {
    const detectCountry = (): 'BE' | 'NL' => {
      if (typeof window !== 'undefined') {
        const hostname = window.location.hostname
        if (hostname.includes('tailtribe.nl') || hostname === 'tailtribe.nl') {
          return 'NL'
        }
        if (hostname.includes('tailtribe.be') || hostname === 'tailtribe.be') {
          return 'BE'
        }
      }
      return pathname?.startsWith('/nl') ? 'NL' : 'BE'
    }
    
    const country = detectCountry()
    setCurrentCountry(country)
    
    if (pathname?.startsWith('/nl')) {
      setSearchPath('/nl/search')
    } else if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userCountry')
      setSearchPath(saved === 'NL' ? '/nl/search' : '/search')
    }
    
    // Listen for country changes
    const handleCountryChange = (e: any) => {
      const newCountry = e.detail as 'BE' | 'NL'
      setCurrentCountry(newCountry)
      setSearchPath(newCountry === 'NL' ? '/nl/search' : '/search')
    }
    
    if (typeof window !== 'undefined') {
      window.addEventListener('countryChanged', handleCountryChange)
      return () => window.removeEventListener('countryChanged', handleCountryChange)
    }
  }, [pathname])
  
  const cities = currentCountry === 'NL' ? dutchCities : belgianCities

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    
    // Update URL params - convert service code to Dutch slug for URL
    const params = new URLSearchParams()
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value) {
        if (key === 'service') {
          // Convert service code to Dutch slug for URL
          const slug = serviceCodeToSlugFn(value)
          params.set(key, slug)
        } else {
          params.set(key, value)
        }
      }
    })
    
    router.push(`${searchPath}?${params.toString()}`)
    onFiltersChange?.(updatedFilters)
  }

  const clearFilters = () => {
    const clearedFilters: SearchFilters = {
      city: '',
      service: '',
      availability: ''
    }
    setFilters(clearedFilters)
    router.push(searchPath)
    onFiltersChange?.(clearedFilters)
  }

  const hasActiveFilters = Object.values(filters).some(value => value !== '')

  return (
    <Card className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
      <CardContent className="p-6 md:p-8">
        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              {currentCountry === 'NL' ? 'Stad in Nederland' : 'Stad in België'}
            </label>
            <select
              value={filters.city}
              onChange={(e) => updateFilters({ city: e.target.value })}
              className="w-full p-3.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 font-medium transition-all hover:border-gray-300"
            >
              <option value="">Alle steden</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-800 mb-3">
              Service
            </label>
            <select
              value={filters.service}
              onChange={(e) => updateFilters({ service: e.target.value })}
              className="w-full p-3.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 font-medium transition-all hover:border-gray-300"
            >
              <option value="">Alle services</option>
              {services.map(service => (
                <option key={service.value} value={service.value}>
                  {service.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Clear Filters */}
        <div className="flex items-center justify-end">
          {hasActiveFilters && (
            <Button
              type="button"
              variant="outline"
              onClick={clearFilters}
              className="text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 font-medium px-4 py-2"
            >
              Wis filters
            </Button>
          )}
        </div>

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-6 pt-6 border-t border-gray-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-semibold text-gray-700">Actieve filters:</span>
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null
                
                let label = value
                if (key === 'service') {
                  label = services.find(s => s.value === value)?.label || value
                }
                
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-emerald-100 text-emerald-800 rounded-full text-sm font-semibold border border-emerald-200"
                  >
                    {label}
                    <button
                      onClick={() => updateFilters({ [key]: '' })}
                      className="ml-0.5 hover:text-emerald-900 font-bold"
                      aria-label={`Verwijder ${label} filter`}
                    >
                      ×
                    </button>
                  </span>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
