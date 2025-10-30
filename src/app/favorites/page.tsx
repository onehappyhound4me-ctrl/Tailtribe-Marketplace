'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { EmptyState } from '@/components/common/EmptyState'

export default function FavoritesPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const [favorites, setFavorites] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (session?.user?.role !== 'OWNER') {
      router.push('/dashboard')
      return
    }
    fetchFavorites()
  }, [session])

  const fetchFavorites = async () => {
    try {
      const res = await fetch('/api/favorites')
      if (res.ok) {
        const data = await res.json()
        setFavorites(data.favorites || [])
      }
    } catch (error) {
      console.error('Error fetching favorites:', error)
    } finally {
      setLoading(false)
    }
  }

  const removeFavorite = async (caregiverId: string) => {
    try {
      const res = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ caregiverId })
      })

      if (!res.ok) throw new Error()

      toast.success('Verwijderd uit favorieten')
      fetchFavorites()
    } catch (error) {
      toast.error('Er ging iets mis')
    }
  }

  if (session?.user?.role !== 'OWNER') {
    return null
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Mijn Favorieten</h1>
              <p className="text-sm text-gray-600">Jouw opgeslagen verzorgers</p>
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

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-6xl">
        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-4 border-emerald-600 border-t-transparent mx-auto mb-4"></div>
            <p className="text-gray-600">Laden...</p>
          </div>
        ) : favorites.length === 0 ? (
          <div className="bg-white rounded-xl shadow-lg p-12">
            <EmptyState
              icon="⭐"
              title="Geen favorieten"
              description="Je hebt nog geen verzorgers opgeslagen. Voeg je favoriete verzorgers toe om ze snel terug te vinden!"
              actionLabel="Zoek Verzorgers"
              actionHref="/search"
            />
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {favorites.map((fav) => {
              const caregiver = fav.caregiver
              if (!caregiver) return null

              const avgRating = caregiver.reviews?.length > 0
                ? caregiver.reviews.reduce((sum: number, r: any) => sum + r.rating, 0) / caregiver.reviews.length
                : 0

              return (
                <div key={fav.id} className="bg-white rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-all">
                  <div className="p-6">
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-14 h-14 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl">
                        {caregiver.user.name?.charAt(0) || 'V'}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-bold text-gray-900 text-lg">{caregiver.user.name}</h3>
                        <p className="text-sm text-gray-600">📍 {caregiver.city}</p>
                        {avgRating > 0 && (
                          <div className="flex items-center gap-1 mt-1">
                            <span className="text-yellow-400">⭐</span>
                            <span className="text-sm font-medium">{avgRating.toFixed(1)}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-emerald-600">€{caregiver.hourlyRate}</p>
                        <p className="text-xs text-gray-500">per uur</p>
                      </div>
                    </div>

                    {caregiver.bio && (
                      <p className="text-sm text-gray-600 line-clamp-2 mb-4">{caregiver.bio}</p>
                    )}

                    <div className="grid grid-cols-2 gap-2">
                      <Button asChild size="sm" className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
                        <Link href={`/caregivers/${caregiver.id}`}>
                          Bekijk Profiel
                        </Link>
                      </Button>
                      <Button asChild size="sm" variant="outline">
                        <Link href={`/booking/new?caregiver=${caregiver.id}`}>
                          Boek Nu
                        </Link>
                      </Button>
                    </div>

                    <Button
                      onClick={() => removeFavorite(caregiver.id)}
                      variant="ghost"
                      size="sm"
                      className="w-full mt-2 text-red-600 hover:text-red-700 hover:bg-red-50"
                    >
                      ❤️ Verwijder uit favorieten
                    </Button>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}





