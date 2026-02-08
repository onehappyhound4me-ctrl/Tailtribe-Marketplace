'use client'

import { useEffect, useState } from 'react'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { DISPATCH_SERVICES } from '@/lib/services'

type Booking = {
  id: string
  service: string
  date: string
  timeWindow: string
  city: string
  postalCode: string
  petName: string
  petType: string
  petDetails: string | null
  status: string
  isRecurring: boolean
  createdAt: string
  owner: {
    firstName: string
    lastName: string
  }
}

const TIME_WINDOW_LABELS: Record<string, string> = {
  MORNING: 'Ochtend (07:00-12:00)',
  AFTERNOON: 'Middag (12:00-18:00)',
  EVENING: 'Avond (18:00-22:00)',
  NIGHT: 'Nacht (22:00-07:00)',
}

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'In afwachting',
  ASSIGNED: 'Toegewezen',
  CONFIRMED: 'Bevestigd',
  COMPLETED: 'Afgerond',
  CANCELLED: 'Geannuleerd',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ASSIGNED: 'bg-blue-100 text-blue-800 border-blue-200',
  CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
  COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
}

export default function CaregiverBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/caregiver/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setLoading(false)
    }
  }


  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Laden...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/dashboard/caregiver" primaryCtaLabel="Dashboard" />

      <main className="container mx-auto px-4" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        <div className="max-w-5xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 mb-2">
              Mijn Opdrachten
            </h1>
            <p className="text-gray-600">
              Overzicht van alle opdrachten die aan jou zijn toegewezen
            </p>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                Nog geen opdrachten
              </h2>
              <p className="text-gray-600 mb-6">
                Er zijn nog geen opdrachten aan jou toegewezen
              </p>
              <p className="text-sm text-gray-500">
                Opdrachten worden door de beheerder toegewezen op basis van je beschikbaarheid en werkgebied
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((booking) => {
                const serviceName =
                  DISPATCH_SERVICES.find((service) => service.id === booking.service)?.name ||
                  booking.service

                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 hover:shadow-md transition"
                  >
                    <div className="flex items-start justify-between gap-4 mb-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-xl font-semibold text-gray-900">
                            {booking.petName} ({booking.petType})
                          </h3>
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium border ${
                              STATUS_COLORS[booking.status] || 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {STATUS_LABELS[booking.status] || booking.status}
                          </span>
                          {booking.isRecurring && (
                            <span className="px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800 border border-purple-200">
                              🔄 Reeks
                            </span>
                          )}
                        </div>
                        <div className="text-gray-600">
                          {serviceName}
                        </div>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4 mb-4">
                      <div>
                        <div className="text-sm text-gray-500 mb-1">📅 Datum & Tijd</div>
                        <div className="font-medium text-gray-900">
                          {new Date(booking.date).toLocaleDateString('nl-BE', {
                            weekday: 'long',
                            year: 'numeric',
                            month: 'long',
                            day: 'numeric',
                          })}
                        </div>
                        <div className="text-sm text-gray-600">
                          {TIME_WINDOW_LABELS[booking.timeWindow] || booking.timeWindow}
                        </div>
                      </div>

                      <div>
                        <div className="text-sm text-gray-500 mb-1">📍 Locatie</div>
                        <div className="font-medium text-gray-900">
                          {booking.city}, {booking.postalCode}
                        </div>
                      </div>
                    </div>

                    {booking.petDetails && (
                      <div className="mb-4">
                        <div className="text-sm text-gray-500 mb-1">ℹ️ Details Huisdier</div>
                        <div className="text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                          {booking.petDetails}
                        </div>
                      </div>
                    )}

                    <div className="pt-4 border-t border-gray-100">
                      <div className="text-sm text-gray-500 mb-1">👤 Eigenaar</div>
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div className="font-medium text-gray-900">
                          {booking.owner.firstName} {booking.owner.lastName}
                        </div>
                        <div className="text-xs text-gray-500">
                          Je mag enkel je adres delen via de chat. Deel geen telefoonnummer, e-mail of links.
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 text-xs text-gray-500">
                      Toegewezen op:{' '}
                      {new Date(booking.createdAt).toLocaleDateString('nl-BE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
