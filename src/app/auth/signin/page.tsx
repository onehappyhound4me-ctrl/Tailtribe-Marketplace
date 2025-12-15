'use client'

import { useState, useEffect } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function SignInPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard'

  const [step, setStep] = useState<'credentials' | 'otp'>('credentials')
  const [loading, setLoading] = useState(false)
  const [otpLoading, setOtpLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [demoLoading, setDemoLoading] = useState<'owner' | 'caregiver' | null>(null)
  const [resendTimer, setResendTimer] = useState(0)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [otp, setOtp] = useState('')

  const registerFirstError = searchParams?.get('error') === 'REGISTER_FIRST'
  const errorEmail = searchParams?.get('email')

  useEffect(() => {
    if (step !== 'otp' || resendTimer <= 0) {
      return
    }

    const timer = setInterval(() => {
      setResendTimer((prev) => Math.max(prev - 1, 0))
    }, 1000)

    return () => clearInterval(timer)
  }, [step, resendTimer])

  useEffect(() => {
    if (errorEmail) {
      setFormData((prev) => ({ ...prev, email: errorEmail }))
    }
  }, [errorEmail])

  const requestTwoFactorCode = async () => {
    if (!formData.email || !formData.password) {
      toast.error('Vul je email en wachtwoord in')
      return
    }

    setLoading(true)
    try {
      const response = await fetch('/api/auth/2fa/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: formData.email,
          password: formData.password
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Kon geen code versturen')
      }

      toast.success('Bevestigingscode verstuurd naar je email')
      setStep('otp')
      setResendTimer(45)
    } catch (error: any) {
      toast.error(error.message || 'Kon geen code versturen')
    } finally {
      setLoading(false)
    }
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await requestTwoFactorCode()
  }

  const handleOtpSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!otp.trim()) {
      toast.error('Voer de code in die je via email ontving')
      return
    }

    setOtpLoading(true)
    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        otp: otp.trim(),
        redirect: false,
        callbackUrl
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      toast.success('Succesvol ingelogd!')
      router.push(callbackUrl)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Code ongeldig of verlopen')
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendCode = async () => {
    if (resendTimer > 0) return
    await requestTwoFactorCode()
  }

  const handleDemoSignIn = async (type: 'owner' | 'caregiver') => {
    const demoAccount =
      type === 'owner'
        ? { email: 'jan.vermeersch@example.com', password: 'password123' }
        : { email: 'sarah.janssens@example.com', password: 'password123' }

    setDemoLoading(type)
    try {
      const result = await signIn('credentials', {
        email: demoAccount.email,
        password: demoAccount.password,
        otp: 'demo',
        redirect: false,
        callbackUrl
      })

      if (result?.error) {
        throw new Error(result.error)
      }

      toast.success('Demo login gelukt. Je wordt doorgestuurd.')
      router.push(callbackUrl)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Demo login mislukt')
    } finally {
      setDemoLoading(null)
    }
  }

  const resetFlow = () => {
    setStep('credentials')
    setOtp('')
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    try {
      await signIn('google', { callbackUrl })
    } catch (error) {
      toast.error('Google login mislukt')
      setGoogleLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 'credentials' ? 'Welkom terug' : 'Bevestig je login'}
          </h1>
          <p className="text-gray-600">
            {step === 'credentials'
              ? 'Log in op je account'
              : 'Vul de 6-cijferige code in die we net hebben verstuurd'}
          </p>
        </div>

        {registerFirstError && (
          <div className="mb-6 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl p-4 text-sm">
            <p className="font-semibold mb-1">Registreer je eerst</p>
            <p className="mb-3">
              We herkennen deze Google login nog niet. Maak eerst een account via e-mail en koppel daarna Google.
            </p>
            <Link
              href={`/auth/register${errorEmail ? `?email=${encodeURIComponent(errorEmail)}` : ''}`}
              className="inline-flex items-center gap-2 font-semibold text-amber-900 underline"
            >
              Account aanmaken
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14m-7-7l7 7-7 7" />
              </svg>
            </Link>
          </div>
        )}

        {step === 'credentials' ? (
          <form onSubmit={handleCredentialsSubmit} className="space-y-6">
            <Button
              type="button"
              onClick={handleGoogleSignIn}
              disabled={googleLoading}
              className="w-full h-12 border border-gray-200 text-gray-700 bg-white hover:bg-gray-50 flex items-center justify-center gap-2"
              variant="outline"
            >
              {googleLoading ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-600" />
                  Verbinden...
                </>
              ) : (
                <>
                  <span className="text-lg">G</span>
                  <span>Inloggen met Google</span>
                </>
              )}
            </Button>

            <div className="rounded-xl border border-gray-200 p-4 space-y-3">
              <div className="flex items-center justify-between">
                <p className="text-sm font-semibold text-gray-800">Demo inloggen</p>
                <span className="text-xs text-gray-500">Alle data is testdata</span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleDemoSignIn('owner')}
                  disabled={demoLoading !== null}
                  className="w-full"
                >
                  {demoLoading === 'owner' ? 'Inloggen...' : 'Demo: Eigenaar'}
                </Button>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => handleDemoSignIn('caregiver')}
                  disabled={demoLoading !== null}
                  className="w-full"
                >
                  {demoLoading === 'caregiver' ? 'Inloggen...' : 'Demo: Verzorger'}
                </Button>
              </div>
              <p className="text-xs text-gray-500">
                Gebruik deze knoppen om zonder code direct het platform te bekijken.
              </p>
            </div>

            <div className="relative my-4">
              <div className="border-t border-gray-200" />
              <span className="absolute left-1/2 -top-3 bg-white px-3 text-xs text-gray-500 -translate-x-1/2">
                of gebruik je email
              </span>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email adres
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="jan@voorbeeld.be"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                  Wachtwoord
                </label>
                <Link href="/auth/forgot-password" className="text-sm text-green-600 hover:text-green-700">
                  Vergeten?
                </Link>
              </div>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent"
                placeholder="Je wachtwoord"
              />
            </div>

            <Button
              type="submit"
              disabled={loading}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Code versturen...</span>
                </div>
              ) : (
                'Ga verder'
              )}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleOtpSubmit} className="space-y-6">
            <div className="rounded-xl bg-gray-50 p-4 text-sm text-gray-700">
              We hebben een code gestuurd naar <strong>{formData.email}</strong>. Geen email ontvangen?
              Controleer je spamfolder of vraag een nieuwe code aan.
            </div>

            <div>
              <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-2">
                Bevestigingscode
              </label>
              <input
                id="otp"
                type="text"
                inputMode="numeric"
                maxLength={6}
                autoComplete="one-time-code"
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/[^0-9]/g, ''))}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent tracking-[0.5em] text-center text-lg font-semibold"
                placeholder="••••••"
              />
            </div>

            <Button
              type="submit"
              disabled={otpLoading}
              className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl"
            >
              {otpLoading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  <span>Controleren...</span>
                </div>
              ) : (
                'Bevestigen'
              )}
            </Button>

            <div className="flex items-center justify-between text-sm text-gray-600">
              <button
                type="button"
                onClick={resetFlow}
                className="text-green-600 hover:text-green-700 font-semibold"
              >
                Andere gebruiker
              </button>
              <button
                type="button"
                disabled={resendTimer > 0 || loading}
                onClick={handleResendCode}
                className="text-green-600 hover:text-green-700 font-semibold disabled:text-gray-400"
              >
                {resendTimer > 0 ? `Opnieuw versturen over ${resendTimer}s` : 'Stuur code opnieuw'}
              </button>
            </div>
          </form>
        )}

        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Nog geen account?{' '}
            <Link href="/auth/register" className="text-green-600 hover:text-green-700 font-semibold">
              Registreer nu
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

