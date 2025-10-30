'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { SmartSearchLink } from '@/components/common/SmartSearchLink'
import { toast } from 'sonner'

export default function ReviewPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [review, setReview] = useState('')
  const [submitted, setSubmitted] = useState(false)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [booking, setBooking] = useState<any>(null)

  useEffect(() => {
    fetchBooking()
  }, [])

  const fetchBooking = async () => {
    try {
      const response = await fetch(`/api/bookings/${params.id}`)
      if (!response.ok) {
        throw new Error('Kon boeking niet laden')
      }
      const data = await response.json()
      setBooking(data.booking)
    } catch (error) {
      console.error('Error fetching booking:', error)
      toast.error('Kon boeking niet laden')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async () => {
    if (rating > 0 && review.trim()) {
      setSaving(true)
      try {
        const response = await fetch('/api/reviews/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            bookingId: params.id,
            rating,
            comment: review
          })
        })

        if (!response.ok) {
          throw new Error('Kon review niet plaatsen')
        }

        setSubmitted(true)
        toast.success('Review succesvol geplaatst!')
        
        setTimeout(() => {
          router.push('/reviews')
        }, 2000)
      } catch (error) {
        console.error('Error submitting review:', error)
        toast.error('Er ging iets mis bij het plaatsen van de review')
      } finally {
        setSaving(false)
      }
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="text-center">
          <h2 className="text-2xl font-bold mb-4">Boeking niet gevonden</h2>
          <Link href="/bookings" className="text-blue-600 hover:underline">Terug naar boekingen</Link>
        </div>
      </div>
    )
  }

  const containerStyle = {
    minHeight: '100vh',
    background: '#f8fafc'
  }

  const headerStyle = {
    background: 'white',
    padding: '1rem 0',
    boxShadow: '0 2px 10px rgba(0,0,0,0.1)'
  }

  const navStyle = {
    maxWidth: '1200px',
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center'
  }

  const logoStyle = {
    fontSize: '1.8rem',
    fontWeight: '700',
    color: '#4f46e5',
    textDecoration: 'none'
  }

  const mainStyle = {
    maxWidth: '600px',
    margin: '0 auto',
    padding: '2rem'
  }

  const cardStyle = {
    background: 'white',
    padding: '2rem',
    borderRadius: '1rem',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)',
    marginBottom: '2rem'
  }

  const buttonStyle = {
    background: '#4f46e5',
    color: 'white',
    border: 'none',
    padding: '0.75rem 1.5rem',
    borderRadius: '0.5rem',
    fontWeight: '600',
    cursor: 'pointer',
    textDecoration: 'none',
    display: 'inline-block'
  }

  const starStyle = (filled: boolean, hover: boolean) => ({
    fontSize: '2rem',
    color: filled || hover ? '#f59e0b' : '#d1d5db',
    cursor: 'pointer',
    transition: 'color 0.2s',
    userSelect: 'none'
  })

  const StarIcon = ({ filled, hover }: { filled: boolean; hover: boolean }) => (
    <svg
      width="32"
      height="32"
      viewBox="0 0 24 24"
      fill={filled || hover ? '#f59e0b' : '#d1d5db'}
      style={{ transition: 'fill 0.2s' }}
    >
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
    </svg>
  )

  if (submitted) {
    return (
      <div style={containerStyle}>
        <header style={headerStyle}>
          <div style={navStyle}>
            <Link href="/" style={logoStyle}>Huisdierverzorging</Link>
          </div>
        </header>

        <div style={mainStyle}>
          <div style={cardStyle}>
            <div style={{textAlign: 'center'}}>
              <div style={{fontSize: '4rem', marginBottom: '1rem', color: '#10b981'}}>✓</div>
              <h2 style={{fontSize: '2rem', fontWeight: '700', color: '#10b981', marginBottom: '1rem'}}>
                Bedankt voor je Review!
              </h2>
              <p style={{color: '#6b7280', fontSize: '1.1rem', marginBottom: '2rem'}}>
                Je review helpt andere huisdiereigenaren bij het maken van de juiste keuze.
              </p>
              
              <div style={{
                background: '#f0fdf4',
                border: '1px solid #10b981',
                borderRadius: '0.5rem',
                padding: '1.5rem',
                marginBottom: '2rem',
                textAlign: 'left'
              }}>
                <h4 style={{fontWeight: '600', marginBottom: '1rem', color: '#10b981'}}>
                  Je Review
                </h4>
                <div style={{display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem'}}>
                  <div style={{display: 'flex', gap: '0.25rem'}}>
                    {[1, 2, 3, 4, 5].map((star) => (
                      <StarIcon key={star} filled={star <= rating} hover={false} />
                    ))}
                  </div>
                  <span style={{fontWeight: '600'}}>({rating}/5)</span>
                </div>
                <p style={{color: '#374151', lineHeight: '1.5'}}>
                  "{review}"
                </p>
              </div>

              <div style={{display: 'flex', gap: '1rem', justifyContent: 'center'}}>
                <Link href="/dashboard/owner" style={buttonStyle}>
                  Ga naar Homepage
                </Link>
                <Link
                  href="/search"
                  style={{
                    ...buttonStyle,
                    background: 'transparent',
                    color: '#4f46e5',
                    border: '2px solid #4f46e5'
                  }}
                >
                  Zoek Meer Oppassen
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div style={containerStyle}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-800">Review Schrijven</h1>
            <Link href="/dashboard/owner" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all duration-200 rounded-lg font-semibold shadow-md hover:shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div style={mainStyle}>
        {/* Booking Summary */}
        <div style={cardStyle}>
          <h2 style={{fontSize: '1.5rem', fontWeight: '600', marginBottom: '1.5rem'}}>
            Hoe was je ervaring?
          </h2>
          
          <div style={{
            background: '#f8fafc',
            padding: '1.5rem',
            borderRadius: '0.5rem',
            marginBottom: '2rem'
          }}>
            <div style={{display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1rem'}}>
              <div style={{
                width: '60px',
                height: '60px',
                borderRadius: '50%',
                background: '#e5e7eb',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.5rem',
                fontWeight: '600',
                color: '#6b7280'
              }}>
                {booking.caregiver.name.split(' ').map(n => n[0]).join('')}
              </div>
              <div>
                <h3 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '0.25rem'}}>
                  {booking.caregiver.name}
                </h3>
                <p style={{color: '#6b7280'}}>{booking.caregiver.city}</p>
              </div>
            </div>
            
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem'}}>
              <div>
                <span style={{color: '#6b7280'}}>Service:</span>
                <span style={{marginLeft: '0.5rem', fontWeight: '500'}}>{booking.service}</span>
              </div>
              <div>
                <span style={{color: '#6b7280'}}>Datum:</span>
                <span style={{marginLeft: '0.5rem', fontWeight: '500'}}>{booking.date}</span>
              </div>
              <div>
                <span style={{color: '#6b7280'}}>Huisdier:</span>
                <span style={{marginLeft: '0.5rem', fontWeight: '500'}}>{booking.pet}</span>
              </div>
              <div>
                <span style={{color: '#6b7280'}}>Duur:</span>
                <span style={{marginLeft: '0.5rem', fontWeight: '500'}}>{booking.duration}</span>
              </div>
            </div>
          </div>

          {/* Rating */}
          <div style={{marginBottom: '2rem'}}>
            <h3 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem'}}>
              Geef een beoordeling
            </h3>
            <div style={{display: 'flex', gap: '0.25rem', marginBottom: '0.5rem'}}>
              {[1, 2, 3, 4, 5].map((star) => (
                <div
                  key={star}
                  style={{cursor: 'pointer'}}
                  onClick={() => setRating(star)}
                  onMouseEnter={() => setHoverRating(star)}
                  onMouseLeave={() => setHoverRating(0)}
                >
                  <StarIcon filled={star <= rating} hover={star <= hoverRating} />
                </div>
              ))}
            </div>
            <p style={{color: '#6b7280', fontSize: '0.875rem'}}>
              Klik op de sterren om je beoordeling te geven
            </p>
          </div>

          {/* Written Review */}
          <div style={{marginBottom: '2rem'}}>
            <h3 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem'}}>
              Schrijf een review
            </h3>
            <textarea
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Vertel andere huisdiereigenaren over je ervaring met Emma. Wat ging goed? Zou je haar aanbevelen?"
              style={{
                width: '100%',
                minHeight: '120px',
                padding: '0.75rem',
                border: '1px solid #d1d5db',
                borderRadius: '0.5rem',
                resize: 'vertical',
                fontFamily: 'inherit',
                fontSize: '1rem',
                lineHeight: '1.5'
              }}
            />
            <p style={{color: '#6b7280', fontSize: '0.875rem', marginTop: '0.5rem'}}>
              Minimum 10 karakters • {review.length}/500
            </p>
          </div>

          {/* Quick Review Options */}
          <div style={{marginBottom: '2rem'}}>
            <h3 style={{fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem'}}>
              Wat viel op? (optioneel)
            </h3>
            <div style={{display: 'flex', flexWrap: 'wrap', gap: '0.5rem'}}>
              {[
                'Op tijd',
                'Goede communicatie',
                'Zorgzaam',
                'Professioneel',
                'Regelmatige updates',
                'Huisdier was blij',
                'Zou opnieuw boeken',
                'Betrouwbaar'
              ].map((tag) => (
                <button
                  key={tag}
                  style={{
                    background: '#e0e7ff',
                    color: '#4f46e5',
                    border: 'none',
                    padding: '0.5rem 1rem',
                    borderRadius: '1rem',
                    fontSize: '0.875rem',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onClick={() => {
                    if (!review.includes(tag)) {
                      setReview(prev => prev + (prev ? ' • ' : '') + tag)
                    }
                  }}
                >
                  {tag}
                </button>
              ))}
            </div>
          </div>

          {/* Submit */}
          <div style={{display: 'flex', justifyContent: 'center'}}>
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || review.length < 10}
              style={{
                ...buttonStyle,
                opacity: rating > 0 && review.length >= 10 ? 1 : 0.5,
                cursor: rating > 0 && review.length >= 10 ? 'pointer' : 'not-allowed',
                padding: '1rem 2rem',
                fontSize: '1.1rem',
                minWidth: '200px'
              }}
            >
              Review Plaatsen
            </button>
          </div>
        </div>

        {/* Privacy Notice */}
        <div style={{
          background: '#fefce8',
          border: '1px solid #f59e0b',
          borderRadius: '0.5rem',
          padding: '1rem',
          fontSize: '0.875rem',
          color: '#92400e'
        }}>
          <h4 style={{fontWeight: '600', marginBottom: '0.5rem'}}>
            Privacy & Veiligheid
          </h4>
          <p>
            Je review wordt publiek zichtbaar op Emma's profiel. Deel geen persoonlijke informatie zoals adressen, telefoonnummers of andere privégegevens.
          </p>
        </div>
      </div>
    </div>
  )
}

