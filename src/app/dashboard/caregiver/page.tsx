'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'
// import { ProfileCompletion } from '@/components/caregiver/ProfileCompletion' // TEMPORARILY DISABLED
import { CaregiverProfileSummary } from '@/components/dashboard/CaregiverProfileSummary'
import { AvailabilityCalendar } from '@/components/caregiver/AvailabilityCalendar'
import { Legend } from '@/components/caregiver/Legend'
import { NewUsersWidget } from '@/components/dashboard/NewUsersWidget'

export default function CaregiverDashboardPage() {
  const { data: session } = useSession()
  const [profile, setProfile] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [stats, setStats] = useState({
    servedClients: 0,
    averageRating: 0,
    totalEarnings: 0,
    totalReviews: 0,
    pendingBookings: 0,
    upcomingBookings: 0
  })
  const [statsLoading, setStatsLoading] = useState(true)
  const [referralStats, setReferralStats] = useState<any>(null)
  const [referralLoading, setReferralLoading] = useState(true)

  useEffect(() => {
    fetchProfile()
    fetchStats()
    fetchReferralStats()
  }, [])

  const fetchProfile = async () => {
    try {
      const res = await fetch('/api/profile/caregiver')
      
      if (res.ok) {
        const data = await res.json()
        
        if (data.profile) {
          setProfile(data.profile)
        } else {
          setProfile(null)
        }
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error('Error fetching profile:', error)
      setProfile(null)
    } finally {
      setLoading(false)
    }
  }

  const fetchStats = async () => {
    try {
      setStatsLoading(true)
      const res = await fetch('/api/caregiver/stats', {
        cache: 'no-store',
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        if (data?.stats) {
          setStats({
            servedClients: data.stats.servedClients ?? 0,
            averageRating: data.stats.averageRating ?? 0,
            totalEarnings: data.stats.totalEarnings ?? 0,
            totalReviews: data.stats.totalReviews ?? 0,
            pendingBookings: data.stats.pendingBookings ?? 0,
            upcomingBookings: data.stats.upcomingBookings ?? 0
          })
        }
      }
    } catch (error) {
      console.error('Error fetching caregiver stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  const fetchReferralStats = async () => {
    try {
      setReferralLoading(true)
      const res = await fetch('/api/referral/generate', {
        cache: 'no-store',
        credentials: 'include'
      })
      if (res.ok) {
        const data = await res.json()
        setReferralStats(data)
      }
    } catch (error) {
      console.error('Error fetching referral stats:', error)
    } finally {
      setReferralLoading(false)
    }
  }

  const renderStatValue = (value: string | number) => {
    if (statsLoading) {
      return <span className="inline-block h-5 w-12 rounded bg-white/30 animate-pulse"></span>
    }
    return value
  }

  const formatCurrency = (value: number) =>
    value.toLocaleString('nl-BE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

  const satisfactionScore = stats.averageRating
    ? Math.min(10, Math.round((stats.averageRating / 5) * 10))
    : 0

  const referralReward = referralStats?.rewardPerReferral ?? referralStats?.reward ?? 10
  const referralSummary = referralLoading
    ? 'Referrals worden geladen...'
    : `${referralStats?.totalReferrals ?? 0} uitnodigingen • ${referralStats?.successfulReferrals ?? 0} succesvol`
  const referralEarnings = referralStats?.totalEarned ?? 0

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 relative overflow-hidden">
      {/* Professional Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
        <div className="absolute top-40 right-40 w-80 h-80 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-40 left-60 w-72 h-72 bg-gradient-to-r from-teal-200 to-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-35"></div>
      </div>

      {/* Premium Pro Header */}
      <header className="relative border-b border-white/20">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600"></div>
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25) 0, transparent 35%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.2) 0, transparent 40%), radial-gradient(circle at 30% 80%, rgba(255,255,255,0.15) 0, transparent 35%)'}}></div>
        <nav className="relative container mx-auto px-8 py-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">Verzorger Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/85 text-sm">Welkom terug!</span>
            </div>
          </div>

          {/* Inline ZEKPIs */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 ring-1 ring-white/20">
              <div className="text-xs text-white/80">Klanten bediend</div>
              <div className="text-2xl font-bold">
                {renderStatValue(stats.servedClients.toLocaleString('nl-BE'))}
              </div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 ring-1 ring-white/20">
              <div className="text-xs text-white/80">Gemiddelde rating</div>
              <div className="text-2xl font-bold">
                {renderStatValue(stats.averageRating ? stats.averageRating.toFixed(1) : '0.0')}
              </div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 ring-1 ring-white/20">
              <div className="text-xs text-white/80">Totale inkomsten</div>
              <div className="text-2xl font-bold">
                {renderStatValue(`€${formatCurrency(stats.totalEarnings)}`)}
              </div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 ring-1 ring-white/20">
              <div className="text-xs text-white/80">Tevredenheid</div>
              <div className="text-2xl font-bold">
                {renderStatValue(`${satisfactionScore}/10`)}
              </div>
            </div>
          </div>
        </nav>
      </header>

      <div className="relative container mx-auto px-8 py-10 pb-24">
        {/* Profile Completion Status - TEMPORARILY DISABLED */}
        {/* {!loading && profile && (
          <ProfileCompletion profile={profile} />
        )} */}

        {/* Removed: Signup/Profile CTA - User just completed onboarding */}

        {/* Caregiver Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch">
          {/* Profiel Summary - Shows ALL onboarding data */}
          {loading ? (
            <div className="backdrop-blur-xl bg-gradient-to-br from-white/25 via-emerald-50/25 to-teal-50/25 border border-white/40 rounded-xl p-6 shadow-lg flex flex-col h-[200px] animate-pulse">
              <div className="flex items-center justify-between mb-4 min-h-[40px]">
                <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                <div className="w-16 h-6 bg-gray-300 rounded-full"></div>
              </div>
              <div className="h-6 bg-gray-300 rounded mb-2"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-300 rounded"></div>
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
              </div>
              <div className="h-10 bg-gray-300 rounded"></div>
            </div>
          ) : profile ? (
            <CaregiverProfileSummary profile={profile} onUpdate={fetchProfile} />
          ) : (
            <div className="backdrop-blur-xl bg-gradient-to-br from-white/25 via-emerald-50/25 to-teal-50/25 border border-white/40 rounded-xl p-6 shadow-lg flex flex-col h-[200px] items-center justify-center">
              <p className="text-gray-500">Geen profiel gevonden</p>
            </div>
          )}

          {/* Mijn Agenda - Calendar Preview */}
          <div className="group backdrop-blur-xl bg-gradient-to-br from-white/25 via-blue-50/25 to-purple-50/25 border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-[200px]">
            <div className="flex items-center justify-between mb-4 min-h-[40px]">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="bg-blue-100/80 text-blue-700 text-xs px-2 py-1 rounded-full">Actief</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Mijn Agenda</h3>
            <p className="text-gray-600 text-sm mb-4">Bekijk je boeking en beheer je beschikbaarheid</p>
            <Link href="/dashboard/caregiver/calendar" className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
              Open Agenda
            </Link>
          </div>

          {/* Boekingen */}
          <div className="group backdrop-blur-xl bg-gradient-to-br from-white/25 via-blue-50/25 to-cyan-50/25 border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-[200px]">
            <div className="flex items-center justify-between mb-4 min-h-[40px]">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="bg-blue-100/80 text-blue-700 text-xs px-2 py-1 rounded-full">
                {statsLoading ? '…' : `${stats.pendingBookings} actief`}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Aanvragen</h3>
            <p className="text-gray-600 text-sm mb-4">Beheer inkomende boekingen van eigenaren</p>
            <Link href="/dashboard/caregiver/bookings" className="w-full bg-gradient-to-r from-blue-500 to-cyan-700 text-white hover:from-blue-600 hover:to-cyan-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
              Open Aanvragen
            </Link>
          </div>

          {/* Inkomsten & Uitbetalingen */}
          <div className="group backdrop-blur-xl bg-gradient-to-br from-white/25 via-yellow-50/25 to-green-50/25 border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-[200px]">
            <div className="flex items-center justify-between mb-4 min-h-[40px]">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-green-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="bg-green-100/80 text-green-700 text-xs px-2 py-1 rounded-full">
                {statsLoading ? '…' : `€${formatCurrency(stats.totalEarnings)}`}
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Inkomsten</h3>
            <p className="text-gray-600 text-sm mb-4">Bekijk je verdiensten en uitbetalingen</p>
            <Link href="/earnings" className="w-full bg-gradient-to-r from-yellow-500 to-green-700 text-white hover:from-yellow-600 hover:to-green-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
              Open Inkomsten
            </Link>
          </div>

          {/* Berichten */}
          <div className="group backdrop-blur-xl bg-gradient-to-br from-white/25 via-purple-50/25 to-pink-50/25 border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-[200px]">
            <div className="flex items-center justify-between mb-4 min-h-[40px]">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="bg-purple-100/80 text-purple-700 text-xs px-2 py-1 rounded-full">2 Nieuw</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Berichten</h3>
            <p className="text-gray-600 text-sm mb-4">Communiceer met huisdiereigenaren</p>
            <Link href="/messages" className="w-full bg-gradient-to-r from-purple-500 to-pink-700 text-white hover:from-purple-600 hover:to-pink-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
              Open Berichten
            </Link>
          </div>

          {/* Reviews */}
          <div className="group backdrop-blur-xl bg-gradient-to-br from-white/25 via-red-50/25 to-orange-50/25 border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-[200px]">
            <div className="flex items-center justify-between mb-4 min-h-[40px]">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <span className="bg-red-100/80 text-red-700 text-xs px-2 py-1 rounded-full">5 Nieuw</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Recensies</h3>
            <p className="text-gray-600 text-sm mb-4">Bekijk feedback van huisdiereigenaren</p>
            <Link href="/reviews?tab=received" prefetch={false} className="w-full bg-gradient-to-r from-red-500 to-orange-700 text-white hover:from-red-600 hover:to-orange-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
              Open Recensies
            </Link>
          </div>

          {/* Video Highlights */}
          <div className="group backdrop-blur-xl bg-gradient-to-br from-white/25 via-indigo-50/25 to-blue-50/25 border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-[200px]">
            <div className="flex items-center justify-between mb-4 min-h-[40px]">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 5a2 2 0 012-2h9a2 2 0 012 2v2l3.553-2.132A1 1 0 0121 5.736v12.528a1 1 0 01-1.447.868L16 17v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"/>
                </svg>
              </div>
              <span className="bg-indigo-100/80 text-indigo-700 text-xs px-2 py-1 rounded-full">Promotie</span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Video's</h3>
            <p className="text-gray-600 text-sm mb-4">Beheer je videopromoties</p>
            <Link href="/dashboard/caregiver/videos" className="w-full bg-gradient-to-r from-indigo-500 to-blue-700 text-white hover:from-indigo-600 hover:to-blue-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
              Beheer Video's
            </Link>
          </div>

          {/* Referrals - NIEUW! */}
          <div className="group backdrop-blur-xl bg-gradient-to-br from-white/25 via-yellow-50/25 to-amber-50/25 border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-[200px]">
            <div className="flex items-center justify-between mb-4 min-h-[40px]">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center">
                <span className="text-white text-xl">🎁</span>
              </div>
              <span className="bg-yellow-100/80 text-yellow-700 text-xs px-2 py-1 rounded-full">
                €{referralReward}/persoon
              </span>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Verwijzingen</h3>
            <p className="text-gray-600 text-sm mb-2">{referralSummary}</p>
            <p className="text-sm text-yellow-700 font-semibold mb-4">
              {referralLoading ? '–' : `Totaal verdiend: €${formatCurrency(referralEarnings)}`}
            </p>
            <Link href="/referrals" className="w-full bg-gradient-to-r from-yellow-500 to-amber-700 text-white hover:from-yellow-600 hover:to-amber-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
              Mijn Verwijzingslink
            </Link>
          </div>

        </div>


        {/* New Users Widget */}
        <div className="mt-6">
          <NewUsersWidget />
        </div>

        {/* Footer simplified: removed redundant back button */}
      </div>
    </div>
  )
}

