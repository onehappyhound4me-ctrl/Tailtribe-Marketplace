'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { NewUsersWidget } from '@/components/dashboard/NewUsersWidget'
import { SmartSearchLink } from '@/components/common/SmartSearchLink'
import { OwnerProfileCard } from '@/components/dashboard/OwnerProfileCard'
import { PetsCard } from '@/components/dashboard/PetsCard'

export default function OwnerDashboardPage() {
  const [userData, setUserData] = useState<any>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  
  useEffect(() => {
    loadUserData()
  }, [])
  
  const loadUserData = async () => {
    try {
      const res = await fetch('/api/profile/owner')
      if (res.ok) {
        const data = await res.json()
        setUserData(data)
      }
    } catch (error) {
      console.error('Error loading user data:', error)
    }
  }
  
  const dismissWelcome = () => {
    setShowWelcome(false)
  }
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
                <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">Eigenaar Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-white/85 text-sm">Welkom terug!</span>
            </div>
          </div>

          {userData && (
            <div className="mt-4 text-white/90 text-sm">
              {userData.firstName && userData.lastName && (
                <p className="font-semibold">Welkom, {userData.firstName} {userData.lastName}!</p>
              )}
              {userData.city && (
                <p className="text-white/70">📍 {userData.city}, {userData.country === 'NL' ? 'Nederland' : 'België'}</p>
              )}
            </div>
          )}
        </nav>
      </header>

      <div className="relative container mx-auto px-8 py-10 pb-24">

        {/* Welkomst Banner voor Nieuwe Users */}
        {showWelcome && (
          <div className="mb-6 backdrop-blur-xl bg-gradient-to-r from-emerald-500/90 via-teal-500/90 to-blue-500/90 border border-white/40 rounded-lg p-5 shadow-xl relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_50%,rgba(255,255,255,0.2),transparent)]"></div>
            
            <button 
              onClick={dismissWelcome}
              className="absolute top-3 right-3 text-white/80 hover:text-white transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            <div className="relative z-10 pr-8">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <span className="text-2xl">👋</span>
                Welkom! Zo vind je snel een verzorger:
              </h2>
              
              <div className="grid md:grid-cols-3 gap-3 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs flex-shrink-0 mt-0.5">1</span>
                    <div>
                      <h3 className="font-bold text-white text-sm mb-1">Klik op "Zoek Verzorger"</h3>
                      <p className="text-white/90 text-xs">Bekijk beschikbare verzorgers bij jou in de buurt</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs flex-shrink-0 mt-0.5">2</span>
                    <div>
                      <h3 className="font-bold text-white text-sm mb-1">Vergelijk & kies</h3>
                      <p className="text-white/90 text-xs">Lees reviews en selecteer de beste match</p>
                    </div>
                  </div>
                </div>
                
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs flex-shrink-0 mt-0.5">3</span>
                    <div>
                      <h3 className="font-bold text-white text-sm mb-1">Stuur een bericht</h3>
                      <p className="text-white/90 text-xs">Plan direct een afspraak via het platform</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Owner Dashboard Content - Uniform Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          
          {/* Zoek Verzorger */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-white/25 via-purple-50/25 to-pink-50/25 border border-white/40 rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-[160px]">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900">Zoek Verzorger</h3>
            </div>
            <SmartSearchLink className="w-full mt-auto bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200 rounded-lg py-2 text-sm font-semibold block text-center">
              Zoek nu
            </SmartSearchLink>
          </div>
          
          {/* Mijn Profiel */}
          <OwnerProfileCard />
          
          {/* Mijn Huisdieren */}
          <PetsCard />
          
          {/* Boekingen */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-white/25 via-blue-50/25 to-purple-50/25 border border-white/40 rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-[160px]">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900">Boekingen</h3>
            </div>
            <Link href="/bookings" className="w-full mt-auto bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 rounded-lg py-2 text-sm font-semibold block text-center">
              Bekijk boekingen
            </Link>
          </div>

          {/* Mijn Agenda */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-white/25 via-blue-50/25 to-purple-50/25 border border-white/40 rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-[160px]">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900">Mijn Agenda</h3>
            </div>
            <Link href="/dashboard/owner/calendar" className="w-full mt-auto bg-blue-600 hover:bg-blue-700 text-white transition-all duration-200 rounded-lg py-2 text-sm font-semibold block text-center">
              Mijn Agenda
            </Link>
          </div>

          {/* Berichten */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-white/25 via-purple-50/25 to-pink-50/25 border border-white/40 rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-[160px]">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900">Berichten</h3>
            </div>
            <Link href="/messages" className="w-full mt-auto bg-purple-600 hover:bg-purple-700 text-white transition-all duration-200 rounded-lg py-2 text-sm font-semibold block text-center">
              Bekijk berichten
            </Link>
          </div>

          {/* Reviews */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-white/25 via-orange-50/25 to-red-50/25 border border-white/40 rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-[160px]">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-orange-500 to-red-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <h3 className="text-base font-bold text-gray-900">Reviews</h3>
            </div>
            <Link href="/reviews" className="w-full mt-auto bg-orange-600 hover:bg-orange-700 text-white transition-all duration-200 rounded-lg py-2 text-sm font-semibold block text-center">
              Beheer reviews
            </Link>
          </div>

          {/* Referrals */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-white/25 via-yellow-50/25 to-amber-50/25 border border-white/40 rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-[160px]">
            <div className="flex items-center gap-2.5 mb-3">
              <div className="w-9 h-9 bg-gradient-to-br from-yellow-500 to-amber-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                <span className="text-white text-base">🎁</span>
              </div>
              <h3 className="text-base font-bold text-gray-900">Referrals</h3>
            </div>
            <Link href="/referrals" className="w-full mt-auto bg-yellow-600 hover:bg-yellow-700 text-white transition-all duration-200 rounded-lg py-2 text-sm font-semibold block text-center">
              Mijn referral link
            </Link>
          </div>

        </div>

        {/* New Users Widget */}
        <div className="mt-6">
          <NewUsersWidget />
        </div>
      </div>
    </div>
  )
}


