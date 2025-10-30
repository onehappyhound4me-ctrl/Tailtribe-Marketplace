'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { toast } from 'sonner'

interface Booking {
  id: string
  startAt: string
  endAt: string
  status: string
  amountCents: number
  caregiver: { name: string }
  owner: { name: string }
}

export function BookingsList({ asCaregiver = false }: { asCaregiver?: boolean }) {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const pathname = usePathname()
  const [searchHref, setSearchHref] = useState('/search')
  
  useEffect(() => {
    // Detect if user is on NL site
    if (pathname?.startsWith('/nl')) {
      setSearchHref('/nl/search')
    } else if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('userCountry')
      setSearchHref(saved === 'NL' ? '/nl/search' : '/search')
    }
  }, [pathname])

  useEffect(() => {
    fetchBookings()
  }, [])

  const fetchBookings = async () => {
    try {
      const res = await fetch(`/api/bookings/create?asCaregiver=${asCaregiver}`)
      const data = await res.json()
      setBookings(data.bookings || [])
    } catch (error) {
      toast.error('Kon boekingen niet laden')
    } finally {
      setLoading(false)
    }
  }

  const handleStatusUpdate = async (bookingId: string, status: 'ACCEPTED' | 'DECLINED') => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status })
      })

      if (!res.ok) throw new Error()

      toast.success(`Boeking ${status === 'ACCEPTED' ? 'geaccepteerd' : 'afgewezen'}`)
      fetchBookings()
    } catch (error) {
      toast.error('Fout bij bijwerken')
    }
  }

  if (loading) {
    return <div className="text-center py-8">Laden...</div>
  }

  if (bookings.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-xl">
        <p className="text-gray-600">Geen boekingen gevonden</p>
        {!asCaregiver && (
          <Link href={searchHref} className="text-green-600 hover:underline mt-2 inline-block">
            Zoek verzorgers
          </Link>
        )}
      </div>
    )
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800'
      case 'ACCEPTED': return 'bg-blue-100 text-blue-800'
      case 'PAID': return 'bg-green-100 text-green-800'
      case 'COMPLETED': return 'bg-purple-100 text-purple-800'
      case 'DECLINED': return 'bg-red-100 text-red-800'
      case 'CANCELLED': return 'bg-gray-100 text-gray-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    const labels: Record<string, string> = {
      PENDING: 'In afwachting',
      ACCEPTED: 'Geaccepteerd',
      PAID: 'Betaald',
      COMPLETED: 'Voltooid',
      DECLINED: 'Afgewezen',
      CANCELLED: 'Geannuleerd'
    }
    return labels[status] || status
  }

  return (
    <div className="space-y-4">
      {bookings.map((booking) => (
        <div key={booking.id} className="bg-white rounded-xl shadow-md p-6 border border-gray-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="font-bold text-lg">
                {asCaregiver ? booking.owner.name : booking.caregiver.name}
              </h3>
              <p className="text-sm text-gray-600">
                {new Date(booking.startAt).toLocaleDateString('nl-BE', {
                  day: 'numeric',
                  month: 'long',
                  year: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusColor(booking.status)}`}>
              {getStatusText(booking.status)}
            </span>
          </div>

          <div className="flex items-center justify-between">
            <div className="text-xl font-bold text-green-600">
              €{(booking.amountCents / 100).toFixed(2)}
            </div>
            <div className="flex gap-2">
              {asCaregiver && booking.status === 'PENDING' && (
                <>
                  <button
                    onClick={() => handleStatusUpdate(booking.id, 'ACCEPTED')}
                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                  >
                    Accepteren
                  </button>
                  <button
                    onClick={() => handleStatusUpdate(booking.id, 'DECLINED')}
                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Afwijzen
                  </button>
                </>
              )}
              <Link
                href={`/booking/${booking.id}`}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Details
              </Link>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}




