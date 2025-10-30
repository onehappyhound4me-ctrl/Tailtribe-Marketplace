"use client"

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { toast } from 'sonner'

function NewMessageContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const caregiverId = searchParams.get('caregiver')
  const from = searchParams.get('from')
  
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [caregiverLoading, setCaregiverLoading] = useState(true)
  const [caregiver, setCaregiver] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)
  
  // Determine back link and label
  const getBackInfo = () => {
    if (from === 'bookings') return { href: '/bookings', label: 'Boekingen', icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z' }
    if (from === 'search') return { href: '/search', label: 'Zoek Verzorgers', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' }
    if (from === 'profile') return { href: `/caregivers/${caregiverId}`, label: 'Terug naar profiel', icon: 'M10 19l-7-7m0 0l7-7m-7 7h18' }
    return { href: '/dashboard/caregiver', label: 'Dashboard', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' }
  }
  
  const backInfo = getBackInfo()

  // Fetch caregiver data
  useEffect(() => {
    const fetchCaregiver = async () => {
      if (!caregiverId) {
        setError('Geen verzorger geselecteerd')
        setCaregiverLoading(false)
        return
      }

      try {
        const response = await fetch(`/api/caregivers/${caregiverId}`)
        if (!response.ok) {
          throw new Error('Kon verzorger niet laden')
        }
        const data = await response.json()
        setCaregiver({
          id: data.id,
          name: data.name,
          city: data.city,
          photo: data.photo || data.photos?.[0] || '',
          rating: 4.5, // TODO: Calculate from reviews
          responseTime: 'Binnen 2 uur' // TODO: Get from profile
        })
      } catch (err) {
        console.error('Error fetching caregiver:', err)
        setError('Kon verzorger niet laden')
      } finally {
        setCaregiverLoading(false)
      }
    }

    fetchCaregiver()
  }, [caregiverId])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!message.trim()) {
      toast.error('Schrijf een bericht voordat je verzendt')
      return
    }

    setLoading(true)

    try {
      // In real app, this would call a server action
      // Message sent successfully: {
      //   caregiverId,
      //   message: message.trim()
      // }

      toast.success('Bericht verzonden! Je ontvangt een notificatie bij antwoord.')
      
      setTimeout(() => {
        router.push(backInfo.href)
      }, 1000)

    } catch (error: any) {
      toast.error(error.message || 'Er ging iets mis bij het versturen van je bericht')
    } finally {
      setLoading(false)
    }
  }

  // Show loading state
  if (caregiverLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Gegevens worden geladen...</p>
        </div>
      </div>
    )
  }

  // Show error state
  if (error || !caregiver) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Oeps!</h2>
          <p className="text-gray-600 mb-6">{error || 'Verzorger niet gevonden'}</p>
          <Link href="/search" className="inline-block px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 text-white font-semibold rounded-lg hover:from-emerald-600 hover:to-teal-700 transition-all">
            Terug naar zoeken
          </Link>
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
              <h1 className="text-2xl font-bold text-gray-800">Nieuw Bericht</h1>
              <p className="text-gray-600">Stuur een bericht naar {caregiver.name}</p>
            </div>
            <Link href={backInfo.href} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all duration-200 rounded-lg font-semibold shadow-md hover:shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={backInfo.icon} />
              </svg>
              {backInfo.label}
            </Link>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <Card>
            <CardHeader>
              <CardTitle>Bericht sturen</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Caregiver Info */}
              <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg mb-6">
                <img
                  src={caregiver.photo}
                  alt={caregiver.name}
                  className="w-12 h-12 rounded-full object-cover"
                />
                <div>
                  <h3 className="font-semibold text-gray-900">{caregiver.name}</h3>
                  <p className="text-gray-600 text-sm">📍 {caregiver.city}</p>
                  <p className="text-gray-600 text-sm">⏱️ {caregiver.responseTime}</p>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="message">Je bericht *</Label>
                  <Textarea
                    id="message"
                    placeholder="Hoi! Ik ben geïnteresseerd in je diensten. Kun je me vertellen..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    rows={6}
                    maxLength={1000}
                    required
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {message.length}/1000 karakters
                  </p>
                </div>

                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-medium text-blue-900 mb-2">💡 Tips voor een goed bericht:</h4>
                  <ul className="text-blue-800 text-sm space-y-1">
                    <li>• Vertel over je huisdier (naam, ras, leeftijd)</li>
                    <li>• Geef je gewenste data en tijden aan</li>
                    <li>• Vermeld speciale wensen of instructies</li>
                    <li>• Stel specifieke vragen over de service</li>
                  </ul>
                </div>

                <div className="flex gap-4 pt-2">
                  <Button type="button" variant="outline" className="px-6 py-3 font-semibold" asChild>
                    <Link href={backInfo.href}>
                      Annuleren
                    </Link>
                  </Button>
                  <Button type="submit" disabled={loading || !message.trim()} className="flex-1 py-3 font-semibold">
                    {loading ? 'Versturen...' : 'Versturen'}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Alternative Actions */}
          <div className="mt-6 text-center pb-12">
            <p className="text-gray-600 text-sm mb-4">
              Of boek direct een afspraak:
            </p>
            <Button variant="outline" className="py-3 px-6 font-semibold" asChild>
              <Link href={`/booking/new?caregiver=${caregiverId}`}>
                📅 Direct boeken
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function NewMessagePage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Laden...</div>}>
      <NewMessageContent />
    </Suspense>
  )
}

