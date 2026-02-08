'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
// Use relative import to avoid path-alias resolution issues in some Vercel build configurations.
import { getStatusLabel } from '../../../lib/status-labels'

type CaregiverProfile = {
  id: string
  city: string
  postalCode: string
  region: string | null
  workRegions: string
  services: string
  experience: string
  isApproved: boolean
  isActive: boolean
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
  owner: {
    firstName: string
    lastName: string
    email: string
    phone: string | null
  }
}

const TIME_WINDOW_LABELS: Record<string, string> = {
  MORNING: 'Ochtend',
  AFTERNOON: 'Middag',
  EVENING: 'Avond',
  NIGHT: 'Nacht',
}

export default function CaregiverDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<CaregiverProfile | null>(null)
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
      const response = await fetch('/api/caregiver/profile', { cache: 'no-store' })
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
    setBookings([])
    try {
      const response = await fetch('/api/caregiver/bookings', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setBookings(data)
      } else {
        setBookings([])
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
      setBookings([])
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
      <SiteHeader primaryCtaHref="/logout" primaryCtaLabel="Uitloggen" />

      <main className="container mx-auto px-4" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        <div className="max-w-6xl mx-auto">
          <div className="mb-8">
            <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700">
              Verzorger Dashboard
            </h1>
            <p className="mt-1 text-sm sm:text-base text-gray-600">
              Welkom terug, {session?.user?.name}
            </p>
            <div className="mt-3 rounded-xl border border-emerald-100 bg-emerald-50/60 px-4 py-3 text-sm text-emerald-900">
              <div className="font-semibold">Wat moet je doen?</div>
              <ol className="mt-1 list-decimal pl-5 space-y-1 text-sm text-emerald-900/90">
                <li>Vul je profiel in bij Instellingen.</li>
                <li>Zet je beschikbaarheid in Kalender.</li>
                <li>
                  Kijk je opdrachten na. Zodra een opdracht bevestigd is, kan je chatten via de knop <strong>Chat</strong> bij je recente
                  opdrachten.
                </li>
              </ol>
            </div>
          </div>

          {isImpersonating && (
            <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="min-w-0">Je bekijkt dit dashboard als beheerder.</span>
              <button
                onClick={stopImpersonation}
                disabled={impersonationLoading}
                className="w-full sm:w-auto px-4 py-2 rounded-xl border border-amber-300 text-amber-900 font-semibold disabled:opacity-60"
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
                Vul je profiel aan om opdrachten te kunnen ontvangen
              </p>
              <Link
                href="/dashboard/caregiver/profile"
                className="btn-brand w-full sm:w-auto inline-flex justify-center"
              >
                Profiel aanmaken
              </Link>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Quick Links */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <Link
                  href="/dashboard/caregiver/calendar"
                  className="bg-white rounded-2xl shadow-sm border border-black/5 p-4 sm:p-6 hover:shadow-md transition"
                >
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Kalender
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Bekijk je planning
                  </p>
                </Link>

                <Link
                  href="/dashboard/caregiver/bookings"
                  className="bg-white rounded-2xl shadow-sm border border-black/5 p-4 sm:p-6 hover:shadow-md transition"
                >
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Mijn opdrachten
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    {bookings.length} actieve opdrachten
                  </p>
                </Link>

                <Link
                  href="/dashboard/caregiver/profile"
                  className="bg-white rounded-2xl shadow-sm border border-black/5 p-4 sm:p-6 hover:shadow-md transition"
                >
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900">
                    Instellingen
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Profiel en voorkeuren
                  </p>
                </Link>
              </div>

              {/* Recent Bookings */}
              <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Recente opdrachten
                </h2>

                {bookings.length === 0 ? (
                  <p className="text-gray-600 text-center py-8">
                    Nog geen opdrachten toegewezen
                  </p>
                ) : (
                  <div className="space-y-3">
                    {bookings.slice(0, 5).map((booking) => (
                      <div
                        key={booking.id}
                        className="border border-gray-200 rounded-xl p-4 hover:bg-gray-50 transition"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="min-w-0">
                            <div className="font-semibold text-gray-900">
                              {booking.petName} ({booking.petType})
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {new Date(booking.date).toLocaleDateString('nl-BE')} •{' '}
                              {TIME_WINDOW_LABELS[booking.timeWindow] || booking.timeWindow}
                            </div>
                            <div className="text-sm text-gray-600">
                              {booking.city}, {booking.postalCode}
                            </div>
                          </div>
                          <div className="flex flex-row sm:flex-col sm:items-end items-center justify-between gap-2">
                            <span
                              className={`px-3 py-1 rounded-full text-xs font-medium ${
                                booking.status === 'CONFIRMED'
                                  ? 'bg-green-100 text-green-800'
                                  : booking.status === 'ASSIGNED'
                                    ? 'bg-blue-100 text-blue-800'
                                    : 'bg-gray-100 text-gray-800'
                              }`}
                            >
                              {getStatusLabel(booking.status)}
                            </span>
                            {['CONFIRMED', 'COMPLETED'].includes(booking.status) && (
                              <Link
                                href={`/chat/${booking.id}`}
                                className="text-xs font-semibold text-emerald-700 hover:underline whitespace-nowrap"
                              >
                                Chat
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {bookings.length > 5 && (
                  <div className="mt-4 text-center">
                    <Link
                      href="/dashboard/caregiver/bookings"
                      className="text-emerald-700 font-semibold hover:underline"
                    >
                      Bekijk alle opdrachten →
                    </Link>
                  </div>
                )}
              </div>

              {/* Status Overzicht */}
              <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">
                      Statusoverzicht
                    </h2>
                    <div className="flex flex-wrap items-center gap-2 select-none pointer-events-none">
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          profile.isApproved
                            ? 'bg-green-100 text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        {profile.isApproved ? 'Goedgekeurd' : 'In afwachting'}
                      </span>
                      <span
                        className={`px-3 py-1 rounded-full text-sm font-medium ${
                          profile.isActive
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {profile.isActive ? 'Actief' : 'Inactief'}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-gray-600">
                    Bewerk en sla je profiel op via <strong>Instellingen</strong>.
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
