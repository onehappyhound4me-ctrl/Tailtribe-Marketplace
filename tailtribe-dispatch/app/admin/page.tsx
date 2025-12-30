'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { SERVICE_LABELS } from '@/lib/services'

type BookingStatus = 'PENDING' | 'ASSIGNED' | 'CONFIRMED' | 'COMPLETED'

type Booking = {
  id: string
  service: string
  date: string
  time: string
  firstName: string
  lastName: string
  email: string
  phone: string
  city: string
  postalCode: string
  petName: string
  petType: string
  message?: string
  status: BookingStatus
  assignedTo: string | null
  adminNotes: string
  createdAt: string
  updatedAt: string
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [draftById, setDraftById] = useState<Record<string, { assignedTo: string; adminNotes: string }>>({})
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  useEffect(() => {
    fetchBookings()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchBookings, 30000)
    return () => clearInterval(interval)
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      const data = await response.json()
      const next = Array.isArray(data) ? (data as Booking[]) : []
      setBookings(next)
      setDraftById((prev) => {
        const copy = { ...prev }
        for (const b of next) {
          if (!copy[b.id]) {
            copy[b.id] = { assignedTo: b.assignedTo ?? '', adminNotes: b.adminNotes ?? '' }
          }
        }
        return copy
      })
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
      setErrorMsg('Kon aanvragen niet laden. Probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  const updateBooking = async (id: string, patch: Record<string, any>) => {
    setActionLoadingId(id)
    setErrorMsg(null)
    try {
      const res = await fetch('/api/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, ...patch }),
      })
      if (!res.ok) {
        setErrorMsg('Kon aanvraag niet bijwerken. Probeer opnieuw.')
        return
      }
      await fetchBookings()
    } finally {
      setActionLoadingId(null)
    }
  }

  const statusColors: Record<string, string> = {
    PENDING: 'bg-yellow-100 text-yellow-800',
    ASSIGNED: 'bg-blue-100 text-blue-800',
    CONFIRMED: 'bg-green-100 text-green-800',
    COMPLETED: 'bg-gray-100 text-gray-800'
  }

  const statusLabels: Record<BookingStatus, string> = {
    PENDING: 'Nieuw',
    ASSIGNED: 'Toegewezen',
    CONFIRMED: 'Bevestigd',
    COMPLETED: 'Afgerond',
  }

  const serviceNames: Record<string, string> = SERVICE_LABELS

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Laden...</div>
      </div>
    )
  }

  const sorted = [...bookings].sort((a, b) => {
    const at = new Date(a.createdAt).getTime()
    const bt = new Date(b.createdAt).getTime()
    return bt - at
  })

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/" primaryCtaLabel="Terug naar site" />

      {/* Dashboard */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Dispatch dashboard</h1>
              <p className="text-gray-600">{bookings.length} aanvragen in totaal</p>
            </div>
            <button
              onClick={fetchBookings}
              className="px-6 py-2.5 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-full font-semibold hover:from-green-700 hover:to-blue-700 transition shadow-lg"
            >
              Ververs
            </button>
          </div>
        </div>

        {errorMsg && (
          <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
            {errorMsg}
          </div>
        )}

        {/* Stats */}
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-2xl font-bold text-gray-900">
              {bookings.filter(b => b.status === 'PENDING').length}
            </div>
            <div className="text-sm text-gray-600">Nieuw</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-2xl font-bold text-blue-600">
              {bookings.filter(b => b.status === 'ASSIGNED').length}
            </div>
            <div className="text-sm text-gray-600">Toegewezen</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-2xl font-bold text-green-600">
              {bookings.filter(b => b.status === 'CONFIRMED').length}
            </div>
            <div className="text-sm text-gray-600">Bevestigd</div>
          </div>
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="text-2xl font-bold text-gray-400">
              {bookings.filter(b => b.status === 'COMPLETED').length}
            </div>
            <div className="text-sm text-gray-600">Afgerond</div>
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nog geen bookings</h3>
            <p className="text-gray-600">Nieuwe bookings verschijnen hier automatisch</p>
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map((booking) => (
              <div key={booking.id} className="bg-white rounded-xl shadow-sm p-6 hover:shadow-md transition">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-xl font-bold text-gray-900">
                        {booking.firstName} {booking.lastName}
                      </h3>
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColors[booking.status] || 'bg-gray-100 text-gray-800'}`}>
                        {statusLabels[booking.status] ?? booking.status}
                      </span>
                    </div>
                    <p className="text-gray-600">
                      {booking.email} • {booking.phone}
                    </p>
                  </div>
                  <div className="text-sm text-gray-500">
                    {new Date(booking.createdAt).toLocaleDateString('nl-BE', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit'
                    })}
                  </div>
                </div>

                <div className="grid md:grid-cols-3 gap-4 mb-4">
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Service</div>
                    <div className="font-semibold">{serviceNames[booking.service] || booking.service}</div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Datum & Tijd</div>
                    <div className="font-semibold">
                      {new Date(booking.date).toLocaleDateString('nl-BE')} om {booking.time}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm font-medium text-gray-500 mb-1">Locatie</div>
                    <div className="font-semibold">{booking.city}, {booking.postalCode}</div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4 mb-4">
                  <div className="text-sm font-medium text-gray-500 mb-2">Huisdier Info</div>
                  <div className="font-semibold mb-1">
                    {booking.petName} ({booking.petType})
                  </div>
                  {booking.message && (
                    <p className="text-gray-600 text-sm">{booking.message}</p>
                  )}
                </div>

                <div className="grid md:grid-cols-3 gap-4 items-end">
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Toewijzen aan</label>
                    <input
                      value={draftById[booking.id]?.assignedTo ?? ''}
                      onChange={(e) =>
                        setDraftById((prev) => ({
                          ...prev,
                          [booking.id]: { assignedTo: e.target.value, adminNotes: prev[booking.id]?.adminNotes ?? '' },
                        }))
                      }
                      placeholder="Naam freelancer"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-600 mb-2">Interne notitie</label>
                    <input
                      value={draftById[booking.id]?.adminNotes ?? ''}
                      onChange={(e) =>
                        setDraftById((prev) => ({
                          ...prev,
                          [booking.id]: { assignedTo: prev[booking.id]?.assignedTo ?? '', adminNotes: e.target.value },
                        }))
                      }
                      placeholder="Optioneel"
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div className="flex flex-wrap gap-2 justify-start md:justify-end">
                    <button
                      type="button"
                      disabled={actionLoadingId === booking.id}
                      onClick={async () => {
                        const draft = draftById[booking.id]
                        const assignedTo = (draft?.assignedTo ?? '').trim()
                        const adminNotes = (draft?.adminNotes ?? '').trim()
                        await updateBooking(booking.id, {
                          status: assignedTo ? 'ASSIGNED' : booking.status,
                          assignedTo: assignedTo || null,
                          adminNotes,
                        })
                      }}
                      className="px-4 py-2 bg-brand text-white rounded-lg hover:brightness-110 text-sm font-medium disabled:opacity-60"
                    >
                      {actionLoadingId === booking.id ? 'Bezig…' : 'Opslaan'}
                    </button>
                    <a
                      href={`mailto:${encodeURIComponent(booking.email)}?subject=${encodeURIComponent('TailTribe – bevestiging van je aanvraag')}`}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                    >
                      E-mail klant
                    </a>
                    <a
                      href={`tel:${encodeURIComponent(booking.phone)}`}
                      className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-800 text-sm font-medium"
                    >
                      Bel klant
                    </a>
                    <button
                      type="button"
                      disabled={actionLoadingId === booking.id}
                      onClick={() => updateBooking(booking.id, { status: 'COMPLETED' })}
                      className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm font-medium disabled:opacity-60"
                    >
                      Afgerond
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  )
}

