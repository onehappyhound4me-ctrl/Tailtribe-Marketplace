'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { DISPATCH_SERVICES } from '@/lib/services'
// Use relative import to avoid path-alias resolution issues in some Vercel build configurations.
import { getStatusLabel } from '../../../../lib/status-labels'

type Booking = {
  id: string
  service: string
  date: string
  time?: string | null
  timeWindow: string
  city: string
  postalCode: string
  petName: string
  petType: string
  status: string
  isRecurring: boolean
  owner: {
    firstName: string
    lastName: string
  }
}

type Availability = {
  id: string
  date: string
  timeWindow: string
  isAvailable: boolean
}

const TIME_WINDOW_LABELS: Record<string, string> = {
  MORNING: 'Ochtend',
  AFTERNOON: 'Middag',
  EVENING: 'Avond',
  NIGHT: 'Nacht',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 border-yellow-400 text-yellow-800',
  ASSIGNED: 'bg-blue-100 border-blue-400 text-blue-800',
  CONFIRMED: 'bg-green-100 border-green-400 text-green-800',
  COMPLETED: 'bg-gray-100 border-gray-400 text-gray-800',
  CANCELLED: 'bg-red-100 border-red-400 text-red-800',
}

const WEEKDAYS = ['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo']
const MONTHS = [
  'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
  'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
]

