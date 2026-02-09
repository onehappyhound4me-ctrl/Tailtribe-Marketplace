'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { DISPATCH_SERVICES } from '@/lib/services'
import { trackEvent } from '@/lib/analytics'

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
  isRecurring: boolean
  createdAt: string
  availableCaregiverCount?: number | null
  caregiver: {
    firstName: string
    lastName: string
    email: string
    phone: string | null
  } | null
  offers?: {
    id: string
    caregiverId: string
    caregiver: {
      firstName: string
      lastName: string
      email: string
      phone: string | null
    }
    unit: string
    priceCents: number
  }[]
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

const CHAT_ELIGIBLE_STATUSES = new Set(['CONFIRMED', 'COMPLETED'])

const UNIT_LABELS: Record<string, string> = {
  HALF_HOUR: 'per half uur',
  HOUR: 'per uur',
  HALF_DAY: 'per halve dag',
  DAY: 'per dag',
}
const formatEuro = (cents: number) => `€ ${(cents / 100).toFixed(2).replace('.', ',')}`

export default function OwnerBookingsPage() {
  const { data: session } = useSession()
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [view, setView] = useState<'active' | 'history'>('active')
  const [successCount, setSuccessCount] = useState<number | null>(null)
  const [isDirect, setIsDirect] = useState(false)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [focusCaregiverId, setFocusCaregiverId] = useState<string | null>(null)
  const [bulkApproveLoading, setBulkApproveLoading] = useState(false)
  const [bulkApproveProgress, setBulkApproveProgress] = useState<{ done: number; total: number } | null>(null)
  const [focusMsg, setFocusMsg] = useState<string | null>(null)
  const [focusError, setFocusError] = useState<string | null>(null)

  const dismissSuccess = () => {
    window.history.replaceState({}, '', '/dashboard/owner/bookings')
    setSuccessCount(null)
    setIsDirect(false)
  }

  useEffect(() => {
    // Check voor success parameter in URL
    const params = new URLSearchParams(window.location.search)
    const count = params.get('success')
    const direct = params.get('direct')
    const caregiver = params.get('caregiver')
    if (count) {
      setSuccessCount(parseInt(count))
      setIsDirect(direct === 'true')
      // Keep banner visible until user closes it, but clean up the URL immediately.
      window.history.replaceState({}, '', '/dashboard/owner/bookings')
    }
    if (caregiver) {
      setFocusCaregiverId(caregiver)
    }
  }, [])

  useEffect(() => {
    fetchBookings(view)
  }, [view])

  const fetchBookings = async (nextView: 'active' | 'history') => {
    setLoading(true)
    try {
      const url = nextView === 'history' ? '/api/owner/bookings?view=history' : '/api/owner/bookings'
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

  const confirmBooking = async (bookingId: string) => {
    setActionLoadingId(bookingId)
    try {
      const response = await fetch('/api/owner/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, status: 'CONFIRMED' }),
      })
      if (response.ok) {
        trackEvent('booking_confirmed', { booking_id: bookingId })
        await fetchBookings(view)
      }
    } catch (error) {
      console.error('Failed to confirm booking:', error)
    } finally {
      setActionLoadingId(null)
    }
  }

  const patchSelectCaregiver = async (bookingId: string, caregiverId: string) => {
    try {
      const response = await fetch('/api/owner/bookings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: bookingId, caregiverId }),
      })
      return response.ok
    } catch (error) {
      console.error('Failed to select caregiver:', error)
      return false
    }
  }

  const selectCaregiver = async (bookingId: string, caregiverId: string) => {
    setActionLoadingId(bookingId)
    try {
      const ok = await patchSelectCaregiver(bookingId, caregiverId)
      if (ok) {
        trackEvent('caregiver_selected', { booking_id: bookingId, caregiver_id: caregiverId })
        await fetchBookings(view)
      }
    } catch (error) {
      console.error('Failed to select caregiver:', error)
    } finally {
      setActionLoadingId(null)
    }
  }

  const focusMatches = useMemo(() => {
    if (!focusCaregiverId) return bookings
    return bookings.filter((b) => (b.offers ?? []).some((o) => o.caregiverId === focusCaregiverId))
  }, [bookings, focusCaregiverId])

  const focusedCaregiverName = useMemo(() => {
    if (!focusCaregiverId) return null
    for (const b of bookings) {
      const offer = (b.offers ?? []).find((o) => o.caregiverId === focusCaregiverId)
      if (offer) return `${offer.caregiver.firstName} ${offer.caregiver.lastName}`.trim() || offer.caregiver.email
    }
    return null
  }, [bookings, focusCaregiverId])

  const approveAllForFocusedCaregiver = async () => {
    if (!focusCaregiverId) return
    const targets = bookings.filter(
      (b) => !b.caregiver && (b.offers ?? []).some((o) => o.caregiverId === focusCaregiverId)
    )
    if (targets.length === 0) return

    const label = focusedCaregiverName || 'deze verzorger'
    if (
      !window.confirm(
        `Keur ${label} goed voor ${targets.length} dag(en)?\n\nDit bevestigt je aanvraag voor alle dagen die bij dit voorstel horen.`
      )
    )
      return

    setBulkApproveLoading(true)
    setBulkApproveProgress({ done: 0, total: targets.length })
    try {
      let done = 0
      for (const b of targets) {
        const ok = await patchSelectCaregiver(b.id, focusCaregiverId)
        if (ok) done += 1
        setBulkApproveProgress({ done, total: targets.length })
      }
      await fetchBookings(view)
      if (done > 0) {
        trackEvent('caregiver_selected_bulk', { caregiver_id: focusCaregiverId, count: done })
      }
    } finally {
      setBulkApproveLoading(false)
      setBulkApproveProgress(null)
    }
  }

  const rejectAllForFocusedCaregiver = async () => {
    if (!focusCaregiverId) return
    const targets = bookings.filter(
      (b) => !b.caregiver && (b.offers ?? []).some((o) => o.caregiverId === focusCaregiverId)
    )
    if (targets.length === 0) return

    const label = focusedCaregiverName || 'deze verzorger'
    if (!window.confirm(`Weiger ${label} voor ${targets.length} dag(en)?\n\nDit verwijdert dit voorstel uit je lijst.`)) {
      return
    }

    setFocusMsg(null)
    setFocusError(null)
    setBulkApproveLoading(true)
    try {
      const res = await fetch('/api/owner/offers/reject', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId: focusCaregiverId, bookingIds: targets.map((t) => t.id) }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        throw new Error(data?.error || 'Kon voorstel niet verwijderen.')
      }
      const deleted = typeof data?.deleted === 'number' ? data.deleted : 0
      setFocusMsg(`Voorstel geweigerd. (${deleted} dag(en) verwijderd)`)
      setFocusCaregiverId(null)
      await fetchBookings(view)
    } catch (e) {
      setFocusError(e instanceof Error ? e.message : 'Kon voorstel niet verwijderen.')
    } finally {
      setBulkApproveLoading(false)
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
      <SiteHeader primaryCtaHref="/dashboard/owner" primaryCtaLabel="Dashboard" />

      <main className="container mx-auto px-4" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        <div className="max-w-5xl mx-auto">
          {focusCaregiverId && (
            <div className="mb-6 rounded-2xl border border-blue-200 bg-blue-50 p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="font-semibold text-blue-950">
                    Voorstel {focusedCaregiverName ? `van ${focusedCaregiverName}` : 'geselecteerd'}
                  </div>
                  <div className="text-sm text-blue-950/80">
                    Toont alleen de dagen waar deze verzorger is voorgesteld.
                  </div>
                  {bulkApproveProgress && (
                    <div className="mt-2 text-xs text-blue-950/80">
                      Bezig: {bulkApproveProgress.done}/{bulkApproveProgress.total}
                    </div>
                  )}
                  {focusMsg && <div className="mt-2 text-xs text-emerald-800">{focusMsg}</div>}
                  {focusError && <div className="mt-2 text-xs text-red-800">{focusError}</div>}
                </div>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={approveAllForFocusedCaregiver}
                    disabled={bulkApproveLoading}
                    className="px-4 py-2 rounded-lg bg-blue-700 text-white text-sm font-semibold disabled:opacity-60"
                  >
                    {bulkApproveLoading ? 'Bezig...' : 'Keur goed (alle dagen)'}
                  </button>
                  <button
                    type="button"
                    onClick={rejectAllForFocusedCaregiver}
                    disabled={bulkApproveLoading}
                    className="px-4 py-2 rounded-lg border border-red-200 text-red-800 text-sm font-semibold hover:bg-red-50 disabled:opacity-60"
                  >
                    Weiger voorstel
                  </button>
                  <Link
                    href="/dashboard/owner/bookings"
                    className="text-sm font-semibold text-blue-900 hover:underline"
                    onClick={() => setFocusCaregiverId(null)}
                  >
                    Toon alles
                  </Link>
                </div>
              </div>
            </div>
          )}

          {successCount !== null && (
            <div className={`mb-6 p-4 rounded-xl border ${
              isDirect 
                ? 'bg-purple-50 border-purple-200' 
                : 'bg-green-50 border-green-200'
            }`}>
              <div className="flex items-start justify-between gap-4">
                <div className={isDirect ? 'text-purple-900' : 'text-green-800'}>
                {isDirect ? (
                  <>
                    <div className="font-bold text-lg mb-1">⚡ Direct Toegewezen!</div>
                    <div className="text-sm">
                      {successCount} aanvra{successCount === 1 ? 'ag' : 'gen'} direct naar je verzorger gestuurd.
                      Geen wachttijd - de verzorger kan nu direct bevestigen!
                    </div>
                  </>
                ) : (
                  <>
                    <div className="font-bold text-lg mb-1">✅ Aanvragen Verstuurd!</div>
                    <div className="text-sm">
                      {successCount} aanvra{successCount === 1 ? 'ag' : 'gen'} succesvol aangemaakt.
                      De beheerder stelt verzorgers voor. Jij kiest je verzorger.
                    </div>
                  </>
                )}
                </div>

                <button
                  type="button"
                  onClick={dismissSuccess}
                  className={`shrink-0 px-3 py-1.5 rounded-lg border text-sm font-semibold ${
                    isDirect
                      ? 'border-purple-200 text-purple-900 hover:bg-purple-100'
                      : 'border-green-200 text-green-900 hover:bg-green-100'
                  }`}
                  aria-label="Sluit melding"
                >
                  Sluiten
                </button>
              </div>
            </div>
          )}
          
          <div className="mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700">
                Mijn aanvragen
              </h1>
              <p className="mt-1 text-sm sm:text-base text-gray-600">
                {view === 'history'
                  ? 'Geschiedenis van oudere of gearchiveerde aanvragen'
                  : 'Overzicht van komende en recente aanvragen'}
              </p>
            </div>
            <div className="w-full sm:w-auto flex flex-col sm:flex-row gap-3 sm:items-center">
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

              <Link
                href="/dashboard/owner/new-booking"
                className="btn-brand w-full sm:w-auto inline-flex justify-center"
              >
                Nieuwe aanvraag
              </Link>
            </div>
          </div>

          {focusMatches.length === 0 ? (
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-12 text-center">
              <div className="text-6xl mb-4">📋</div>
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">
                {focusCaregiverId ? 'Geen aanvragen voor dit voorstel' : 'Nog geen aanvragen'}
              </h2>
              <p className="text-gray-600 mb-6">
                {focusCaregiverId
                  ? 'Deze verzorger is (nog) niet voorgesteld voor je huidige aanvragen.'
                  : 'Je hebt nog geen aanvragen gedaan voor dierenverzorging'}
              </p>
              <Link
                href="/dashboard/owner/new-booking"
                className="btn-brand"
              >
                Eerste Aanvraag Doen
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {focusMatches.map((booking) => {
                const serviceName =
                  DISPATCH_SERVICES.find((service) => service.id === booking.service)?.name ||
                  booking.service

                return (
                  <div
                    key={booking.id}
                    className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 hover:shadow-md transition"
                  >
                    {view === 'active' &&
                      !booking.caregiver &&
                      (booking.offers ?? []).length === 0 &&
                      booking.availableCaregiverCount === 0 && (
                        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                          Voor deze dag is er momenteel geen verzorger beschikbaar.
                        </div>
                      )}
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

                    {booking.offers && booking.offers.length > 0 && !booking.caregiver && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-500 mb-2">💶 Kies een verzorger</div>
                        <div className="space-y-2">
                          {booking.offers.map((offer) => (
                            <div
                              key={offer.id}
                              className="flex flex-wrap items-center justify-between gap-2 border border-gray-200 rounded-xl p-3"
                            >
                              <div>
                                <div className="font-medium text-gray-900">
                                  {offer.caregiver.firstName} {offer.caregiver.lastName}
                                </div>
                                <div className="text-xs text-gray-600">
                                  {offer.priceCents > 0
                                    ? `${formatEuro(offer.priceCents)} ${UNIT_LABELS[offer.unit] ?? offer.unit}`
                                    : 'Prijs in overleg'}
                                </div>
                                <div className="mt-1">
                                  <Link
                                    href={`/dashboard/owner/caregivers/${offer.caregiverId}`}
                                    className="text-xs font-semibold text-emerald-700 hover:underline"
                                  >
                                    Bekijk profiel
                                  </Link>
                                </div>
                              </div>
                              <button
                                onClick={() => selectCaregiver(booking.id, offer.caregiverId)}
                                disabled={actionLoadingId === booking.id}
                                className="px-3 py-1 rounded-lg border border-emerald-300 text-emerald-800 text-sm font-semibold disabled:opacity-60"
                              >
                                {actionLoadingId === booking.id ? 'Bezig...' : 'Kies verzorger'}
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {booking.caregiver && (
                      <div className="mt-4 pt-4 border-t border-gray-100">
                        <div className="text-sm text-gray-500 mb-1">👤 Toegewezen Verzorger</div>
                        <div className="flex items-center justify-between">
                          <div>
                            <div className="font-medium text-emerald-700">
                              {booking.caregiver.firstName} {booking.caregiver.lastName}
                            </div>
                            <div className="text-sm text-gray-600">
                              {booking.caregiver.email}
                              {booking.caregiver.phone && ` • ${booking.caregiver.phone}`}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2">
                            {booking.status === 'ASSIGNED' && (
                              <button
                                onClick={() => confirmBooking(booking.id)}
                                disabled={actionLoadingId === booking.id}
                                className="text-sm font-semibold text-emerald-700 hover:underline disabled:opacity-60"
                              >
                                {actionLoadingId === booking.id ? 'Bevestigen...' : 'Bevestig opdracht'}
                              </button>
                            )}
                            {CHAT_ELIGIBLE_STATUSES.has(booking.status) && (
                              <Link
                                href={`/chat/${booking.id}`}
                                className="text-sm text-emerald-700 font-semibold hover:underline"
                              >
                              Chat
                              </Link>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="mt-4 text-xs text-gray-500">
                      Aangemaakt op:{' '}
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
