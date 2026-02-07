'use client'

import { useEffect, useState } from 'react'
import { signIn, signOut, useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [googleEnabled, setGoogleEnabled] = useState<boolean | null>(null)

  const debug = searchParams.get('debug') === '1'
  const switchMode = searchParams.get('switch') === '1'
  const pwReset = searchParams.get('pwreset') === '1'

  const verified = searchParams.get('verified')
  const errorParam = searchParams.get('error')
  const oauthErrorMessage = errorParam
    ? {
        Configuration:
          'De Google login is niet correct ingesteld. Controleer client ID/secret en redirect-URL.',
        OAuthSignin: 'Inloggen via Google is mislukt. Probeer opnieuw.',
        OAuthCallback: 'De terugkoppeling van Google faalde. Probeer opnieuw.',
        OAuthAccountNotLinked:
          'Dit account is al gekoppeld aan een andere loginmethode. Log in met je originele methode.',
        OAuthCreateAccount: 'Er ging iets mis bij het aanmaken van je account. Probeer opnieuw.',
        AccessDenied: 'Toegang geweigerd. Controleer je account of rechten.',
        default: 'Inloggen mislukt. Probeer opnieuw.',
      }[errorParam] ?? 'Inloggen mislukt. Probeer opnieuw.'
    : null

  // SECURITY: never allow external callbackUrl redirects (prevents phishing/open-redirect issues).
  const rawCallbackUrl = searchParams.get('callbackUrl')
  const callbackUrl =
    rawCallbackUrl && rawCallbackUrl.startsWith('/') && !rawCallbackUrl.startsWith('//')
      ? rawCallbackUrl
      : '/dashboard'

  // Prefetch available providers so we can disable the Google button when not configured on THIS server (local dev).
  useEffect(() => {
    let cancelled = false
    fetch('/api/auth/providers')
      .then((r) => r.json())
      .then((providers) => {
        if (cancelled) return
        setGoogleEnabled(Boolean(providers?.google))
      })
      .catch(() => {
        if (cancelled) return
        setGoogleEnabled(false)
      })
    return () => {
      cancelled = true
    }
  }, [])

  useEffect(() => {
    // Default behavior: authenticated users go straight to the dashboard.
    // Switch mode: stay on /login so the user can log out and sign in with another account (mobile-friendly).
    if (!switchMode && status === 'authenticated' && session?.user) {
      router.replace(callbackUrl)
    }
  }, [status, session, callbackUrl, router, switchMode])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    if (status === 'authenticated') {
      setError('Je bent al ingelogd. Klik eerst op uitloggen om met een ander account in te loggen.')
      setLoading(false)
      return
    }

    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: false,
        callbackUrl,
      })

      if (result?.error) {
        if (debug) {
          setError(`Inloggen mislukt (${result.error}). Controleer je e-mailadres en wachtwoord.`)
        } else {
          setError('Ongeldig e-mailadres of wachtwoord')
        }
        setLoading(false)
        return
      }

      // Mark a fresh login so IdleLogout won't immediately kick the user due to stale activity markers.
      try {
        const ms = Date.now()
        localStorage.setItem('tt_last_login_ms', String(ms))
        document.cookie = `tt_last_login_ms=${encodeURIComponent(String(ms))}; Max-Age=${60 * 60 * 24 * 30}; Path=/; SameSite=Lax`
      } catch {
        // ignore
      }

      // Redirect based on role (will be handled by middleware)
      router.push(callbackUrl)
      router.refresh()
    } catch (err) {
      setError('Er ging iets mis. Probeer opnieuw.')
      setLoading(false)
    }
  }

  const handleOAuth = async (provider: 'google') => {
    setError('')
    setLoading(true)
    try {
      if (provider === 'google' && googleEnabled === false) {
        setError(
          'Google login is op deze server nog niet geconfigureerd. Zet GOOGLE_CLIENT_ID en GOOGLE_CLIENT_SECRET in tailtribe-dispatch/.env.local en herstart de dev server.'
        )
        setLoading(false)
        return
      }
      const res = await fetch('/api/auth/providers')
      const providers = await res.json().catch(() => ({}))
      if (!providers?.[provider]) {
        setError('Deze login is nog niet geconfigureerd. Controleer de env-variabelen.')
        setLoading(false)
        return
      }
      const result = await signIn(provider, { callbackUrl, redirect: false })
      if (result?.error) {
        setError('Inloggen via externe provider lukt niet. Probeer opnieuw.')
        setLoading(false)
        return
      }
      if (result?.url) {
        window.location.href = result.url
        return
      }
      window.location.href = `/api/auth/signin/${provider}?callbackUrl=${encodeURIComponent(callbackUrl)}`
    } catch {
      setError('Inloggen via externe provider lukt niet. Probeer opnieuw.')
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/" primaryCtaLabel="Home" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 mb-2">
              Inloggen
            </h1>
            <p className="text-gray-600 mb-6">
              Log in om je dashboard te bekijken
            </p>

            {status === 'authenticated' && session?.user && switchMode && (
              <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                <div className="font-semibold">Je bent nog ingelogd.</div>
                <div className="mt-1">
                  Rol: <strong>{(session.user as any)?.role ?? 'onbekend'}</strong>
                </div>
                <div className="mt-3 flex flex-col sm:flex-row gap-2">
                  <button
                    type="button"
                    onClick={() => signOut({ callbackUrl: '/login?switch=1' })}
                    className="btn-brand"
                  >
                    Uitloggen en opnieuw inloggen
                  </button>
                  <Link
                    href="/logout"
                    className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border border-amber-300 text-amber-900 font-semibold hover:bg-amber-100"
                  >
                    Naar uitloggen
                  </Link>
                </div>
              </div>
            )}

            {verified && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                Je email is geverifieerd. Je kan nu inloggen.
              </div>
            )}

            {pwReset && (
              <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-800 text-sm">
                Je wachtwoord is aangepast. Je kan nu inloggen.
              </div>
            )}

            {errorParam === 'invalid_token' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                Ongeldige verificatie link. Probeer opnieuw te registreren.
              </div>
            )}

            {errorParam === 'token_expired' && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                Verificatie link is verlopen. Registreer opnieuw voor een nieuwe link.
              </div>
            )}

            {oauthErrorMessage && !['invalid_token', 'token_expired'].includes(errorParam ?? '') && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {oauthErrorMessage}
              </div>
            )}

            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-800 text-sm">
                {error}
              </div>
            )}

            <div className="space-y-3 mb-6">
              <button
                type="button"
                onClick={() => handleOAuth('google')}
                disabled={googleEnabled === false || loading}
                className={`w-full px-4 py-2.5 rounded-xl border font-semibold transition ${
                  googleEnabled === false || loading
                    ? 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'border-gray-300 bg-white text-gray-800 hover:bg-gray-50'
                }`}
              >
                Inloggen met Gmail
              </button>
              {googleEnabled === false && (
                <div className="text-xs text-gray-500">
                  Google login is nog niet geconfigureerd voor deze server (lokaal). Vul{' '}
                  <span className="font-mono">GOOGLE_CLIENT_ID</span> en <span className="font-mono">GOOGLE_CLIENT_SECRET</span>{' '}
                  in <span className="font-mono">tailtribe-dispatch/.env.local</span> en herstart.
                </div>
              )}
              <div className="text-center text-xs text-gray-400">of</div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
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

              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                  Wachtwoord
                </label>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  placeholder="••••••••"
                />
                <div className="mt-2 text-xs text-gray-500">
                  Wachtwoord vergeten?{' '}
                  <Link href="/forgot-password" className="text-emerald-700 font-semibold hover:underline">
                    Reset je wachtwoord
                  </Link>
                  .
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full btn-brand disabled:opacity-60"
              >
                {loading ? 'Inloggen...' : 'Inloggen'}
              </button>
            </form>

            <div className="mt-6 text-center text-sm text-gray-600">
              Nog geen account?{' '}
              <Link href="/register" className="text-emerald-700 font-semibold hover:underline">
                Registreren
              </Link>
            </div>

            <div className="mt-4 text-center text-xs text-gray-500">
              Problemen om van account te wisselen? Gebruik{' '}
              <Link href="/login?switch=1" className="text-emerald-700 font-semibold hover:underline">
                /login?switch=1
              </Link>
              .
            </div>

            {debug && (
              <div className="mt-2 text-center text-[11px] text-gray-500">
                Debug: check admin env via{' '}
                <a className="text-emerald-700 font-semibold hover:underline" href="/api/debug/env-admin" target="_blank" rel="noreferrer">
                  /api/debug/env-admin
                </a>
              </div>
            )}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
