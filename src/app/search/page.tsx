'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { SearchFilters } from '@/components/search/SearchFilters'
import { CaregiverCard } from '@/components/search/CaregiverCard'
import { SkeletonGrid } from '@/components/loading/SkeletonCard'
import { serviceLabels } from '@/lib/types'
import { serviceSlugToCodeFn } from '@/lib/service-slugs'
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
  query?: string
  caregiver?: string
  date?: string
}

interface Props {
  searchParams: SearchParams
}

async function getCaregivers(
  searchParams: SearchParams,
  userLocation?: { lat: number; lng: number }
) {
  const params = new URLSearchParams()
  if (searchParams.city) params.set('city', searchParams.city)
  // Convert Dutch slug to service code for API
  if (searchParams.service) {
    const serviceCode = serviceSlugToCodeFn(searchParams.service)
    params.set('service', serviceCode)
  }
  if (searchParams.maxRate) params.set('maxRate', searchParams.maxRate)
  if (userLocation) {
    params.set('userLat', userLocation.lat.toString())
    params.set('userLng', userLocation.lng.toString())
  }
  try {
    const res = await fetch(`/api/caregivers/search?${params.toString()}`, { cache: 'no-store' })
    const data = await res.json()
    const caregivers = data.caregivers || []

    // Simple ranking with distance boost
    const availabilityRequested = Boolean(searchParams?.service || searchParams?.city)
    const ranked = caregivers
      .map((c: any) => {
        const reviewsCount = c.reviews?.length ?? 0
        const avg = c.avgRating ?? 0
        const newbieBoost = reviewsCount === 0 ? 0.8 : reviewsCount < 3 ? 0.3 : 0
        const availabilityBoost = availabilityRequested ? 0.2 : 0
        const engagementBoost = Math.min(reviewsCount, 10) * 0.05
        // Distance boost: closer caregivers get higher score (max 0.5 boost for < 5km)
        const distanceBoost = c.distance && c.distance < 5 ? (5 - c.distance) * 0.1 : 0
        const jitter = Math.random() * 0.1
        const score = avg * 2 + engagementBoost + newbieBoost + availabilityBoost + distanceBoost + jitter
        return { ...c, _score: score }
      })
      .sort((a: any, b: any) => (b._score as number) - (a._score as number))
      .map(({ _score, ...rest }: any) => rest)
    return ranked
  } catch (e) {
    console.error('Error fetching caregivers:', e)
    return []
  }
}

export const dynamic = 'force-dynamic'

