'use client'

import { useState } from 'react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [emailSent, setEmailSent] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email) {
      toast.error('Vul je email adres in')
      return
    }

    setLoading(true)
    
    try {
      const res = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      if (res.ok) {
        setEmailSent(true)
        toast.success('Reset link verzonden!')
      } else {
        const data = await res.json()
        toast.error(data.error || 'Er ging iets mis')
      }
    } catch (error) {
      toast.error('Er ging iets mis. Probeer het opnieuw.')
    } finally {
      setLoading(false)
    }
  }

  if (emailSent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full">
          <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10 text-center">
            {/* Success Icon */}
            <div className="w-20 h-20 bg-gradient-to-br from-green-500 to-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
              </svg>
            </div>

            {/* Title */}
            <h1 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
              Check je inbox!
            </h1>

            {/* Description */}
            <p className="text-gray-600 mb-6">
              We hebben een wachtwoord reset link gestuurd naar:
            </p>
            <p className="text-emerald-600 font-semibold mb-6">
              {email}
            </p>
            <p className="text-sm text-gray-500 mb-8">
              Klik op de link in de email om je wachtwoord te resetten. De link is 1 uur geldig.
            </p>

            {/* Actions */}
            <div className="space-y-3">
              <Link
                href="/auth/signin"
                className="block w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg"
              >
                Terug naar inloggen
              </Link>
              <button
                onClick={() => setEmailSent(false)}
                className="block w-full py-3 px-6 text-gray-600 hover:text-gray-900 font-medium transition-colors"
              >
                Andere email gebruiken
              </button>
            </div>

            {/* Info */}
            <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200 text-left">
              <p className="text-sm text-gray-700">
                <strong>💡 Tip:</strong> Check ook je spam folder als je de email niet ontvangt.
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <div className="bg-white rounded-2xl shadow-2xl p-8 md:p-10">
          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
            </svg>
          </div>

          {/* Title */}
          <h1 className="text-2xl md:text-3xl font-bold text-center text-gray-900 mb-2">
            Wachtwoord vergeten?
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Geen probleem! Vul je email in en we sturen je een reset link.
          </p>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Email adres
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                placeholder="jouw@email.be"
                required
                disabled={loading}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 px-6 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:from-gray-400 disabled:to-gray-500 text-white font-semibold rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl disabled:cursor-not-allowed"
            >
              {loading ? 'Bezig...' : 'Verstuur reset link'}
            </button>
          </form>

          {/* Back to login */}
          <div className="mt-6 text-center">
            <Link
              href="/auth/signin"
              className="text-sm text-gray-600 hover:text-gray-900 font-medium transition-colors"
            >
              ← Terug naar inloggen
            </Link>
          </div>
        </div>

        {/* Help */}
        <div className="mt-6 p-4 bg-white/50 backdrop-blur-sm rounded-xl border border-emerald-200/30 text-center">
          <p className="text-sm text-gray-700">
            Hulp nodig? <Link href="/contact" className="text-emerald-600 hover:text-emerald-700 font-semibold">Neem contact op</Link>
          </p>
        </div>
      </div>
    </div>
  )
}




