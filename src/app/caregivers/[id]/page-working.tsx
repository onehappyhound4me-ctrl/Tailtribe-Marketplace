import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { db } from '@/lib/db'
import { serviceLabels } from '@/lib/types'

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
      return { title: 'Verzorger niet gevonden' }
    }

    return {
      title: `${caregiver.user.name || 'Verzorger'} - Dierenverzorger in ${caregiver.city}`,
      description: caregiver.bio || `Professionele dierenverzorging in ${caregiver.city} vanaf €${caregiver.hourlyRate} per uur.`
    }
  } catch {
    return { title: 'Verzorger profiel' }
  }
}

export default async function CaregiverProfilePage({ params }: Props) {
  let caregiver
  
  try {
    caregiver = await db.caregiverProfile.findUnique({
      where: { id: params.id },
      include: {
        user: true
      }
    })
  } catch (error) {
    console.error('Error loading caregiver:', error)
  }

  if (!caregiver) {
    notFound()
  }

  // Parse JSON fields safely
  let services: string[] = []
  let photos: string[] = []
  
  try {
    services = caregiver.services ? caregiver.services.split(',') : []
    photos = JSON.parse(caregiver.photos || '[]')
  } catch (e) {
    console.error('Error parsing JSON fields:', e)
  }
  
  // Calculate average rating
  const avgRating = caregiver.reviews.length > 0 
    ? caregiver.reviews.reduce((sum, review) => sum + review.rating, 0) / caregiver.reviews.length
    : 0

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Breadcrumbs */}
          <nav className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
            <Link href="/" className="hover:text-gray-700">Home</Link>
            <span>›</span>
            <Link href="/search" className="hover:text-gray-700">Zoek verzorgers</Link>
            <span>›</span>
            <span className="text-gray-900">{caregiver.user.name || 'Verzorger'}</span>
          </nav>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Main Profile */}
            <div className="lg:col-span-2 space-y-6">
              {/* Profile Header */}
              <Card>
                <CardContent className="p-8">
                  <div className="flex gap-6 items-start">
                    <div className="flex-shrink-0">
                      {photos.length > 0 ? (
                        <img
                          src={photos[0]}
                          alt={caregiver.user.name || 'Verzorger'}
                          className="w-32 h-32 rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-gray-200 flex items-center justify-center text-4xl">
                          🐾
                        </div>
                      )}
                    </div>
                    
                    <div className="flex-1">
                      <div className="flex items-start justify-between mb-4">
                        <div>
                          <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            {caregiver.user.name || 'Verzorger'}
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
                        
                        <div className="text-right">
                          <div className="text-3xl font-bold text-blue-600">
                            €{caregiver.hourlyRate}
                          </div>
                          <div className="text-gray-500">per uur</div>
                        </div>
                      </div>

                      <div className="flex gap-2 flex-wrap mb-6">
                        {services.map((service: string) => (
                          <Badge key={service} variant="secondary" className="bg-blue-100 text-blue-800">
                            {serviceLabels[service as keyof typeof serviceLabels] || service}
                          </Badge>
                        ))}
                      </div>

                      {caregiver.bio && (
                        <p className="text-gray-700 leading-relaxed">
                          {caregiver.bio}
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>

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
                <Card>
                  <CardHeader>
                    <CardTitle>Boek een afspraak</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Service
                      </label>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="">Kies een service</option>
                        {services.map((service: string) => (
                          <option key={service} value={service}>
                            {serviceLabels[service as keyof typeof serviceLabels] || service} - €{caregiver.hourlyRate}/uur
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Datum
                      </label>
                      <input
                        type="date"
                        className="w-full p-2 border border-gray-300 rounded-md"
                        min={new Date().toISOString().split('T')[0]}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Tijd
                      </label>
                      <select className="w-full p-2 border border-gray-300 rounded-md">
                        <option value="">Kies een tijd</option>
                        <option value="08:00">08:00</option>
                        <option value="09:00">09:00</option>
                        <option value="10:00">10:00</option>
                        <option value="11:00">11:00</option>
                        <option value="14:00">14:00</option>
                        <option value="15:00">15:00</option>
                        <option value="16:00">16:00</option>
                        <option value="17:00">17:00</option>
                      </select>
                    </div>

                    <Button className="w-full" asChild>
                      <Link href={`/booking/new?caregiver=${caregiver.id}`}>
                        Boek nu
                      </Link>
                    </Button>

                    <Button variant="outline" className="w-full" asChild>
                      <Link href={`/messages/new?caregiver=${caregiver.id}`}>
                        💬 Bericht sturen
                      </Link>
                    </Button>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Beschikbaarheid</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span>Maandag - Vrijdag</span>
                        <span className="text-green-600">09:00 - 17:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Zaterdag</span>
                        <span className="text-green-600">10:00 - 16:00</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Zondag</span>
                        <span className="text-gray-500">Niet beschikbaar</span>
                      </div>
                    </div>
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

