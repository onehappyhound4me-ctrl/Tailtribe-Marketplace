'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  name: string | null
  email: string
  role: 'OWNER' | 'CAREGIVER'
  image: string | null
  city: string | null
  bio: string | null
  createdAt: string
  caregiverProfile?: {
    hourlyRate: number
    services: string
    experience: string
    photos: string
  }
  pets?: Array<{
    id: string
    name: string
    type: string
    breed: string | null
    photo: string | null
  }>
}

export default function UserProfilePage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
  }, [params.id])

  const fetchProfile = async () => {
    try {
      console.log('Fetching profile for user ID:', params.id)
      const response = await fetch(`/api/users/${params.id}`)
      console.log('Profile API response status:', response.status)
      if (response.ok) {
        const data = await response.json()
        console.log('Profile data received:', data)
        setProfile(data)
      } else {
        const errorData = await response.json()
        console.error('Profile API error:', errorData)
        toast.error('Profiel niet gevonden')
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      toast.error('Kon profiel niet laden')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Profiel laden...</p>
        </div>
      </div>
    )
  }

  if (!profile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">Profiel niet gevonden</h2>
          <Link href={session?.user?.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner'} className="text-emerald-600 hover:text-emerald-700">
            Terug naar dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Profiel</h1>
              <p className="text-gray-600">Gebruikersprofiel</p>
            </div>
            <Link href={session?.user?.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner'} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 rounded-lg font-semibold shadow-md">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-8 py-8">
        <div className="bg-white rounded-lg shadow-lg p-8">
          {/* Profile Header */}
          <div className="flex items-start gap-6 mb-8">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white text-3xl font-bold">
              {profile.image ? (
                <img src={profile.image} alt={profile.name || 'User'} className="w-full h-full rounded-full object-cover" />
              ) : (
                (profile.name || 'U').charAt(0).toUpperCase()
              )}
            </div>
            <div className="flex-1">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">{profile.name || 'Naamloos'}</h2>
              <p className="text-gray-600 mb-1">
                {profile.role === 'CAREGIVER' ? 'Verzorger' : 'Huisdiereigenaar'}
              </p>
              {profile.city && (
                <p className="text-gray-500 flex items-center gap-1">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  {profile.city}
                </p>
              )}
              {profile.bio && (
                <p className="text-gray-700 mt-4">{profile.bio}</p>
              )}
            </div>
          </div>

          {/* Caregiver Specific Info */}
          {profile.role === 'CAREGIVER' && profile.caregiverProfile && (
            <div className="border-t pt-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Diensten & Tarieven</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-600">Tarief per uur</p>
                  <p className="text-2xl font-bold text-emerald-600">€{profile.caregiverProfile.hourlyRate}</p>
                </div>
                {profile.caregiverProfile.services && (
                  <div>
                    <p className="text-sm text-gray-600">Diensten</p>
                    <p className="text-lg font-semibold text-gray-800">
                      {profile.caregiverProfile.services.split(',').join(', ')}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Owner Pets */}
          {profile.role === 'OWNER' && profile.pets && profile.pets.length > 0 && (
            <div className="border-t pt-6 mb-6">
              <h3 className="text-xl font-semibold text-gray-800 mb-4">Huisdieren</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {profile.pets.map((pet) => (
                  <div key={pet.id} className="border rounded-lg p-4">
                    {pet.photo ? (
                      <img src={pet.photo} alt={pet.name} className="w-full h-32 object-cover rounded-lg mb-2" />
                    ) : (
                      <div className="w-full h-32 bg-gray-200 rounded-lg mb-2 flex items-center justify-center">
                        <span className="text-4xl">🐾</span>
                      </div>
                    )}
                    <h4 className="font-semibold text-gray-800">{pet.name}</h4>
                    <p className="text-sm text-gray-600">{pet.type} - {pet.breed}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Action Buttons */}
          <div className="border-t pt-6 flex gap-4">
            {profile.role === 'CAREGIVER' && (
              <Link 
                href={`/booking/new?caregiver=${profile.id}`}
                className="px-6 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 font-semibold transition-colors"
              >
                Boeken
              </Link>
            )}
            <Link 
              href={session?.user?.id === profile.id ? '/profile/edit' : `/messages/${params.id}`}
              className="px-6 py-3 border border-gray-300 rounded-lg hover:bg-gray-50 font-semibold transition-colors"
            >
              {session?.user?.id === profile.id ? 'Profiel bewerken' : 'Bericht sturen'}
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
