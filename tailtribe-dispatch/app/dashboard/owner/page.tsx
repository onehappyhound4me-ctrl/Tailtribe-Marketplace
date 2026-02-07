'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
// Use relative import to avoid path-alias resolution issues in some Vercel build configurations.
import { getStatusLabel } from '../../../lib/status-labels'
import { SERVICE_LABELS } from '@/lib/services'

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
  offers?: {
    id: string
    caregiverId: string
    caregiver: {
      id: string
      firstName: string
      lastName: string
      email: string
      phone: string | null
    }
    unit: string
    priceCents: number
  }[]
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

type NotificationItem = {
  id: string
  type: string
  title: string
  message: string
  entityId?: string | null
  readAt: string | null
  createdAt: string
}

export default function OwnerDashboardPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const [profile, setProfile] = useState<OwnerProfile | null>(null)
  const [bookings, setBookings] = useState<Booking[]>([])
  const [bookingsError, setBookingsError] = useState<string | null>(null)
  const [notifications, setNotifications] = useState<NotificationItem[]>([])
  const [notificationsLoading, setNotificationsLoading] = useState(false)
  const [notificationsError, setNotificationsError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [impersonationLoading, setImpersonationLoading] = useState(false)
  const [rejectLoadingCaregiverId, setRejectLoadingCaregiverId] = useState<string | null>(null)
  const [rejectError, setRejectError] = useState<string | null>(null)

  const notificationsLoadingRef = useRef(false)

  const fetchProfile = useCallback(async () => {
    try {
      const response = await fetch('/api/owner/profile', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setProfile(data)
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchBookings = useCallback(async () => {
    setBookingsError(null)
    try {
      const response = await fetch('/api/owner/bookings', { cache: 'no-store' })
      const data = await response.json().catch(() => null)
      if (!response.ok) {
        const msg = (data && typeof data === 'object' && (data as any).error) ? String((data as any).error) : 'Kon aanvragen niet laden'
        setBookings([])
        setBookingsError(`${msg} (status ${response.status})`)
        return
      }
      setBookings(Array.isArray(data) ? (data as Booking[]) : [])
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
      setBookings([])
      setBookingsError('Kon aanvragen niet laden (network/fetch)')
    }
  }, [])

  const fetchNotifications = useCallback(async () => {
    if (notificationsLoadingRef.current) return
    notificationsLoadingRef.current = true
    setNotificationsLoading(true)
    setNotificationsError(null)
    try {
      const res = await fetch('/api/notifications', { cache: 'no-store' })
      if (!res.ok) {
        const data = await res.json().catch(() => ({}))
        throw new Error(data?.error || 'Kon meldingen niet laden')
      }
      const data = (await res.json()) as NotificationItem[]
      setNotifications(Array.isArray(data) ? data : [])
    } catch (e) {
      setNotificationsError(e instanceof Error ? e.message : 'Kon meldingen niet laden')
      setNotifications([])
    } finally {
      setNotificationsLoading(false)
      notificationsLoadingRef.current = false
    }
  }, [])

  useEffect(() => {
    if (status === 'authenticated') {
      fetchProfile()
      fetchBookings()
      fetchNotifications()
    }
  }, [status, fetchProfile, fetchBookings, fetchNotifications])

  const markNotificationsRead = async (ids: string[]) => {
    if (!ids || ids.length === 0) return
    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids }),
      })
      setNotifications((prev) => prev.map((n) => (ids.includes(n.id) ? { ...n, readAt: n.readAt ?? new Date().toISOString() } : n)))
    } catch {
      // ignore (best-effort)
    }
  }

  const rejectOfferGroup = async (caregiverId: string, bookingIds: string[], caregiverName: string) => {
    if (!caregiverId || !bookingIds || bookingIds.length === 0) return
    if (
      !window.confirm(
        `Weiger ${caregiverName} voor ${bookingIds.length} dag(en)?\n\nDit verwijdert dit voorstel uit je lijst.`
      )
    ) {
      return
    }

    setRejectError(null)
    setRejectLoadingCaregiverId(caregiverId)
    try {
      const res = await fetch('/api/owner/offers/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId, bookingIds }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Kon voorstel niet verwijderen.')
      }
      await fetchBookings()
    } catch (e) {
      setRejectError(e instanceof Error ? e.message : 'Kon voorstel niet verwijderen.')
    } finally {
      setRejectLoadingCaregiverId(null)
    }
  }

  const hasProfile = !!profile
  const pendingBookings = bookings.filter((b) => b.status === 'PENDING')
  const assignedBookings = bookings.filter((b) => Boolean(b.caregiver) || b.status === 'ASSIGNED')
  const confirmedBookings = bookings.filter((b) => b.status === 'CONFIRMED')
  const isImpersonating = session?.user?.role === 'ADMIN'
  const unreadNotifications = notifications.filter((n) => !n.readAt)
  const latestNotifications = notifications.slice(0, 3)

  const offerGroups = useMemo(() => {
    const map = new Map<
      string,
      {
        caregiverId: string
        caregiver: NonNullable<Booking['offers']>[number]['caregiver']
        bookings: Booking[]
      }
    >()

    for (const b of bookings) {
      if (b.caregiver) continue
      const offers = b.offers ?? []
      for (const o of offers) {
        const existing = map.get(o.caregiverId)
        if (!existing) {
          map.set(o.caregiverId, { caregiverId: o.caregiverId, caregiver: o.caregiver, bookings: [b] })
        } else if (!existing.bookings.some((x) => x.id === b.id)) {
          existing.bookings.push(b)
        }
      }
    }

    const groups = Array.from(map.values())
      .map((g) => ({
        ...g,
        bookings: g.bookings.slice().sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()),
      }))
      .sort((a, b) => {
        const aTime = a.bookings[0] ? new Date(a.bookings[0].date).getTime() : 0
        const bTime = b.bookings[0] ? new Date(b.bookings[0].date).getTime() : 0
        return aTime - bTime
      })

    return groups
  }, [bookings])
  const debugEnabled =
    typeof window !== 'undefined' && new URLSearchParams(window.location.search).get('debug') === '1'

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Laden...</div>
      </div>
    )
  }

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

          <div className="mb-6 bg-white rounded-2xl shadow-sm border border-black/5 p-5">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-3">
              <div>
                <h2 className="text-lg font-semibold text-gray-900">Meldingen</h2>
                <div className="text-xs text-gray-600">
                  {bookingsError ? 'Aanvragen: fout' : `Aanvragen: ${bookings.length}`}
                  {offerGroups.length > 0 ? ` • Nieuwe voorstellen: ${offerGroups.length}` : ''}
                </div>
              </div>
            </div>

            {bookingsError && (
              <div className="mb-4 text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                {bookingsError}
              </div>
            )}

            {offerGroups.length > 0 && (
              <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3">
                <div className="text-sm font-semibold text-blue-900 mb-1">Nieuwe verzorger voorgesteld</div>
                <div className="text-xs text-blue-900/80 mb-3">
                  Bekijk de dagen en keur goed in één overzicht.
                </div>

                {rejectError && (
                  <div className="mb-3 rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-800">
                    {rejectError}
                  </div>
                )}

                <div className="space-y-3">
                  {offerGroups.slice(0, 3).map((g) => {
                    const caregiverName =
                      `${g.caregiver.firstName ?? ''} ${g.caregiver.lastName ?? ''}`.trim() || g.caregiver.email
                    const serviceSet = new Set<string>(g.bookings.map((b) => b.service))
                    const serviceLabels = Array.from(serviceSet).map(
                      (id) => (SERVICE_LABELS as Record<string, string>)[id] ?? id
                    )

                    const dayLines = g.bookings.map((b) => {
                      const d = new Date(b.date).toLocaleDateString('nl-BE')
                      const lbl = (SERVICE_LABELS as Record<string, string>)[b.service] ?? b.service
                      return `${d} (${lbl})`
                    })
                    const shown = dayLines.slice(0, 6)
                    const rest = Math.max(0, dayLines.length - shown.length)
                    return (
                      <div key={g.caregiverId} className="rounded-xl border border-blue-200 bg-white/60 px-3 py-3">
                        <div className="flex flex-wrap items-start justify-between gap-3">
                          <div className="min-w-0 sm:min-w-[200px] pr-2">
                            <div className="text-sm font-semibold text-blue-950">{caregiverName}</div>
                            <div className="text-xs text-blue-950/70">
                              {g.bookings.length} dag(en){serviceLabels.length > 0 ? ` • ${serviceLabels.join(' • ')}` : ''}
                            </div>
                          </div>

                          <div className="flex-1 min-w-0 sm:min-w-[220px] text-xs text-blue-950/80 break-words">
                            <span className="font-semibold">Dagen:</span> {shown.join(' • ')}
                            {rest > 0 ? ` • +${rest}` : ''}
                          </div>

                          <div className="flex flex-col sm:flex-row sm:flex-wrap sm:justify-end sm:items-center gap-2 w-full sm:w-auto sm:ml-auto">
                            <Link
                              href={`/dashboard/owner/caregivers/${g.caregiverId}`}
                              className="w-full sm:w-auto px-3 py-1.5 rounded-lg border border-blue-200 text-blue-900 text-sm font-semibold hover:bg-blue-50 text-center whitespace-nowrap"
                            >
                              Bekijk profiel
                            </Link>
                            <Link
                              href={`/dashboard/owner/bookings?caregiver=${encodeURIComponent(g.caregiverId)}`}
                              className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-blue-700 text-white text-sm font-semibold hover:bg-blue-800 text-center whitespace-nowrap"
                            >
                              Keur goed
                            </Link>
                            <button
                              type="button"
                              onClick={() =>
                                rejectOfferGroup(
                                  g.caregiverId,
                                  g.bookings.map((b) => b.id),
                                  caregiverName
                                )
                              }
                              disabled={rejectLoadingCaregiverId === g.caregiverId}
                              className="w-full sm:w-auto px-3 py-1.5 rounded-lg border border-red-200 text-red-800 text-sm font-semibold hover:bg-red-50 disabled:opacity-60 text-center whitespace-nowrap"
                            >
                              {rejectLoadingCaregiverId === g.caregiverId ? 'Bezig...' : 'Weiger'}
                            </button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>

                {offerGroups.length > 3 && (
                  <div className="mt-3 text-xs text-blue-900/80">
                    Er zijn nog meer voorstellen.{' '}
                    <Link href="/dashboard/owner/bookings" className="font-semibold hover:underline">
                      Bekijk alles
                    </Link>
                  </div>
                )}
              </div>
            )}

            {debugEnabled && (
              <div className="mb-4 rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-700">
                <div className="font-semibold mb-1">Debug</div>
                <div>Status: {status}</div>
                <div>Role: {String((session as any)?.user?.role ?? '')}</div>
                <div>Bookings: {bookings.length}</div>
                  <div>Bookings with offers: {bookings.filter((b) => !b.caregiver && (b.offers?.length ?? 0) > 0).length}</div>
                <div>Notifications: {notifications.length}</div>
                <div>Unread notifications: {unreadNotifications.length}</div>
              </div>
            )}

            {notificationsError && (
              <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                {notificationsError}
              </div>
            )}

            {!bookingsError && offerGroups.length === 0 && (
              <div className="text-sm text-gray-700">
                Geen nieuwe voorstellen. Je ziet hier iets zodra er een verzorger is voorgesteld.
              </div>
            )}
          </div>

          {false && (
            <div className="mb-6 bg-white rounded-2xl shadow-sm border border-black/5 p-5">
              <div className="flex items-center justify-between gap-3 mb-2">
                <h2 className="text-lg font-semibold text-gray-900">Meldingen</h2>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={fetchNotifications}
                    disabled={notificationsLoading}
                    className="px-3 py-1.5 rounded-lg border border-gray-200 text-sm font-semibold text-gray-800 disabled:opacity-60"
                  >
                    {notificationsLoading ? 'Laden...' : 'Vernieuwen'}
                  </button>
                  {unreadNotifications.length > 0 && (
                    <button
                      type="button"
                      onClick={() => markNotificationsRead(unreadNotifications.map((n) => n.id))}
                      className="px-3 py-1.5 rounded-lg border border-emerald-200 text-sm font-semibold text-emerald-800 hover:bg-emerald-50"
                    >
                      Markeer als gelezen
                    </button>
                  )}
                </div>
              </div>

              {notificationsError && (
                <div className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-xl p-3">
                  {notificationsError}
                </div>
              )}

              {!notificationsError && unreadNotifications.length === 0 && !notificationsLoading && (
                <div className="text-sm text-gray-600">Geen nieuwe meldingen.</div>
              )}

              {unreadNotifications.length > 0 && (
                <div className="space-y-2">
                  {unreadNotifications.slice(0, 3).map((n) => (
                    <div key={n.id} className="border border-gray-200 rounded-xl p-3">
                      <div className="text-sm font-semibold text-gray-900">{n.title}</div>
                      <div className="text-sm text-gray-700">{n.message}</div>
                      <div className="mt-2 flex items-center gap-3">
                        <Link href="/dashboard/owner/bookings" className="text-sm font-semibold text-emerald-700 hover:underline">
                          Bekijk
                        </Link>
                        <button
                          type="button"
                          onClick={() => markNotificationsRead([n.id])}
                          className="text-sm font-semibold text-gray-700 hover:underline"
                        >
                          Gelezen
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
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
                  <li>Maak een nieuwe aanvraag aan en kies dienst + dagen.</li>
                  <li>Geef je huisdierinfo mee bij de aanvraag.</li>
                  <li>Wacht op toewijzing of bevestiging van de verzorger (tijdstip in overleg via chat).</li>
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
                  <div className="text-sm text-gray-600">Verzorger gekozen</div>
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
                            {!booking.caregiver && booking.offers && booking.offers.length > 0 && (
                              <div className="text-sm text-blue-700 mt-1">
                                Voorstel klaar: {booking.offers.length} verzorger(s).{' '}
                                <Link href="/dashboard/owner/bookings" className="font-semibold hover:underline">
                                  Kies verzorger
                                </Link>
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
