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

type TeamMember = {
  id: string
  name: string
}

export default function AdminPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null)
  const [emailSending, setEmailSending] = useState(false)
  const [emailSentMsg, setEmailSentMsg] = useState<string | null>(null)

  const [team, setTeam] = useState<TeamMember[]>([])
  const [newTeamName, setNewTeamName] = useState('')

  useEffect(() => {
    fetchBookings()
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchBookings, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('tt_dispatch_team')
      if (raw) {
        const parsed = JSON.parse(raw)
        if (Array.isArray(parsed)) setTeam(parsed)
      }
    } catch {
      // ignore
    }
  }, [])

  useEffect(() => {
    try {
      window.localStorage.setItem('tt_dispatch_team', JSON.stringify(team))
    } catch {
      // ignore
    }
  }, [team])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings')
      const data = await response.json()
      const next = Array.isArray(data) ? (data as Booking[]) : []
      setBookings(next)
      setSelectedId((prev) => prev ?? (next[0]?.id ?? null))
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

  const sendCustomerEmail = async (bookingId: string) => {
    setEmailSentMsg(null)
    setEmailSending(true)
    try {
      const res = await fetch('/api/admin/email-customer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookingId }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        setErrorMsg(data?.error || 'Kon e-mail niet versturen. Probeer opnieuw.')
        return
      }
      setEmailSentMsg('E-mail verstuurd.')
    } catch {
      setErrorMsg('Kon e-mail niet versturen. Probeer opnieuw.')
    } finally {
      setEmailSending(false)
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

  const selected = sorted.find((b) => b.id === selectedId) ?? sorted[0] ?? null

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

        {/* Main layout */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center">
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Nog geen bookings</h3>
            <p className="text-gray-600">Nieuwe bookings verschijnen hier automatisch</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            {/* Left: requests list */}
            <div className="lg:col-span-7">
              <div className="bg-white rounded-2xl shadow-sm border border-black/5 overflow-hidden">
                <div className="px-5 py-4 border-b border-black/5 flex items-center justify-between">
                  <h2 className="text-lg font-semibold text-gray-900">Aanvragen</h2>
                  <div className="text-sm text-gray-500">Auto-refresh: 30s</div>
                </div>
                <div className="divide-y">
                  {sorted.map((b) => {
                    const isSelected = b.id === selected?.id
                    return (
                      <button
                        key={b.id}
                        type="button"
                        onClick={() => setSelectedId(b.id)}
                        className={`w-full text-left px-5 py-4 hover:bg-gray-50 transition ${
                          isSelected ? 'bg-emerald-50/60' : ''
                        }`}
                      >
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <div className="font-semibold text-gray-900">
                                {b.firstName} {b.lastName}
                              </div>
                              <span
                                className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                                  statusColors[b.status] || 'bg-gray-100 text-gray-800'
                                }`}
                              >
                                {statusLabels[b.status] ?? b.status}
                              </span>
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              {serviceNames[b.service] || b.service} • {b.city} ({b.postalCode})
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              {b.date} om {b.time}
                              {b.assignedTo ? ` • Toegewezen: ${b.assignedTo}` : ''}
                            </div>
                          </div>
                          <div className="text-xs text-gray-500 whitespace-nowrap">
                            {new Date(b.createdAt).toLocaleDateString('nl-BE', {
                              day: 'numeric',
                              month: 'short',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            </div>

            {/* Middle: selected request */}
            <div className="lg:col-span-5">
              {selected ? (
                <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-5">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h2 className="text-lg font-semibold text-gray-900">
                        {selected.firstName} {selected.lastName}
                      </h2>
                      <div className="text-sm text-gray-600 mt-1">
                        {serviceNames[selected.service] || selected.service}
                      </div>
                    </div>
                    <button
                      type="button"
                      disabled={emailSending}
                      onClick={() => sendCustomerEmail(selected.id)}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium disabled:opacity-60"
                    >
                      {emailSending ? 'Versturen…' : 'E-mail klant'}
                    </button>
                  </div>
                  {emailSentMsg ? <div className="mt-3 text-sm text-emerald-700">{emailSentMsg}</div> : null}

                  <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">Datum & tijd</div>
                      <div className="font-semibold text-gray-900">
                        {new Date(selected.date).toLocaleDateString('nl-BE')} • {selected.time}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">Locatie</div>
                      <div className="font-semibold text-gray-900">
                        {selected.city}, {selected.postalCode}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">Contact</div>
                      <div className="text-sm text-gray-800">{selected.email}</div>
                      <div className="text-sm text-gray-800">{selected.phone}</div>
                    </div>
                    <div>
                      <div className="text-xs font-medium text-gray-500 mb-1">Toegewezen</div>
                      <div className="font-semibold text-gray-900">{selected.assignedTo || '—'}</div>
                    </div>
                  </div>

                  <div className="mt-5 rounded-xl bg-gray-50 border border-black/5 p-4">
                    <div className="text-xs font-medium text-gray-500 mb-1">Huisdier</div>
                    <div className="font-semibold text-gray-900">
                      {selected.petName} ({selected.petType})
                    </div>
                    {selected.message ? (
                      <div className="text-sm text-gray-700 mt-2 whitespace-pre-wrap">{selected.message}</div>
                    ) : null}
                  </div>
                </div>
              ) : null}

              {/* Team column */}
              <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-5 mt-6">
                <div className="flex items-center justify-between gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">Team / freelancers</h3>
                  <div className="text-xs text-gray-500">{team.length} personen</div>
                </div>

                <div className="flex gap-2">
                  <input
                    value={newTeamName}
                    onChange={(e) => setNewTeamName(e.target.value)}
                    placeholder="Naam toevoegen…"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const name = newTeamName.trim()
                      if (!name) return
                      setTeam((prev) => [{ id: `${Date.now()}`, name }, ...prev])
                      setNewTeamName('')
                    }}
                    className="px-4 py-2.5 bg-brand text-white rounded-xl hover:brightness-110 font-medium"
                  >
                    Voeg toe
                  </button>
                </div>

                <div className="mt-4 space-y-2">
                  {team.length === 0 ? (
                    <div className="text-sm text-gray-600">Nog geen teamleden toegevoegd.</div>
                  ) : (
                    team.map((m) => (
                      <div
                        key={m.id}
                        className="flex items-center justify-between gap-2 rounded-xl border border-black/5 bg-gray-50 px-3 py-2"
                      >
                        <button
                          type="button"
                          disabled={!selected || actionLoadingId === selected.id}
                          onClick={async () => {
                            if (!selected) return
                            await updateBooking(selected.id, { status: 'ASSIGNED', assignedTo: m.name })
                          }}
                          className="text-left flex-1"
                          title={selected ? 'Klik om toe te wijzen aan geselecteerde aanvraag' : 'Selecteer eerst een aanvraag'}
                        >
                          <div className="font-medium text-gray-900">{m.name}</div>
                          <div className="text-xs text-gray-500">
                            {selected ? 'Toewijzen aan geselecteerde aanvraag' : 'Selecteer eerst een aanvraag'}
                          </div>
                        </button>
                        <button
                          type="button"
                          onClick={() => setTeam((prev) => prev.filter((x) => x.id !== m.id))}
                          className="text-sm text-gray-600 hover:text-gray-900"
                        >
                          Verwijder
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <SiteFooter />
    </div>
  )
}

