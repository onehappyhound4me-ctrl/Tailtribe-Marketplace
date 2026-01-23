'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { DISPATCH_SERVICES } from '@/lib/services'

type TimeWindow = 'MORNING' | 'AFTERNOON' | 'EVENING' | 'NIGHT'

type AvailabilitySlot = {
  id: string
  date: string
  timeWindow: TimeWindow
  isAvailable: boolean
  notes: string | null
}

const TIME_WINDOWS: { value: TimeWindow; label: string }[] = [
  { value: 'MORNING', label: 'Ochtend (07:00-12:00)' },
  { value: 'AFTERNOON', label: 'Middag (12:00-18:00)' },
  { value: 'EVENING', label: 'Avond (18:00-22:00)' },
  { value: 'NIGHT', label: 'Nacht (22:00-07:00)' },
]

const WEEKDAYS = [
  { value: 1, label: 'Maandag' },
  { value: 2, label: 'Dinsdag' },
  { value: 3, label: 'Woensdag' },
  { value: 4, label: 'Donderdag' },
  { value: 5, label: 'Vrijdag' },
  { value: 6, label: 'Zaterdag' },
  { value: 0, label: 'Zondag' },
]

export default function CaregiverAvailabilityPage() {
  const { status } = useSession()
  const [services, setServices] = useState<string[]>([])
  const [showServices, setShowServices] = useState(true)
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [selectedWeekdays, setSelectedWeekdays] = useState<number[]>([])
  const [selectedTimeWindows, setSelectedTimeWindows] = useState<TimeWindow[]>([])
  const [perDayTimeWindows, setPerDayTimeWindows] = useState<Record<string, TimeWindow[]>>({})
  const [availability, setAvailability] = useState<AvailabilitySlot[]>([])
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

// Date helpers using lokale middernacht (voorkomt tz-shift in de browser)
const parseLocalDate = (val: string) => {
  const [y, m, d] = val.split('-').map(Number)
  const dt = new Date(y, m - 1, d, 0, 0, 0, 0)
  dt.setHours(0, 0, 0, 0)
  return dt
}

const formatLocalDate = (d: Date) => {
  const yyyy = d.getFullYear()
  const mm = String(d.getMonth() + 1).padStart(2, '0')
  const dd = String(d.getDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

// Today helpers (lokale dag, middernacht)
const todayLocal = (() => {
  const t = new Date()
  t.setHours(0, 0, 0, 0)
  return t
})()
const todayStr = formatLocalDate(todayLocal)
const todayDate = todayLocal
const maxBookingDateStr = (() => {
  const dt = new Date(todayLocal)
  dt.setDate(dt.getDate() + 60)
  return formatLocalDate(dt)
})()

  useEffect(() => {
    if (status !== 'authenticated') return
    fetchAvailability()
    fetchProfile()
  }, [status])

  const fetchAvailability = async () => {
    try {
      const response = await fetch('/api/caregiver/availability', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setAvailability(data)
      }
    } catch (error) {
      console.error('Failed to fetch availability:', error)
    }
  }

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/caregiver/profile', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        const allowed = new Set<string>(DISPATCH_SERVICES.map((service) => service.id))
        const parsed = JSON.parse(data?.services || '[]')
        const nextServices = Array.isArray(parsed)
          ? parsed.map((service: unknown) => String(service)).filter((service) => allowed.has(service))
          : []
        setServices(nextServices)
        setSelectedServices((prev) => prev.filter((service) => nextServices.includes(service)))
      } else {
        setServices([])
        setSelectedServices([])
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
      setServices([])
      setSelectedServices([])
    }
  }

  const handleToggleTimeWindow = (window: TimeWindow) => {
    setSelectedTimeWindows((prev) =>
      prev.includes(window) ? prev.filter((w) => w !== window) : [...prev, window]
    )
  }

  const handleToggleWeekday = (day: number) => {
    setSelectedWeekdays((prev) =>
      prev.includes(day) ? prev.filter((d) => d !== day) : [...prev, day]
    )
  }

  // Build dates in range filtered by weekdays
  const computedDates = (() => {
    if (!startDate || !endDate) return []
    const start = parseLocalDate(startDate)
    const end = parseLocalDate(endDate)
    const dates: string[] = []
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      d.setHours(0, 0, 0, 0)
      const isFutureOrToday = d.getTime() >= todayDate.getTime()
      if (isFutureOrToday && (selectedWeekdays.length === 0 || selectedWeekdays.includes(d.getDay()))) {
        dates.push(formatLocalDate(d))
      }
    }
    return dates
  })()

  // Keep per-day selections in sync with computed dates
  useEffect(() => {
    setPerDayTimeWindows((prev) => {
      const next: Record<string, TimeWindow[]> = {}
      for (const date of computedDates) {
        next[date] = prev[date] ?? []
      }
      return next
    })
  }, [computedDates])

  const togglePerDay = (date: string, window: TimeWindow) => {
    setPerDayTimeWindows((prev) => {
      const current = prev[date] ?? []
      const next = current.includes(window)
        ? current.filter((w) => w !== window)
        : [...current, window]
      return { ...prev, [date]: next }
    })
  }

  const totalPerDay = Object.values(perDayTimeWindows).reduce((acc, arr) => acc + arr.length, 0)

  const calculateTotalSlots = () => {
    if (totalPerDay > 0) return totalPerDay
    if (!startDate || !endDate || selectedWeekdays.length === 0 || selectedTimeWindows.length === 0) {
      return 0
    }
    return computedDates.length * selectedTimeWindows.length
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)

    if (!startDate || !endDate) {
      setMessage({ type: 'error', text: 'Selecteer een start- en einddatum' })
      return
    }

    // Block past dates explicitly (vergelijk als datums, niet als strings)
    const startLocal = parseLocalDate(startDate)
    const endLocal = parseLocalDate(endDate)
    if (startLocal.getTime() < todayDate.getTime() || endLocal.getTime() < todayDate.getTime()) {
      setMessage({ type: 'error', text: 'Dit is het verleden. Kies een datum vanaf vandaag.' })
      return
    }
    const maxDate = new Date(todayDate)
    maxDate.setDate(maxDate.getDate() + 60)
    if (endLocal.getTime() > maxDate.getTime()) {
      setMessage({ type: 'error', text: 'Je kan maximaal 60 dagen vooruit beschikbaarheid zetten.' })
      return
    }

    if (selectedWeekdays.length === 0) {
      setMessage({ type: 'error', text: 'Selecteer minstens één dag van de week' })
      return
    }

    if (selectedTimeWindows.length === 0 && totalPerDay === 0) {
      setMessage({ type: 'error', text: 'Selecteer minstens één tijdsblok' })
      return
    }

    if (selectedServices.length === 0) {
      setMessage({ type: 'error', text: 'Selecteer minstens één dienst voor deze periode' })
      return
    }

    if (computedDates.length === 0) {
      setMessage({ type: 'error', text: 'Kies een periode in de toekomst (geen dagen in het verleden).' })
      return
    }

    setLoading(true)

    try {
      const response = await fetch('/api/caregiver/availability/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          startDate,
          endDate,
          weekdays: selectedWeekdays,
          timeWindows: selectedTimeWindows,
          services: selectedServices,
          days:
            totalPerDay > 0
              ? Object.entries(perDayTimeWindows)
                  .filter(([, arr]) => arr.length > 0)
                  .map(([date, arr]) => ({ date, timeWindows: arr }))
              : undefined,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setMessage({ 
          type: 'success', 
          text: `${data.count} beschikbaarheidsslots toegevoegd!` 
        })
        setStartDate('')
        setEndDate('')
        setSelectedWeekdays([])
        setSelectedTimeWindows([])
        fetchAvailability()
      } else {
        const data = await response.json()
        setMessage({ type: 'error', text: data.error || 'Er ging iets mis' })
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Er ging iets mis' })
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Weet je zeker dat je deze beschikbaarheid wilt verwijderen?')) return

    try {
      const response = await fetch('/api/caregiver/availability', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      })

      if (response.ok) {
        fetchAvailability()
      }
    } catch (error) {
      console.error('Failed to delete availability:', error)
    }
  }

  const futureAvailability = availability.filter(
    (slot) => new Date(slot.date).getTime() >= todayDate.getTime()
  )

  // Group by date (alleen toekomst)
  const groupedAvailability = futureAvailability.reduce(
    (acc, slot) => {
      const date = new Date(slot.date).toLocaleDateString('nl-BE')
      if (!acc[date]) acc[date] = []
      acc[date].push(slot)
      return acc
    },
    {} as Record<string, AvailabilitySlot[]>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/dashboard/caregiver" primaryCtaLabel="Dashboard" />

      <main className="container mx-auto px-4" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 mb-2">
              Beschikbaarheid
            </h1>
            <p className="text-gray-600">
              Geef aan wanneer je beschikbaar bent voor opdrachten
            </p>
          </div>

          {message && (
            <div
              className={`mb-6 p-4 rounded-xl border ${
                message.type === 'success'
                  ? 'bg-green-50 border-green-200 text-green-800'
                  : 'bg-red-50 border-red-200 text-red-800'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Services */}
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 mb-8">
            <button
              type="button"
              onClick={() => setShowServices((prev) => !prev)}
              className="w-full flex items-center justify-between gap-3"
            >
              <div className="text-left">
                <h2 className="text-xl font-semibold text-gray-900">Diensten</h2>
                <p className="text-sm text-gray-600">
                  {selectedServices.length} geselecteerd • Pas dit aan in je profiel
                </p>
              </div>
              <span className="text-sm text-emerald-700 font-semibold">
                {showServices ? 'Verberg ▲' : 'Toon ▼'}
              </span>
            </button>

            {showServices && (
              <div className="mt-4">
                <div className="flex items-center justify-between gap-3 mb-4">
                  <p className="text-sm text-gray-600">
                    Kies voor welke diensten je beschikbaar bent in deze periode.
                  </p>
                  <Link
                    href="/dashboard/caregiver/profile"
                    className="text-sm text-emerald-700 font-semibold hover:underline"
                  >
                    Diensten wijzigen →
                  </Link>
                </div>

                {services.length === 0 && (
                  <div className="text-sm text-gray-500 mb-3">
                    Je hebt nog geen diensten gekozen. Ga naar je profiel om dit in te stellen.
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DISPATCH_SERVICES.map((service) => {
                    const isAllowed = services.includes(service.id)
                    const checked = selectedServices.includes(service.id)
                    return (
                      <label
                        key={service.id}
                        className={`flex items-start gap-3 p-3 border rounded-xl ${
                          checked
                            ? 'border-emerald-200 bg-emerald-50/60'
                            : 'border-gray-200 bg-white'
                        }`}
                      >
                        <input
                          type="checkbox"
                          checked={checked}
                          disabled={!isAllowed}
                          onChange={() =>
                            setSelectedServices((prev) =>
                              prev.includes(service.id)
                                ? prev.filter((s) => s !== service.id)
                                : [...prev, service.id]
                            )
                          }
                          className="mt-1 text-emerald-600 rounded disabled:opacity-40"
                        />
                        <div>
                          <div className="font-medium text-gray-900">
                            {service.name}
                          </div>
                          <div className="text-xs text-gray-600">
                            {service.desc}
                            {!isAllowed && (
                              <span className="text-gray-500"> • voeg toe via Instellingen</span>
                            )}
                          </div>
                          {!isAllowed && (
                            <div className="mt-2 inline-flex items-center rounded-full border border-gray-300 bg-gray-50 px-2.5 py-0.5 text-[11px] font-semibold text-gray-600">
                              Niet geactiveerd
                            </div>
                          )}
                        </div>
                      </label>
                    )
                  })}
                </div>

              </div>
            )}
          </div>

          {/* Add Availability Form */}
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 mb-8">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Beschikbaarheid toevoegen voor periode
            </h2>
            <p className="text-sm text-gray-600 mb-6">
              Vul gemakkelijk je beschikbaarheid in voor een hele maand of langere periode
            </p>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Periode */}
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="startDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Van datum
                  </label>
                  <input
                    id="startDate"
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    min={todayStr}
                  max={maxBookingDateStr}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="endDate" className="block text-sm font-medium text-gray-700 mb-1">
                    Tot datum
                  </label>
                  <input
                    id="endDate"
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    min={startDate || todayStr}
                  max={maxBookingDateStr}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Weekdagen */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Welke dagen van de week?
                </label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {WEEKDAYS.map((day) => (
                    <div
                      key={day.value}
                      className={`flex items-center gap-2 p-3 border-2 rounded-xl cursor-pointer transition ${
                        selectedWeekdays.includes(day.value)
                          ? 'border-emerald-500 bg-emerald-50'
                          : 'border-gray-200 hover:bg-gray-50'
                      }`}
                      onClick={() => handleToggleWeekday(day.value)}
                    >
                      <input
                        type="checkbox"
                        checked={selectedWeekdays.includes(day.value)}
                        onChange={() => handleToggleWeekday(day.value)}
                        className="w-5 h-5 text-emerald-600 rounded pointer-events-none"
                      />
                      <span className="text-sm font-medium text-gray-900">{day.label}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedWeekdays([1, 2, 3, 4, 5])}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Werkdagen
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedWeekdays([0, 6])}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Weekend
                  </button>
                  <span className="text-gray-400">|</span>
                  <button
                    type="button"
                    onClick={() => setSelectedWeekdays([0, 1, 2, 3, 4, 5, 6])}
                    className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                  >
                    Hele week
                  </button>
                </div>
              </div>

              {/* Per-dag tijdsblokken */}
              {computedDates.length > 0 && (
                <div className="border border-gray-200 rounded-xl p-4 space-y-3">
                  <div className="text-sm font-semibold text-gray-900">Per dag bepalen</div>
                  <div className="max-h-72 overflow-auto space-y-2">
                    {computedDates.map((date) => (
                      <div key={date} className="border rounded-lg p-3">
                        <div className="text-sm font-medium text-gray-900 mb-2">
                          {new Date(date).toLocaleDateString('nl-BE', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </div>
                        <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-2">
                          {TIME_WINDOWS.map((window) => {
                            const active = perDayTimeWindows[date]?.includes(window.value)
                            const inherited = !active && selectedTimeWindows.includes(window.value)
                            return (
                              <button
                                key={window.value}
                                type="button"
                                onClick={() => togglePerDay(date, window.value)}
                                className={`px-3 py-2 rounded-lg border text-xs text-left ${
                                  active
                                    ? 'bg-emerald-100 border-emerald-300 text-emerald-800'
                                    : inherited
                                      ? 'bg-gray-50 border-gray-200 text-gray-700'
                                      : 'bg-white border-gray-200 text-gray-500'
                                }`}
                              >
                                {window.label}
                              </button>
                            )
                          })}
                        </div>
                        <p className="text-[11px] text-gray-500 mt-1">
                          Groen = expliciet gekozen; grijs = erft standaard selectie.
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Preview */}
              {calculateTotalSlots() > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <span className="text-2xl">📊</span>
                    <div>
                      <h3 className="font-semibold text-blue-900">
                        {calculateTotalSlots()} beschikbaarheidsslots
                      </h3>
                      <p className="text-sm text-blue-700 mt-1">
                        Dit zal {calculateTotalSlots()} slots aanmaken in je kalender
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-brand disabled:opacity-60"
              >
                {loading ? 'Opslaan...' : `${calculateTotalSlots()} slots toevoegen`}
              </button>
            </form>
          </div>

          {/* Current Availability */}
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">
              Jouw beschikbaarheid
            </h2>

            {availability.length === 0 ? (
              <p className="text-gray-600 text-center py-8">
                Je hebt nog geen beschikbaarheid toegevoegd
              </p>
            ) : (
              <div className="space-y-4">
                {Object.entries(groupedAvailability)
                  .sort(([dateA], [dateB]) => new Date(dateA).getTime() - new Date(dateB).getTime())
                  .map(([date, slots]) => (
                    <div key={date} className="border border-gray-200 rounded-xl p-4">
                      <div className="font-semibold text-gray-900 mb-3">{date}</div>
                      <div className="space-y-2">
                        {slots.map((slot) => {
                          const windowLabel = TIME_WINDOWS.find((w) => w.value === slot.timeWindow)?.label
                          return (
                            <div
                              key={slot.id}
                              className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                            >
                              <div className="text-sm text-gray-700">{windowLabel}</div>
                              <button
                                onClick={() => handleDelete(slot.id)}
                                className="text-sm text-red-600 hover:text-red-800 font-medium"
                              >
                                Verwijder
                              </button>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
