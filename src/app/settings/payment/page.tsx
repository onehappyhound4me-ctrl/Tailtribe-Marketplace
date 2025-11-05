'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { PLATFORM_CONFIG } from '@/lib/constants'

export default function PaymentSettingsPage() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [loading, setLoading] = useState(false)
  const [stripeStatus, setStripeStatus] = useState<any>(null)
  const [checkingStatus, setCheckingStatus] = useState(true)

  const checkStripeStatus = useCallback(async () => {
    try {
      const res = await fetch('/api/stripe/connect-onboard', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setStripeStatus(data)
      }
    } catch (error) {
      console.error('Error checking Stripe status')
    } finally {
      setCheckingStatus(false)
    }
  }, [])

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/auth/signin')
      return
    }

    if (session?.user?.role !== 'CAREGIVER') {
      router.push('/dashboard')
      return
    }

    if (searchParams?.get('success') === 'true') {
      toast.success('Stripe account succesvol gekoppeld!')
    }

    checkStripeStatus()
  }, [session, status, router, searchParams, checkStripeStatus])

  const handleConnect = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/stripe/connect-onboard', {
        method: 'POST'
      })

      if (!res.ok) {
        const data = await res.json()
        throw new Error(data.error)
      }

      const data = await res.json()
      
      // Redirect to Stripe onboarding
      window.location.href = data.url

    } catch (error: any) {
      toast.error(error.message || 'Fout bij koppelen Stripe')
      setLoading(false)
    }
  }

  if (checkingStatus) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Uitbetalingen</h1>
              <p className="text-gray-600">Koppel je bankrekening voor uitbetalingen</p>
            </div>
            <Link href="/dashboard" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all duration-200 rounded-lg font-semibold shadow-md hover:shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8 max-w-3xl">
        <div className="bg-white rounded-2xl shadow-md p-8">

          {!stripeStatus?.connected ? (
            // Not connected
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">Ontvang uitbetalingen</h3>
                <p className="text-gray-700 mb-4">
                  Koppel je bankrekening via Stripe om automatisch uitbetalingen te ontvangen na voltooide boekingen.
                </p>
                <ul className="space-y-2 text-sm text-gray-600 mb-4">
                  <li>✅ Veilig via Stripe (wereldwijd vertrouwd)</li>
                  <li>✅ Automatische uitbetalingen</li>
                  <li>✅ Transparante commissie ({PLATFORM_CONFIG.COMMISSION_PERCENTAGE}%)</li>
                  <li>✅ Je verdient {100 - PLATFORM_CONFIG.COMMISSION_PERCENTAGE}% van elke boeking</li>
                </ul>
              </div>

              <Button
                onClick={handleConnect}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4 text-lg"
              >
                {loading ? 'Bezig...' : 'Koppel Stripe account'}
              </Button>

              <p className="text-xs text-gray-500 text-center">
                Je wordt doorgestuurd naar Stripe om je gegevens veilig in te voeren
              </p>
            </div>
          ) : !stripeStatus?.onboarded ? (
            // Connected but not onboarded
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2">⚠️ Onboarding niet compleet</h3>
                <p className="text-gray-700 mb-4">
                  Je Stripe account is aangemaakt maar nog niet volledig ingesteld. Voltooi de onboarding om uitbetalingen te kunnen ontvangen.
                </p>
              </div>

              <Button
                onClick={handleConnect}
                disabled={loading}
                className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-bold py-4"
              >
                {loading ? 'Bezig...' : 'Voltooi Stripe onboarding'}
              </Button>
            </div>
          ) : (
            // Fully onboarded
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-xl p-6">
                <h3 className="font-bold text-lg mb-2 text-green-800">✅ Stripe account gekoppeld</h3>
                <p className="text-gray-700">
                  Je bent helemaal ingesteld! Uitbetalingen worden automatisch verwerkt na voltooide boekingen.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white border rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">Status</div>
                  <div className="font-bold text-green-600">✓ Actief</div>
                </div>
                <div className="bg-white border rounded-xl p-4">
                  <div className="text-sm text-gray-600 mb-1">Uitbetalingen</div>
                  <div className="font-bold text-green-600">✓ Ingeschakeld</div>
                </div>
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-xl p-6">
                <h4 className="font-semibold mb-2">💡 Hoe werken uitbetalingen?</h4>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Wanneer een boeking compleet is, ontvangt TailTribe de betaling</li>
                  <li>• TailTribe behoudt {PLATFORM_CONFIG.COMMISSION_PERCENTAGE}% commissie</li>
                  <li>• Jij ontvangt {100 - PLATFORM_CONFIG.COMMISSION_PERCENTAGE}% direct op je bankrekening</li>
                  <li>• Uitbetalingen worden automatisch verwerkt binnen 2-7 werkdagen</li>
                </ul>
              </div>

              <Button
                onClick={handleConnect}
                variant="outline"
                className="w-full"
              >
                Stripe dashboard openen
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
