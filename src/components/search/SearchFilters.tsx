'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SearchFiltersProps {
  onFiltersChange?: (filters: SearchFilters) => void
}

export interface SearchFilters {
  city: string
  service: string
  availability: string
}

const cities = [
  'Antwerpen', 'Gent', 'Brussel-Stad', 'Leuven', 'Brugge', 'Hasselt',
  'Charleroi', 'Liège', 'Namur', 'Mons', 'Mechelen', 'Aalst'
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
  
  const [filters, setFilters] = useState<SearchFilters>({
    city: searchParams.get('city') || '',
    service: searchParams.get('service') || '',
    availability: searchParams.get('availability') || ''
  })
  
  // Detect if user is on NL site
  useEffect(() => {
    if (pathname?.startsWith('/nl')) {
      setSearchPath('/nl/search')
    } else if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userCountry')
      setSearchPath(saved === 'NL' ? '/nl/search' : '/search')
    }
  }, [pathname])

  // Advanced filters removed for simplicity

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    
    // Update URL params
    const params = new URLSearchParams()
    Object.entries(updatedFilters).forEach(([key, value]) => {
      if (value) params.set(key, value)
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
    <Card className="gradient-card professional-shadow border border-green-100/50">
      <CardContent className="p-6">
        {/* Quick Search Bar removed */}

        {/* Basic Filters */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Stad
            </label>
            <select
              value={filters.city}
              onChange={(e) => updateFilters({ city: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
            >
              <option value="">Alle steden</option>
              {cities.map(city => (
                <option key={city} value={city}>{city}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Service
            </label>
            <select
              value={filters.service}
              onChange={(e) => updateFilters({ service: e.target.value })}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500 bg-white"
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
              className="text-gray-600 border-gray-300 hover:bg-gray-50"
            >
              Wis filters
            </Button>
          )}
        </div>

        {/* Advanced filters removed */}

        {/* Active Filters Display */}
        {hasActiveFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium text-gray-600">Actieve filters:</span>
              {Object.entries(filters).map(([key, value]) => {
                if (!value) return null
                
                let label = value
                if (key === 'service') {
                  label = services.find(s => s.value === value)?.label || value
                }
                
                return (
                  <span
                    key={key}
                    className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                  >
                    {label}
                    <button
                      onClick={() => updateFilters({ [key]: '' })}
                      className="ml-1 hover:text-green-900"
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
