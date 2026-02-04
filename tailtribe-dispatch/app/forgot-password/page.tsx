'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export default function ForgotPasswordPage() {
  const searchParams = useSearchParams()
  const token = useMemo(() => searchParams.get('token')?.trim() || '', [searchParams])

  const [email, setEmail] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')

  const requestReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')
    setLoading(true)
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error ?? 'Reset aanvragen mislukt. Probeer opnieuw.')
        setLoading(false)
        return
      }
      setSuccess(
        data?.message ??
          'Als dit e-mailadres bestaat, sturen we een reset-link. Controleer ook je spam.'
      )
      setLoading(false)
    } catch {
      setError('Reset aanvragen mislukt. Probeer opnieuw.')
      setLoading(false)
    }
  }

  const submitNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword.length < 6) {
      setError('Wachtwoord moet minimaal 6 karakters lang zijn')
      return
    }
    if (newPassword !== confirmPassword) {
      setError('Wachtwoorden komen niet overeen')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/reset-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, newPassword }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data?.error ?? 'Reset mislukt. Vraag een nieuwe link aan.')
        setLoading(false)
        return
      }
      setSuccess('Wachtwoord aangepast. Je kan nu inloggen.')
      setLoading(false)
    } catch {
      setError('Reset mislukt. Vraag een nieuwe link aan.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/" primaryCtaLabel="Home" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">Wachtwoord resetten</h1>
            <p className="text-gray-600 mb-6">
              {token ? 'Kies een nieuw wachtwoord.' : 'Vul je e-mailadres in en ontvang een reset-link.'}
            </p>

            {success && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                {success}
              </div>
            )}
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            {!token ? (
              <form onSubmit={requestReset} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    E-mailadres
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                    placeholder="jouw@email.com"
                  />
                </div>
                <button type="submit" disabled={loading} className="w-full btn-brand disabled:opacity-60">
                  {loading ? 'Versturen...' : 'Stuur reset-link'}
                </button>
                <div className="text-xs text-gray-500">
                  Geen mail ontvangen? Check spam. Als e-mail verzending niet geconfigureerd is: gebruik{' '}
                  <Link href="/contact" className="text-emerald-700 font-semibold hover:underline">
                    contact
                  </Link>
                  .
                </div>
              </form>
            ) : (
              <form onSubmit={submitNewPassword} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700 mb-1">
                    Nieuw wachtwoord
                  </label>
                  <input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
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
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <button type="submit" disabled={loading} className="w-full btn-brand disabled:opacity-60">
                  {loading ? 'Opslaan...' : 'Wachtwoord aanpassen'}
                </button>
                <div className="text-xs text-gray-500">
                  Link verlopen?{' '}
                  <Link href="/forgot-password" className="text-emerald-700 font-semibold hover:underline">
                    Vraag een nieuwe aan
                  </Link>
                  .
                </div>
              </form>
            )}

            <div className="mt-6 text-center text-sm text-gray-600">
              <Link href="/login" className="text-emerald-700 font-semibold hover:underline">
                Terug naar inloggen
              </Link>
            </div>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

