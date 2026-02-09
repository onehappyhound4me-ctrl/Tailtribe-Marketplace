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
  ARCHIVED: 'Gearchiveerd',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  ASSIGNED: 'bg-blue-100 text-blue-800 border-blue-200',
  CONFIRMED: 'bg-green-100 text-green-800 border-green-200',
  COMPLETED: 'bg-gray-100 text-gray-800 border-gray-200',
  CANCELLED: 'bg-red-100 text-red-800 border-red-200',
  ARCHIVED: 'bg-slate-100 text-slate-800 border-slate-200',
}

export default function CaregiverBookingsPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'active' | 'history'>('active')

  useEffect(() => {
    fetchBookings(view)
  }, [view])

  const fetchBookings = async (nextView: 'active' | 'history') => {
    setLoading(true)
    try {
      const url = nextView === 'history' ? '/api/caregiver/bookings?view=history' : '/api/caregiver/bookings'
      const response = await fetch(url, { cache: 'no-store' })
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
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
              <div>
                <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 mb-2">
                  Mijn Opdrachten
                </h1>
                <p className="text-gray-600">
                  {view === 'history'
                    ? 'Geschiedenis van oudere of gearchiveerde opdrachten'
                    : 'Overzicht van komende en recente opdrachten'}
                </p>
              </div>

              <div className="inline-flex rounded-full border border-emerald-200 bg-white shadow-sm overflow-hidden w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setView('active')}
                  className={`flex-1 px-4 py-2 text-sm font-semibold transition ${
                    view === 'active' ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-emerald-50'
                  }`}
                >
                  Actief
                </button>
                <button
                  type="button"
                  onClick={() => setView('history')}
                  className={`flex-1 px-4 py-2 text-sm font-semibold transition ${
                    view === 'history' ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-emerald-50'
                  }`}
                >
                  Geschiedenis
                </button>
              </div>
            </div>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                {view === 'history' ? 'Geen geschiedenis' : 'Nog geen opdrachten'}
              </h2>
              <p className="text-gray-600 mb-6">
                {view === 'history'
                  ? 'Er zijn nog geen oudere of gearchiveerde opdrachten'
                  : 'Er zijn nog geen opdrachten aan jou toegewezen'}
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
