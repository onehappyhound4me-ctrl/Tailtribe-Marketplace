'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { getAnimalTypeLabel, getAnimalTypeIcon } from '@/lib/animal-types'

interface NewUser {
  id: string
  userId?: string
  name: string
  city: string
  createdAt: string
  userType: 'OWNER' | 'CAREGIVER'
  petCount?: number
  hourlyRate?: number
  avgRating?: number
  reviewCount?: number
  pets?: Array<{ id: string; name: string; type: string }>
}

export function NewUsersWidget() {
  const { data: session } = useSession()
  const [newUsers, setNewUsers] = useState<NewUser[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchNewUsers()
  }, [])

  const fetchNewUsers = async () => {
    try {
      const res = await fetch('/api/dashboard/new-users')
      if (res.ok) {
        const data = await res.json()
        setNewUsers(data.newUsers || [])
      }
    } catch (error) {
      console.error('Error fetching new users:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-white/40 border border-white/60 rounded-xl p-6 shadow-lg">
        <div className="animate-pulse space-y-3">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-1/2"></div>
        </div>
      </div>
    )
  }

  if (newUsers.length === 0) {
    return null // Don't show widget if no new users
  }

  const isCaregiver = session?.user?.role === 'CAREGIVER'
  const title = isCaregiver 
    ? 'Nieuwe eigenaren in jouw buurt' 
    : 'Nieuwe dierenoppassers in jouw buurt'
  const icon = isCaregiver ? '👋' : '✨'

  return (
    <div className="backdrop-blur-xl bg-gradient-to-br from-white/40 via-amber-50/30 to-yellow-50/30 border border-amber-200/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{icon}</span>
          <h3 className="text-lg font-bold text-gray-900">{title}</h3>
        </div>
        <span className="bg-amber-100 text-amber-700 text-xs px-2 py-1 rounded-full font-semibold">
          {newUsers.length} nieuw
        </span>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        {isCaregiver 
          ? 'Deze eigenaren zoeken hulp in jouw regio' 
          : 'Recent goedgekeurd en klaar om te helpen'}
      </p>

      <div className="space-y-3">
        {newUsers.slice(0, 3).map((user) => (
          <div
            key={user.id}
            className="bg-white/70 backdrop-blur-sm rounded-lg p-4 border border-gray-200/50 hover:border-emerald-300 transition-all"
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <div className="w-8 h-8 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-sm">
                    {user.name?.charAt(0).toUpperCase() || '?'}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
                    <p className="text-xs text-gray-600">{user.city}</p>
                  </div>
                </div>
                
                {user.userType === 'OWNER' && user.pets && user.pets.length > 0 && (
                  <div className="flex items-center gap-1 mt-2">
                    {user.pets.map((pet) => (
                      <span key={pet.id} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                        {getAnimalTypeIcon(pet.type)} {pet.name}
                      </span>
                    ))}
                  </div>
                )}

                {user.userType === 'CAREGIVER' && (
                  <div className="flex items-center gap-2 mt-2">
                    <span className="text-xs text-emerald-700 font-semibold">
                      €{user.hourlyRate}/uur
                    </span>
                    {user.avgRating && user.avgRating > 0 && (
                      <span className="text-xs text-gray-600">
                        ⭐ {user.avgRating.toFixed(1)} ({user.reviewCount})
                      </span>
                    )}
                  </div>
                )}
              </div>

              <div className="flex-shrink-0">
                {user.userType === 'CAREGIVER' ? (
                  <Link
                    href={`/caregivers/${user.id}`}
                    className="text-xs px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-medium transition-colors"
                  >
                    Bekijk
                  </Link>
                ) : (
                  <span className="text-xs bg-gray-100 text-gray-600 px-3 py-1.5 rounded-lg">
                    {new Date(user.createdAt).toLocaleDateString('nl-BE', { day: 'numeric', month: 'short' })}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {newUsers.length > 3 && (
        <div className="mt-4 text-center">
          <Link
            href={isCaregiver ? '/search' : '/search'}
            className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold"
          >
            Bekijk alle {newUsers.length} nieuwe gebruikers →
          </Link>
        </div>
      )}
    </div>
  )
}




