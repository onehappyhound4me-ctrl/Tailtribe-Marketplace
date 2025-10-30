'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { getAnimalTypeLabel } from '@/lib/animal-types'
import { OwnerInfoCard } from '@/components/dashboard/OwnerInfoCard'

interface Booking {
  id: string
  status: string
  startAt: string
  endAt: string
  amountCents: number
  petName: string
  petType: string
  petBreed: string
  specialInstructions: string
  offLeashAllowed: boolean
  emergencyContactName?: string
  emergencyContactPhone?: string
  veterinarianName?: string
  veterinarianPhone?: string
  veterinarianAddress?: string
  caregiverId: string
  caregiverProfileId: string | null
  ownerId: string
  caregiver: {
    name: string
    email: string
  }
  owner: {
    name: string
    email: string
  }
}

export default function BookingDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchBooking = async () => {
      try {
        const response = await fetch(`/api/bookings/${params.id}`)
        if (!response.ok) {
          throw new Error('Boeking niet gevonden')
        }
        const data = await response.json()
        setBooking(data.booking)
      } catch (err) {
        console.error('Fout bij ophalen boeking:', err)
        setError('Kon boeking niet laden')
      } finally {
        setLoading(false)
      }
    }

    fetchBooking()
  }, [params.id])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Boeking wordt geladen...</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardHeader>
            <CardTitle className="text-red-600">Fout</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-700 mb-4">{error || 'Boeking niet gevonden'}</p>
            <Button asChild>
              <Link href="/">Terug naar Homepagina</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const statusConfig: Record<string, { color: string; icon: string; label: string }> = {
    PENDING: { color: 'bg-yellow-100 text-yellow-800 border-yellow-300', icon: '🟡', label: 'In afwachting' },
    ACCEPTED: { color: 'bg-green-100 text-green-800 border-green-300', icon: '🟢', label: 'Geaccepteerd' },
    DECLINED: { color: 'bg-red-100 text-red-800 border-red-300', icon: '🔴', label: 'Afgewezen' },
    PAID: { color: 'bg-blue-100 text-blue-800 border-blue-300', icon: '💰', label: 'Betaald' },
    COMPLETED: { color: 'bg-emerald-100 text-emerald-800 border-emerald-300', icon: '✅', label: 'Voltooid' },
    CANCELLED: { color: 'bg-gray-100 text-gray-800 border-gray-300', icon: '❌', label: 'Geannuleerd' },
    REFUNDED: { color: 'bg-purple-100 text-purple-800 border-purple-300', icon: '💸', label: 'Terugbetaald' },
  }

  const status = statusConfig[booking.status as keyof typeof statusConfig] || statusConfig.PENDING

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="mb-6">
          <Button variant="outline" asChild>
            <Link href="/">← Terug naar Homepagina</Link>
          </Button>
        </div>

        <Card className="shadow-lg">
          <CardHeader className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white">
            <div className="flex items-center justify-between">
              <CardTitle className="text-2xl font-bold">Boekingsdetails</CardTitle>
              <div className={`px-4 py-2 rounded-lg border-2 font-semibold ${status.color}`}>
                {status.icon} {status.label}
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Caregiver Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-3">Verzorger</h3>
              <p className="text-lg font-semibold text-gray-800">{booking.caregiver.name}</p>
              <p className="text-sm text-gray-600">{booking.caregiver.email}</p>
            </div>

            {/* Booking Details */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-3">Boekingsinformatie</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Start:</span>
                  <span className="font-medium">{new Date(booking.startAt).toLocaleString('nl-NL')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Einde:</span>
                  <span className="font-medium">{new Date(booking.endAt).toLocaleString('nl-NL')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Totaal:</span>
                  <span className="font-bold text-emerald-600 text-lg">€{(booking.amountCents / 100).toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Pet Info */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="font-bold text-gray-900 mb-3">Huisdier</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Naam:</span>
                  <span className="font-medium">{booking.petName}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Type:</span>
                  <span className="font-medium">{getAnimalTypeLabel(booking.petType)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ras:</span>
                  <span className="font-medium">{booking.petBreed}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Mag los lopen:</span>
                  <span className="font-medium">{booking.offLeashAllowed ? '✅ Ja' : '❌ Nee'}</span>
                </div>
                {booking.specialInstructions && (
                  <div className="mt-2 pt-2 border-t border-gray-200">
                    <span className="text-gray-600 block mb-1">Speciale instructies:</span>
                    <p className="text-gray-800">{booking.specialInstructions}</p>
                  </div>
                )}
              </div>
            </div>

            {/* Emergency Contacts */}
            {(booking.emergencyContactName || booking.veterinarianName) && (
              <div className="bg-red-50 rounded-lg p-4 border border-red-200">
                <h3 className="font-bold text-red-900 mb-3">🚨 Noodcontacten</h3>
                <div className="space-y-3 text-sm">
                  {booking.emergencyContactName && (
                    <div>
                      <p className="font-semibold text-red-900">Noodcontact:</p>
                      <p className="text-red-800">{booking.emergencyContactName}</p>
                      {booking.emergencyContactPhone && (
                        <p className="text-red-800">{booking.emergencyContactPhone}</p>
                      )}
                    </div>
                  )}
                  {booking.veterinarianName && (
                    <div>
                      <p className="font-semibold text-red-900">Dierenarts:</p>
                      <p className="text-red-800">{booking.veterinarianName}</p>
                      {booking.veterinarianPhone && (
                        <p className="text-red-800">{booking.veterinarianPhone}</p>
                      )}
                      {booking.veterinarianAddress && (
                        <p className="text-red-800 text-xs">{booking.veterinarianAddress}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            {booking.status === 'COMPLETED' && (
              <div className="pt-4">
                <Button asChild className="w-full">
                  <Link href={`/reviews/${booking.id}`}>
                    ⭐ Schrijf Review
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Owner Information Card */}
        <div className="mt-6">
          <OwnerInfoCard bookingId={params.id} />
        </div>
      </div>
    </div>
  )
}

