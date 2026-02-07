'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
// Use relative import to avoid path-alias resolution issues in some Vercel build configurations.
import { getStatusLabel } from '../../../../lib/status-labels'

const BELGIAN_REGIONS = [
  'Antwerpen',
  'Limburg',
  'Oost-Vlaanderen',
  'Vlaams-Brabant',
  'West-Vlaanderen',
  'Brussels Hoofdstedelijk Gewest',
]

export default function OwnerProfilePage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [pwLoading, setPwLoading] = useState(false)
  const [pwMessage, setPwMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [formData, setFormData] = useState({
    city: '',
    postalCode: '',
    region: '',
    address: '',
  })

  useEffect(() => {
    fetchProfile()
  }, [])

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/owner/profile')
      if (response.ok) {
        const data = await response.json()
        if (data) {
          setFormData({
            city: data.city ?? '',
            postalCode: data.postalCode ?? '',
            region: data.region ?? '',
            address: data.address ?? '',
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch profile:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setMessage(null)
    setLoading(true)

    try {
      const response = await fetch('/api/owner/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        setMessage({ type: 'success', text: 'Profiel opgeslagen!' })
        setTimeout(() => router.push('/dashboard/owner'), 1500)
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

  const changePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setPwMessage(null)
    if (newPassword.length < 6) {
      setPwMessage({ type: 'error', text: 'Nieuw wachtwoord moet minimaal 6 karakters lang zijn.' })
      return
    }
    if (newPassword !== confirmPassword) {
      setPwMessage({ type: 'error', text: 'Wachtwoorden komen niet overeen.' })
      return
    }
    setPwLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setPwMessage({ type: 'error', text: data?.error || 'Kon wachtwoord niet wijzigen.' })
        setPwLoading(false)
        return
      }
      setPwMessage({ type: 'success', text: 'Wachtwoord gewijzigd.' })
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setPwMessage({ type: 'error', text: 'Kon wachtwoord niet wijzigen.' })
    } finally {
      setPwLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/dashboard/owner" primaryCtaLabel="Dashboard" />

      <main className="container mx-auto px-4 py-12 pb-28">
        <div className="max-w-2xl mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 mb-2">
              Profiel bewerken
            </h1>
            <p className="text-gray-600">Vul je gegevens aan</p>
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

          <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Stad *
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Postcode *
                </label>
                <input
                  type="text"
                  value={formData.postalCode}
                  onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                  required
                  maxLength={4}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Provincie
              </label>
              <select
                value={formData.region}
                onChange={(e) => setFormData({ ...formData, region: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Selecteer provincie</option>
                {BELGIAN_REGIONS.map((region) => (
                  <option key={region} value={region}>
                    {region}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Adres (optioneel)
              </label>
              <input
                type="text"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-brand disabled:opacity-60"
            >
              {loading ? 'Opslaan...' : 'Profiel opslaan'}
            </button>
          </form>

          <div className="mt-6 bg-white rounded-2xl shadow-sm border border-black/5 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-2">Wachtwoord wijzigen</h2>
            <p className="text-sm text-gray-600 mb-4">
              Gebruik je huidige wachtwoord om een nieuw wachtwoord in te stellen.
            </p>

            {pwMessage && (
              <div
                className={`mb-4 p-3 rounded-xl border ${
                  pwMessage.type === 'success'
                    ? 'bg-green-50 border-green-200 text-green-800'
                    : 'bg-red-50 border-red-200 text-red-800'
                }`}
              >
                {pwMessage.text}
              </div>
            )}

            <form onSubmit={changePassword} className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Huidig wachtwoord</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nieuw wachtwoord</label>
                  <input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                    placeholder="Minimaal 6 karakters"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Bevestig wachtwoord</label>
                  <input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  />
                </div>
              </div>

              <button type="submit" disabled={pwLoading} className="w-full btn-brand disabled:opacity-60">
                {pwLoading ? 'Opslaan...' : 'Wijzig wachtwoord'}
              </button>
              <div className="text-xs text-gray-500">
                Wachtwoord vergeten?{' '}
                <a href="/forgot-password" className="text-emerald-700 font-semibold hover:underline">
                  Reset via e-mail
                </a>
                .
              </div>
            </form>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
