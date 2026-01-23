'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { getStatusLabel } from '@/lib/status-labels'

type OwnerProfile = {
  id: string
  city: string
  postalCode: string
  region: string | null
}

type Booking = {
  id: string
  service: string
  date: string
  timeWindow: string
  city: string
  postalCode: string
  petName: string
  petType: string
  status: string
  caregiver: {
    firstName: string
    lastName: string
  } | null
}

const TIME_WINDOW_LABELS: Record<string, string> = {
  MORNING: 'Ochtend',
  AFTERNOON: 'Middag',
  EVENING: 'Avond',
  NIGHT: 'Nacht',
}

const CHAT_ELIGIBLE_STATUSES = new Set(['CONFIRMED', 'COMPLETED'])

export default function OwnerDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<OwnerProfile | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [impersonationLoading, setImpersonationLoading] = useState(false)

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile()
      fetchBookings()
    }
  }, [status])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/owner/profile')
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/owner/bookings')
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    }
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Laden...</div>
      </div>
    )
  }

  const hasProfile = !!profile
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING')
  const assignedBookings = bookings.filter((b) => b.status === 'ASSIGNED')
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED')
  const isImpersonating = session?.user?.role === 'ADMIN'

  const stopImpersonation = async () => {
    setImpersonationLoading(true)
    try {
      await fetch('/api/admin/impersonate/clear', { method: 'POST' })
      router.push('/admin')
    } finally {
      setImpersonationLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/login" primaryCtaLabel="Uitloggen" />

      <main className="container mx-auto px-4" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 mb-2">
              Eigenaar Dashboard
            </h1>
            <p className="text-gray-600">
              Welkom terug, {session?.user?.name}
            </p>
          </div>

          {isImpersonating && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex items-center justify-between gap-3">
              <span>Je bekijkt dit dashboard als beheerder.</span>
              <button
                onClick={stopImpersonation}
                disabled={impersonationLoading}
                className="px-3 py-1 rounded-lg border border-amber-300 text-amber-900 font-semibold disabled:opacity-60"
              >
                {impersonationLoading ? 'Stoppen...' : 'Stop bekijken'}
              </button>
            </div>
          )}

          {!hasProfile ? (
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Profiel nog niet compleet
              </h2>
              <p className="text-gray-600 mb-6">
                Vul je profiel aan om aanvragen te kunnen doen
              </p>
              <Link
                href="/dashboard/owner/profile"
                className="btn-brand"
              >
                Profiel aanmaken
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Owner instructions */}
              <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-2">
                  Wat moet je doen?
                </h2>
                <ol className="list-decimal pl-5 space-y-1 text-sm text-gray-700">
                  <li>Controleer je profiel en vul je thuisadres in bij Profiel.</li>
                  <li>Maak een nieuwe aanvraag aan en kies dienst, datum en tijdsblok.</li>
                  <li>Geef je huisdierinfo mee bij de aanvraag.</li>
                  <li>Wacht op toewijzing of bevestiging van de verzorger.</li>
                </ol>
              </div>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="text-2xl font-bold text-gray-900">{bookings.length}</div>
                  <div className="text-sm text-gray-600">Totaal aanvragen</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="text-2xl font-bold text-yellow-600">{pendingBookings.length}</div>
                  <div className="text-sm text-gray-600">In afwachting</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="text-2xl font-bold text-blue-600">{assignedBookings.length}</div>
                  <div className="text-sm text-gray-600">Toegewezen</div>
                </div>
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <div className="text-2xl font-bold text-green-600">{confirmedBookings.length}</div>
                  <div className="text-sm text-gray-600">Bevestigd</div>
                </div>
              </div>

              {/* Quick Links */}
              <div className="grid md:grid-cols-4 gap-4">
                <Link
                  href="/dashboard/owner/new-booking"
                  className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 hover:shadow-md transition"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    ➕ Nieuwe aanvraag
                  </h3>
                  <p className="text-sm text-gray-600">
                    Vraag dierenverzorging aan
                  </p>
                </Link>

                <Link
                  href="/dashboard/owner/calendar"
                  className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 hover:shadow-md transition"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    📅 Kalender
                  </h3>
                  <p className="text-sm text-gray-600">
                    Bekijk je planning
                  </p>
                </Link>

                <Link
                  href="/dashboard/owner/bookings"
                  className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 hover:shadow-md transition"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    📋 Mijn aanvragen
                  </h3>
                  <p className="text-sm text-gray-600">
                    Bekijk al je aanvragen
                  </p>
                </Link>

                <Link
                  href="/dashboard/owner/profile"
                  className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 hover:shadow-md transition"
                >
                  <h3 className="text-lg font-semibold text-gray-900 mb-2">
                    ⚙️ Profiel
                  </h3>
                  <p className="text-sm text-gray-600">
                    Beheer je gegevens
                  </p>
                </Link>
              </div>

              {/* Recent Bookings */}
              <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Recente aanvragen
                </h2>

                {bookings.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    Je hebt nog geen aanvragen gedaan
                  </p>
                ) : (
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map((booking) => (
                      <div
                        key={booking.id}
                        className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition"
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <div className="font-semibold text-gray-900">
                              {booking.petName} ({booking.petType})
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {new Date(booking.date).toLocaleDateString('nl-BE')} •{' '}
                              {TIME_WINDOW_LABELS[booking.timeWindow] || booking.timeWindow}
                            </div>
                            {booking.caregiver && (
                              <div className="text-sm text-emerald-700 mt-1">
                                Verzorger: {booking.caregiver.firstName} {booking.caregiver.lastName}
                              </div>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {booking.caregiver && CHAT_ELIGIBLE_STATUSES.has(booking.status) && (
                              <Link
                                href={`/chat/${booking.id}`}
                                className="text-sm text-emerald-700 font-semibold hover:underline"
                              >
                                Chat
                              </Link>
                            )}
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-medium ${
                              booking.status === 'CONFIRMED'
                                ? 'bg-green-100 text-green-800'
                                : booking.status === 'ASSIGNED'
                                  ? 'bg-blue-100 text-blue-800'
                                  : booking.status === 'PENDING'
                                    ? 'bg-yellow-100 text-yellow-800'
                                    : 'bg-gray-100 text-gray-800'
                            }`}
                          >
                            {booking.status === 'PENDING'
                              ? 'In afwachting'
                              : booking.status === 'ASSIGNED'
                                ? 'Toegewezen'
                                : booking.status === 'CONFIRMED'
                                  ? 'Bevestigd'
                                  : getStatusLabel(booking.status)}
                          </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {bookings.length > 5 && (
                  <div className="mt-4 text-center">
                    <Link
                      href="/dashboard/owner/bookings"
                      className="text-emerald-700 font-semibold hover:underline"
                    >
                      Bekijk alle aanvragen →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
