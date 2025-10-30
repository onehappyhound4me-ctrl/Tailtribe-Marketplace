"use client"

import Link from 'next/link'
import { Suspense } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { DashboardLink } from '@/components/common/DashboardLink'

function BookingsPageContent() {
  const searchParams = useSearchParams()
  const { data: session, status } = useSession()
  const role = searchParams.get('role') || 'owner'
  const bookings = [
    {
      id: 1,
      service: 'Hondenuitlaat',
      caregiver: 'Emma Willems',
      caregiverId: 1,
      pet: 'Max',
      date: '25 Jan 2025',
      time: '14:00 - 15:00',
      status: 'Bevestigd',
      price: '€15'
    },
    {
      id: 2,
      service: 'Dierenoppas',
      caregiver: 'Tom Janssen',
      caregiverId: 2,
      pet: 'Luna',
      date: '28 Jan 2025',
      time: '10:00 - 18:00',
      status: 'In afwachting',
      price: '€120'
    },
    {
      id: 3,
      service: 'Hondentraining',
      caregiver: 'Sarah De Vries',
      caregiverId: 3,
      pet: 'Max',
      date: '22 Jan 2025',
      time: '16:00 - 17:00',
      status: 'Voltooid',
      price: '€25'
    }
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Bevestigd': return 'bg-green-100 text-green-800'
      case 'In afwachting': return 'bg-yellow-100 text-yellow-800'
      case 'Voltooid': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Boekingen</h1>
              <p className="text-gray-600">Overzicht van alle reserveringen en afspraken</p>
            </div>
            {status === 'loading' ? (
              <div className="h-10 w-32 bg-gray-200 animate-pulse rounded-lg"></div>
            ) : (
              <DashboardLink className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all duration-200 rounded-lg font-semibold shadow-md hover:shadow-lg self-start">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </DashboardLink>
            )}
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-8 py-8">

        <div className="grid grid-cols-1 gap-6">
          {bookings.map(booking => (
            <div key={booking.id} className="backdrop-blur-xl bg-gradient-to-br from-white/25 via-blue-50/25 to-purple-50/25 border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-800">{booking.service}</h3>
                    <p className="text-gray-600">Verzorger: {booking.caregiver}</p>
                    <p className="text-sm text-gray-500">Huisdier: {booking.pet}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <Badge className={getStatusColor(booking.status)}>
                    {booking.status}
                  </Badge>
                  <div className="mt-2">
                    <p className="font-semibold text-gray-800">{booking.date}</p>
                    <p className="text-gray-600 text-sm">{booking.time}</p>
                    <p className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">{booking.price}</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-6 flex space-x-3">
                <Link href={`/bookings/${booking.id}`} className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 transition-all duration-300 rounded-lg py-2 px-4 text-sm font-medium">
                  Details bekijken
                </Link>
                <Link href={`/messages/new?caregiver=${booking.caregiverId}&from=bookings`} className="bg-white/70 text-gray-700 hover:bg-white/90 transition-all duration-300 rounded-lg py-2 px-4 text-sm font-medium border border-gray-300">
                  Contact verzorger
                </Link>
                {booking.status === 'Voltooid' && (
                  <Link href={`/reviews/write?booking=${booking.id}`} className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 rounded-lg py-2 px-4 text-sm font-medium">
                    Review schrijven
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* System Overview */}
        <div className="mt-16 mb-16">
          <div className="backdrop-blur-xl bg-gradient-to-r from-white/30 via-emerald-50/30 to-teal-50/30 border border-white/40 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Boekingen Analyse</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">3</div>
                <div className="text-xs text-gray-600 font-medium">Totaal aantal boekingen</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">1</div>
                <div className="text-xs text-gray-600 font-medium">In afwachting</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">4.9</div>
                <div className="text-xs text-gray-600 font-medium">Gem. beoordeling</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function BookingsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Laden...</div>}>
      <BookingsPageContent />
    </Suspense>
  )
}

