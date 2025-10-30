'use client'

import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { toast } from 'sonner'

export default function ReferralsPage() {
  const { data: session } = useSession()
  const [referralData, setReferralData] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [generating, setGenerating] = useState(false)

  useEffect(() => {
    loadReferralData()
  }, [])

  const loadReferralData = async () => {
    try {
      const res = await fetch('/api/referral/generate')
      const data = await res.json()
      
      if (data.success) {
        setReferralData(data)
      }
    } catch (error) {
      console.error('Error loading referral data:', error)
    } finally {
      setLoading(false)
    }
  }

  const generateCode = async () => {
    setGenerating(true)
    try {
      const res = await fetch('/api/referral/generate', {
        method: 'POST'
      })
      const data = await res.json()
      
      if (data.success) {
        setReferralData(data)
        toast.success('Referral code aangemaakt!')
      } else {
        toast.error(data.error || 'Failed to generate code')
      }
    } catch (error) {
      toast.error('Er ging iets mis')
    } finally {
      setGenerating(false)
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('Gekopieerd naar klembord!')
  }

  const shareWhatsApp = () => {
    const message = `Hey! Ik gebruik TailTribe voor dierenoppas - probeer het ook eens! Registreer via mijn link: ${referralData.referralLink}`
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank')
  }

  const shareEmail = () => {
    const subject = 'Probeer TailTribe voor dierenoppas!'
    const body = `Hey!\n\nIk gebruik TailTribe voor het vinden van betrouwbare dierenoppassers en ben super tevreden!\n\nProbeer het ook via deze link:\n${referralData.referralLink}\n\nGroetjes!`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
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
              <h1 className="text-2xl font-bold text-gray-800">Verdien €10 per Referral</h1>
              <p className="text-gray-600">Nodig vrienden uit en verdien €10 credit per succesvolle aanmelding!</p>
            </div>
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all duration-200 rounded-lg font-semibold shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {!referralData?.referralCode ? (
          /* No referral code yet */
          <div className="bg-white rounded-xl shadow-lg p-8 text-center">
            <div className="text-6xl mb-6">🎁</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Verdien €10 per Referral!
            </h2>
            <p className="text-gray-600 mb-6 max-w-2xl mx-auto">
              Nodig vrienden uit om TailTribe te gebruiken. Zodra zij hun eerste boeking voltooien, 
              ontvangen jullie beiden €10 credit!
            </p>
            <button
              onClick={generateCode}
              disabled={generating}
              className="px-8 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
            >
              {generating ? 'Aanmaken...' : 'Mijn Referral Code Aanmaken'}
            </button>
          </div>
        ) : (
          /* Has referral code */
          <>
            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-emerald-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Totaal Referrals</p>
                    <p className="text-3xl font-bold text-gray-900">{referralData.totalReferrals || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">👥</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Succesvol</p>
                    <p className="text-3xl font-bold text-gray-900">{referralData.successfulReferrals || 0}</p>
                  </div>
                  <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">✅</span>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-6 border-l-4 border-yellow-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Verdiend</p>
                    <p className="text-3xl font-bold text-gray-900">€{referralData.totalEarned?.toFixed(2) || '0.00'}</p>
                  </div>
                  <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <span className="text-2xl">💰</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Referral Link Card */}
            <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">Jouw Referral Link</h3>
              
              <div className="bg-gray-50 rounded-lg p-4 mb-4 border-2 border-gray-200">
                <div className="flex items-center justify-between">
                  <code className="text-sm text-gray-700 break-all">{referralData.referralLink}</code>
                  <button
                    onClick={() => copyToClipboard(referralData.referralLink)}
                    className="ml-4 px-4 py-2 bg-gray-700 hover:bg-gray-800 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Kopieer
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <button
                  onClick={() => copyToClipboard(referralData.referralLink)}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-gray-800 hover:to-gray-900 text-white rounded-lg font-medium transition-all"
                >
                  <span>📋</span>
                  Kopieer Link
                </button>

                <button
                  onClick={shareWhatsApp}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-lg font-medium transition-all"
                >
                  <span>💬</span>
                  WhatsApp
                </button>

                <button
                  onClick={shareEmail}
                  className="flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white rounded-lg font-medium transition-all"
                >
                  <span>📧</span>
                  Email
                </button>
              </div>
            </div>

            {/* How it Works */}
            <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl shadow-md p-8 border-2 border-emerald-200">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Hoe werkt het?</h3>
              
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    1
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Deel je link</h4>
                    <p className="text-gray-600">Stuur je unieke referral link naar vrienden en familie.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    2
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Zij registreren en boeken</h4>
                    <p className="text-gray-600">Je vriend registreert met jouw link en maakt hun eerste boeking.</p>
                  </div>
                </div>

                <div className="flex items-start gap-4">
                  <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center text-white font-bold flex-shrink-0">
                    3
                  </div>
                  <div>
                    <h4 className="font-semibold text-gray-900">Jij verdient €{referralData.rewardPerReferral}!</h4>
                    <p className="text-gray-600">Na hun eerste voltooide boeking ontvang jij €{referralData.rewardPerReferral} credit op jouw account!</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}





