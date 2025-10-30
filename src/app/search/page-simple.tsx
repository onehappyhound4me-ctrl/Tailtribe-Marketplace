import { Suspense } from 'react'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'
import { serviceLabels } from '@/lib/types'

interface SearchParams {
  city?: string
  service?: string
  maxRate?: string
  query?: string
}

interface Props {
  searchParams: SearchParams
}

async function getCaregivers(searchParams: SearchParams) {
  try {
    const caregivers = await db.caregiverProfile.findMany({
      where: {
        isApproved: true,
        ...(searchParams.city && {
          city: {
            contains: searchParams.city
          }
        }),
        ...(searchParams.maxRate && {
          hourlyRate: {
            lte: parseInt(searchParams.maxRate)
          }
        })
      },
      include: {
        user: {
          select: { name: true }
        }
      },
      take: 20,
      orderBy: { createdAt: 'desc' }
    })

    // Calculate average ratings and parse JSON fields
    return caregivers.map(caregiver => {
      const avgRating = 0 // TODO: Calculate from reviews

      let services: string[] = []
      let photos: string[] = []
      
      try {
        services = caregiver.services ? caregiver.services.split(',') : []
        photos = JSON.parse(caregiver.photos || '[]')
      } catch (e) {
        console.error('Error parsing JSON fields:', e)
      }

      return {
        ...caregiver,
        avgRating: Math.round(avgRating * 10) / 10,
        parsedServices: services,
        parsedPhotos: photos
      }
    })
  } catch (error) {
    console.error('Error loading caregivers:', error)
    return []
  }
}

export default async function SearchPage({ searchParams }: Props) {
  const caregivers = await getCaregivers(searchParams)

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Search Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              Dierenverzorgers in België
            </h1>
            <p className="text-xl text-gray-600">
              {caregivers.length} betrouwbare verzorgers gevonden
            </p>
          </div>

          {/* Quick Filters */}
          <Card className="mb-8">
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Stad</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option value="">Alle steden</option>
                    <option value="antwerpen">Antwerpen</option>
                    <option value="gent">Gent</option>
                    <option value="brussel">Brussel</option>
                    <option value="leuven">Leuven</option>
                    <option value="brugge">Brugge</option>
                    <option value="hasselt">Hasselt</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Service</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option value="">Alle services</option>
                    <option value="DOG_WALKING">Hondenuitlaat</option>
                    <option value="PET_SITTING">Dierenoppas</option>
                    <option value="TRAINING">Training</option>
                    <option value="TRANSPORT">Transport</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Max. tarief</label>
                  <select className="w-full p-2 border border-gray-300 rounded-md">
                    <option value="">Geen limiet</option>
                    <option value="15">Tot €15</option>
                    <option value="20">Tot €20</option>
                    <option value="25">Tot €25</option>
                    <option value="30">Tot €30</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <Button className="w-full">
                    Zoeken
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Results */}
          {caregivers.length === 0 ? (
            <Card>
              <CardContent className="text-center py-12">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">
                  Geen verzorgers gevonden
                </h3>
                <p className="text-gray-600 mb-4">
                  Probeer je zoekcriteria aan te passen.
                </p>
                <Button variant="outline" asChild>
                  <Link href="/search">
                    Nieuwe zoekopdracht
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {caregivers.map(caregiver => (
                <Card key={caregiver.id} className="hover:shadow-lg transition-shadow">
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      {caregiver.parsedPhotos.length > 0 ? (
                        <img
                          src={caregiver.parsedPhotos[0]}
                          alt={caregiver.user.name || 'Verzorger'}
                          className="w-20 h-20 rounded-full object-cover mx-auto mb-3"
                        />
                      ) : (
                        <div className="w-20 h-20 rounded-full bg-gray-200 flex items-center justify-center mx-auto mb-3 text-2xl">
                          🐾
                        </div>
                      )}
                      
                      <h3 className="text-lg font-semibold text-gray-900 mb-1">
                        {caregiver.user.name || 'Verzorger'}
                      </h3>
                      <p className="text-gray-600 text-sm mb-2">
                        📍 {caregiver.city}
                      </p>
                      
                      {caregiver.avgRating > 0 && (
                        <div className="flex items-center justify-center gap-1 mb-3">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-medium">{caregiver.avgRating}</span>
                          <span className="text-gray-500 text-sm">(0)</span>
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1 flex-wrap justify-center mb-4">
                      {caregiver.parsedServices.slice(0, 2).map((service: string) => (
                        <Badge key={service} variant="secondary" className="text-xs">
                          {serviceLabels[service as keyof typeof serviceLabels] || service}
                        </Badge>
                      ))}
                      {caregiver.parsedServices.length > 2 && (
                        <Badge variant="outline" className="text-xs">
                          +{caregiver.parsedServices.length - 2} meer
                        </Badge>
                      )}
                    </div>

                    <div className="text-center mb-4">
                      <div className="text-2xl font-bold text-blue-600">
                        €{caregiver.hourlyRate}
                      </div>
                      <div className="text-sm text-gray-500">per uur</div>
                    </div>

                    {caregiver.bio && (
                      <p className="text-gray-700 text-sm mb-4 line-clamp-2">
                        {caregiver.bio}
                      </p>
                    )}

                    <div className="space-y-2">
                      <Button className="w-full" asChild>
                        <Link href={`/caregivers/${caregiver.id}`}>
                          Profiel bekijken
                        </Link>
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <Link href={`/booking/new?caregiver=${caregiver.id}`}>
                          Boek nu
                        </Link>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

