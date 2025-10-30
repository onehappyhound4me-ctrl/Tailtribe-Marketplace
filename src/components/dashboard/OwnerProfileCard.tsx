'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'

interface ProfileData {
  name: string | null
  firstName: string | null
  lastName: string | null
  email: string | null
  phone: string | null
  city: string | null
  postalCode: string | null
  country: string
  notificationPreferences: any
  preferences: any
  howHeardAbout: string | null
  perfectExperience: string | null
  onboardingCompleted: boolean
  pets: any[]
}

export function OwnerProfileCard() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProfile()
  }, [])

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/profile/owner', {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (res.ok) {
        const data = await res.json()
        setProfile(data)
      } else {
        console.error('Failed to load profile:', res.status)
      }
    } catch (error) {
      console.error('Error loading profile:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-gradient-to-br from-white/25 via-blue-50/25 to-indigo-50/25 border border-white/40 rounded-lg p-5 shadow-lg flex flex-col h-[160px]">
        <div className="animate-pulse space-y-2 flex-1">
          <div className="w-9 h-9 bg-gray-300 rounded-lg"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    )
  }

  if (!profile) return null

  const preferences = profile.preferences ? JSON.parse(profile.preferences) : null
  const notifications = profile.notificationPreferences ? JSON.parse(profile.notificationPreferences) : null

  return (
    <div className="backdrop-blur-xl bg-gradient-to-br from-white/25 via-blue-50/25 to-indigo-50/25 border border-white/40 rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-[160px]">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900">Profiel</h3>
      </div>
      
      <div className="text-xs text-gray-600 mb-3 max-h-[30px] overflow-hidden">
        {profile.firstName && profile.lastName && (
          <p className="font-semibold text-gray-900 text-sm truncate">{profile.firstName} {profile.lastName}</p>
        )}
      </div>
      
      <Link 
        href="/settings?role=owner" 
        className="w-full mt-auto bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200 rounded-lg py-2 text-sm font-semibold block text-center"
      >
        Instellingen
      </Link>
    </div>
  )
}


