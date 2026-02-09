'use client'

import { useEffect, useState } from 'react'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { DISPATCH_SERVICES } from '@/lib/services'

const DEFAULT_TZ = 'Europe/Brussels'

type Booking = {
  id: string
  service: string
  date: string
  timeWindow: string
  city: string
  petName: string
  petType: string
  status: string
  isRecurring: boolean
  caregiver: {
    firstName: string
    lastName: string
    email?: string
    phone?: string | null
  } | null
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

const ymdInZone = (date: Date, timeZone = DEFAULT_TZ) => {
  const fmt = new Intl.DateTimeFormat('en-US', {
    timeZone,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  })
  const parts = fmt.formatToParts(date)
  const yyyy = parts.find((p) => p.type === 'year')?.value ?? '0000'
  const mm = parts.find((p) => p.type === 'month')?.value ?? '00'
  const dd = parts.find((p) => p.type === 'day')?.value ?? '00'
  return `${yyyy}-${mm}-${dd}`
}

export default function OwnerCalendarPage() {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null)
  const [showBookingModal, setShowBookingModal] = useState(false)

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/owner/calendar')
      if (response.ok) {
        const data = await response.json()
        setBookings(data.bookings || [])
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
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
    const startingDayOfWeek = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1 // Ma = 0

    const days = []
    
    // Vorige maand opvulling
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Huidige maand
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i))
    }
    
    return days
  }

  const getBookingsForDate = (date: Date) => {
    const target = ymdInZone(date)
    return bookings.filter((booking) => ymdInZone(new Date(booking.date)) === target)
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
    return ymdInZone(date) === ymdInZone(new Date())
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
      <SiteHeader primaryCtaHref="/dashboard/owner" primaryCtaLabel="Dashboard" />

      <main className="container mx-auto px-4" style={{ paddingTop: '6rem', paddingBottom: '5rem' }}>
        <div className="max-w-7xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 mb-2">
              📅 Mijn Kalender
            </h1>
            <p className="text-gray-600">
              Overzicht van al je aanvragen in kalender vorm
            </p>
            <div className="mt-2 inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-800">
              Boekbaar tot 60 dagen vooruit
            </div>
          </div>

          {/* Kalender Header */}
          <div className="bg-white rounded-2xl shadow-lg border border-black/5 overflow-hidden">
            <div className="bg-gradient-to-r from-emerald-600 to-blue-600 text-white p-6">
              <div className="flex items-center justify-between">
                <button
                  onClick={() => changeMonth(-1)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <span className="sm:hidden" aria-hidden>
                    ←
                  </span>
                  <span className="hidden sm:inline">← Vorige</span>
                </button>
                <h2 className="text-lg sm:text-2xl font-bold text-center flex-1 px-2 truncate">
                  {MONTHS[currentDate.getMonth()]} {currentDate.getFullYear()}
                </h2>
                <button
                  onClick={() => changeMonth(1)}
                  className="p-2 hover:bg-white/20 rounded-lg transition"
                >
                  <span className="sm:hidden" aria-hidden>
                    →
                  </span>
                  <span className="hidden sm:inline">Volgende →</span>
                </button>
              </div>
            </div>

            {/* Weekdag headers */}
            <div className="grid grid-cols-7 bg-gray-50 border-b">
              {WEEKDAYS.map((day) => (
                <div
                  key={day}
                  className="p-1.5 sm:p-4 text-center text-[11px] sm:text-base font-semibold text-gray-700 border-r last:border-r-0"
                >
                  {day}
                </div>
              ))}
            </div>

            {/* Kalender grid (no horizontal scroll on mobile) */}
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
                const today = isToday(date)

                return (
                  <div
                    key={date.toISOString()}
                    className={`min-h-[72px] sm:min-h-[120px] border-r border-b last:border-r-0 p-1.5 sm:p-2 ${
                      today ? 'bg-blue-50' : 'bg-white'
                    } hover:bg-gray-50 transition`}
                  >
                    <div
                      className={`text-xs sm:text-sm font-semibold mb-1.5 sm:mb-2 ${
                        today
                          ? 'text-blue-600 bg-blue-100 rounded-full w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center'
                          : 'text-gray-700'
                      }`}
                    >
                      {date.getDate()}
                    </div>

                    <div className="space-y-1">
                      {dayBookings.map((booking) => {
                        const serviceName =
                          DISPATCH_SERVICES.find((service) => service.id === booking.service)?.name || booking.service

                        return (
                          <div
                            key={booking.id}
                            onClick={() => {
                              setSelectedBooking(booking)
                              setShowBookingModal(true)
                            }}
                            className={`text-[10px] sm:text-xs p-1.5 sm:p-2 rounded-lg border-l-4 cursor-pointer hover:shadow-md transition ${
                              STATUS_COLORS[booking.status]
                            }`}
                            title={`Klik voor details: ${serviceName} - ${booking.petName}`}
                          >
                            <div className="font-semibold truncate">{serviceName}</div>
                            <div className="truncate text-[10px] opacity-80">
                              {booking.petName}
                              {booking.isRecurring && ' (reeks)'}
                            </div>
                            {booking.caregiver && (
                              <div className="truncate text-[10px] font-medium mt-1">{booking.caregiver.firstName}</div>
                            )}
                            {!booking.caregiver && booking.status === 'PENDING' && (
                              <div className="truncate text-[10px] text-yellow-700 mt-1">Wacht op toewijzing</div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Legenda */}
          <div className="mt-6 bg-white rounded-xl shadow-sm border border-black/5 p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Legenda:</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-yellow-100 border-2 border-yellow-400 rounded"></div>
                <span className="text-sm">In afwachting</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-blue-100 border-2 border-blue-400 rounded"></div>
                <span className="text-sm">Toegewezen</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-green-100 border-2 border-green-400 rounded"></div>
                <span className="text-sm">Bevestigd</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 bg-gray-100 border-2 border-gray-400 rounded"></div>
                <span className="text-sm">Afgerond</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm">Reeks</span>
              </div>
            </div>
          </div>

          {/* Stats */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-xl shadow-sm border border-black/5 p-4">
              <div className="text-2xl font-bold text-gray-900">
                {bookings.filter(b => b.status === 'PENDING').length}
              </div>
              <div className="text-sm text-gray-600">In afwachting</div>
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
            <div className="bg-white rounded-xl shadow-sm border border-black/5 p-4">
              <div className="text-2xl font-bold text-gray-600">
                {bookings.filter(b => b.isRecurring).length}
              </div>
              <div className="text-sm text-gray-600">Reeksen</div>
            </div>
          </div>
        </div>
      </main>

      {/* Modal voor booking details */}
      {showBookingModal && selectedBooking && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[9999] p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-6 max-h-[90dvh] md:max-h-[90vh] overflow-y-auto">
            <div className="flex items-start justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900 mb-2">
                  Aanvraag details
                </h2>
                <div className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${
                  STATUS_COLORS[selectedBooking.status]
                }`}>
                  {selectedBooking.status === 'PENDING' && 'In afwachting'}
                  {selectedBooking.status === 'ASSIGNED' && 'Toegewezen'}
                  {selectedBooking.status === 'CONFIRMED' && 'Bevestigd'}
                  {selectedBooking.status === 'COMPLETED' && 'Afgerond'}
                  {selectedBooking.status === 'CANCELLED' && 'Geannuleerd'}
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
                <p className="text-emerald-700 mt-1">Tijdstip bespreek je via chat.</p>
                {selectedBooking.isRecurring && (
                  <p className="text-sm text-emerald-600 mt-2">
                    Terugkerende aanvraag
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

              {/* Verzorger (als toegewezen) */}
              {selectedBooking.caregiver ? (
                <div className="bg-green-50 border-l-4 border-green-500 p-4 rounded-lg">
                  <h3 className="font-semibold text-green-900 mb-2">Toegewezen verzorger</h3>
                  <p className="text-lg font-medium text-green-800">
                    {selectedBooking.caregiver.firstName} {selectedBooking.caregiver.lastName}
                  </p>
                  {selectedBooking.caregiver.email && (
                    <p className="text-green-700 mt-1">
                      {selectedBooking.caregiver.email}
                    </p>
                  )}
                  {selectedBooking.caregiver.phone && (
                    <p className="text-green-700 mt-1">
                      📱 {selectedBooking.caregiver.phone}
                    </p>
                  )}
                </div>
              ) : (
                <div className="bg-yellow-50 border-l-4 border-yellow-500 p-4 rounded-lg">
                  <h3 className="font-semibold text-yellow-900 mb-2">⏳ Status</h3>
                  <p className="text-yellow-700">
                    Je aanvraag is ontvangen en wacht op toewijzing aan een verzorger.
                    We nemen zo snel mogelijk contact met je op!
                  </p>
                </div>
              )}

              {/* Locatie */}
              <div className="bg-teal-50 border-l-4 border-teal-500 p-4 rounded-lg">
                <h3 className="font-semibold text-teal-900 mb-2">📍 Locatie</h3>
                <p className="text-teal-800">
                  {selectedBooking.city}
                </p>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap gap-3 justify-end">
              {selectedBooking.caregiver && ['CONFIRMED', 'COMPLETED'].includes(selectedBooking.status) ? (
                <a
                  href={`/chat/${selectedBooking.id}`}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition"
                >
                  Chat
                </a>
              ) : (
                <span className="text-xs text-gray-500 flex items-center">Chat beschikbaar na je bevestiging</span>
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
