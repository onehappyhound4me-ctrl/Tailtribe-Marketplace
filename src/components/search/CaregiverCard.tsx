'use client'

import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { serviceLabels } from '@/lib/types'
import Link from 'next/link'
import Image from 'next/image'
import { useSession } from 'next-auth/react'
import { maskName, limitPhotos } from '@/lib/contact-gating'

type Caregiver = {
  id: string | number
  user?: { name?: string | null }
  name?: string | null
  city?: string | null
  hourlyRate?: number | null
  bio?: string | null
  parsedServices?: string[]
  parsedPhotos?: string[]
  profilePhoto?: string | null
  avgRating?: number
  reviews?: any[]
}

interface CaregiverCardProps {
  caregiver: Caregiver
  distance?: number
  onSelect?: (caregiver: Caregiver) => void
  isSelected?: boolean
  isPreSelected?: boolean
}

export function CaregiverCard({ caregiver, distance, onSelect, isSelected, isPreSelected }: CaregiverCardProps) {
  const { data: session } = useSession()
  const hasReviews = caregiver.reviews && caregiver.reviews.length > 0
  
  // Contact gating: Show masked name for non-logged-in users
  const fullName = caregiver.user?.name || caregiver.name || 'Verzorger'
  const displayName = session ? fullName : maskName(fullName)
  
  // Combine profile photo with other photos
  const allPhotos = caregiver.profilePhoto 
    ? [caregiver.profilePhoto, ...(caregiver.parsedPhotos || [])]
    : caregiver.parsedPhotos || []
  
  // Limit photos for non-logged-in users
  const displayPhotos = session ? allPhotos : limitPhotos(allPhotos, 1)

  return (
    <Card className={`group hover:shadow-xl transition-all duration-300 border-2 overflow-hidden h-full flex flex-col ${
      isPreSelected 
        ? 'border-blue-400 bg-blue-50 shadow-lg' 
        : isSelected 
        ? 'border-emerald-400 bg-emerald-50 shadow-lg' 
        : 'border-gray-200 hover:border-emerald-400'
    }`}>
      <CardContent className="p-0 flex flex-col flex-1">
        {/* Clickable Profile Area */}
        <Link href={`/caregivers/${caregiver.id}`} className="block hover:bg-gray-50/50 transition-colors flex-1">
          {/* Header with Avatar and Basic Info */}
          <div className="p-6 pb-4">
            <div className="flex items-start gap-4">
              {/* Professional Avatar */}
              <div className="flex-shrink-0">
                {displayPhotos && displayPhotos.length > 0 ? (
                  <Image
                    src={displayPhotos[0]}
                    alt={displayName}
                    width={64}
                    height={64}
                    className="w-16 h-16 rounded-xl object-cover border-2 border-emerald-200 shadow-md"
                    loading="lazy"
                    unoptimized={displayPhotos[0]?.startsWith('http')}
                  />
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl border-2 border-emerald-300 shadow-md">
                    {displayName.charAt(0).toUpperCase()}
                  </div>
                )}
              </div>

              {/* Name and Location */}
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-semibold text-gray-900 text-lg mb-1">
                  {displayName}
                  {!session && (
                    <span className="ml-2 text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">Log in voor volledige naam</span>
                  )}
                  {isPreSelected && (
                    <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full font-medium">Geselecteerd vanuit agenda</span>
                  )}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-2">
                  <span>📍 {caregiver.city}</span>
                  {distance && (
                    <span className="bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full text-xs font-medium">
                      {distance.toFixed(1)} km
                    </span>
                  )}
                </div>
                
                {/* Rating */}
                {caregiver.avgRating && caregiver.avgRating > 0 && (
                  <div className="flex items-center gap-1 mb-3">
                    <div className="flex items-center">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-sm ${i < Math.floor(caregiver.avgRating || 0) ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ⭐
                        </span>
                      ))}
                    </div>
                    <span className="font-medium text-sm text-gray-900">{caregiver.avgRating}</span>
                    <span className="text-xs text-gray-600">({caregiver.reviews?.length || 0} reviews)</span>
                  </div>
                )}
              </div>

              {/* Price */}
              <div className="text-right">
                <div className="text-3xl font-bold text-emerald-600">
                  €{caregiver.hourlyRate}
                </div>
                <div className="text-xs text-gray-500 font-medium">per uur</div>
              </div>
            </div>
          </div>

          {/* Services */}
          {caregiver.parsedServices && caregiver.parsedServices.length > 0 && (
            <div className="px-6 pb-4">
              <div className="flex flex-wrap gap-2">
                {caregiver.parsedServices.slice(0, 3).map((service: string) => (
                  <Badge key={service} variant="secondary" className="text-xs bg-gray-100 text-gray-700 hover:bg-gray-200">
                    {serviceLabels[service as keyof typeof serviceLabels] || service}
                  </Badge>
                ))}
                {caregiver.parsedServices.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{caregiver.parsedServices.length - 3} meer
                  </Badge>
                )}
              </div>
            </div>
          )}

          {/* Bio */}
          {caregiver.bio && (
            <div className="px-6 pb-4">
              <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed">
                {caregiver.bio}
              </p>
            </div>
          )}
        </Link>

        {/* Action Button - Outside Link */}
        <div className={`px-6 py-5 border-t-2 ${
          isPreSelected 
            ? 'border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100' 
            : 'border-gray-100 bg-gradient-to-r from-gray-50 to-emerald-50'
        }`}>
          <Button
            className={`w-full py-4 text-base font-bold shadow-lg hover:shadow-xl transition-all ${
              isPreSelected 
                ? 'bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white' 
                : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white'
            }`}
            asChild
          >
            <Link href={`/caregivers/${caregiver.id}`}>
              {isPreSelected ? '🎯 Geselecteerd - Bekijk & Boek' : '📋 Bekijk Profiel & Boek'}
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
