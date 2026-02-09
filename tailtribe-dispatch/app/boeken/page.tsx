'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { DISPATCH_SERVICES } from '@/lib/services'
import { trackEvent } from '@/lib/analytics'
import { SERVICE_ICON_FILTER, withAssetVersion } from '@/lib/service-icons'
import { routes } from '@/lib/routes'

const TIME_WINDOWS = [
  { value: 'MORNING', label: 'Ochtend', hint: '07:00 - 12:00' },
  { value: 'AFTERNOON', label: 'Middag', hint: '12:00 - 18:00' },
  { value: 'EVENING', label: 'Avond', hint: '18:00 - 22:00' },
  { value: 'NIGHT', label: 'Nacht', hint: '22:00 - 07:00' },
] as const

export default function BookingPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [step, setStep] = useState(1)
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({})
  
  const serviceParam = searchParams.get('service')
  const todayStr = (() => {
    const t = new Date()
    const yyyy = t.getFullYear()
    const mm = String(t.getMonth() + 1).padStart(2, '0')
    const dd = String(t.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })()
  const maxBookingDateStr = (() => {
    const t = new Date()
    t.setDate(t.getDate() + 60)
    const yyyy = t.getFullYear()
    const mm = String(t.getMonth() + 1).padStart(2, '0')
    const dd = String(t.getDate()).padStart(2, '0')
    return `${yyyy}-${mm}-${dd}`
  })()

  // Redirect logged-in owners to their dashboard booking form
  useEffect(() => {
    if (status === 'authenticated' && session?.user?.role === 'OWNER') {
      const nextUrl = serviceParam
        ? `/dashboard/owner/new-booking?service=${encodeURIComponent(serviceParam)}`
        : '/dashboard/owner/new-booking'
      router.push(nextUrl)
    }
  }, [status, session, router, serviceParam])


  useEffect(() => {
    if (!serviceParam) return
    const valid = DISPATCH_SERVICES.some((service) => service.id === serviceParam)
    if (!valid) return
    setFormData((prev) => ({ ...prev, service: serviceParam }))
    setStep(2)
  }, [serviceParam])

  const [formData, setFormData] = useState({
    service: '',
    // Step 2 supports multiple days + multiple time blocks
    dates: [] as string[],
    timeWindows: ['MORNING'] as string[],
    // Optional exact time (if empty, we use the selected time blocks)
    time: '',
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    postalCode: '',
    petName: '',
    petType: '',
    contactPreference: 'email',
    message: '',
    // Honeypot field (should stay empty)
    website: ''
  })

  const [dateDraft, setDateDraft] = useState('')

  const addDate = () => {
    const d = (dateDraft ?? '').trim()
    if (!d) return
    if (d < todayStr || d > maxBookingDateStr) return
    setFormData((prev) => {
      const next = Array.from(new Set([...(prev.dates ?? []), d])).sort()
      // Keep the list reasonable
      if (next.length > 10) return prev
      return { ...prev, dates: next }
    })
    setDateDraft('')
  }

  const removeDate = (d: string) => {
    setFormData((prev) => ({ ...prev, dates: (prev.dates ?? []).filter((x) => x !== d) }))
  }

  const toggleTimeWindow = (value: string) => {
    setFormData((prev) => {
      const current = prev.timeWindows ?? []
      if (current.includes(value)) {
        const next = current.filter((x) => x !== value)
        return { ...prev, timeWindows: next }
      }
      return { ...prev, timeWindows: [...current, value] }
    })
  }

  // Show loading while checking authentication
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Laden...</div>
      </div>
    )
  }

  // Don't render form if owner is redirected to dashboard flow
  if (session?.user?.role === 'OWNER') {
    return null
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitError(null)
    setFieldErrors({})

    if (step < 4) {
      setStep((prev) => Math.min(prev + 1, 4))
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        trackEvent('booking_request_submitted', {
          service: formData.service,
          time_windows: JSON.stringify(formData.timeWindows ?? []),
          dates: JSON.stringify(formData.dates ?? []),
          has_exact_time: Boolean(formData.time?.trim()),
        })
        router.push('/bedankt')
        return
      }

      const data = await response.json().catch(() => null)
      if (response.status === 401) {
        router.replace('/login?callbackUrl=/boeken')
        return
      }
      if (data?.error === 'VALIDATION_ERROR' && data?.fieldErrors) {
        setFieldErrors(data.fieldErrors)
        setSubmitError('Controleer de velden hieronder en probeer opnieuw.')
        return
      }

      setSubmitError('Er ging iets mis. Probeer opnieuw.')
    } catch (error) {
      setSubmitError('Er ging iets mis. Probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref={routes.diensten} primaryCtaLabel="Diensten" />

      {/* Booking Form */}
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          {/* Progress */}
          <div className="mb-8">
            <div className="flex justify-between items-center">
              {[1, 2, 3, 4].map((s) => (
                <div key={s} className="flex items-center">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold ${
                    step >= s ? 'bg-brand text-white' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {s}
                  </div>
                  {s < 4 && (
                    <div className={`h-1 w-12 mx-2 ${
                      step > s ? 'bg-brand' : 'bg-gray-200'
                    }`} />
                  )}
                </div>
              ))}
            </div>
            <div className="mt-4 text-center">
              <span className="text-sm text-gray-600">
                Stap {step} van 4
              </span>
            </div>
          </div>

          {/* Form Card */}
          <div className="bg-white rounded-2xl shadow-tt p-6 sm:p-8">
            {submitError && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
                {submitError}
              </div>
            )}
            <form onSubmit={handleSubmit}>
              {/* Honeypot (spam) - keep hidden from users */}
              <div className="hidden">
                <label>
                  Website
                  <input
                    type="text"
                    value={(formData as any).website ?? ''}
                    onChange={(e) => setFormData({ ...(formData as any), website: e.target.value })}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
              </div>
              {/* Step 1: Dienst */}
              {step === 1 && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-5 sm:mb-6">Welke dienst heb je nodig?</h2>
                  {fieldErrors.service && (
                    <p className="text-sm text-red-700 mb-3">{fieldErrors.service}</p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {DISPATCH_SERVICES.map((service) => (
                      <button
                        key={service.id}
                        type="button"
                        onClick={() => {
                          setFormData({ ...formData, service: service.id })
                          setStep(2)
                        }}
                        className={`p-4 sm:p-6 rounded-xl border-2 transition text-left ${
                          formData.service === service.id
                            ? 'border-brand bg-brand/5'
                            : 'border-gray-200 hover:border-brand/50'
                        }`}
                      >
                        <div className="flex gap-4 items-center">
                          <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden bg-gradient-to-br from-emerald-50 to-blue-50 border border-black/5 flex-shrink-0">
                            <img
                              src={withAssetVersion(service.image)}
                              alt={service.name}
                              loading="eager"
                              decoding="async"
                              className="h-full w-full object-contain p-2"
                              style={{ filter: SERVICE_ICON_FILTER }}
                            />
                          </div>
                          <div>
                            <div className="font-semibold text-base sm:text-lg text-gray-900">{service.name}</div>
                            <div className="text-sm text-gray-600 line-clamp-2 leading-relaxed">{service.desc}</div>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Step 2: Date & Time */}
              {step === 2 && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-5 sm:mb-6">Wanneer?</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Voorkeur tijdsblok(ken)</label>
                      {(fieldErrors.timeWindows || fieldErrors.timeWindow) && (
                        <p className="text-sm text-red-700 mb-2">{fieldErrors.timeWindows || fieldErrors.timeWindow}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
                        {TIME_WINDOWS.map((slot) => {
                          const selected = (formData.timeWindows ?? []).includes(slot.value)
                          return (
                            <button
                              key={slot.value}
                              type="button"
                              onClick={() => toggleTimeWindow(slot.value)}
                              className={`w-full rounded-xl border-2 p-3 text-left transition ${
                                selected ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-brand/50'
                              }`}
                            >
                              <div className="font-semibold text-gray-900">{slot.label}</div>
                              <div className="text-sm text-gray-600">{slot.hint}</div>
                            </button>
                          )
                        })}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Datum(s)</label>
                      <div className="text-xs text-gray-500 mb-2">
                        Je kan maximaal 60 dagen vooruit boeken.
                      </div>
                      {(fieldErrors.dates || fieldErrors.date) && (
                        <p className="text-sm text-red-700 mb-2">{fieldErrors.dates || fieldErrors.date}</p>
                      )}
                      <div className="flex flex-col md:flex-row gap-2">
                        <input
                          type="date"
                          value={dateDraft}
                          onChange={(e) => setDateDraft(e.target.value)}
                          min={todayStr}
                          max={maxBookingDateStr}
                          className="flex-1 px-4 py-3 h-11 md:h-auto border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent"
                        />
                        <button
                          type="button"
                          onClick={addDate}
                          className="px-4 py-3 h-11 md:h-auto rounded-xl border border-gray-300 bg-white font-semibold text-gray-900 hover:bg-gray-50 inline-flex items-center justify-center"
                        >
                          Voeg toe
                        </button>
                      </div>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {(formData.dates ?? []).length === 0 ? (
                          <div className="text-sm text-gray-500">Geen dagen gekozen.</div>
                        ) : (
                          (formData.dates ?? []).map((d) => (
                            <button
                              key={d}
                              type="button"
                              onClick={() => removeDate(d)}
                              className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1.5 text-sm font-semibold text-emerald-900 hover:bg-emerald-100"
                              aria-label={`Verwijder ${d}`}
                            >
                              {d}
                              <span className="text-emerald-700">×</span>
                            </button>
                          ))
                        )}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Exact tijdstip (optioneel)</label>
                      <input
                        type="time"
                        value={formData.time}
                        onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand focus:border-transparent"
                      />
                      {fieldErrors.time && <p className="text-sm text-red-700 mt-2">{fieldErrors.time}</p>}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="px-6 py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50"
                    >
                      Terug
                    </button>
                    <button
                      type="submit"
                      formNoValidate
                      disabled={(formData.dates ?? []).length === 0 || (formData.timeWindows ?? []).length === 0}
                      className="flex-1 btn-brand disabled:opacity-50"
                    >
                      Volgende
                    </button>
                  </div>
                </div>
              )}

              {/* Step 3: Contact Info */}
              {step === 3 && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-5 sm:mb-6">Jouw gegevens</h2>
                  <div className="space-y-4">
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Voornaam</label>
                        <input
                          type="text"
                          required
                          value={formData.firstName}
                          onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand"
                        />
                        {fieldErrors.firstName && <p className="text-sm text-red-700 mt-2">{fieldErrors.firstName}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Achternaam</label>
                        <input
                          type="text"
                          required
                          value={formData.lastName}
                          onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand"
                        />
                        {fieldErrors.lastName && <p className="text-sm text-red-700 mt-2">{fieldErrors.lastName}</p>}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Email</label>
                      <input
                        type="email"
                        required
                        value={formData.email}
                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand"
                      />
                      {fieldErrors.email && <p className="text-sm text-red-700 mt-2">{fieldErrors.email}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Telefoon</label>
                      <input
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand"
                      />
                      <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                        Optioneel. Als je “Telefoon” of “WhatsApp” kiest, helpt dit om sneller te contacteren.
                      </p>
                      {fieldErrors.phone && <p className="text-sm text-red-700 mt-2">{fieldErrors.phone}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Voorkeur communicatiekanaal</label>
                      {fieldErrors.contactPreference && (
                        <p className="text-sm text-red-700 mb-2">{fieldErrors.contactPreference}</p>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {[
                          { value: 'email', label: 'E-mail', helper: 'We antwoorden per mail' },
                          { value: 'telefoon', label: 'Telefoon', helper: 'We bellen je op' },
                          { value: 'whatsapp', label: 'WhatsApp', helper: 'We sturen een bericht' },
                        ].map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setFormData({ ...formData, contactPreference: opt.value })}
                            className={`w-full rounded-xl border-2 p-3 text-left transition ${
                              formData.contactPreference === opt.value
                                ? 'border-brand bg-brand/5'
                                : 'border-gray-200 hover:border-brand/50'
                            }`}
                          >
                            <div className="font-semibold text-gray-900">{opt.label}</div>
                            <div className="text-sm text-gray-600">{opt.helper}</div>
                          </button>
                        ))}
                      </div>
                    </div>
                    <div className="grid md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-2">Stad</label>
                        <input
                          type="text"
                          required
                          value={formData.city}
                          onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand"
                        />
                        {fieldErrors.city && <p className="text-sm text-red-700 mt-2">{fieldErrors.city}</p>}
                      </div>
                      <div>
                        <label className="block text-sm font-medium mb-2">Postcode</label>
                        <input
                          type="text"
                          required
                          value={formData.postalCode}
                          onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand"
                        />
                        {fieldErrors.postalCode && <p className="text-sm text-red-700 mt-2">{fieldErrors.postalCode}</p>}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep(2)}
                      className="px-6 py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50"
                    >
                      Terug
                    </button>
                    <button
                      type="submit"
                      formNoValidate
                      disabled={!formData.firstName || !formData.email}
                      className="flex-1 btn-brand disabled:opacity-50"
                    >
                      Volgende
                    </button>
                  </div>
                </div>
              )}

              {/* Step 4: Pet Info */}
              {step === 4 && (
                <div>
                  <h2 className="text-2xl sm:text-3xl font-bold mb-5 sm:mb-6">Over je huisdier</h2>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium mb-2">Naam huisdier</label>
                      <input
                        type="text"
                        required
                        value={formData.petName}
                        onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand"
                      />
                      {fieldErrors.petName && <p className="text-sm text-red-700 mt-2">{fieldErrors.petName}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Type huisdier</label>
                      <select
                        required
                        value={formData.petType}
                        onChange={(e) => setFormData({ ...formData, petType: e.target.value })}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand"
                      >
                        <option value="">Selecteer...</option>
                        <option value="Hond">Hond</option>
                        <option value="Kat">Kat</option>
                        <option value="Konijn">Konijn</option>
                        <option value="Vogel">Vogel</option>
                        <option value="Anders">Anders</option>
                      </select>
                      {fieldErrors.petType && <p className="text-sm text-red-700 mt-2">{fieldErrors.petType}</p>}
                    </div>
                    <div>
                      <label className="block text-sm font-medium mb-2">Extra info (optioneel)</label>
                      <textarea
                        value={formData.message}
                        onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                        rows={4}
                        className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand"
                        placeholder="Vertel ons meer over jouw huisdier..."
                      />
                      {fieldErrors.message && <p className="text-sm text-red-700 mt-2">{fieldErrors.message}</p>}
                    </div>
                  </div>
                  <div className="flex gap-4 mt-6">
                    <button
                      type="button"
                      onClick={() => setStep(3)}
                      className="px-6 py-3 border-2 border-gray-300 rounded-xl font-medium hover:bg-gray-50"
                    >
                      Terug
                    </button>
                    <button
                      type="submit"
                      disabled={loading || !formData.petName || !formData.petType}
                      className="flex-1 btn-brand disabled:opacity-50"
                    >
                      {loading ? 'Bezig...' : 'Versturen'}
                    </button>
                  </div>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      <SiteFooter />
    </div>
  )
}