export default function CaregiverCalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [availability, setAvailability] = useState<Availability[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [showModal, setShowModal] = useState(false)
  const [selectedTimeWindows, setSelectedTimeWindows] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  useEffect(() => {
    fetchCalendarData()
  }, [])

  const fetchCalendarData = async () => {
    setBookings([])
    setAvailability([])
    try {
      const response = await fetch('/api/caregiver/calendar', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
        setAvailability(data.availability || [])
      } else {
        setBookings([])
        setAvailability([])
      }
    } catch (error) {
      console.error('Failed to fetch calendar:', error)
      setBookings([])
      setAvailability([])
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1

    const days = []
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const getBookingsForDate = (date: Date) => {
    return bookings.filter(booking => {
      const bookingDate = new Date(booking.date)
      // Use UTC to avoid timezone issues
      return (
        bookingDate.getUTCDate() === date.getDate() &&
        bookingDate.getUTCMonth() === date.getMonth() &&
        bookingDate.getUTCFullYear() === date.getFullYear()
      )
    })
  }

  const getAvailabilityForDate = (date: Date) => {
    return availability.filter(avail => {
      const availDate = new Date(avail.date)
      // Use UTC to avoid timezone issues
      return (
        availDate.getUTCDate() === date.getDate() &&
        availDate.getUTCMonth() === date.getMonth() &&
        availDate.getUTCFullYear() === date.getFullYear() &&
        avail.isAvailable
      )
    })
  }

  const changeMonth = (direction: number) => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + direction)
      if (direction > 0) {
        const maxDate = new Date()
        maxDate.setHours(0, 0, 0, 0)
        maxDate.setDate(maxDate.getDate() + 60)
        const isBeyondMax =
          newDate.getFullYear() > maxDate.getFullYear() ||
          (newDate.getFullYear() === maxDate.getFullYear() && newDate.getMonth() > maxDate.getMonth())
        if (isBeyondMax) return prev
      }
      return newDate
    })
  }

  const isToday = (date: Date) => {
    const today = new Date()
    return (
      date.getDate() === today.getDate() &&
      date.getMonth() === today.getMonth() &&
      date.getFullYear() === today.getFullYear()
    )
  }

  const handleDayClick = (date: Date) => {
    const maxDate = new Date()
    maxDate.setHours(0, 0, 0, 0)
    maxDate.setDate(maxDate.getDate() + 60)
    if (date.getTime() > maxDate.getTime()) {
      alert('Je kan maximaal 60 dagen vooruit beschikbaarheid zetten.')
      return
    }
    const dateAvailability = getAvailabilityForDate(date)
    setSelectedDate(date)
    setSelectedTimeWindows(dateAvailability.map((a) => a.timeWindow))
    setShowModal(true)
  }

  const handleToggleTimeWindow = (window: string) => {
    setSelectedTimeWindows((prev) => (prev.includes(window) ? prev.filter((w) => w !== window) : [...prev, window]))
  }

  const handleSaveAvailability = async () => {
    if (!selectedDate) return

    setSaving(true)

    try {
      // Format date as YYYY-MM-DD zonder timezone shift
      const year = selectedDate.getFullYear()
      const month = String(selectedDate.getMonth() + 1).padStart(2, '0')
      const day = String(selectedDate.getDate()).padStart(2, '0')
      const dateStr = `${year}-${month}-${day}`
      
      const response = await fetch('/api/caregiver/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: dateStr,
          timeWindows: selectedTimeWindows,
        }),
      })

      if (response.ok) {
        // Refresh calendar data
        await fetchCalendarData()
        setShowModal(false)
        setSelectedDate(null)
        setSelectedTimeWindows([])
      } else {
        alert('Er ging iets mis bij het opslaan')
      }
    } catch (error) {
      console.error('Failed to save availability:', error)
      alert('Er ging iets mis bij het opslaan')
    } finally {
      setSaving(false)
    }
  }

  const handleDeleteDayAvailability = async () => {
    if (!selectedDate) return
    
    const dateAvailability = getAvailabilityForDate(selectedDate)
    
    if (dateAvailability.length === 0) {
      setShowModal(false)
      return
    }
    
    if (!confirm('Wil je alle beschikbaarheid voor deze dag verwijderen?')) return
    
    setSaving(true)
    
    try {
      // Delete all slots for this date
      for (const slot of dateAvailability) {
        await fetch('/api/caregiver/availability', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: slot.id }),
        })
      }
      
      // Refresh calendar data
      await fetchCalendarData()
      setShowModal(false)
      setSelectedDate(null)
      setSelectedTimeWindows([])
    } catch (error) {
      console.error('Failed to delete availability:', error)
      alert('Er ging iets mis bij het verwijderen')
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl">Laden...</div>
      </div>
    )
  }

  const days = getDaysInMonth(currentDate)
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/dashboard/caregiver" primaryCtaLabel="Dashboard" />

      <main className="container mx-auto px-4" style={{ paddingTop: '7rem', paddingBottom: '5rem' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 mb-4">
              <div className="min-w-0">
                <h1 className="text-2xl sm:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700">
                  Mijn kalender
                </h1>
                <p className="mt-1 text-sm sm:text-base text-gray-600">
                  Klik op een dag om je beschikbaarheid in te vullen
                </p>
                <div className="mt-2 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] sm:text-xs font-semibold text-emerald-800">
                  Beschikbaarheid tot 60 dagen vooruit
                </div>
              </div>
            </div>
            
            <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
              <div className="flex items-start gap-3">
                <div className="h-8 w-8 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold select-none pointer-events-none">
                  i
                </div>
                <div>
                  <h3 className="font-semibold text-emerald-900 mb-1">
                    Tip
                  </h3>
                  <p className="text-sm text-emerald-700">
                    Klik op een dag in de kalender om snel je beschikbaarheid voor die dag in te vullen of te wijzigen
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Kalender */}
          <div className="bg-white rounded-2xl shadow-lg border border-black/5 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white p-4 sm:p-6">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h2 className="text-lg sm:text-2xl font-bold text-center sm:text-left">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    type="button"
                    onClick={() => changeMonth(-1)}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-lg hover:bg-white/20 transition text-sm font-semibold"
                  >
                    ← Vorige
                  </button>
                  <button
                    type="button"
                    onClick={() => changeMonth(1)}
                    className="flex-1 sm:flex-none px-3 py-2 rounded-lg hover:bg-white/20 transition text-sm font-semibold"
                  >
                    Volgende →
                  </button>
                </div>
              </div>
            </div>

            {/* Mobile: keep 7 columns readable without massive width */}
            <div className="-mx-4 px-4 overflow-x-auto sm:mx-0 sm:px-0 sm:overflow-x-visible">
              <div className="min-w-[420px] sm:min-w-0">
                {/* Weekdag headers */}
                <div className="grid grid-cols-7 bg-gray-50 border-b">
                  {WEEKDAYS.map((day) => (
                    <div
                      key={day}
                      className="p-1.5 sm:p-3 text-center font-semibold text-gray-700 border-r last:border-r-0 text-xs sm:text-sm"
                    >
                      {day}
                    </div>
                  ))}
                </div>

                {/* Kalender grid */}
                <div className="grid grid-cols-7">
                  {days.map((date, index) => {
                    if (!date) {
                      return (
                        <div
                          key={`empty-${index}`}
                          className="min-h-[72px] sm:min-h-[120px] bg-gray-50 border-r border-b last:border-r-0"
                        />
                      )
                    }

                    const dayBookings = getBookingsForDate(date)
                    const dayAvailability = getAvailabilityForDate(date)
                    const today = isToday(date)

                    return (
                      <div
                        key={date.toISOString()}
                        onClick={() => handleDayClick(date)}
                        className={`min-h-[72px] sm:min-h-[120px] border-r border-b last:border-r-0 p-1.5 sm:p-2 cursor-pointer ${
                          today ? 'bg-blue-50' : 'bg-white'
                        } hover:bg-emerald-50 hover:border-emerald-300 transition`}
                      >
                        <div className={`text-xs sm:text-sm font-semibold mb-1.5 ${
                          today 
                            ? 'text-blue-600 bg-blue-100 rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center' 
                            : 'text-gray-700'
                        }`}>
                          {date.getDate()}
                        </div>

                        <div className="space-y-1">
                          {/* Beschikbaarheid */}
                          {dayAvailability.length > 0 && (
                            <div className="text-[10px] bg-green-50 border-l-2 border-green-400 p-1 rounded">
                              <div className="font-medium text-green-700">Beschikbaar</div>
                              <div className="text-green-700 text-[10px] leading-snug truncate">
                                {(() => {
                                  const labels = dayAvailability.map((a) => TIME_WINDOW_LABELS[a.timeWindow] ?? a.timeWindow)
                                  const shown = labels.slice(0, 2)
                                  const rest = Math.max(0, labels.length - shown.length)
                                  return `${shown.join(', ')}${rest > 0 ? ` +${rest}` : ''}`
                                })()}
                              </div>
                            </div>
                          )}

                          {/* Bookings */}
                          {dayBookings.map((booking) => {
                            const serviceName = DISPATCH_SERVICES.find(
                              s => s.id === booking.service
                            )?.name || booking.service

                            return (
                              <div
                                key={booking.id}
                                onClick={(e) => {
                                  e.stopPropagation()
                                  setSelectedBooking(booking)
                                  setShowBookingModal(true)
                                }}
                                className={`text-[11px] sm:text-xs p-1.5 sm:p-2 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition ${
                                  STATUS_COLORS[booking.status]
                                }`}
                                title={`Klik voor details: ${serviceName} - ${booking.petName}`}
                              >
                                <div className="font-semibold truncate">
                                  {TIME_WINDOW_LABELS[booking.timeWindow]}
                                </div>
                                <div className="truncate text-[10px] opacity-90">
                                  {booking.petName}
                                  {booking.isRecurring && <span className="ml-1">(reeks)</span>}
                                </div>
                                <div className="truncate text-[10px] font-medium mt-1 hidden sm:block">
                                  {booking.owner.firstName} {booking.owner.lastName}
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Legenda */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-black/5 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Legenda:</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <div className="font-medium text-sm text-gray-700">Beschikbaarheid:</div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-50 border-2 border-green-400 rounded"></div>
                  <span className="text-sm">Beschikbaar</span>
                </div>
              </div>
              
              <div className="space-y-2">
                <div className="font-medium text-sm text-gray-700">Opdrachten:</div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded"></div>
                  <span className="text-sm">Toegewezen</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded"></div>
                  <span className="text-sm">Bevestigd</span>
                </div>
              </div>

              <div className="space-y-2">
                <div className="font-medium text-sm text-gray-700">Symbolen:</div>
                <div className="flex items-center gap-2">
                  <span className="text-sm">🔄 = Reeks</span>
                </div>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-black/5 p-4">
              <div className="text-2xl font-bold text-green-600">
                {availability.filter(a => a.isAvailable).length}
              </div>
              <div className="text-sm text-gray-600">Beschikbare slots</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-black/5 p-4">
              <div className="text-2xl font-bold text-blue-600">
                {bookings.filter(b => b.status === 'ASSIGNED').length}
              </div>
              <div className="text-sm text-gray-600">Toegewezen</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm border border-black/5 p-4">
              <div className="text-2xl font-bold text-green-600">
                {bookings.filter(b => b.status === 'CONFIRMED').length}
              </div>
              <div className="text-sm text-gray-600">Bevestigd</div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal voor beschikbaarheid bewerken */}
      {showModal && selectedDate && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-6 max-h-[90dvh] md:max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold text-gray-900">
                {selectedDate.toLocaleDateString('nl-BE', { 
                  weekday: 'long', 
                  day: 'numeric', 
                  month: 'long' 
                })}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl"
              >
                ×
              </button>
            </div>

            <div className="mb-6">
              <h3 className="font-semibold text-gray-900 mb-3">Wanneer ben je beschikbaar?</h3>
              <div className="mb-3 text-xs sm:text-sm text-gray-600">
                Dit geldt voor de diensten die je aanbiedt. Pas je diensten aan in{' '}
                <Link href="/dashboard/caregiver/profile" className="font-semibold text-emerald-700 hover:underline">
                  Profiel
                </Link>
                .
              </div>
              <div className="space-y-2">
                {[
                  { value: 'MORNING', label: 'Ochtend', hint: '07:00 - 12:00' },
                  { value: 'AFTERNOON', label: 'Middag', hint: '12:00 - 18:00' },
                  { value: 'EVENING', label: 'Avond', hint: '18:00 - 22:00' },
                  { value: 'NIGHT', label: 'Nacht', hint: '22:00 - 07:00' },
                ].map((window) => (
                  <label
                    key={window.value}
                    className={`flex items-center gap-3 p-4 border-2 rounded-xl cursor-pointer transition ${
                      selectedTimeWindows.includes(window.value)
                        ? 'border-emerald-500 bg-emerald-50'
                        : 'border-gray-200 hover:bg-gray-50'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={selectedTimeWindows.includes(window.value)}
                      onChange={() => handleToggleTimeWindow(window.value)}
                      className="w-5 h-5 text-emerald-600 rounded"
                    />
                    <div className="flex-1">
                      <div className="font-semibold text-gray-900">{window.label}</div>
                      <div className="text-sm text-gray-600">{window.hint}</div>
                    </div>
                  </label>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => setSelectedTimeWindows(['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT'])}
                  className="text-sm text-emerald-600 hover:text-emerald-700 font-medium"
                >
                  Hele dag
                </button>
                <span className="text-gray-400">|</span>
                <button
                  type="button"
                  onClick={() => setSelectedTimeWindows([])}
                  className="text-sm text-gray-600 hover:text-gray-700 font-medium"
                >
                  Geen
                </button>
              </div>
            </div>

            <div className="flex gap-3">
              {getAvailabilityForDate(selectedDate).length > 0 && (
                <button
                  onClick={handleDeleteDayAvailability}
                  disabled={saving}
                  className="flex-1 px-4 py-3 bg-red-100 text-red-700 rounded-xl font-semibold hover:bg-red-200 transition disabled:opacity-50"
                >
                  {saving ? 'Verwijderen...' : 'Verwijder alles'}
                </button>
              )}
              <button
                onClick={handleSaveAvailability}
                disabled={saving || selectedTimeWindows.length === 0}
                className="flex-1 px-4 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition disabled:opacity-50"
              >
                {saving ? 'Opslaan...' : 'Opslaan'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal voor booking details */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90dvh] md:max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                      Opdracht details
                </h2>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  STATUS_COLORS[selectedBooking.status]
                }`}>
                  {getStatusLabel(selectedBooking.status)}
                </div>
              </div>
              <button
                onClick={() => setShowBookingModal(false)}
                className="text-gray-400 hover:text-gray-600 text-3xl leading-none"
              >
                ×
              </button>
            </div>

            <div className="space-y-6">
              {/* Datum & Tijd */}
              <div className="bg-emerald-50 border-l-4 border-emerald-500 p-4 rounded-lg">
                    <h3 className="font-semibold text-emerald-900 mb-2">Wanneer</h3>
                <p className="text-lg font-medium text-emerald-800">
                  {new Date(selectedBooking.date).toLocaleDateString('nl-BE', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                    year: 'numeric'
                  })}
                </p>
                <p className="text-emerald-700 mt-1">
                  {TIME_WINDOW_LABELS[selectedBooking.timeWindow]}
                  {selectedBooking.time && ` om ${selectedBooking.time}`}
                </p>
                {selectedBooking.isRecurring && (
                  <p className="text-sm text-emerald-600 mt-2">
                        Terugkerende opdracht
                  </p>
                )}
              </div>

              {/* Dienst */}
              <div className="bg-blue-50 border-l-4 border-blue-500 p-4 rounded-lg">
                    <h3 className="font-semibold text-blue-900 mb-2">Dienst</h3>
                <p className="text-lg font-medium text-blue-800">
                  {DISPATCH_SERVICES.find(s => s.id === selectedBooking.service)?.name || selectedBooking.service}
                </p>
              </div>

              {/* Huisdier */}
              <div className="bg-purple-50 border-l-4 border-purple-500 p-4 rounded-lg">
                    <h3 className="font-semibold text-purple-900 mb-2">Huisdier</h3>
                <p className="text-lg font-medium text-purple-800">
                  {selectedBooking.petName}
                </p>
                <p className="text-purple-700 capitalize">
                  {selectedBooking.petType}
                </p>
              </div>

              {/* Eigenaar */}
              <div className="bg-orange-50 border-l-4 border-orange-500 p-4 rounded-lg">
                    <h3 className="font-semibold text-orange-900 mb-2">Eigenaar</h3>
                <p className="text-lg font-medium text-orange-800">
                  {selectedBooking.owner.firstName} {selectedBooking.owner.lastName}
                </p>
              </div>

              {/* Locatie */}
              <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-lg">
                    <h3 className="font-semibold text-teal-900 mb-2">Locatie</h3>
                <p className="text-teal-800">
                  {selectedBooking.city}
                </p>
                <p className="text-teal-700">
                  {selectedBooking.postalCode}
                </p>
              </div>

            </div>

            <div className="mt-6 flex flex-wrap gap-3 justify-end">
              {['CONFIRMED', 'COMPLETED'].includes(selectedBooking.status) ? (
                <a
                  href={`/chat/${selectedBooking.id}`}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
                >
                  Chat
                </a>
              ) : (
                <span className="text-xs text-gray-500 flex items-center">Chat beschikbaar na bevestiging eigenaar</span>
              )}
              <button
                onClick={() => setShowBookingModal(false)}
                className="px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition"
              >
                Sluiten
              </button>
            </div>
          </div>
        </div>
      )}

      <SiteFooter />
    </div>
  )
}
