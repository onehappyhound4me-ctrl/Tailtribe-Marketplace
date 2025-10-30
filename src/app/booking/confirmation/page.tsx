"use client"

import { Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

function BookingConfirmationContent() {
  const searchParams = useSearchParams()
  const total = searchParams.get('total')
  const caregiverName = searchParams.get('caregiver')

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Boeking Bevestigd</h1>
              <p className="text-gray-600">Je aanvraag is succesvol verstuurd</p>
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
      
      <div className="container mx-auto px-8 py-8 flex items-center justify-center">
        <div className="max-w-md w-full">
          <Card className="shadow-xl">
            <CardContent className="text-center p-8">
              <div className="w-20 h-20 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Verzoek verzonden!
              </h2>
              
              <p className="text-gray-600 mb-6">
                Je boekingsverzoek is verzonden naar <strong>{caregiverName}</strong>.
                {total && (
                  <> Het totaalbedrag is <strong>€{total}</strong>.</>
                )}
              </p>
              
              <div className="bg-blue-50 rounded-lg p-4 text-left mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Volgende stappen:</h3>
                <ul className="text-blue-800 text-sm space-y-1">
                  <li>• Je ontvangt een bevestigingsmail</li>
                  <li>• De verzorger reageert binnen 24 uur</li>
                  <li>• Bij acceptatie krijg je een betaallink</li>
                  <li>• Na betaling is je boeking definitief</li>
                </ul>
              </div>
              
              <Link href="/bookings" className="w-full inline-flex items-center justify-center px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 rounded-lg font-medium transition-all">
                Bekijk mijn boekingen
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default function BookingConfirmationPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Laden...</div>}>
      <BookingConfirmationContent />
    </Suspense>
  )
}

