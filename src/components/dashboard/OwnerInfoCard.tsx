'use client'

import { useEffect, useState, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'

interface OwnerInfo {
  name: string
  email: string
  phone?: string
  preferences?: any
  perfectExperience?: string
  pets: Array<{
    id: string
    name: string
    type: string
    breed?: string
    age?: string
    weight?: string
    gender?: string
    character?: string
    medicalInfo?: string
    socialWithPets?: boolean
    socialWithPeople?: boolean
  }>
}

interface Props {
  bookingId: string
}

export function OwnerInfoCard({ bookingId }: Props) {
  const [ownerInfo, setOwnerInfo] = useState<OwnerInfo | null>(null)
  const [loading, setLoading] = useState(true)

  const fetchOwnerInfo = useCallback(async () => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}`)
      if (res.ok) {
        const data = await res.json()
        if (data.booking?.owner) {
          setOwnerInfo(data.booking.owner)
        }
      }
    } catch (error) {
      console.error('Error fetching owner info:', error)
    } finally {
      setLoading(false)
    }
  }, [bookingId])

  useEffect(() => {
    if (bookingId) {
      fetchOwnerInfo()
    }
  }, [bookingId, fetchOwnerInfo])

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
    return null
  }

  const getAnimalTypeIcon = (type: string) => {
    switch (type) {
      case 'DOG': return '🐕'
      case 'CAT': return '🐈'
      case 'BIRD': return '🐦'
      case 'SMALL_ANIMAL': return '🐰'
      default: return '🐾'
    }
  }

  const getGenderIcon = (gender: string) => {
    return gender === 'MALE' ? '♂️' : '♀️'
  }

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          👤 Eigenaar Informatie
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Owner Basic Info */}
        <div className="bg-gray-50 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">{ownerInfo.name}</h4>
          <div className="space-y-1 text-sm text-gray-600">
            <p>📧 {ownerInfo.email}</p>
            {ownerInfo.phone && <p>📞 {ownerInfo.phone}</p>}
          </div>
        </div>

        {/* Owner Preferences */}
        {ownerInfo.preferences && (
          <div className="bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold text-blue-900 mb-2">Wat is belangrijk voor {ownerInfo.name}:</h4>
            {ownerInfo.preferences.importantQualities && (
              <div className="mb-2">
                <p className="text-sm font-medium text-blue-800">Belangrijke kwaliteiten:</p>
                <div className="flex flex-wrap gap-1 mt-1">
                  {ownerInfo.preferences.importantQualities.map((quality: string) => (
                    <Badge key={quality} variant="outline" className="text-xs bg-blue-100 text-blue-700 border-blue-300">
                      {quality === 'BETROUWBAARHEID' ? 'Betrouwbaarheid' :
                       quality === 'ERVARING' ? 'Ervaring' :
                       quality === 'OMGANG' ? 'Omgang met dieren' :
                       quality === 'PRIJS' ? 'Prijs' : 'Locatie'}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
            {ownerInfo.perfectExperience && (
              <div>
                <p className="text-sm font-medium text-blue-800">Perfecte ervaring:</p>
                <p className="text-sm text-blue-700 italic mt-1">"{ownerInfo.perfectExperience}"</p>
              </div>
            )}
          </div>
        )}

        {/* Pets Information */}
        {ownerInfo.pets && ownerInfo.pets.length > 0 && (
          <div className="bg-green-50 rounded-lg p-4">
            <h4 className="font-semibold text-green-900 mb-3">Huisdieren ({ownerInfo.pets.length})</h4>
            <div className="space-y-3">
              {ownerInfo.pets.map((pet) => (
                <div key={pet.id} className="bg-white rounded-lg p-3 border border-green-200">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{getAnimalTypeIcon(pet.type)}</span>
                    <span className="font-medium text-gray-900">{pet.name}</span>
                    {pet.gender && <span className="text-sm">{getGenderIcon(pet.gender)}</span>}
                    {pet.breed && <span className="text-sm text-gray-600">({pet.breed})</span>}
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs text-gray-600">
                    {pet.age && <p>Leeftijd: {pet.age}</p>}
                    {pet.weight && <p>Gewicht: {pet.weight}</p>}
                    {pet.character && <p className="col-span-2 italic">"{pet.character}"</p>}
                  </div>

                  {pet.medicalInfo && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                      <p className="text-xs font-medium text-yellow-800">Medische info:</p>
                      <p className="text-xs text-yellow-700">{pet.medicalInfo}</p>
                    </div>
                  )}

                  <div className="flex gap-2 mt-2">
                    <Badge variant="outline" className={`text-xs ${pet.socialWithPets ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                      {pet.socialWithPets ? '✅ Sociaal met dieren' : '❌ Niet sociaal met dieren'}
                    </Badge>
                    <Badge variant="outline" className={`text-xs ${pet.socialWithPeople ? 'bg-green-100 text-green-700 border-green-300' : 'bg-red-100 text-red-700 border-red-300'}`}>
                      {pet.socialWithPeople ? '✅ Sociaal met mensen' : '❌ Niet sociaal met mensen'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="text-xs text-gray-500 text-center">
          💡 Deze informatie helpt je om de beste service te leveren
        </div>
      </CardContent>
    </Card>
  )
}
