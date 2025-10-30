'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AvailabilityCalendar } from '@/components/caregiver/AvailabilityCalendar'

interface CaregiverStats {
  totalBookings: number
  pendingBookings: number
  weeklyEarnings: number
  averageRating: number
  totalReviews: number
  recentBookings: any[]
}

export default function CaregiverCalendarPage() {
  const { data: session } = useSession()
  const [userData, setUserData] = useState<any>(null)
  const [showWelcome, setShowWelcome] = useState(true)
  const [stats, setStats] = useState<CaregiverStats>({
    totalBookings: 0,
    pendingBookings: 0,
    weeklyEarnings: 0,
    averageRating: 0,
    totalReviews: 0,
    recentBookings: []
  })
  const [loading, setLoading] = useState(true)
  const [availability, setAvailability] = useState<any>(null)
  const [selectedDates, setSelectedDates] = useState<string[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      const [statsRes, bookingsRes, profileRes, availabilityRes] = await Promise.all([
        fetch('/api/caregiver/stats'),
        fetch('/api/caregiver/bookings'),
        fetch('/api/profile/caregiver'),
        fetch('/api/availability')
      ])

      if (statsRes.ok) {
        const statsData = await statsRes.json()
        setStats(statsData)
      }

      if (bookingsRes.ok) {
        const bookingsData = await bookingsRes.json()
        setStats(prev => ({ ...prev, recentBookings: bookingsData.bookings || [] }))
      }

      if (profileRes.ok) {
        const profileData = await profileRes.json()
        setUserData(profileData)
      }

      if (availabilityRes.ok) {
        const availabilityData = await availabilityRes.json()
        setAvailability(availabilityData)
      }
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const dismissWelcome = () => {
    setShowWelcome(false)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'CONFIRMED': return 'bg-green-100 text-green-800'
      case 'CANCELLED': return 'bg-red-100 text-red-800'
      case 'COMPLETED': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'In afwachting'
      case 'CONFIRMED': return 'Bevestigd'
      case 'CANCELLED': return 'Geannuleerd'
      case 'COMPLETED': return 'Voltooid'
      default: return status
    }
  }

  const handleBookingAction = async (bookingId: string, action: string) => {
    console.log('🎯 Handling booking action:', { bookingId, action })
    try {
      const res = await fetch(`/api/caregiver/bookings/${bookingId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action })
      })
      
      console.log('📡 API response:', res.status, res.statusText)
      
      if (res.ok) {
        const data = await res.json()
        console.log('✅ Booking updated:', data)
        loadData() // Reload data
      } else {
        const error = await res.json()
        console.error('❌ API error:', error)
      }
    } catch (error) {
      console.error('❌ Error updating booking:', error)
    }
  }

  if (loading) {
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
                  <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">Verzorger Agenda</h1>
                  <p className="text-emerald-100 mt-1">Beheer je dienstverlening en beschikbaarheid</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-white/85 text-sm">Agenda overzicht</span>
              </div>
            </div>
          </nav>
        </header>

        <div className="relative container mx-auto px-8 py-10 pb-24">
          {/* Loading Stats Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="group backdrop-blur-xl bg-gradient-to-br from-white/25 via-white/25 to-white/25 border border-white/40 rounded-xl p-6 shadow-lg animate-pulse">
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 bg-gray-300 rounded-lg"></div>
                  <div className="w-16 h-6 bg-gray-300 rounded-full"></div>
                </div>
                <div className="h-6 bg-gray-300 rounded mb-2"></div>
                <div className="h-8 bg-gray-300 rounded mb-2"></div>
                <div className="h-4 bg-gray-300 rounded"></div>
              </div>
            ))}
          </div>

          {/* Loading Calendar */}
          <div className="group backdrop-blur-xl bg-gradient-to-br from-white/25 via-white/25 to-white/25 border border-white/40 rounded-xl shadow-lg">
            <div className="p-6 border-b">
              <div className="h-6 bg-gray-300 rounded w-48 mb-2"></div>
              <div className="h-4 bg-gray-300 rounded w-64"></div>
            </div>
            <div className="p-6">
              <div className="grid grid-cols-7 gap-4">
                {Array.from({ length: 35 }).map((_, i) => (
                  <div key={i} className="h-20 bg-gray-200 rounded-lg animate-pulse"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
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
                <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">Verzorger Dashboard</h1>
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
                Welkom! Zo beheer je je dienstverlening:
              </h2>

              <div className="grid md:grid-cols-3 gap-3 mb-4">
                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs flex-shrink-0 mt-0.5">1</span>
                    <div>
                      <h3 className="font-bold text-white text-sm mb-1">Stel je beschikbaarheid in</h3>
                      <p className="text-white/90 text-xs">Configureer je werktijden en diensten</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs flex-shrink-0 mt-0.5">2</span>
                    <div>
                      <h3 className="font-bold text-white text-sm mb-1">Beheer boekingen</h3>
                      <p className="text-white/90 text-xs">Accepteer of weiger aanvragen</p>
                    </div>
                  </div>
                </div>

                <div className="bg-white/20 backdrop-blur-sm rounded-lg p-3 border border-white/30">
                  <div className="flex items-start gap-2">
                    <span className="w-6 h-6 bg-white rounded-full flex items-center justify-center text-emerald-600 font-bold text-xs flex-shrink-0 mt-0.5">3</span>
                    <div>
                      <h3 className="font-bold text-white text-sm mb-1">Verdien geld</h3>
                      <p className="text-white/90 text-xs">Bekijk je inkomsten en uitbetalingen</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Professionele Agenda Kalender */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          
          {/* Maand Kalender - Groot */}
          <div className="lg:col-span-3 backdrop-blur-xl bg-gradient-to-br from-white/25 via-white/25 to-white/25 border border-white/40 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
            <div className="p-6 border-b">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 mb-2">Mijn Agenda</h2>
                  <p className="text-gray-600">Beheer je beschikbaarheid en bekijk je boekingen</p>
                </div>
                <Link 
                  href="/dashboard/caregiver" 
                  className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v2H8V5z" />
                  </svg>
                  Dashboard
                </Link>
              </div>
            </div>
            <div className="p-6">
                <div className="bg-white rounded-xl border-2 border-gray-200 shadow-lg overflow-hidden">
                  <div className="p-4">
                     <AvailabilityCalendar caregiverId={session?.user?.id || ''} />
                  </div>
                </div>
            </div>
          </div>

          {/* Sidebar - Verslavende UX */}
          <div className="space-y-4">
            
            {/* Vandaag - Super Visueel */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-emerald-500/20 via-teal-500/20 to-blue-500/20 border border-emerald-400/40 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-4 border-b border-emerald-200/30">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                  <h3 className="font-bold text-emerald-800">Vandaag</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="text-center">
                  <div className="text-4xl font-black text-emerald-700 mb-2">
                    {new Date().getDate()}
                  </div>
                  <div className="text-sm font-semibold text-emerald-600 mb-3">
                    {new Date().toLocaleDateString('nl-NL', { 
                      weekday: 'long', 
                      month: 'long' 
                    })}
                  </div>
                  {stats.pendingBookings > 0 && (
                    <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-2">
                      <div className="text-xs font-bold text-yellow-800">
                        🔔 {stats.pendingBookings} nieuwe aanvragen!
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Beschikbaarheid Status - Verslavend */}
            <div className="backdrop-blur-xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 border border-blue-400/40 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="p-4 border-b border-blue-200/30">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <h3 className="font-bold text-blue-800">Status</h3>
                </div>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-700">Beschikbaar</span>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-xs font-bold text-green-600">Actief</span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-700">Boekingen</span>
                    <span className="text-lg font-black text-blue-600">{stats.totalBookings}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-blue-700">Beoordeling</span>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-black text-purple-600">{(stats.averageRating || 0).toFixed(1)}</span>
                      <span className="text-xs text-purple-500">⭐</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>


          </div>
        </div>

        {/* Recente Boekingen */}
        <div className="mt-8 backdrop-blur-xl bg-gradient-to-br from-white/25 via-white/25 to-white/25 border border-white/40 rounded-xl shadow-lg hover:shadow-xl transition-all duration-300">
          <div className="p-6 border-b">
            <h2 className="text-xl font-bold text-gray-900">Recente Boekingen</h2>
            <p className="text-gray-600">Overzicht van je laatste boekingen</p>
          </div>

          <div className="p-6">
            {(stats.recentBookings || []).length === 0 ? (
              <div className="text-center py-12">
                <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-900 mb-2">Nog geen boekingen</h3>
                <p className="text-gray-600">Je hebt nog geen boekingen ontvangen.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {(stats.recentBookings || []).map((booking) => (
                  <div key={booking.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                        <div>
                          <h3 className="font-semibold text-gray-900">{booking.petName} - {booking.service || 'Dienst'}</h3>
                          <p className="text-sm text-gray-600">{booking.owner.name}</p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(booking.status)}>
                        {getStatusLabel(booking.status)}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                      <div>
                        <span className="font-medium text-gray-700">Datum:</span>
                        <p className="text-gray-600">{new Date(booking.startAt).toLocaleDateString('nl-NL')}</p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Tijd:</span>
                        <p className="text-gray-600">
                          {new Date(booking.startAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })} -
                          {new Date(booking.endAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' })}
                        </p>
                      </div>
                      <div>
                        <span className="font-medium text-gray-700">Bedrag:</span>
                        <p className="text-gray-600">€{(booking.amountCents / 100).toFixed(2)}</p>
                      </div>
                    </div>

                    {booking.specialInstructions && (
                      <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                        <span className="font-medium text-gray-700">Speciale instructies:</span>
                        <p className="text-gray-600 mt-1">{booking.specialInstructions}</p>
                      </div>
                    )}

                    <div className="mt-4 flex gap-2">
                      {booking.status === 'PENDING' && (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleBookingAction(booking.id, 'confirm')}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Accepteren
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleBookingAction(booking.id, 'decline')}
                            className="text-red-600 border-red-600 hover:bg-red-50"
                          >
                            Afwijzen
                          </Button>
                        </>
                      )}
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => console.log('Details clicked for booking:', booking.id)}
                      >
                        Details
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