export default function SearchPage({ searchParams }: Props) {
  const [caregivers, setCaregivers] = useState<any[]>([])
  const [selectedCaregiver, setSelectedCaregiver] = useState<any>(null)
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const clientSearchParams = useSearchParams()
  const router = useRouter()
  const { data: session, status } = useSession()

  // Derive live filters from URL (client-side) to ensure refetch on user changes
  // Note: service in URL is Dutch slug, but we convert it for API calls
  const liveCity = clientSearchParams.get('city') || searchParams.city || ''
  const liveServiceSlug = clientSearchParams.get('service') || searchParams.service || ''
  const liveService = liveServiceSlug ? serviceSlugToCodeFn(liveServiceSlug) : ''
  const liveMaxRate = clientSearchParams.get('maxRate') || searchParams.maxRate || ''
  const preSelectedCaregiver = clientSearchParams.get('caregiver') || searchParams.caregiver || ''
  const preSelectedDate = clientSearchParams.get('date') || searchParams.date || ''

  // Fetch user location if owner is logged in
  useEffect(() => {
    if (session?.user && session.user.role === 'OWNER') {
      fetch('/api/profile/owner')
        .then(res => res.json())
        .then(data => {
          if (data.lat && data.lng) {
            setUserLocation({ lat: data.lat, lng: data.lng })
          }
        })
        .catch(err => console.error('Error fetching user location:', err))
    }
  }, [session])

  // Load caregivers on mount and when filters change
  useEffect(() => {
    let mounted = true
    setIsLoading(true)
        getCaregivers(
          { city: liveCity, service: liveServiceSlug, maxRate: liveMaxRate },
          userLocation || undefined
        ).then((data) => {
      if (mounted) {
        setCaregivers(data)
        setIsLoading(false)
      }
    }).catch((error) => {
      console.error('Error loading caregivers:', error)
      if (mounted) {
        setIsLoading(false)
      }
    })
        return () => {
          mounted = false
        }
      }, [liveCity, liveServiceSlug, liveMaxRate, userLocation])

  // Pre-select caregiver when coming from owner calendar
  useEffect(() => {
    if (preSelectedCaregiver && caregivers.length > 0) {
      const caregiver = caregivers.find(c => c.id === preSelectedCaregiver)
      if (caregiver) {
        setSelectedCaregiver(caregiver)
        // Scroll to caregiver cards
        setTimeout(() => {
          const element = document.getElementById('caregiver-cards')
          if (element) {
            element.scrollIntoView({ behavior: 'smooth' })
          }
        }, 100)
      }
    }
  }, [preSelectedCaregiver, caregivers])


  const handleSeedDemo = async () => {
    try {
      await fetch('/api/dev/seed-brussels', { method: 'POST' })
      await fetch('/api/dev/seed-antwerp', { method: 'POST' })
      await fetch('/api/dev/seed-ghent', { method: 'POST' })
    } catch (e) {
      console.error('Seeding failed', e)
    } finally {
      router.push('/search?city=Brussel&service=DOG_WALKING')
    }
  }

  const handleCaregiverSelect = (caregiver: any) => {
    setSelectedCaregiver(caregiver)
    // Scroll to caregiver cards
    const element = document.getElementById('caregiver-cards')
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' })
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 pt-16">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6 md:py-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div className="flex-1">
              <h1 className="text-2xl md:text-3xl font-bold text-gray-800 mb-2">Zoek Dierenoppassers</h1>
              <p className="text-sm md:text-base text-gray-600">{caregivers.length} dierenoppassers gevonden</p>
            </div>
            <div className="flex-shrink-0">
              {status === 'loading' ? (
                <div className="w-36 h-11 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse"></div>
              ) : session ? (
                <Link href={session?.user?.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner'} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all duration-200 rounded-lg font-semibold shadow-md hover:shadow-lg text-sm md:text-base">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                  </svg>
                  Dashboard
                </Link>
              ) : (
                <Link href="/auth/register" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all duration-200 rounded-lg font-semibold shadow-md hover:shadow-lg text-sm md:text-base">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                  Registreer
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-7xl mx-auto">

          {/* Pre-selected Info Banner */}
          {preSelectedCaregiver && preSelectedDate && (
            <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <div>
                  <h3 className="font-semibold text-blue-900">Pre-selectie vanuit agenda</h3>
                  <p className="text-sm text-blue-700">
                    Verzorger en datum zijn geselecteerd vanuit je agenda. 
                    {preSelectedDate && ` Geselecteerde datum: ${new Date(preSelectedDate).toLocaleDateString('nl-NL')}`}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Search Filters */}
          <div className="mb-4">
            <Suspense fallback={<div>Filters laden...</div>}>
              <SearchFilters />
            </Suspense>
          </div>

          {/* Results */}
          {isLoading ? (
            <div className="space-y-8">
              <SkeletonGrid count={6} />
            </div>
          ) : (
            <div className="space-y-8">
              {/* Map Section - ALTIJD tonen */}
              <div className="mb-8">
                <h2 className="font-heading text-xl font-semibold text-foreground mb-4">
                  Kaartweergave
                </h2>
                <ModernMap
                  caregivers={caregivers}
                  onCaregiverSelect={handleCaregiverSelect}
                  country="BE"
                />
              </div>

              {/* Caregiver Cards Section */}
              {caregivers.length > 0 ? (
                <div id="caregiver-cards" className="space-y-6">
                  <div className="flex items-center justify-between">
                    <h2 className="font-heading text-2xl font-semibold text-foreground">
                      Alle verzorgers
                    </h2>
                    <div className="text-sm text-muted-foreground">
                      {caregivers.length} verzorgers gevonden
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {caregivers.map(caregiver => {
                      const isPreSelected = preSelectedCaregiver === caregiver.id
                      const isSelected = selectedCaregiver?.id === caregiver.id
                      
                      return (
                        <CaregiverCard
                          key={caregiver.id}
                          caregiver={caregiver}
                          distance={caregiver.distance} // Distance in km from API
                          onSelect={() => handleCaregiverSelect(caregiver)}
                          isSelected={isSelected}
                          isPreSelected={isPreSelected}
                        />
                      )
                    })}
                  </div>
                </div>
              ) : (
                <Card className="card-tt">
                  <CardContent className="text-center py-12">
                    <div className="text-6xl mb-4">🔍</div>
                    <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                      Geen verzorgers gevonden
                    </h3>
                    <p className="text-muted-foreground mb-6">
                      Probeer een andere stad of service te selecteren.
                    </p>
                    <Button variant="outline" asChild>
                      <Link href="/search">
                        Wis filters
                      </Link>
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
