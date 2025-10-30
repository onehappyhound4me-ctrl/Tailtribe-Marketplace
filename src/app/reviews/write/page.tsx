'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

export default function WriteReviewPage() {
  const { data: session } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const caregiverId = searchParams?.get('caregiverId')
  const bookingId = searchParams?.get('bookingId')

  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!session) {
      toast.error('Je moet ingelogd zijn')
      router.push('/auth/signin')
      return
    }

    if (rating === 0) {
      toast.error('Selecteer een rating')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/reviews/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId,
          bookingId,
          rating,
          comment
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error)
      }

      toast.success('Review geplaatst!')
      router.push('/dashboard')
    } catch (error: any) {
      toast.error(error.message || 'Fout bij plaatsen review')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Schrijf Review</h1>
              <p className="text-gray-600">Deel je ervaring met deze verzorger</p>
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
      
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <div className="bg-white rounded-2xl shadow-md p-8">

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Star Rating */}
            <div>
              <label className="block text-sm font-medium mb-3">
                Hoe tevreden ben je?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRating(star)}
                    className={`text-4xl transition-all ${
                      star <= rating ? 'text-yellow-400' : 'text-gray-300'
                    } hover:scale-110`}
                  >
                    ⭐
                  </button>
                ))}
              </div>
              {rating > 0 && (
                <p className="text-sm text-gray-600 mt-2">
                  Je hebt {rating} {rating === 1 ? 'ster' : 'sterren'} gegeven
                </p>
              )}
            </div>

            {/* Comment */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Jouw ervaring (minimaal 10 karakters)
              </label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                required
                minLength={10}
                maxLength={200}
                rows={6}
                className="w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500"
                placeholder="Vertel over je ervaring met deze verzorger..."
              />
              <p className="text-xs text-gray-500 mt-1">
                {comment.length}/200 karakters
              </p>
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={loading || rating === 0}
              className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-4"
            >
              {loading ? 'Bezig...' : 'Review plaatsen'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}
