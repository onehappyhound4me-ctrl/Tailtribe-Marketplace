'use client'

import { useParams } from 'next/navigation'
import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { CaregiverAvailabilityCalendar } from '@/components/owner/CaregiverAvailabilityCalendar'

export default function CaregiverAvailabilityPage() {
  const params = useParams()
  const [caregiverData, setCaregiverData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  const fetchCaregiverData = useCallback(async () => {
    try {
      const res = await fetch(`/api/caregiver/${params.id}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setCaregiverData(data)
      }
    } catch (error) {
      console.error('Error fetching caregiver data:', error)
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (params.id) {
      fetchCaregiverData()
    }
  }, [params.id, fetchCaregiverData])

  const handleSlotSelect = (date: string, start: string, end: string) => {
    // Navigate to booking page with prefilled data
    const bookingUrl = `/booking/new?caregiverId=${params.id}&date=${date}&start=${start}&end=${end}`
    window.location.href = bookingUrl
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!caregiverData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Verzorger niet gevonden</h2>
          <Link href="/search" className="text-blue-600 hover:text-blue-800">
            Terug naar zoeken
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                Beschikbaarheid van {caregiverData.name}
              </h1>
              <p className="text-gray-600 mt-1">
                Bekijk beschikbare tijden en boek een afspraak
              </p>
            </div>
            <Link 
              href={`/caregivers/${params.id}`}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Terug naar profiel
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-6xl mx-auto">
          {/* Calendar */}
          <div className="bg-white rounded-xl shadow-lg overflow-hidden">
            <div className="p-6">
              <CaregiverAvailabilityCalendar
                caregiverId={params.id as string}
                readOnly={true}
                onSelect={handleSlotSelect}
              />
            </div>
          </div>

          {/* Booking Info */}
          <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
            <h3 className="text-lg font-semibold text-blue-900 mb-2">
              Hoe werkt het boeken?
            </h3>
            <div className="space-y-2 text-blue-800">
              <p>• Klik op een groene dag om beschikbare tijden te zien</p>
              <p>• Selecteer een tijd slot om door te gaan naar het boekingsformulier</p>
              <p>• Blauwe dagen zijn al geboekt door andere klanten</p>
              <p>• Rode dagen zijn geblokkeerd door de verzorger</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}