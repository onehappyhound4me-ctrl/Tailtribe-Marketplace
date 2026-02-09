'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { DISPATCH_SERVICES } from '@/lib/services'
import { getTodayStringInZone } from '@/lib/date-utils'
import { trackEvent } from '@/lib/analytics'

// NOTE: The backend currently requires `timeWindow` for bookings.
// This page intentionally hides time selection; time is discussed via chat.
// We therefore submit a placeholder time window that keeps the API happy.
const BOOKING_TIME_WINDOW_PLACEHOLDER = 'MORNING'

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

export default function NewBookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [selectedDates, setSelectedDates] = useState<string[]>([])
  const [useDirect, setUseDirect] = useState(false)
  const [myCaregivers, setMyCaregivers] = useState<MyCaregiver[]>([])
  const [selectedCaregiver, setSelectedCaregiver] = useState<string>('')
  const [homeAddress, setHomeAddress] = useState('')
  const [homeCity, setHomeCity] = useState('')
  const [homePostalCode, setHomePostalCode] = useState('')
  const [calendarMonth, setCalendarMonth] = useState<Date | null>(null)
  
  const [formData, setFormData] = useState({
    service: '',
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

  useEffect(() => {
    if (calendarMonth) return
    const today = parseYmd(todayStr)
    setCalendarMonth(new Date(today.getFullYear(), today.getMonth(), 1))
  }, [calendarMonth, todayStr])

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

  const toggleSelectedDate = (ymd: string) => {
    if (!ymd) return
    if (ymd < todayStr || ymd > maxBookingDateStr) return
    setSelectedDates((prev) => {
      const exists = prev.includes(ymd)
      const next = exists ? prev.filter((d) => d !== ymd) : [...prev, ymd]
      next.sort()
      return next
    })
  }

  const clearSelectedDates = () => {
    setSelectedDates([])
  }

  // Reset form functie
  const resetForm = () => {
    setSelectedDates([])
    setUseDirect(false)
    setSelectedCaregiver('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const maxDate = new Date(today)
    maxDate.setUTCDate(maxDate.getUTCDate() + 60)

    if (selectedDates.length === 0) {
      setError('Kies minimaal één dag')
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

      const dates = [...selectedDates].sort()

      // Valideer tijdslots + geen verleden (in Brussels tijd)
      if (!dates.length) {
        setError('Geen dagen geselecteerd')
        setLoading(false)
        return
      }
      for (const date of dates) {
        if (date < todayStr) {
          setError('Datum mag niet in het verleden liggen')
          setLoading(false)
          return
        }
        const dateObj = parseYmd(date)
        if (dateObj.getTime() > maxDate.getTime()) {
          setError('Je kan maximaal 60 dagen vooruit boeken')
          setLoading(false)
          return
        }
      }

      // Maak booking voor elke geselecteerde dag (tijd in overleg via chat)
      for (const date of dates) {
        const bookingAddress = formData.address.trim() || homeAddress
        const baseMessage = String(formData.message || '').trim()
        const message = baseMessage ? `Tijdstip: in overleg via chat.\n\n${baseMessage}` : 'Tijdstip: in overleg via chat.'

        bookings.push({
          service: formData.service,
          date,
          timeWindow: BOOKING_TIME_WINDOW_PLACEHOLDER,
          city: formData.city.trim() || homeCity,
          postalCode: formData.postalCode.trim() || homePostalCode,
          address: bookingAddress,
          petName: formData.petName,
          petType: formData.petType,
          petDetails: formData.petDetails,
          message,
          isRecurring: false,
        })
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
                Kies één of meerdere dagen. Het tijdstip spreken jullie af via chat.
              </div>
            </div>

            {/* Kalender: multi-select */}
            <div className="space-y-3">
              <label className="block text-sm font-medium text-gray-700">
                Dagen * <span className="text-gray-500 text-xs">(klik om te selecteren)</span>
              </label>
              <div className="text-xs text-gray-500">
                Je kan maximaal 60 dagen vooruit boeken.
              </div>

              <div className="border border-gray-200 rounded-2xl p-3 sm:p-4 bg-white overflow-hidden">
                {calendarMonth ? (
                  <>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <button
                        type="button"
                        onClick={() =>
                          setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() - 1, 1))
                        }
                        className="p-2 sm:px-3 sm:py-2 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Vorige maand"
                        disabled={(() => {
                          const min = parseYmd(todayStr)
                          const minMonth = new Date(min.getFullYear(), min.getMonth(), 1)
                          return calendarMonth.getTime() <= minMonth.getTime()
                        })()}
                      >
                        ‹
                      </button>
                      <div className="min-w-0 flex-1 text-center text-sm font-bold text-gray-900 truncate">
                        {calendarMonth.toLocaleDateString('nl-BE', { month: 'long', year: 'numeric' })}
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          setCalendarMonth(new Date(calendarMonth.getFullYear(), calendarMonth.getMonth() + 1, 1))
                        }
                        className="p-2 sm:px-3 sm:py-2 rounded-xl border border-gray-200 text-sm font-semibold hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                        aria-label="Volgende maand"
                        disabled={(() => {
                          const max = parseYmd(maxBookingDateStr)
                          const maxMonth = new Date(max.getFullYear(), max.getMonth(), 1)
                          return calendarMonth.getTime() >= maxMonth.getTime()
                        })()}
                      >
                        ›
                      </button>
                    </div>

                    <div className="grid grid-cols-7 gap-1 text-[11px] sm:text-xs font-semibold text-gray-500 mb-2">
                      {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((d) => (
                        <div key={d} className="text-center py-1">
                          {d}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1 w-full">
                      {(() => {
                        const year = calendarMonth.getFullYear()
                        const month = calendarMonth.getMonth()
                        const first = new Date(year, month, 1)
                        const mondayFirstIndex = (first.getDay() + 6) % 7
                        const daysInMonth = new Date(year, month + 1, 0).getDate()

                        const cells: JSX.Element[] = []
                        for (let i = 0; i < mondayFirstIndex; i++) {
                          cells.push(<div key={`empty-${i}`} className="aspect-square w-full" />)
                        }
                        for (let day = 1; day <= daysInMonth; day++) {
                          const ymd = formatYmd(new Date(year, month, day))
                          const isSelected = selectedDates.includes(ymd)
                          const isDisabled = ymd < todayStr || ymd > maxBookingDateStr
                          const dayClass = isDisabled
                            ? 'bg-gray-50 border-gray-100 text-gray-300 cursor-not-allowed'
                            : isSelected
                              ? 'bg-emerald-600 border-emerald-600 text-white shadow-sm ring-2 ring-emerald-200 hover:bg-emerald-700 hover:border-emerald-700'
                              : 'bg-white border-gray-200 hover:border-emerald-300 hover:bg-emerald-50'
                          cells.push(
                            <button
                              key={ymd}
                              type="button"
                              disabled={isDisabled}
                              onClick={() => toggleSelectedDate(ymd)}
                              className={[
                                'aspect-square w-full rounded-xl border text-sm font-semibold transition',
                                dayClass,
                                'focus:outline-none focus-visible:ring-2 focus-visible:ring-emerald-400/60 focus-visible:ring-offset-2',
                                !isDisabled ? 'active:scale-[0.98]' : '',
                              ].join(' ')}
                              aria-pressed={isSelected}
                              aria-label={`Selecteer ${new Date(ymd).toLocaleDateString('nl-BE')}`}
                            >
                              {day}
                            </button>
                          )
                        }
                        return cells
                      })()}
                    </div>
                  </>
                ) : null}
              </div>

              <div className="flex items-center justify-between gap-3">
                <div className="text-xs text-gray-600">
                  Geselecteerd: <strong>{selectedDates.length}</strong>
                </div>
                {selectedDates.length > 0 && (
                  <button
                    type="button"
                    onClick={clearSelectedDates}
                    className="text-xs font-semibold text-gray-700 hover:text-gray-900 underline"
                  >
                    Wis selectie
                  </button>
                )}
              </div>

              {selectedDates.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {selectedDates.slice().sort().map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => toggleSelectedDate(d)}
                      className="px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-emerald-50 text-xs font-semibold text-emerald-900 hover:bg-emerald-100 transition"
                      title="Klik om te verwijderen"
                    >
                      {new Date(d).toLocaleDateString('nl-BE', { day: '2-digit', month: '2-digit' })} ×
                    </button>
                  ))}
                </div>
              )}
            </div>

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
            {selectedDates.length > 0 && (
              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4">
                <div className="font-medium text-emerald-900 mb-2">📋 Samenvatting:</div>
                <div className="text-sm text-emerald-800 space-y-1">
                  <div>
                    • Dagen geselecteerd: <strong>{selectedDates.length}</strong>
                  </div>
                  <div>
                    • <strong>Totaal aantal aanvragen: {selectedDates.length}</strong>
                  </div>
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
