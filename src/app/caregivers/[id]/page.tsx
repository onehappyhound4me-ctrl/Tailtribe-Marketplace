import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'
import { StoryHighlights } from '@/components/video/StoryHighlights'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { hasConfirmedBookingWith } from '@/lib/booking-check'
import { maskName, limitPhotos, getGatingMessage } from '@/lib/contact-gating'
import { CaregiverHeader } from '@/components/caregiver/CaregiverHeader'
import { BookingForm } from '@/components/caregiver/BookingForm'
import { BadgeDisplay } from '@/components/caregiver/BadgeDisplay'

interface Props {
  params: {
    id: string
  }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  try {
    const caregiver = await db.caregiverProfile.findUnique({
      where: { id: params.id },
      include: { user: true }
    })

    if (!caregiver) {
      return { title: 'Dierenoppasser niet gevonden' }
    }

    return {
      title: `${caregiver.user.name} - Dierenoppasser in ${caregiver.city}`,
      description: caregiver.bio || `Professionele dierenoppasser in ${caregiver.city} vanaf €${caregiver.hourlyRate} per uur.`
    }
  } catch {
    return { title: 'Dierenoppasser profiel' }
  }
}

export default async function CaregiverProfilePage({ params }: Props) {
  // Get session for contact gating
  const session = await getServerSession(authOptions)
  const isLoggedIn = !!session
  
  let caregiver
  
  try {
    caregiver = await db.caregiverProfile.findUnique({
      where: { id: params.id },
      include: {
        user: true,
        listings: {
          where: { active: true },
          take: 3
        },
        highlights: {
          where: {
            published: true,
            expiresAt: { gte: new Date() }
          },
          include: {
            caregiver: {
              include: {
                user: {
                  select: { name: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        },
        availability: true
      }
    })
    
    // Fetch reviews separately using the new schema
    const reviews = await db.review.findMany({
      where: {
        revieweeId: caregiver.userId,
        revieweeRole: 'CAREGIVER'
      },
      include: {
        author: {
          select: { name: true }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    
    // Add reviews to caregiver object
    if (caregiver) {
      caregiver.reviews = reviews as any
    }
  } catch (error) {
    console.error('Error loading caregiver:', error)
  }

  if (!caregiver) {
    notFound()
  }

  // Check if user has confirmed booking with this caregiver
  const hasConfirmedBooking = await hasConfirmedBookingWith(session?.user?.id, caregiver.userId)
  const shouldGate = !hasConfirmedBooking
  
  // Parse fields correctly
  const services = caregiver.services ? caregiver.services.split(',') : []
  const photos = caregiver.photos ? JSON.parse(caregiver.photos) : []
  
  // Add profile photo to photos array if it exists
  const allPhotos = caregiver.profilePhoto 
    ? [caregiver.profilePhoto, ...photos]
    : photos
  
  // Apply contact gating
  const fullName = caregiver.user.name || 'Verzorger'
  const displayName = (shouldGate && !isLoggedIn) ? maskName(fullName) : fullName
  const displayPhotos = (shouldGate && !isLoggedIn) ? limitPhotos(allPhotos, 2) : allPhotos
  
  // Calculate average rating
  const avgRating = caregiver.reviews.length > 0 
    ? caregiver.reviews.reduce((sum, review) => sum + review.rating, 0) / caregiver.reviews.length
    : 0
  
  // Get gating message if needed
  const gatingInfo = shouldGate ? getGatingMessage(isLoggedIn) : null

  const serviceLabels: Record<string, string> = {
    'DOG_WALKING': 'Hondenuitlaat',
    'PET_SITTING': 'Dierenoppas',
    'TRAINING': 'Training',
    'TRANSPORT': 'Transport'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Header */}
      <CaregiverHeader name={displayName} city={caregiver.city} />
      
      {/* Contact Gating Banner */}
      {gatingInfo && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-200">
          <div className="container mx-auto px-8 py-3">
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1">
                <p className="text-sm text-gray-800">
                  <strong>💡 Tip:</strong> Boek een afspraak om volledige contactgegevens, telefoonnummer en adres te ontvangen
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header */}
              <Card>
                <CardContent className="p-8">
                  <div className="flex gap-6 items-start">
                    <div className="flex-shrink-0">
                      {displayPhotos.length > 0 ? (
                        <img
                          src={displayPhotos[0]}
                          alt={displayName}
                          className="w-32 h-32 rounded-2xl object-cover border-4 border-emerald-200 shadow-lg"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-5xl border-4 border-emerald-300 shadow-lg">
                          🐾
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {displayName}
                          </h1>
                          <p className="text-lg text-gray-600 mb-3 flex items-center">
                            📍 {caregiver.city}
                          </p>
                          
                          {avgRating > 0 && (
                            <div className="flex items-center gap-4 mb-4">
                              <div className="flex items-center gap-1">
                                <span className="text-yellow-500 text-lg">⭐</span>
                                <span className="font-semibold text-lg">{avgRating.toFixed(1)}</span>
                                <span className="text-gray-500">({caregiver.reviews.length} reviews)</span>
                              </div>
                              {caregiver.isApproved && (
                                <Badge className="bg-green-600">
                                  ✓ Geverifieerd
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        
                        <div className="text-right bg-gradient-to-br from-emerald-50 to-teal-50 px-6 py-4 rounded-xl border-2 border-emerald-200">
                          <div className="text-4xl font-bold text-emerald-600">
                            €{caregiver.hourlyRate}
                          </div>
                          <div className="text-gray-600 font-medium text-sm">per uur</div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap mb-6">
                        {services.map((service: string) => (
                          <Badge key={service} variant="secondary" className="bg-emerald-100 text-emerald-800 font-medium px-3 py-1">
                            {serviceLabels[service] || service}
                          </Badge>
                        ))}
                      </div>

                      {caregiver.bio && (
                        <p className="text-gray-700 leading-relaxed">
                          {caregiver.bio}
                        </p>
                      )}

                      {/* Badges Display */}
                      {(caregiver.certificates || caregiver.businessNumber || caregiver.vatNumber) && (
                        <BadgeDisplay
                          certificates={caregiver.certificates ? JSON.parse(caregiver.certificates) : []}
                          businessNumber={caregiver.businessNumber}
                          vatNumber={caregiver.vatNumber}
                        />
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Availability Schedule */}
              {caregiver.availability && (() => {
                try {
                  const weeklySchedule = JSON.parse(caregiver.availability.weeklyJson)
                  const dayNames: Record<string, string> = {
                    'monday': 'Maandag',
                    'tuesday': 'Dinsdag',
                    'wednesday': 'Woensdag',
                    'thursday': 'Donderdag',
                    'friday': 'Vrijdag',
                    'saturday': 'Zaterdag',
                    'sunday': 'Zondag'
                  }
                  
                  // Check if there's any availability data
                  const hasAvailability = Object.values(weeklySchedule).some((data: any) => {
                    if (Array.isArray(data)) {
                      return data.length > 0
                    }
                    if (data && typeof data === 'object') {
                      return data.available === true || (data.slots && data.slots.length > 0)
                    }
                    return false
                  })
                  
                  if (!hasAvailability) {
                    return (
                      <Card>
                        <CardHeader>
                          <CardTitle className="flex items-center gap-2">
                            <span>📅</span>
                            Beschikbaarheid
                          </CardTitle>
                        </CardHeader>
                        <CardContent>
                          <p className="text-gray-500 text-center py-4">
                            Nog geen beschikbaarheid ingesteld
                          </p>
                        </CardContent>
                      </Card>
                    )
                  }
                  
                  return (
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                          <span>📅</span>
                          Beschikbaarheid
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          {Object.entries(weeklySchedule).map(([day, data]: [string, any]) => {
                            // Handle different formats
                            let slots: any[] = []
                            
                            if (Array.isArray(data)) {
                              // Direct array format: [{"start": "09:00", "end": "17:00"}]
                              slots = data
                            } else if (data && typeof data === 'object') {
                              // Object format: {available: true, slots: [...]}
                              if (data.slots) {
                                slots = data.slots
                              } else if (data.available && data.start && data.end) {
                                // Single slot object
                                slots = [{start: data.start, end: data.end}]
                              }
                            }
                            
                            if (slots.length === 0) return null
                            
                            return (
                              <div key={day} className="flex items-center gap-4 py-2 border-b border-gray-100 last:border-b-0">
                                <div className="w-32 font-semibold text-gray-700">
                                  {dayNames[day] || day}
                                </div>
                                <div className="flex-1">
                                  <div className="flex flex-wrap gap-2">
                                    {slots.map((slot: any, idx: number) => (
                                      <Badge key={idx} variant="secondary" className="bg-emerald-100 text-emerald-800 font-medium">
                                        {slot.start} - {slot.end}
                                      </Badge>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-sm text-blue-800">
                            💡 <strong>Tip:</strong> Bekijk de kalender tijdens het boeken voor exacte beschikbaarheid per datum.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                } catch (error) {
                  console.error('Error parsing availability:', error)
                  return null
                }
              })()}

              {/* Story Highlights */}
              {caregiver.highlights.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Video Highlights</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <StoryHighlights highlights={caregiver.highlights as any} />
                  </CardContent>
                </Card>
              )}

              {/* Photo Gallery */}
              {photos.length > 1 && (
                <Card>
                  <CardHeader>
                    <CardTitle>Foto's</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {photos.slice(1).map((photo: string, index: number) => (
                        <img
                          key={index}
                          src={photo}
                          alt={`Foto ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Reviews */}
              <Card>
                <CardHeader>
                  <CardTitle>Reviews ({caregiver.reviews.length})</CardTitle>
                </CardHeader>
                <CardContent>
                  {caregiver.reviews.length === 0 ? (
                    <p className="text-gray-500 text-center py-8">
                      Nog geen reviews ontvangen.
                    </p>
                  ) : (
                    <div className="space-y-6">
                      {caregiver.reviews.map(review => (
                        <div key={review.id} className="border-b border-gray-200 pb-6 last:border-b-0">
                          <div className="flex justify-between items-start mb-2">
                            <h4 className="font-semibold text-gray-900">
                              {review.author.name || 'Anoniem'}
                            </h4>
                            <span className="text-sm text-gray-500">
                              {new Date(review.createdAt).toLocaleDateString('nl-BE')}
                            </span>
                          </div>
                          <div className="flex items-center mb-2">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={i < review.rating ? 'text-yellow-400' : 'text-gray-300'}
                              >
                                ⭐
                              </span>
                            ))}
                          </div>
                          {review.comment && (
                            <p className="text-gray-700 leading-relaxed">
                              {review.comment}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Booking Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-4 space-y-6">
                <Card className="shadow-lg border-2 border-emerald-200">
                  <CardHeader className="bg-gradient-to-r from-emerald-50 to-teal-50">
                    <CardTitle className="text-center text-xl">💼 Boeken</CardTitle>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="text-center mb-4">
                      <p className="text-3xl font-bold text-emerald-600 mb-1">
                        €{caregiver.hourlyRate}
                      </p>
                      <p className="text-sm text-gray-600">per uur</p>
                    </div>
                    
                    <Button 
                      asChild 
                      className="w-full py-6 text-lg font-bold bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 shadow-lg hover:shadow-xl"
                    >
                      <Link href={`/booking/new?caregiver=${caregiver.id}&from=profile`}>
                        ✨ Boek & Bekijk Beschikbaarheid
                      </Link>
                    </Button>

                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                      <p className="text-xs text-blue-800 text-center">
                        💡 In de volgende stap kun je de beschikbaarheid zien en datums/tijden selecteren
                      </p>
                    </div>

                    <Button 
                      asChild 
                      variant="outline"
                      className="w-full py-4 text-base font-semibold border-2 hover:bg-emerald-50 hover:border-emerald-500 mt-3"
                    >
                      <Link href={`/messages/new?caregiver=${caregiver.id}&from=profile`}>
                        💬 Bericht Sturen
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Contact Info</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2">
                        <span>📞</span>
                        <span>Reactietijd: Binnen 2 uur</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>📍</span>
                        <span>Locatie: {caregiver.city}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>🛡️</span>
                        <span>Volledig verzekerd</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
