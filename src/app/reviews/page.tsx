'use client'

import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Review {
  id: string
  rating: number
  comment: string
  createdAt: string
  author: {
    id: string
    name: string | null
    image: string | null
  }
  reviewee: {
    id: string
    name: string | null
  }
  authorRole: 'OWNER' | 'CAREGIVER'
  revieweeRole: 'OWNER' | 'CAREGIVER'
}

export default function ReviewsPage() {
  const { data: session } = useSession()
  const searchParams = useSearchParams()
  const router = useRouter()
  
  const tab = searchParams?.get('tab') || 'received'
  const isReceived = tab === 'received'
  
  const [reviews, setReviews] = useState<Review[]>([])
  const [loading, setLoading] = useState(true)
  
  useEffect(() => {
    const fetchReviews = async () => {
      if (!session?.user?.id) {
        setLoading(false)
        return
      }
      
      setLoading(true)
      try {
        const response = await fetch(`/api/reviews?userId=${session.user.id}&mode=${tab}`)
        
        if (response.ok) {
          const data = await response.json()
          setReviews(data.reviews || [])
        } else {
          toast.error('Kon reviews niet laden')
        }
      } catch (error) {
        console.error('Error fetching reviews:', error)
        toast.error('Kon reviews niet laden')
      } finally {
        setLoading(false)
      }
    }

    if (session?.user) {
      fetchReviews()
    }
  }, [session?.user?.id, tab, session?.user])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Reviews laden...</p>
        </div>
      </div>
    )
  }

  const dashboardLink = session?.user?.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner'

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      <header className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Recensies</h1>
              <p className="text-gray-600 mt-1">
                {isReceived 
                  ? 'Recensies die anderen over jou hebben geschreven' 
                  : 'Recensies die jij over anderen hebt geschreven'}
              </p>
            </div>
            <Link 
              href={dashboardLink} 
              className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white hover:from-emerald-700 hover:to-teal-700 transition-all rounded-lg font-semibold shadow-md hover:shadow-lg"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-8 py-8">
        <div className="flex gap-8">
          {/* Main content */}
          <div className="flex-1">
            {reviews.length === 0 ? (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-16 text-center">
                <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Nog geen recensies</h3>
                <p className="text-gray-600 max-w-md mx-auto">
                  {isReceived 
                    ? 'Je hebt nog geen recensies ontvangen van huisdiereigenaren.' 
                    : 'Je hebt nog geen recensies geschreven.'}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {reviews.map((review) => (
                  <div key={review.id} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 hover:shadow-md transition-shadow">
                    <div className="flex items-start gap-4">
                      {/* Avatar */}
                      <Link href={`/profile/${review.author.id}`}>
                        <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0 cursor-pointer hover:scale-105 transition-transform">
                          {review.author.image ? (
                            <img src={review.author.image} alt={review.author.name || 'User'} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            (review.author.name || 'U').charAt(0).toUpperCase()
                          )}
                        </div>
                      </Link>

                      {/* Content */}
                      <div className="flex-1">
                        <div className="flex items-start justify-between mb-2">
                          <div>
                            <h3 className="text-lg font-semibold text-gray-900 mb-1">
                              {review.rating === 5 ? 'Uitstekend!' : 
                               review.rating === 4 ? 'Zeer goed' : 
                               review.rating === 3 ? 'Goed' : 
                               review.rating === 2 ? 'Matig' : 'Teleurstellend'}
                            </h3>
                            <p className="text-sm font-medium text-gray-700 mb-2">
                              {review.author.name || 'Onbekend'}
                            </p>
                          </div>
                          <div className="flex items-center gap-1">
                            {[...Array(5)].map((_, i) => (
                              <svg
                                key={i}
                                className={`w-5 h-5 ${i < review.rating ? 'text-yellow-400 fill-current' : 'text-gray-300'}`}
                                fill="currentColor"
                                viewBox="0 0 20 20"
                              >
                                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                              </svg>
                            ))}
                          </div>
                        </div>
                        
                        <p className="text-gray-700 mb-3 leading-relaxed">{review.comment}</p>
                        
                        <p className="text-xs text-gray-500">
                          {new Date(review.createdAt).toLocaleDateString('nl-NL', { 
                            day: 'numeric', 
                            month: 'long', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right sidebar with buttons */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 sticky top-24">
              <h2 className="text-lg font-bold text-gray-900 mb-4">Filter</h2>
              
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  router.push('/reviews?tab=received')
                }}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all mb-3 flex items-center gap-3 ${
                  isReceived
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Ontvangen
              </button>

              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault()
                  e.stopPropagation()
                  router.push('/reviews?tab=given')
                }}
                className={`w-full text-left px-4 py-3 rounded-lg font-semibold transition-all flex items-center gap-3 ${
                  !isReceived
                    ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md'
                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                }`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                </svg>
                Gegeven
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
