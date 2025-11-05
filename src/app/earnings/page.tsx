'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/common/EmptyState'
import { PLATFORM_CONFIG } from '@/lib/constants'

interface Earning {
  id: string
  date: string
  ownerName: string
  serviceName: string
  totalAmount: number
  platformFee: number
  yourEarnings: number
  status: string
  paidOut: boolean
  payoutDate?: string
}

export default function EarningsPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [earnings, setEarnings] = useState<Earning[]>([])
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    totalEarnings: 0,
    pendingPayouts: 0,
    completedPayouts: 0,
    thisMonth: 0
  })

  const fetchEarnings = useCallback(async () => {
    try {
      const res = await fetch('/api/earnings', { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setEarnings(data.earnings || [])
        setStats(prev => data.stats || prev)
      }
    } catch (error) {
      console.error('Error fetching earnings:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (session?.user?.role !== 'CAREGIVER') {
      router.push('/dashboard')
      return
    }
    fetchEarnings()
  }, [session, router, fetchEarnings])

  if (session?.user?.role !== 'CAREGIVER') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Inkomsten & Uitbetalingen</h1>
              <p className="text-sm text-gray-600">Overzicht van je verdiensten</p>
            </div>
            <Link href="/dashboard/caregiver" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all duration-200 rounded-lg font-semibold shadow-md hover:shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Totaal Verdiend</p>
                <p className="text-3xl font-bold text-gray-900">€{stats.totalEarnings.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Te Ontvangen</p>
                <p className="text-3xl font-bold text-gray-900">€{stats.pendingPayouts.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">⏳</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Uitbetaald</p>
                <p className="text-3xl font-bold text-gray-900">€{stats.completedPayouts.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">✅</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Deze Maand</p>
                <p className="text-3xl font-bold text-gray-900">€{stats.thisMonth.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                <span className="text-2xl">📅</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stripe Connect Status */}
        <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-300 rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-blue-500 rounded-lg flex items-center justify-center">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-lg">Stripe Connect</h3>
                <p className="text-sm text-gray-600">Uitbetalingen gebeuren automatisch via Stripe</p>
              </div>
            </div>
            <Button asChild className="bg-blue-600 hover:bg-blue-700">
              <Link href="/settings/payment">
                Instellingen
              </Link>
            </Button>
          </div>
        </div>

        {/* Earnings Table */}
        <div className="bg-white rounded-xl shadow-lg overflow-hidden">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Transactie Overzicht</h2>
            <p className="text-sm text-gray-600 mt-1">Alle voltooide boekingen en uitbetalingen</p>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
              <p className="text-gray-600">Laden...</p>
            </div>
          ) : earnings.length === 0 ? (
            <div className="p-12">
              <EmptyState
                icon="💸"
                title="Nog geen inkomsten"
                description="Je hebt nog geen voltooide boekingen. Zodra je eerste booking is afgerond, verschijnen je verdiensten hier."
                actionLabel="Terug naar Dashboard"
                actionHref="/dashboard/caregiver"
              />
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Datum</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Klant</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Service</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Totaal</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Commissie</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Jouw Verdienste</th>
                    <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {earnings.map((earning) => (
                    <tr key={earning.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(earning.date).toLocaleDateString('nl-NL')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {earning.ownerName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                        {earning.serviceName}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                        €{earning.totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600">
                        -€{earning.platformFee.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-bold text-emerald-600">
                        €{earning.yourEarnings.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {earning.paidOut ? (
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-100 text-emerald-700">
                            ✓ Uitbetaald
                          </span>
                        ) : (
                          <span className="px-3 py-1 text-xs font-semibold rounded-full bg-yellow-100 text-yellow-700">
                            ⏳ In behandeling
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* BTW Info Box */}
        <div className="mt-8 bg-amber-50 border-2 border-amber-200 rounded-xl p-6">
          <h3 className="font-bold text-amber-900 mb-3 flex items-center gap-2">
            <span className="text-xl">⚠️</span>
            BTW Informatie
          </h3>
          <div className="text-sm text-amber-800 space-y-2">
            <p>
              <strong>Let op:</strong> De getoonde bedragen zijn exclusief BTW. Als je BTW-plichtig bent (omzet &gt; €25.000/jaar), 
              moet je 21% BTW afdragen over je inkomsten aan de belastingdienst.
            </p>
            <div className="bg-white/50 rounded-lg p-3 mt-3">
              <p className="font-semibold text-amber-900 mb-1">Voorbeeld berekening:</p>
              <div className="space-y-1 text-xs">
                <div className="flex justify-between">
                  <span>Jouw verdienste (na commissie):</span>
                  <span className="font-semibold">€100,00</span>
                </div>
                <div className="flex justify-between text-red-700">
                  <span>BTW (21% - eigen opgave):</span>
                  <span className="font-semibold">-€21,00</span>
                </div>
                <div className="border-t border-amber-300 my-1"></div>
                <div className="flex justify-between font-bold">
                  <span>Netto na BTW:</span>
                  <span>€79,00</span>
                </div>
              </div>
            </div>
            <p className="text-xs mt-2">
              Raadpleeg een accountant voor fiscale vragen. Dit platform is niet verantwoordelijk voor BTW-aangifte.
            </p>
          </div>
        </div>

        {/* Info Box */}
        <div className="mt-6 bg-blue-50 border-2 border-blue-200 rounded-xl p-6">
          <h3 className="font-bold text-blue-900 mb-3 flex items-center gap-2">
            <span className="text-xl">ℹ️</span>
            Uitbetalingsschema
          </h3>
          <div className="text-sm text-blue-800 space-y-2">
            <p>
              <strong>Commissie:</strong> TailTribe houdt {PLATFORM_CONFIG.COMMISSION_PERCENTAGE}% commissie in op elke transactie voor platformkosten en support.
            </p>
            <p>
              <strong>Uitbetalingen:</strong> Voltooide betalingen worden automatisch uitbetaald via Stripe binnen 2-7 werkdagen na voltooiing van de boeking.
            </p>
            <p>
              <strong>Vragen?</strong> Neem contact op via <a href="mailto:steven@tailtribe.be" className="underline">steven@tailtribe.be</a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}





