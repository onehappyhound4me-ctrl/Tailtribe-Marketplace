'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface OwnerPreferences {
  primaryServices?: string[]
  frequency?: string
  timing?: string[]
  location?: string[] // Now an array
  importantQualities?: string[]
}

interface OwnerInfo {
  name: string
  email: string
  phone?: string
  preferences?: OwnerPreferences
  perfectExperience?: string
  howHeardAbout?: string
  pets: Array<{
    id: string
    name: string
    type: string
    breed?: string
    age?: number
    weight?: number
    gender?: string
    character?: string
    medicalInfo?: string
    socialWithPets?: boolean
    socialWithPeople?: boolean
  }>
}

interface Props {
  ownerId: string
  bookingId?: string
}

export function OwnerPreferencesCard({ ownerId, bookingId }: Props) {
  const [ownerInfo, setOwnerInfo] = useState<OwnerInfo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadOwnerInfo()
  }, [ownerId, bookingId])

  const loadOwnerInfo = async () => {
    try {
      const endpoint = bookingId 
        ? `/api/bookings/${bookingId}` 
        : `/api/users/${ownerId}`
      
      const res = await fetch(endpoint)
      if (res.ok) {
        const data = await res.json()
        const owner = bookingId ? data.owner : data
        
        setOwnerInfo({
          name: owner.name || 'Eigenaar',
          email: owner.email || '',
          phone: owner.phone || '',
          preferences: owner.preferences ? JSON.parse(owner.preferences) : null,
          perfectExperience: owner.perfectExperience || '',
          howHeardAbout: owner.howHeardAbout || '',
          pets: owner.pets || []
        })
      }
    } catch (error) {
      console.error('Error loading owner info:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Eigenaar Informatie</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
            <div className="h-4 bg-gray-200 rounded w-2/3"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!ownerInfo) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg">Eigenaar Informatie</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-gray-500">Geen informatie beschikbaar</p>
        </CardContent>
      </Card>
    )
  }

  const serviceLabels: Record<string, string> = {
    'DOG_WALKING': 'Hondenuitlaat',
    'GROUP_DOG_WALKING': 'Groepsuitlaat',
    'DOG_TRAINING': 'Hondentraining',
    'PET_SITTING': 'Dierenoppas',
    'PET_BOARDING': 'Dierenopvang',
    'HOME_CARE': 'Verzorging aan huis',
    'PET_TRANSPORT': 'Transport huisdieren',
    'SMALL_ANIMAL_CARE': 'Verzorging kleinvee',
    'EVENT_COMPANION': 'Begeleiding events'
  }

  const qualityLabels: Record<string, string> = {
    'EXPERIENCE': 'Ervaring',
    'PATIENCE': 'Geduld',
    'RELIABILITY': 'Betrouwbaarheid',
    'COMMUNICATION': 'Communicatie',
    'FLEXIBILITY': 'Flexibiliteit',
    'KNOWLEDGE': 'Kennis van dieren',
    'EMERGENCY_HANDLING': 'Omgaan met noodsituaties',
    'CLEANLINESS': 'Netheid',
    'PUNCTUALITY': 'Stiptheid',
    'LOVE_FOR_ANIMALS': 'Liefde voor dieren'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <span className="text-2xl">👤</span>
          Eigenaar Informatie
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Basic Info */}
        <div>
          <h3 className="font-semibold text-gray-900 mb-2">Contactgegevens</h3>
          <div className="space-y-1">
            <p><strong>Naam:</strong> {ownerInfo.name}</p>
            <p><strong>Email:</strong> {ownerInfo.email}</p>
            {ownerInfo.phone && <p><strong>Telefoon:</strong> {ownerInfo.phone}</p>}
          </div>
        </div>

        {/* Huisdieren */}
        {ownerInfo.pets.length > 0 && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Huisdieren ({ownerInfo.pets.length})</h3>
            <div className="space-y-2">
              {ownerInfo.pets.map((pet) => (
                <div key={pet.id} className="bg-gray-50 p-3 rounded-lg">
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium">{pet.name}</span>
                    <Badge variant="secondary" className="text-xs">
                      {pet.type === 'DOG' ? '🐕' : pet.type === 'CAT' ? '🐈' : '🐾'} {pet.type}
                    </Badge>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{pet.character || pet.breed || 'Geen beschrijving'}</p>
                  
                  <div className="text-sm text-gray-600 space-y-1">
                    {pet.breed && <p><strong>Ras:</strong> {pet.breed}</p>}
                    {pet.age && <p><strong>Leeftijd:</strong> {pet.age} jaar</p>}
                    {pet.weight && <p><strong>Gewicht:</strong> {pet.weight} kg</p>}
                    {pet.gender && <p><strong>Geslacht:</strong> {pet.gender === 'MALE' ? '♂️ Mannelijk' : '♀️ Vrouwelijk'}</p>}
                    {pet.medicalInfo && <p><strong>Medische info:</strong> {pet.medicalInfo}</p>}
                    <div className="flex gap-2 mt-2">
                      <Badge variant={pet.socialWithPets ? "default" : "secondary"} className="text-xs">
                        {pet.socialWithPets ? '✅' : '❌'} Sociaal met dieren
                      </Badge>
                      <Badge variant={pet.socialWithPeople ? "default" : "secondary"} className="text-xs">
                        {pet.socialWithPeople ? '✅' : '❌'} Sociaal met mensen
                      </Badge>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Voorkeuren */}
        {ownerInfo.preferences && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Voorkeuren</h3>
            <div className="space-y-3">
              {ownerInfo.preferences.primaryServices && ownerInfo.preferences.primaryServices.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Gewenste diensten:</p>
                  <div className="flex flex-wrap gap-1">
                    {ownerInfo.preferences.primaryServices.map((service) => (
                      <Badge key={service} variant="secondary" className="text-xs">
                        {serviceLabels[service] || service}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {ownerInfo.preferences.frequency && (
                <div>
                  <p className="text-sm font-medium text-gray-700">Frequentie:</p>
                  <p className="text-sm text-gray-600">{ownerInfo.preferences.frequency}</p>
                </div>
              )}

              {ownerInfo.preferences.timing && ownerInfo.preferences.timing.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-1">Gewenste tijden:</p>
                  <div className="flex flex-wrap gap-1">
                    {ownerInfo.preferences.timing.map((time) => (
                      <Badge key={time} variant="outline" className="text-xs">
                        {time}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {ownerInfo.preferences.location && ownerInfo.preferences.location.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-gray-700 mb-2">Gewenste locatie:</p>
                  <div className="flex flex-wrap gap-1">
                    {ownerInfo.preferences.location.map((location) => (
                      <Badge key={location} variant="outline" className="text-xs">
                        {location === 'THUIS' ? 'Bij eigenaar thuis' : 
                         location === 'VERZORGER' ? 'Bij verzorger' : 
                         location === 'BEIDE' ? 'Beide opties' : location}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>
        )}

        {/* Perfecte ervaring */}
        {ownerInfo.perfectExperience && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Wat verwacht de eigenaar van een verzorger?</h3>
            <div className="bg-blue-50 p-4 rounded-lg border-l-4 border-blue-400">
              <p className="text-sm text-gray-700 italic">"{ownerInfo.perfectExperience}"</p>
            </div>
          </div>
        )}

        {/* Hoe gevonden */}
        {ownerInfo.howHeardAbout && (
          <div>
            <h3 className="font-semibold text-gray-900 mb-2">Hoe heeft de eigenaar TailTribe gevonden?</h3>
            <p className="text-sm text-gray-600">{ownerInfo.howHeardAbout}</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
