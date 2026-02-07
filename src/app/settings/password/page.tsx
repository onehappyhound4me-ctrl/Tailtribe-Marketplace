'use client'

import Link from 'next/link'
import { useState } from 'react'
import { toast } from 'sonner'

export default function PasswordSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [loading, setLoading] = useState(false)

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (newPassword.length < 8) {
      toast.error('Nieuw wachtwoord moet minimaal 8 karakters zijn')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('Nieuwe wachtwoorden komen niet overeen')
      return
    }

    setLoading(true)
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword, confirmPassword }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        toast.error(data?.error || 'Wachtwoord wijzigen mislukt')
        return
      }
      toast.success(data?.message || 'Wachtwoord gewijzigd')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      toast.error('Wachtwoord wijzigen mislukt. Probeer opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Wachtwoord & Veiligheid</h1>
              <p className="text-gray-600">Wijzig je wachtwoord en beveiligingsinstellingen</p>
            </div>
            <Link href="/settings" className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 transition-colors rounded-lg font-medium">
              Terug naar Instellingen
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-8 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-8 max-w-2xl">
          <h2 className="text-xl font-bold text-gray-800 mb-6">Wachtwoord wijzigen</h2>
          
          <form className="space-y-4" onSubmit={submit}>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Huidig wachtwoord</label>
              <input
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Nieuw wachtwoord</label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                minLength={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Bevestig nieuw wachtwoord</label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                minLength={8}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                required
              />
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white hover:bg-emerald-700 active:bg-emerald-800 transition-colors rounded-lg py-3 font-medium disabled:opacity-60"
              >
                {loading ? 'Opslaan...' : 'Wachtwoord bijwerken'}
              </button>
            </div>
            <div className="text-xs text-gray-500">
              Wachtwoord vergeten?{' '}
              <Link href="/auth/forgot-password" className="text-emerald-700 font-semibold hover:underline">
                Reset via e-mail
              </Link>
              .
            </div>
          </form>
          
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Tip:</strong> Gebruik een sterk wachtwoord met minimaal 8 karakters.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
