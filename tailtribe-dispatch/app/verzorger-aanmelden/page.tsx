'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { DISPATCH_SERVICES } from '@/lib/services'

type FieldErrors = Record<string, string>

export default function CaregiverApplyPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    city: '',
    postalCode: '',
    services: [] as string[],
    experience: '',
    message: '',
    // Honeypot
    website: '',
  })

  const toggleService = (id: string) => {
    setFormData((prev) => {
      const set = new Set(prev.services)
      if (set.has(id)) set.delete(id)
      else set.add(id)
      return { ...prev, services: Array.from(set) }
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setSubmitError(null)
    setFieldErrors({})

    try {
      const res = await fetch('/api/caregiver-applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (res.ok) {
        router.push('/verzorger-aanmelden/bedankt')
        return
      }

      const data = await res.json().catch(() => null)
      if (data?.error === 'VALIDATION_ERROR' && data?.fieldErrors) {
        setFieldErrors(data.fieldErrors)
        setSubmitError('Controleer de velden hieronder en probeer opnieuw.')
        return
      }
      setSubmitError(data?.error || 'Er ging iets mis. Probeer opnieuw.')
    } catch {
      setSubmitError('Er ging iets mis. Probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/" primaryCtaLabel="Terug" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Aanmelden als dierenverzorger</h1>
            <p className="text-gray-600">
              Vul je gegevens in en selecteer de services die je aanbiedt. We nemen contact op voor de volgende stappen.
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-tt p-8">
            {submitError && (
              <div className="mb-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-red-800">
                {submitError}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Honeypot */}
              <div className="hidden">
                <label>
                  Website
                  <input
                    type="text"
                    value={formData.website}
                    onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                    tabIndex={-1}
                    autoComplete="off"
                  />
                </label>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Voornaam</label>
                  <input
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand"
                  />
                  {fieldErrors.firstName && <p className="text-sm text-red-700 mt-2">{fieldErrors.firstName}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Achternaam</label>
                  <input
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand"
                  />
                  {fieldErrors.lastName && <p className="text-sm text-red-700 mt-2">{fieldErrors.lastName}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">E-mail</label>
                <input
                  type="email"
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
                {fieldErrors.phone && <p className="text-sm text-red-700 mt-2">{fieldErrors.phone}</p>}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Stad</label>
                  <input
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand"
                  />
                  {fieldErrors.city && <p className="text-sm text-red-700 mt-2">{fieldErrors.city}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Postcode</label>
                  <input
                    value={formData.postalCode}
                    onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand"
                  />
                  {fieldErrors.postalCode && <p className="text-sm text-red-700 mt-2">{fieldErrors.postalCode}</p>}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Welke services bied je aan?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DISPATCH_SERVICES.map((s) => {
                    const checked = formData.services.includes(s.id)
                    return (
                      <button
                        key={s.id}
                        type="button"
                        onClick={() => toggleService(s.id)}
                        className={`px-4 py-3 rounded-xl border text-left transition ${
                          checked ? 'border-brand bg-brand/5' : 'border-gray-200 hover:border-brand/50'
                        }`}
                      >
                        <div className="font-semibold text-gray-900">{s.name}</div>
                        <div className="text-sm text-gray-600">{s.desc}</div>
                      </button>
                    )
                  })}
                </div>
                {fieldErrors.services && <p className="text-sm text-red-700 mt-2">{fieldErrors.services}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Ervaring (kort)</label>
                <textarea
                  value={formData.experience}
                  onChange={(e) => setFormData({ ...formData, experience: e.target.value })}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand"
                  placeholder="Vertel kort over je ervaring, beschikbaarheid, en wat je aanbiedt…"
                />
                {fieldErrors.experience && <p className="text-sm text-red-700 mt-2">{fieldErrors.experience}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Extra info (optioneel)</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand"
                />
              </div>

              <button type="submit" disabled={loading} className="w-full btn-brand disabled:opacity-60">
                {loading ? 'Versturen…' : 'Aanmelding versturen'}
              </button>
            </form>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}


