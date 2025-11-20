'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

type Step = 'CREDENTIALS' | 'VERIFY'

const errorMessages: Record<string, string> = {
  CredentialsSignin: 'Ongeldige inloggegevens',
  TWO_FACTOR_INVALID: 'De code is ongeldig of verlopen',
  TWO_FACTOR_REQUIRED: 'Voer eerst de verificatiecode in',
}

export default function SignInPage() {
  const [loading, setLoading] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [step, setStep] = useState<Step>('CREDENTIALS')
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const [twoFactorCode, setTwoFactorCode] = useState('')
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard'

  const requestTwoFactorCode = async () => {
    const response = await fetch('/api/auth/request-2fa', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        email: formData.email,
        password: formData.password,
      })
    })

    const data = await response.json()
    if (!response.ok) {
      throw new Error(data.error || 'Het versturen van de code is mislukt')
    }
  }

  const handleCredentialsSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      await requestTwoFactorCode()
      setStep('VERIFY')
      toast.success('Bevestigingscode verzonden naar je e-mail')
    } catch (error: any) {
      toast.error(error.message || 'Ongeldige inloggegevens')
    } finally {
      setLoading(false)
    }
  }

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        twoFactorCode,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        const message = errorMessages[result.error] || 'Verificatie mislukt'
        toast.error(message)
        return
      }

      toast.success('Succesvol ingelogd!')
      router.push(callbackUrl)
      router.refresh()
    } catch (error) {
      toast.error('Er ging iets mis')
    } finally {
      setLoading(false)
    }
  }

  const resendCode = async () => {
    setResendLoading(true)
    try {
      await requestTwoFactorCode()
      toast.success('Nieuwe code verstuurd')
    } catch (error: any) {
      toast.error(error.message || 'Kon geen nieuwe code versturen')
    } finally {
      setResendLoading(false)
    }
  }

  const CredentialsForm = () => (
    <form onSubmit={handleCredentialsSubmit} className="space-y-6">
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
          'Volgende: bevestig met code'
        )}
      </Button>
    </form>
  )

  const VerifyForm = () => (
    <form onSubmit={handleCodeSubmit} className="space-y-6">
      <div className="p-4 bg-green-50 border border-green-100 rounded-xl">
        <p className="text-sm text-gray-700">
          We hebben een 6-cijferige code gestuurd naar <strong>{formData.email}</strong>.
          Vul de code hieronder in om je login te bevestigen.
        </p>
      </div>

      <div>
          <label htmlFor="twoFactor" className="block text-sm font-medium text-gray-700 mb-2">
            Verificatiecode
          </label>
          <input
            id="twoFactor"
            type="text"
            inputMode="numeric"
            pattern="[0-9]*"
            maxLength={6}
            required
            value={twoFactorCode}
            onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
            className="w-full text-center tracking-[0.6em] px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-transparent font-bold text-2xl"
            placeholder="••••••"
          />
        </div>

      <div className="flex items-center justify-between text-sm text-gray-600">
        <button
          type="button"
          onClick={() => setStep('CREDENTIALS')}
          className="text-green-600 hover:text-green-700 font-semibold"
        >
          Gegevens aanpassen
        </button>
        <button
          type="button"
          onClick={resendCode}
          disabled={resendLoading}
          className="text-gray-600 hover:text-gray-800"
        >
          {resendLoading ? 'Nieuwe code versturen...' : 'Code opnieuw verzenden'}
        </button>
      </div>

      <Button
        type="submit"
        disabled={loading || twoFactorCode.length !== 6}
        className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl"
      >
        {loading ? (
          <div className="flex items-center gap-2">
            <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
            <span>Bevestigen...</span>
          </div>
        ) : (
          'Inloggen'
        )}
      </Button>
    </form>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {step === 'CREDENTIALS' ? 'Welkom terug' : 'Bevestig je login'}
          </h1>
          <p className="text-gray-600">
            {step === 'CREDENTIALS'
              ? 'Log in op je account'
              : 'Extra beveiliging voor je account'}
          </p>
        </div>

        {step === 'CREDENTIALS' ? <CredentialsForm /> : <VerifyForm />}

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

