'use client'

import { useEffect, useState, useCallback } from 'react'

interface Props {
  userCity: string
  userCountry: string
  userLat?: number | null
  userLng?: number | null
}

export function NearbyCaregiverMap({ userCity, userCountry, userLat, userLng }: Props) {
  const [caregivers, setCaregivers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const loadNearbyCaregivers = useCallback(async () => {
    try {
      const params = new URLSearchParams({
        city: userCity,
        country: userCountry,
        limit: '10'
      })
      
      const res = await fetch(`/api/caregivers/search?${params}`)
      if (res.ok) {
        const data = await res.json()
        setCaregivers(data.caregivers || [])
      }
    } catch (error) {
      console.error('Error loading nearby caregivers:', error)
    } finally {
      setLoading(false)
    }
  }, [userCity, userCountry])

  useEffect(() => {
    loadNearbyCaregivers()
  }, [loadNearbyCaregivers])

  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-gradient-to-br from-white/25 via-green-50/25 to-emerald-50/25 border border-white/40 rounded-xl p-5 shadow-lg">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-[300px] bg-gray-200 rounded"></div>
        </div>
      </div>
    )
  }

  const caregiversWithCoords = caregivers.filter(c => c.lat && c.lng)

  if (caregiversWithCoords.length === 0) {
    return (
      <div className="backdrop-blur-xl bg-gradient-to-br from-white/25 via-gray-50/25 to-slate-50/25 border border-white/40 rounded-xl p-5 shadow-lg">
        <div className="flex items-center justify-between mb-3">
          <div className="w-10 h-10 bg-gradient-to-br from-gray-400 to-slate-500 rounded-lg flex items-center justify-center">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
            </svg>
          </div>
        </div>
        <h3 className="text-lg font-bold text-gray-900 mb-2">Verzorgers in de buurt</h3>
        <p className="text-sm text-gray-600">
          Geen verzorgers met locatie gevonden in {userCity}
        </p>
      </div>
    )
  }

  return (
    <div className="backdrop-blur-xl bg-gradient-to-br from-white/25 via-green-50/25 to-emerald-50/25 border border-white/40 rounded-xl p-5 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col lg:col-span-2">
      <div className="flex items-center justify-between mb-3">
        <div className="w-10 h-10 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center">
          <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
        </div>
        <span className="bg-green-100/80 text-green-700 text-xs px-2 py-1 rounded-full">
          {caregiversWithCoords.length} verzorgers
        </span>
      </div>
      
      <h3 className="text-lg font-bold text-gray-900 mb-3">Verzorgers in de buurt</h3>
      
      <div className="flex-1 h-[300px] bg-gray-100 rounded-lg flex items-center justify-center">
        <p className="text-gray-500 text-sm">Kaart tijdelijk niet beschikbaar</p>
      </div>
    </div>
  )
}





























