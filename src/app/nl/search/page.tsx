'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CaregiverCard } from '@/components/search/CaregiverCard'
import nextDynamic from 'next/dynamic'

// Dynamisch importeren om SSR te voorkomen (map heeft window dependency)
const ModernMap = nextDynamic(() => import('@/components/search/ModernMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[400px] rounded-2xl bg-gray-100 flex items-center justify-center text-sm text-gray-500 border border-gray-200">
      Kaart laden...
    </div>
  ),
})

interface SearchParams {
  city?: string
  service?: string
  maxRate?: string
}

async function getCaregivers(searchParams: SearchParams) {
  const params = new URLSearchParams()
  params.set('country', 'NL') // ALWAYS filter for Netherlands
  if (searchParams.city) params.set('city', searchParams.city)
  if (searchParams.service) params.set('service', searchParams.service)
  if (searchParams.maxRate) params.set('maxRate', searchParams.maxRate)
  
  try {
    const res = await fetch(`/api/caregivers/search?${params.toString()}`, { cache: 'no-store' })
    const data = await res.json()
    return data.caregivers || []
  } catch (e) {
    console.error('Error fetching NL caregivers:', e)
    return []
  }
}

export const dynamic = 'force-dynamic'

export default function NetherlandsSearchPage() {
  const [caregivers, setCaregivers] = useState<any[]>([])
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null)
  const clientSearchParams = useSearchParams()
  const router = useRouter()
  const { data: session, status } = useSession()

  // Derive live filters from URL
  const liveCity = clientSearchParams?.get('city') || ''
  const liveService = clientSearchParams?.get('service') || ''
  const liveMaxRate = clientSearchParams?.get('maxRate') || ''
  
  console.log('🔍 NL Search filters:', { city: liveCity, service: liveService, maxRate: liveMaxRate })

  // Load caregivers on mount and when filters change
  useEffect(() => {
    let mounted = true
    setCaregivers([]) // Clear immediately to show loading state
    getCaregivers({ city: liveCity, service: liveService, maxRate: liveMaxRate }).then((data) => {
      if (mounted) {
        console.log('🇳🇱 NL caregivers loaded:', data.length)
        if (data.length > 0) {
          console.log('First caregiver:', data[0])
          console.log('Has coordinates?', data.some((c: any) => c.lat && c.lng))
          console.log('All have coordinates?', data.every((c: any) => c.lat && c.lng))
        }
        setCaregivers(data)
      }
    })
    return () => {
      mounted = false
    }
  }, [liveCity, liveService, liveMaxRate])

  const handleCaregiverSelect = (caregiver: any) => {
    setSelectedCaregiver(caregiver)
    const element = document.getElementById('caregiver-cards')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-md border-b border-gray-200">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                Dierenoppassers in Nederland
              </h1>
              <p className="text-gray-600 text-sm md:text-base">{caregivers.length} dierenoppassers gevonden</p>
            </div>
            {status === 'loading' ? (
              <div className="w-36 h-11 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
            ) : session ? (
              <Link href="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all duration-200 rounded-lg font-semibold shadow-md hover:shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </Link>
            ) : (
              <Link href="/auth/register" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all duration-200 rounded-lg font-semibold shadow-md hover:shadow-lg">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                Registreer
              </Link>
            )}
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12">
        <div className="max-w-7xl mx-auto">

          {/* NL-Specific Search Filters */}
          <div className="mb-6 md:mb-8">
            <Card className="bg-white rounded-xl shadow-md border border-gray-200 hover:shadow-lg transition-shadow">
              <CardContent className="p-6 md:p-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 mb-6">
                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Stad in Nederland
                    </label>
                    <select
                      value={liveCity}
                      onChange={(e) => {
                        const params = new URLSearchParams()
                        if (e.target.value) params.set('city', e.target.value)
                        if (liveService) params.set('service', liveService)
                        router.push(`/nl/search?${params.toString()}`)
                      }}
                      className="w-full p-3.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 font-medium transition-all hover:border-gray-300"
                    >
                      <option value="">Alle steden</option>
                      <option value="Amsterdam">Amsterdam</option>
                      <option value="Rotterdam">Rotterdam</option>
                      <option value="Utrecht">Utrecht</option>
                      <option value="Den Haag">Den Haag</option>
                      <option value="Eindhoven">Eindhoven</option>
                      <option value="Groningen">Groningen</option>
                      <option value="Tilburg">Tilburg</option>
                      <option value="Almere">Almere</option>
                      <option value="Breda">Breda</option>
                      <option value="Nijmegen">Nijmegen</option>
                      <option value="Haarlem">Haarlem</option>
                      <option value="Maastricht">Maastricht</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-800 mb-3">
                      Service
                    </label>
                    <select
                      value={liveService}
                      onChange={(e) => {
                        const params = new URLSearchParams()
                        if (liveCity) params.set('city', liveCity)
                        if (e.target.value) params.set('service', e.target.value)
                        router.push(`/nl/search?${params.toString()}`)
                      }}
                      className="w-full p-3.5 border-2 border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white text-gray-900 font-medium transition-all hover:border-gray-300"
                    >
                      <option value="">Alle services</option>
                      <option value="DOG_WALKING">Hondenuitlaat</option>
                      <option value="GROUP_DOG_WALKING">Groepsuitlaat</option>
                      <option value="DOG_TRAINING">Hondentraining</option>
                      <option value="PET_SITTING">Dierenoppas</option>
                      <option value="PET_BOARDING">Dierenopvang</option>
                      <option value="HOME_CARE">Verzorging aan huis</option>
                      <option value="PET_TRANSPORT">Transport huisdieren</option>
                      <option value="SMALL_ANIMAL_CARE">Verzorging kleinvee</option>
                      <option value="EVENT_COMPANION">Begeleiding events</option>
                    </select>
                  </div>
                </div>

                {/* Clear Filters */}
                {(liveCity || liveService) && (
                  <div className="flex justify-end">
                    <Button
                      variant="outline"
                      onClick={() => router.push('/nl/search')}
                      className="text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 font-medium px-4 py-2"
                    >
                      Wis filters
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Results */}
          {caregivers.length > 0 ? (
            <div className="space-y-10 md:space-y-12">
              {/* Map Section */}
              <div className="mb-8">
                <h2 className="font-heading text-xl font-semibold text-gray-900 mb-4">
                  Kaartweergave
                </h2>
                <ModernMap
                  caregivers={caregivers}
                  onCaregiverSelect={handleCaregiverSelect}
                  country="NL"
                />
              </div>

              {/* Caregiver Cards Section */}
              <div id="caregiver-cards" className="space-y-8">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
                  <h2 className="font-heading text-2xl md:text-3xl font-bold text-gray-900">
                    Alle dierenoppassers
                  </h2>
                  <div className="text-sm md:text-base text-gray-600 font-medium">
                    {caregivers.length} dierenoppassers gevonden
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {caregivers.map(caregiver => (
                    <CaregiverCard
                      key={caregiver.id}
                      caregiver={caregiver}
                      distance={Math.random() * 20 + 1}
                      onSelect={() => handleCaregiverSelect(caregiver)}
                    />
                  ))}
                </div>
              </div>
            </div>
          ) : (
            <Card className="bg-white rounded-xl shadow-lg border border-gray-200">
              <CardContent className="text-center py-12 md:py-16">
                <div className="text-6xl mb-6">🔍</div>
                <h3 className="font-heading text-xl md:text-2xl font-bold text-gray-900 mb-3">
                  Geen dierenoppassers gevonden in Nederland
                </h3>
                <p className="text-gray-600 mb-8 max-w-md mx-auto">
                  Probeer een andere stad of service te selecteren.
                </p>
                <Button variant="outline" asChild className="px-6 py-3">
                  <Link href="/nl/search">
                    Wis filters
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
