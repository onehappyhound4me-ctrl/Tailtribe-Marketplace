'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { DISPATCH_SERVICES } from '@/lib/services'
import { getTodayStringInZone, validateNotInPast } from '@/lib/date-utils'
import { trackEvent } from '@/lib/analytics'

const TIME_WINDOWS = [
  { value: 'MORNING', label: 'Ochtend', time: '07:00-12:00' },
  { value: 'AFTERNOON', label: 'Middag', time: '12:00-18:00' },
  { value: 'EVENING', label: 'Avond', time: '18:00-22:00' },
  { value: 'NIGHT', label: 'Nacht', time: '22:00-07:00' },
]

type MyCaregiver = {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string | null
  services: string[]
  city: string
  bio: string
  totalBookings: number
  lastBookingDate: string
}

type BookingMode = 'calendar'

export default function NewBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [bookingMode, setBookingMode] = useState<BookingMode>('calendar')
  const [selectedTimeWindows, setSelectedTimeWindows] = useState<string[]>([])
  const [perDayTimeWindows, setPerDayTimeWindows] = useState<Record<string, string[]>>({})
  const isCalendarMode = bookingMode === 'calendar'
  const [useDirect, setUseDirect] = useState(false)
  const [myCaregivers, setMyCaregivers] = useState<MyCaregiver[]>([])
  const [selectedCaregiver, setSelectedCaregiver] = useState<string>('')
  const [homeAddress, setHomeAddress] = useState('')
  const [homeCity, setHomeCity] = useState('')
  const [homePostalCode, setHomePostalCode] = useState('')
  const [weekdayFilter, setWeekdayFilter] = useState<number[]>([])
  const [excludedDates, setExcludedDates] = useState<Record<string, boolean>>({})
  const [usePerDaySlots, setUsePerDaySlots] = useState(false)
  
  const [formData, setFormData] = useState({
    service: '',
    startDate: '',
    endDate: '',
    city: '',
    postalCode: '',
    address: '',
    petName: '',
    petType: 'hond',
    petDetails: '',
    message: '',
  })

  // Locale-safe yyyy-mm-dd string for today in Brussels
  const todayStr = getTodayStringInZone()
  const maxBookingDateStr = (() => {
    const [y, m, d] = todayStr.split('-').map(Number)
    const dt = new Date(y, m - 1, d)
    dt.setDate(dt.getDate() + 60)
    const yyyy = dt.getFullYear()
    const mm = String(dt.getMonth() + 1).padStart(2, '0')
    const dd = String(dt.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })()

  const serviceParam = searchParams.get('service')

  useEffect(() => {
    fetchMyCaregivers()
    fetchOwnerProfile()
  }, [])

  useEffect(() => {
    if (!serviceParam) return
    const valid = DISPATCH_SERVICES.some((service) => service.id === serviceParam)
    if (!valid) return
    setFormData((prev) => (prev.service ? prev : { ...prev, service: serviceParam }))
  }, [serviceParam])

  const fetchOwnerProfile = async () => {
    try {
      const response = await fetch('/api/owner/profile', { cache: 'no-store' })
      if (response.ok) {
        const data = await response.json()
        const nextAddress = (data?.address || '').trim()
        const nextCity = (data?.city || '').trim()
        const nextPostalCode = (data?.postalCode || '').trim()
        setHomeAddress(nextAddress)
        setHomeCity(nextCity)
        setHomePostalCode(nextPostalCode)
        setFormData((prev) => ({
          ...prev,
          address: prev.address ? prev.address : nextAddress,
          city: prev.city ? prev.city : nextCity,
          postalCode: prev.postalCode ? prev.postalCode : nextPostalCode,
        }))
      }
    } catch (error) {
      console.error('Failed to fetch owner profile:', error)
    }
  }

  const parseYmd = (ymd: string) => {
    const [y, m, d] = ymd.split('-').map(Number)
    return new Date(y, m - 1, d)
  }

  const formatYmd = (d: Date) => {
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  }

  const getRangeDates = (startYmd: string, endYmd: string) => {
    const start = parseYmd(startYmd)
    const end = parseYmd(endYmd)
    const out: string[] = []
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      out.push(formatYmd(d))
    }
    return out
  }

  const filteredDates = (() => {
    if (!formData.startDate) return []
    const end = formData.endDate || formData.startDate
    const all = getRangeDates(formData.startDate, end)
    const filtered =
      weekdayFilter.length > 0 ? all.filter((ymd) => weekdayFilter.includes(parseYmd(ymd).getDay())) : all
    return filtered.filter((ymd) => !excludedDates[ymd])
  })()

  const toggleWeekday = (weekday: number) => {
    setWeekdayFilter((prev) =>
      prev.includes(weekday) ? prev.filter((d) => d !== weekday) : [...prev, weekday].sort((a, b) => a - b)
    )
  }

  const toggleDateExcluded = (ymd: string) => {
    setExcludedDates((prev) => ({ ...prev, [ymd]: !prev[ymd] }))
  }

  // Keep per-day time slots in sync with the currently selected date set.
  useEffect(() => {
    if (!usePerDaySlots) {
      setPerDayTimeWindows({})
      return
    }
    if (!formData.startDate) return
    if (!filteredDates.length) return

    setPerDayTimeWindows((prev) => {
      const next: Record<string, string[]> = { ...prev }
      // Add new dates with default (current global selection)
      filteredDates.forEach((date) => {
        if (!next[date]) {
          next[date] = selectedTimeWindows.length ? [...selectedTimeWindows] : []
        }
      })
      // Remove dates that are no longer selected
      Object.keys(next).forEach((key) => {
        if (!filteredDates.includes(key)) {
          delete next[key]
        }
      })
      return next
    })
  }, [formData.startDate, formData.endDate, selectedTimeWindows, weekdayFilter, excludedDates, usePerDaySlots])

  const fetchMyCaregivers = async () => {
    try {
      const response = await fetch('/api/owner/my-caregivers')
      if (response.ok) {
        const data = await response.json()
        setMyCaregivers(data)
      }
    } catch (error) {
      console.error('Failed to fetch caregivers:', error)
    }
  }

  const toggleTimeWindow = (window: string) => {
    setSelectedTimeWindows(prev =>
      prev.includes(window)
        ? prev.filter(w => w !== window)
        : [...prev, window]
    )
  }

  // Reset form functie
  const resetForm = () => {
    setSelectedTimeWindows([])
    setBookingMode('calendar')
    setPerDayTimeWindows({})
    setUseDirect(false)
    setSelectedCaregiver('')
    setWeekdayFilter([])
    setExcludedDates({})
    setUsePerDaySlots(false)
  }

  const setMode = (mode: BookingMode) => {
    setBookingMode(mode)
    void mode
  }

  const togglePerDayTimeWindow = (date: string, window: string) => {
    setPerDayTimeWindows((prev) => {
      const current = prev[date] || []
      const exists = current.includes(window)
      const next = exists ? current.filter((w) => w !== window) : [...current, window]
      return { ...prev, [date]: next }
    })
  }

  const applyFirstDayToAll = () => {
    if (!formData.startDate || !formData.endDate) return
    const first = perDayTimeWindows[formData.startDate] || []
    if (!first.length) return

    const dates: string[] = []
    const [startYear, startMonth, startDay] = formData.startDate.split('-').map(Number)
    const [endYear, endMonth, endDay] = formData.endDate.split('-').map(Number)
    const start = new Date(startYear, startMonth - 1, startDay)
    const end = new Date(endYear, endMonth - 1, endDay)
    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
      const year = d.getFullYear()
      const month = String(d.getMonth() + 1).padStart(2, '0')
      const day = String(d.getDate()).padStart(2, '0')
      dates.push(`${year}-${month}-${day}`)
    }

    setPerDayTimeWindows((prev) => {
      const next: Record<string, string[]> = { ...prev }
      dates.forEach((date) => {
        next[date] = [...first]
      })
      return next
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const maxDate = new Date(today)
    maxDate.setUTCDate(maxDate.getUTCDate() + 60)

    // Base check: at least one time window
    if (selectedTimeWindows.length === 0) {
      setError('Selecteer minimaal één tijdsblok')
      return
    }

    if (!formData.startDate) {
      setError('Kies een datum')
      return
    }

    if (useDirect && !selectedCaregiver) {
      setError('Selecteer een verzorger voor direct boeken')
      return
    }

    setLoading(true)

    try {
      // BOOKINGS
      const bookings: any[] = []

      const dates = filteredDates.length ? filteredDates : [formData.startDate]

      // Valideer tijdslots + geen verleden (in Brussels tijd)
      if (formData.endDate) {
        const endDate = parseYmd(formData.endDate)
        if (endDate.getTime() > maxDate.getTime()) {
          setError('Je kan maximaal 60 dagen vooruit boeken')
          setLoading(false)
          return
        }
      }
      if (!dates.length) {
        setError('Geen dagen geselecteerd')
        setLoading(false)
        return
      }
      for (const date of dates) {
        const dateObj = parseYmd(date)
        if (dateObj.getTime() > maxDate.getTime()) {
          setError('Je kan maximaal 60 dagen vooruit boeken')
          setLoading(false)
          return
        }
        const slots = usePerDaySlots ? perDayTimeWindows[date] || [] : selectedTimeWindows
        if (!slots.length) {
          setError(usePerDaySlots ? 'Kies minimaal één tijdsblok per geselecteerde dag' : 'Selecteer minimaal één tijdsblok')
          setLoading(false)
          return
        }
        for (const window of slots) {
          const notPast = validateNotInPast({ date, timeWindow: window })
          if (!notPast.ok) {
            setError('Datum mag niet in het verleden liggen')
            setLoading(false)
            return
          }
        }
      }

      // Maak booking voor elke datum + elk tijdsblok
      for (const date of dates) {
        const slotsForDay = usePerDaySlots ? perDayTimeWindows[date] || [] : selectedTimeWindows
        const bookingAddress = formData.address.trim() || homeAddress
        for (const timeWindow of slotsForDay) {
          bookings.push({
            service: formData.service,
            date,
            timeWindow,
            city: formData.city.trim() || homeCity,
            postalCode: formData.postalCode.trim() || homePostalCode,
            address: bookingAddress,
            petName: formData.petName,
            petType: formData.petType,
            petDetails: formData.petDetails,
            message: formData.message,
            isRecurring: false
          })
        }
      }

      // Als direct naar verzorger: voeg caregiverId en status toe
      if (useDirect && selectedCaregiver) {
        bookings.forEach(booking => {
          booking.caregiverId = selectedCaregiver
          booking.status = 'ASSIGNED' // Direct toegewezen
        })
      }

      const response = await fetch('/api/owner/bookings/bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bookings }),
      })

      if (response.ok) {
        const data = await response.json()
        trackEvent('booking_request_submitted', {
          service: formData.service,
          count: data.count,
          direct: useDirect,
        })
        resetForm()
        if (useDirect) {
          router.push(`/dashboard/owner/bookings?success=${data.count}&direct=true`)
        } else {
          router.push(`/dashboard/owner/bookings?success=${data.count}`)
        }
      } else {
        const data = await response.json()
        setError(data.error || 'Er ging iets mis')
        setLoading(false)
      }
    } catch (err) {
      setError('Er ging iets mis bij het versturen')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/dashboard/owner" primaryCtaLabel="Dashboard" />

      <main className="container mx-auto px-4" style={{ paddingTop: '3rem', paddingBottom: '5rem' }}>
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 mb-2">
              Nieuwe aanvraag
            </h1>
            <p className="text-gray-600">Vraag dierenverzorging aan - enkel of meerdere dagen</p>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-800">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-6">
            {/* Dienst */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Dienst *
              </label>
              <select
                value={formData.service}
                onChange={(e) => setFormData({ ...formData, service: e.target.value })}
                required
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              >
                <option value="">Selecteer een dienst</option>
                {DISPATCH_SERVICES.map((service) => (
                  <option key={service.id} value={service.id}>
                    {service.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Direct naar verzorger OF via admin */}
            {myCaregivers.length > 0 && (
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 border-2 border-purple-200 rounded-xl p-5">
                <div className="flex items-start gap-3 mb-4">
                  <div className="text-3xl">⚡</div>
                  <div className="flex-1">
                    <div className="font-bold text-gray-900 text-lg mb-1">
                      Direct boeken - Bespaar tijd!
                    </div>
                    <div className="text-sm text-gray-600">
                      Stuur direct naar een verzorger die je al kent - geen wachten op de beheerder!
                    </div>
                  </div>
                </div>

                <label 
                  className="flex items-start gap-3 cursor-pointer mb-4"
                  onClick={(e) => e.preventDefault()}
                >
                  <input
                    type="checkbox"
                    checked={useDirect}
                    onChange={(e) => {
                      e.stopPropagation()
                      setUseDirect(e.target.checked)
                      if (!e.target.checked) setSelectedCaregiver('')
                    }}
                    onClick={(e) => e.stopPropagation()}
                    className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
                  />
                  <div className="flex-1">
                    <div className="font-medium text-gray-900">
                      ✅ Gebruik direct boeken
                    </div>
                    <div className="text-xs text-gray-500 mt-1">
                      Kies een verzorger uit je lijst - aanvraag wordt direct toegewezen
                    </div>
                  </div>
                </label>

                {useDirect && (
                  <div className="space-y-2 mt-3">
                    <div className="text-sm font-medium text-gray-700 mb-2">
                      Selecteer verzorger:
                    </div>
                    {myCaregivers.map((caregiver) => {
                      const isSelected = selectedCaregiver === caregiver.id
                      return (
                        <button
                          key={caregiver.id}
                          type="button"
                          onClick={() => setSelectedCaregiver(caregiver.id)}
                          className={`w-full flex items-center justify-between p-4 rounded-xl border-2 transition text-left ${
                            isSelected
                              ? 'bg-purple-100 border-purple-500'
                              : 'bg-white border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <div className="flex-1">
                            <div className={`font-semibold ${isSelected ? 'text-purple-900' : 'text-gray-900'}`}>
                              {caregiver.firstName} {caregiver.lastName}
                            </div>
                            <div className="text-xs text-gray-500 mt-1">
                              📍 {caregiver.city} • {caregiver.totalBookings}x samengewerkt
                            </div>
                            {caregiver.bio && (
                              <div className="text-xs text-gray-600 mt-1 line-clamp-1">
                                {caregiver.bio}
                              </div>
                            )}
                          </div>
                          {isSelected && (
                            <div className="text-purple-600 font-bold ml-3">✓</div>
                          )}
                        </button>
                      )
                    })}
                    
                    {!selectedCaregiver && (
                      <div className="text-xs text-red-600 mt-2">
                        ⚠️ Selecteer een verzorger om door te gaan
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Type aanvraag: single / multi */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <div className="text-sm font-semibold text-blue-900 mb-1">Kies dagen in één flow</div>
              <div className="text-xs text-gray-600">
                Kies een datum of periode. Optioneel: filter op weekdag (bv. elke dinsdag) en klik dagen aan/uit.
              </div>
            </div>

            {/* Datums */}
            {isCalendarMode ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Van (startdatum) *
                  </label>
                  <div className="text-xs text-gray-500 mb-2">
                    Je kan maximaal 60 dagen vooruit boeken.
                  </div>
                  <input
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                    min={todayStr}
                    max={maxBookingDateStr}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tot (einddatum) (optioneel)
                  </label>
                  <div className="text-xs text-gray-500 mb-2">
                    Je kan maximaal 60 dagen vooruit boeken.
                  </div>
                  <input
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                    min={formData.startDate || todayStr}
                    max={maxBookingDateStr}
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                {formData.startDate && formData.endDate && (
                  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
                    <div className="text-sm font-semibold text-amber-900 mb-3">
                      Filter op weekdag (optioneel)
                    </div>
                    <div className="flex flex-wrap gap-2">
                      {[
                        { d: 1, label: 'Ma' },
                        { d: 2, label: 'Di' },
                        { d: 3, label: 'Wo' },
                        { d: 4, label: 'Do' },
                        { d: 5, label: 'Vr' },
                        { d: 6, label: 'Za' },
                        { d: 0, label: 'Zo' },
                      ].map((w) => {
                        const active = weekdayFilter.includes(w.d)
                        return (
                          <button
                            key={w.d}
                            type="button"
                            onClick={() => toggleWeekday(w.d)}
                            className={`px-3 py-2 rounded-full border text-sm font-semibold transition ${
                              active ? 'bg-amber-200 border-amber-400 text-amber-950' : 'bg-white border-amber-200 text-gray-900 hover:bg-amber-100'
                            }`}
                          >
                            {w.label}
                          </button>
                        )
                      })}
                    </div>
                    <div className="mt-3 text-xs text-gray-700">
                      Geselecteerde dagen: <strong>{filteredDates.length}</strong>
                    </div>
                    {filteredDates.length > 0 && (
                      <div className="mt-2 flex flex-wrap gap-2">
                        {filteredDates.map((d) => (
                          <button
                            key={d}
                            type="button"
                            onClick={() => toggleDateExcluded(d)}
                            className="px-2 py-1 rounded-lg border border-amber-200 bg-white text-xs hover:bg-amber-100 transition"
                            title="Klik om uit te sluiten"
                          >
                            {new Date(d).toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit' })}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="mt-2 text-xs text-gray-500">
                      Tip: klik een dag hierboven om hem uit te sluiten (voor losse uitzonderingen).
                    </div>
                  </div>
                )}
              </div>
            ) : null}

            {/* Tijdsblokken (basisselectie) */}
            {isCalendarMode && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Tijdsblokken * <span className="text-gray-500 text-xs">(selecteer 1 of meer)</span>
                </label>
                <div className="grid gap-3">
                  {TIME_WINDOWS.map((window) => {
                    const isSelected = selectedTimeWindows.includes(window.value)
                    return (
                      <button
                        key={window.value}
                        type="button"
                        onClick={() => toggleTimeWindow(window.value)}
                        className={`flex items-center justify-between p-4 rounded-xl border-2 transition ${
                          isSelected
                            ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                            : 'bg-white border-gray-200 hover-border-emerald-300'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-5 h-5 rounded border-2 flex items-center justify-center ${
                              isSelected
                                ? 'bg-emerald-600 border-emerald-600'
                                : 'border-gray-300'
                            }`}
                          >
                            {isSelected && (
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            )}
                          </div>
                          <div className="text-left">
                            <div className={`font-semibold ${isSelected ? 'text-emerald-900' : 'text-gray-900'}`}>
                              {window.label}
                            </div>
                            <div className="text-sm text-gray-500">
                              {window.time}
                            </div>
                          </div>
                        </div>
                        {isSelected && (
                          <span className="text-emerald-600 text-sm font-medium">
                            ✓ Geselecteerd
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {/* Per-dag tijdsloten (optioneel) */}
            {isCalendarMode && formData.startDate && (formData.endDate && filteredDates.length > 1) && (
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <div className="font-semibold text-blue-900">Per dag tijdsblokken (optioneel)</div>
                    <div className="text-xs text-gray-600">
                      Zet aan als je per dag andere blokken wilt. Anders gebruiken we je globale selectie.
                    </div>
                  </div>
                  <label className="inline-flex items-center gap-2 text-xs font-semibold text-blue-900">
                    <input
                      type="checkbox"
                      checked={usePerDaySlots}
                      onChange={(e) => setUsePerDaySlots(e.target.checked)}
                      className="h-4 w-4 rounded border-blue-300 text-blue-600 focus:ring-blue-500"
                    />
                    Per dag instellen
                  </label>
                </div>

                {!usePerDaySlots ? (
                  <div className="text-sm text-gray-600">
                    Globale tijdsblokken worden gebruikt voor alle dagen.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {(() => {
                      const items: JSX.Element[] = []
                      for (const dateStr of filteredDates) {
                        const perDaySlots = perDayTimeWindows[dateStr] || []
                        items.push(
                          <div key={dateStr} className="bg-white border border-blue-100 rounded-lg p-3">
                            <div className="font-medium text-gray-900 mb-2">
                              {new Date(dateStr).toLocaleDateString('nl-BE')}
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                              {TIME_WINDOWS.map((window) => {
                                const isSelected = perDaySlots.includes(window.value)
                                return (
                                  <button
                                    key={window.value}
                                    type="button"
                                    onClick={() => togglePerDayTimeWindow(dateStr, window.value)}
                                    className={`flex items-center justify-between p-3 rounded-lg border-2 transition text-left ${
                                      isSelected
                                        ? 'bg-emerald-50 border-emerald-500 shadow-sm'
                                        : 'bg-white border-gray-200 hover:border-emerald-300'
                                    }`}
                                  >
                                    <div>
                                      <div className={`font-semibold ${isSelected ? 'text-emerald-900' : 'text-gray-900'}`}>
                                        {window.label}
                                      </div>
                                      <div className="text-xs text-gray-500">{window.time}</div>
                                    </div>
                                    {isSelected && <div className="text-emerald-600 font-bold">✓</div>}
                                  </button>
                                )
                              })}
                            </div>
                            {perDaySlots.length === 0 && (
                              <div className="mt-2 text-xs text-red-600">Selecteer minstens 1 blok voor deze dag.</div>
                            )}
                          </div>
                        )
                      }
                      return items
                    })()}
                  </div>
                )}
              </div>
            )}

            {/* Locatie */}
            <div className="text-xs text-gray-500 mb-2">
              Deze velden zijn optioneel en enkel nodig als de dienst niet op je thuisadres is.
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Stad (optioneel)
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Bijv. Antwerpen"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Postcode (optioneel)
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  maxLength={4}
                  placeholder="2000"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Adres (optioneel)
              </label>
              {homeAddress ? (
                <div className="mb-2 text-xs text-emerald-700">
                  Thuisadres: {homeAddress}
                </div>
              ) : (
                <div className="mb-2 text-xs text-gray-500">
                  Geen thuisadres ingesteld. Je kan dit invullen via Instellingen.
                </div>
              )}
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Straat en huisnummer"
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Huisdier */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Naam huisdier *
                </label>
                <input
                  type="text"
                  value={formData.petName}
                  onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                  required
                  placeholder="Bijv. Max"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type *
                </label>
                <select
                  value={formData.petType}
                  onChange={(e) => setFormData({ ...formData, petType: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="hond">🐕 Hond</option>
                  <option value="kat">🐈 Kat</option>
                  <option value="konijn">🐰 Konijn</option>
                  <option value="cavia">🐹 Cavia</option>
                  <option value="vogel">🦜 Vogel</option>
                  <option value="anders">🐾 Anders</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Extra informatie over je huisdier
              </label>
              <textarea
                value={formData.petDetails}
                onChange={(e) => setFormData({ ...formData, petDetails: e.target.value })}
                rows={3}
                placeholder="Leeftijd, ras, gedrag, medische info..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bericht (optioneel)
              </label>
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                rows={3}
                placeholder="Extra informatie of vragen..."
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
              />
            </div>

            {/* Samenvatting */}
            {formData.startDate && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="font-medium text-emerald-900 mb-2">📋 Samenvatting:</div>
                <div className="text-sm text-emerald-800 space-y-1">
                  {formData.endDate ? (
                    <>
                      <div>
                        • Periode: {new Date(formData.startDate).toLocaleDateString('nl-BE')} tot{' '}
                        {new Date(formData.endDate).toLocaleDateString('nl-BE')}
                      </div>
                      {weekdayFilter.length > 0 ? (
                        <div>
                          • Weekdag filter:{' '}
                          {weekdayFilter
                            .map((d: number) => ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za'][d])
                            .join(', ')}
                        </div>
                      ) : null}
                      <div>
                        • Dagen geselecteerd: <strong>{filteredDates.length}</strong>
                      </div>
                      <div className="space-y-1 text-xs text-gray-700">
                        {(() => {
                          const rows: JSX.Element[] = []
                          let total = 0
                          for (const dateStr of filteredDates) {
                            const slots = usePerDaySlots ? perDayTimeWindows[dateStr] || [] : selectedTimeWindows
                            total += slots.length || 0
                            rows.push(
                              <div key={dateStr}>
                                • {new Date(dateStr).toLocaleDateString('nl-BE')}: {slots.length} blok(ken)
                              </div>
                            )
                          }
                          rows.push(
                            <div key="total" className="font-semibold text-emerald-800 mt-1">
                              Totaal: {total}
                            </div>
                          )
                          return rows
                        })()}
                      </div>
                    </>
                  ) : (
                    <>
                      <div>• Datum: {new Date(formData.startDate).toLocaleDateString('nl-BE')}</div>
                      <div>• <strong>Totaal aantal aanvragen: {selectedTimeWindows.length}</strong></div>
                    </>
                  )}
                </div>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-brand disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? 'Aanvragen versturen...' : 'Aanvragen versturen'}
            </button>
          </form>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
