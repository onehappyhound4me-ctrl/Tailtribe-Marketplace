'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export default function RegisterPage() {
  const router = useRouter()
  const [role, setRole] = useState<'OWNER' | 'CAREGIVER'>('OWNER')
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    phone: '',
    address: '',
    city: '',
    postalCode: '',
    region: '',
    acceptTerms: false,
  })
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const countryName = 'België'
  const callingCode = '+32'

  const normalizePhone = (raw: string) => {
    const trimmed = raw.trim()
    if (!trimmed) return ''
    const compact = trimmed.replace(/[^\d+]/g, '')
    if (!compact) return ''
    if (compact.startsWith('+')) return compact
    if (compact.startsWith('00')) return `+${compact.slice(2)}`
    if (compact.startsWith('32')) return `+${compact}`
    if (compact.startsWith('0')) return `${callingCode}${compact.slice(1)}`
    return `${callingCode}${compact}`
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Wachtwoorden komen niet overeen')
      return
    }

    if (formData.password.length < 6) {
      setError('Wachtwoord moet minimaal 6 karakters lang zijn')
      return
    }

    if (role === 'OWNER') {
      if (!formData.address.trim() || !formData.city.trim() || !formData.postalCode.trim()) {
        setError('Vul je volledige thuisadres in')
        return
      }
      if (!/^\d{4}$/.test(formData.postalCode.trim())) {
        setError('Vul een geldige Belgische postcode (4 cijfers) in')
        return
      }
    }

    if (!formData.acceptTerms) {
      setError('Je moet akkoord gaan met de algemene voorwaarden')
      return
    }

    setLoading(true)

    try {
      const phoneNormalized = normalizePhone(formData.phone)
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          phone: phoneNormalized || '',
          role,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || 'Registratie mislukt')
        setLoading(false)
        return
      }

      // Show success message
      setSuccess('✅ Account aangemaakt! Controleer je e-mail voor verificatie.')
      setLoading(false)
    } catch (err) {
      setError('Er ging iets mis. Probeer opnieuw.')
      setLoading(false)
    }
  }

  const resendVerification = async () => {
    setError('')
    setResendLoading(true)
    try {
      const res = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error ?? 'Kon geen e-mail opnieuw sturen. Probeer later opnieuw.')
        setResendLoading(false)
        return
      }
      setSuccess(data?.message ?? '✅ Verificatie e-mail opnieuw verstuurd. Controleer ook je spam.')
      setResendLoading(false)
    } catch {
      setError('Kon geen e-mail opnieuw sturen. Probeer later opnieuw.')
      setResendLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/" primaryCtaLabel="Home" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 mb-2">
              Account aanmaken
            </h1>
            <p className="text-gray-600 mb-6">
              Maak een account aan als eigenaar of verzorger
            </p>

            {success && (
              <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                {success}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Role Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Ik ben een:
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => setRole('OWNER')}
                    className={`px-4 py-3 rounded-xl border-2 font-semibold transition ${
                      role === 'OWNER'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Eigenaar
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole('CAREGIVER')}
                    className={`px-4 py-3 rounded-xl border-2 font-semibold transition ${
                      role === 'CAREGIVER'
                        ? 'border-emerald-600 bg-emerald-50 text-emerald-900'
                        : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    Verzorger
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label htmlFor="firstName" className="block text-sm font-medium text-gray-700 mb-1">
                    Voornaam
                  </label>
                  <input
                    id="firstName"
                    name="given-name"
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    required
                    autoComplete="given-name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block text-sm font-medium text-gray-700 mb-1">
                    Achternaam
                  </label>
                  <input
                    id="lastName"
                    name="family-name"
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    required
                    autoComplete="family-name"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>

              {/* Explicit country field to prevent iOS/Chrome guessing UK */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Land</label>
                <input
                  type="text"
                  value={countryName}
                  readOnly
                  name="country"
                  autoComplete="country-name"
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                  E-mailadres
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                  autoComplete="email"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="jouw@email.com"
                />
              </div>

              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
                  Telefoonnummer (optioneel)
                </label>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={callingCode}
                    readOnly
                    name="tel-country-code"
                    autoComplete="tel-country-code"
                    className="w-[86px] px-3 py-2.5 border border-gray-200 rounded-xl bg-gray-50 text-gray-900 text-center"
                  />
                  <input
                    id="phone"
                    name="tel-national"
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    autoComplete="tel-national"
                    inputMode="tel"
                    className="flex-1 px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="489 12 34 56 (zonder +32)"
                  />
                </div>
                <div className="mt-1 text-xs text-gray-500">
                  We bewaren je nummer als {callingCode}… (bijv. <span className="font-mono">{callingCode}489123456</span>).
                </div>
              </div>

              {role === 'OWNER' && (
                <>
                  <div>
                    <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
                      Thuisadres *
                    </label>
                    <input
                      id="address"
                      name="street-address"
                      type="text"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      required
                      autoComplete="street-address"
                      className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                      placeholder="Straat en huisnummer"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-1">
                        Stad / gemeente *
                      </label>
                      <input
                        id="city"
                        name="address-level2"
                        type="text"
                        value={formData.city}
                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                        required
                        autoComplete="address-level2"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="Bijv. Antwerpen"
                      />
                    </div>
                    <div>
                      <label htmlFor="postalCode" className="block text-sm font-medium text-gray-700 mb-1">
                        Postcode *
                      </label>
                      <input
                        id="postalCode"
                        name="postal-code"
                        type="text"
                        value={formData.postalCode}
                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                        required
                        maxLength={4}
                        inputMode="numeric"
                        autoComplete="postal-code"
                        className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                        placeholder="2000"
                      />
                    </div>
                  </div>
                </>
              )}

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Wachtwoord
                </label>
                <input
                  id="password"
                  name="new-password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Minimaal 6 karakters"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                  Bevestig wachtwoord
                </label>
                <input
                  id="confirmPassword"
                  name="new-password-confirm"
                  type="password"
                  value={formData.confirmPassword}
                  onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                  required
                  autoComplete="new-password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="Herhaal wachtwoord"
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

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-brand disabled:opacity-60"
              >
                {loading ? 'Account aanmaken...' : 'Account aanmaken'}
              </button>
            </form>

            {success && formData.email.trim() ? (
              <div className="mt-4 space-y-2">
                <button
                  type="button"
                  onClick={resendVerification}
                  disabled={resendLoading}
                  className="w-full rounded-xl border border-emerald-200 bg-white px-4 py-3 text-sm font-semibold text-gray-900 hover:bg-emerald-50 transition disabled:opacity-60"
                >
                  {resendLoading ? 'Opnieuw sturen...' : 'Verificatie e-mail opnieuw sturen'}
                </button>
                <div className="text-center text-sm text-gray-600">
                  Al geverifieerd?{' '}
                  <Link href="/login" className="text-emerald-700 font-semibold hover:underline">
                    Ga naar inloggen
                  </Link>
                </div>
              </div>
            ) : null}

            <div className="mt-6 text-center text-sm text-gray-600">
              Heb je al een account?{' '}
              <Link href="/login" className="text-emerald-700 font-semibold hover:underline">
                Inloggen
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
