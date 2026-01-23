'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { DISPATCH_SERVICES } from '@/lib/services'

type FieldErrors = Record<string, string>

export default function CaregiverApplyPage() {
  const router = useRouter()
  const { data: session, status } = useSession()
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
    companyName: '',
    enterpriseNumber: '',
    isSelfEmployed: false,
    hasLiabilityInsurance: false,
    liabilityInsuranceCompany: '',
    liabilityInsurancePolicyNumber: '',
    services: [] as string[],
    experience: '',
    message: '',
    acceptTerms: false,
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

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
        <SiteHeader primaryCtaHref="/" primaryCtaLabel="Terug" />
        <main className="container mx-auto px-4 py-12 pb-28">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-tt p-8 text-center text-gray-600">
              Laden...
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (status === 'authenticated' && session?.user?.role === 'OWNER') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
        <SiteHeader primaryCtaHref="/" primaryCtaLabel="Terug" />
        <main className="container mx-auto px-4 py-12 pb-28">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-tt p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Je bent ingelogd als eigenaar
              </h1>
              <p className="text-gray-600 mb-6">
                Om je als dierenverzorger aan te melden, moet je eerst uitloggen of een ander account gebruiken.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/verzorger-aanmelden' })}
                  className="btn-brand"
                >
                  Uitloggen
                </button>
                <Link
                  href="/dashboard/owner"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Terug naar eigenaar dashboard
                </Link>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (status === 'authenticated' && session?.user?.role === 'CAREGIVER') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
        <SiteHeader primaryCtaHref="/" primaryCtaLabel="Terug" />
        <main className="container mx-auto px-4 py-12 pb-28">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-tt p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Je hebt al een verzorgersaccount
              </h1>
              <p className="text-gray-600 mb-6">
                Je gegevens worden beheerd via je verzorgerdashboard. Ga naar je profiel om alles te bekijken of aan te passen.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/dashboard/caregiver/profile"
                  className="btn-brand"
                >
                  Ga naar verzorgerprofiel
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/verzorger-aanmelden' })}
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Uitloggen
                </button>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/" primaryCtaLabel="Terug" />

      <main className="container mx-auto px-4 py-12 pb-28">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Aanmelden als dierenverzorger</h1>
            <p className="text-gray-600">
              TailTribe werkt uitsluitend met zelfstandige dierenverzorgers (freelancers). Vul je gegevens in en selecteer
              de services die je aanbiedt. We nemen contact op voor de volgende stappen.
              <span className="block mt-2 text-gray-700">
                Extra voordeel: je werkt samen met ervaren dierenverzorgers, zodat je sneller en sterker kan starten.
              </span>
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
                <label className="block text-sm font-medium mb-2">Bedrijfsnaam (optioneel)</label>
                <input
                  value={formData.companyName}
                  onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Ondernemingsnummer / btw-nummer</label>
                  <input
                    value={formData.enterpriseNumber}
                    onChange={(e) => setFormData({ ...formData, enterpriseNumber: e.target.value })}
                    placeholder="bv. BE 0123.456.789 of 0123456789"
                    className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand"
                  />
                  {fieldErrors.enterpriseNumber && (
                    <p className="text-sm text-red-700 mt-2">{fieldErrors.enterpriseNumber}</p>
                  )}
                </div>

                <div className="flex items-start gap-3 pt-2">
                  <input
                    id="isSelfEmployed"
                    type="checkbox"
                    checked={formData.isSelfEmployed}
                    onChange={(e) => setFormData({ ...formData, isSelfEmployed: e.target.checked })}
                    className="mt-1 h-4 w-4"
                  />
                  <label htmlFor="isSelfEmployed" className="text-sm text-gray-700">
                    Ik ben zelfstandige (freelancer) en kan factureren.
                  </label>
                </div>
              </div>
              {fieldErrors.isSelfEmployed && <p className="text-sm text-red-700 -mt-2">{fieldErrors.isSelfEmployed}</p>}

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

              <div className="rounded-xl border border-black/5 bg-gray-50 p-4">
                <div className="flex items-start gap-3">
                  <input
                    id="hasLiabilityInsurance"
                    type="checkbox"
                    checked={formData.hasLiabilityInsurance}
                    onChange={(e) => setFormData({ ...formData, hasLiabilityInsurance: e.target.checked })}
                    className="mt-1 h-4 w-4"
                  />
                  <div className="flex-1">
                    <label htmlFor="hasLiabilityInsurance" className="text-sm font-medium text-gray-900">
                      Ik heb een BA-verzekering (burgerlijke aansprakelijkheid / beroepsaansprakelijkheid).
                    </label>
                    <div className="text-sm text-gray-600 mt-1">Een sleutelcontract is mogelijk. We kunnen ook een verzekeringsattest opvragen bij onboarding.</div>
                  </div>
                </div>
                {fieldErrors.hasLiabilityInsurance && (
                  <p className="text-sm text-red-700 mt-2">{fieldErrors.hasLiabilityInsurance}</p>
                )}

                <div className="grid md:grid-cols-2 gap-4 mt-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Verzekeraar (optioneel)</label>
                    <input
                      value={formData.liabilityInsuranceCompany}
                      onChange={(e) => setFormData({ ...formData, liabilityInsuranceCompany: e.target.value })}
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-2">Polisnummer (optioneel)</label>
                    <input
                      value={formData.liabilityInsurancePolicyNumber}
                      onChange={(e) =>
                        setFormData({ ...formData, liabilityInsurancePolicyNumber: e.target.value })
                      }
                      className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-brand"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Welke services bied je aan?</label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {DISPATCH_SERVICES.map((s) => {
                    const checked = formData.services.includes(s.id)
                    const isGroupWalk = s.id === 'GROUP_DOG_WALKING'
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
                        {isGroupWalk && (
                          <div className="mt-2 text-xs text-emerald-700 font-semibold">
                            Groepsuitlaat – opleiding voorzien indien gewenst!
                          </div>
                        )}
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

              <div className="flex items-start gap-3">
                <input
                  id="acceptTerms"
                  type="checkbox"
                  checked={formData.acceptTerms}
                  onChange={(e) => setFormData({ ...formData, acceptTerms: e.target.checked })}
                  className="mt-1 h-4 w-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
                />
                <label htmlFor="acceptTerms" className="text-sm text-gray-700">
                  Ik ga akkoord met de{' '}
                  <Link href="/terms" className="text-emerald-700 font-semibold hover:underline">
                    algemene voorwaarden
                  </Link>
                  .
                </label>
              </div>
              {fieldErrors.acceptTerms && <p className="text-sm text-red-700 -mt-4">{fieldErrors.acceptTerms}</p>}

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


