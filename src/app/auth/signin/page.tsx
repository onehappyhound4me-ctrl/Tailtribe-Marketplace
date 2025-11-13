'use client'

import { useState, useEffect } from 'react'
import { signIn, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function SignInPage() {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  })
  const router = useRouter()
  const searchParams = useSearchParams()
  const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard'
  const error = searchParams?.get('error')
  const { data: session, status } = useSession()

  // Debug: log all params and error
  useEffect(() => {
    const allParams = Object.fromEntries(searchParams?.entries() || [])
    console.log('[SIGNIN] Page loaded - error:', error, 'error type:', typeof error, 'error === OAuthAccountNotLinked:', error === 'OAuthAccountNotLinked')
    console.log('[SIGNIN] All params:', allParams)
    console.log('[SIGNIN] Full URL:', typeof window !== 'undefined' ? window.location.href : 'SSR')
    console.log('[SIGNIN] Session status:', status, 'has session:', !!session)
  }, [error, searchParams, status, session])

  // Redirect if already authenticated (prevent loops)
  useEffect(() => {
    if (status === 'authenticated' && session) {
      console.log('[SIGNIN] Already authenticated, redirecting to dashboard')
      router.push(callbackUrl)
      router.refresh()
    }
  }, [status, session, callbackUrl, router])

  // Check if error indicates no account (case-insensitive, handle all NextAuth error types)
  const showNoAccountError = error && (
    error === 'AccessDenied' || 
    error === 'NoAccount' ||
    error === 'OAuthSignin' ||
    error === 'OAuthCallback' ||
    error === 'OAuthCreateAccount' ||
    error.toLowerCase() === 'accessdenied' ||
    error.toLowerCase() === 'noaccount' ||
    error.toLowerCase().includes('access') ||
    error.toLowerCase().includes('denied')
  )

  // Check if error indicates account already exists with different provider
  // This happens when user tries Google login but account was created with email/password
  const showAccountNotLinkedError = error && (
    error === 'OAuthAccountNotLinked' ||
    error.trim() === 'OAuthAccountNotLinked' ||
    error.toLowerCase().includes('oauthaccountnotlinked') ||
    error.toLowerCase().includes('accountnotlinked')
  )

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const result = await signIn('credentials', {
        email: formData.email,
        password: formData.password,
        redirect: false,
      })

      if (result?.error) {
        toast.error('Ongeldige inloggegevens')
      } else {
        toast.success('Succesvol ingelogd!')
        router.push(callbackUrl)
        router.refresh()
      }
    } catch (error) {
      toast.error('Er ging iets mis')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signIn('google', {
        callbackUrl: callbackUrl,
        redirect: true,
      })
    } catch (error) {
      console.error('Google sign in error:', error)
      toast.error('Er ging iets mis bij Google login')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Welkom terug
          </h1>
          <p className="text-gray-600">
            Log in op je account
          </p>
        </div>

        {/* Error Message - OAuthAccountNotLinked */}
        {showAccountNotLinkedError ? (
          <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-blue-900 mb-2">
                  Account bestaat al
                </h3>
                <p className="text-sm text-blue-800 mb-2">
                  Er bestaat al een TailTribe account met dit e-mailadres. Log in met je e-mailadres en wachtwoord in plaats van Google.
                </p>
                <p className="text-xs text-blue-700">
                  Als je je wachtwoord bent vergeten, gebruik dan de "Wachtwoord vergeten?" link hieronder.
                </p>
              </div>
            </div>
          </div>
        ) : showNoAccountError ? (
          <div className="mb-6 p-4 bg-amber-50 border-2 border-amber-200 rounded-xl shadow-sm">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-900 mb-3">
                  Je hebt nog geen TailTribe account met dit e-mailadres. Registreer je eerst.
                </p>
                <Link href="/auth/register">
                  <Button
                    type="button"
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg py-2.5 px-4 text-sm transition-colors"
                  >
                    Account aanmaken
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        ) : error ? (
          // Fallback: Show OAuthAccountNotLinked even if detection failed
          error.includes('OAuthAccountNotLinked') || error.includes('AccountNotLinked') ? (
            <div className="mb-6 p-4 bg-blue-50 border-2 border-blue-200 rounded-xl shadow-sm">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <div className="flex-1">
                  <h3 className="text-sm font-semibold text-blue-900 mb-2">
                    Account bestaat al
                  </h3>
                  <p className="text-sm text-blue-800 mb-2">
                    Er bestaat al een TailTribe account met dit e-mailadres. Log in met je e-mailadres en wachtwoord in plaats van Google.
                  </p>
                  <p className="text-xs text-blue-700">
                    Als je je wachtwoord bent vergeten, gebruik dan de "Wachtwoord vergeten?" link hieronder.
                  </p>
                </div>
              </div>
            </div>
          ) : null
        ) : null}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email */}
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

          {/* Password */}
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

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full h-12 bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold rounded-xl"
          >
            {loading ? (
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                <span>Inloggen...</span>
              </div>
            ) : (
              'Inloggen'
            )}
          </Button>
        </form>

        {/* Divider */}
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Of</span>
          </div>
        </div>

        {/* Google Sign In Button */}
        <Button
          type="button"
          onClick={handleGoogleSignIn}
          disabled={loading}
          className="w-full h-12 bg-white border-2 border-gray-300 hover:bg-gray-50 text-gray-700 font-semibold rounded-xl flex items-center justify-center gap-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
          <span>Inloggen met Google</span>
        </Button>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-gray-600">
            Nog geen account?{' '}
            <Link href="/auth/register" className="text-green-600 hover:text-green-700 font-semibold">
              Registreer nu
            </Link>
          </p>
        </div>

        {/* Demo Accounts */}
        <div className="mt-8 p-4 bg-gray-50 rounded-xl">
          <p className="text-xs text-gray-600 font-semibold mb-2">Test accounts:</p>
          <div className="text-xs text-gray-500 space-y-1">
            <p>Eigenaar: jan.vermeersch@example.com</p>
            <p>Verzorger: sarah.janssens@example.com</p>
            <p className="text-gray-400">(wachtwoord: password123)</p>
          </div>
        </div>
      </div>
    </div>
  )
}
