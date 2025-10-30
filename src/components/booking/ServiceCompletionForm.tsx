'use client'

import { useState } from 'react'
import { toast } from 'sonner'

interface ServiceCompletionFormProps {
  bookingId: string
  onComplete?: () => void
}

export function ServiceCompletionForm({ bookingId, onComplete }: ServiceCompletionFormProps) {
  const [photos, setPhotos] = useState<string[]>([])
  const [notes, setNotes] = useState('')
  const [rating, setRating] = useState(5)
  const [submitting, setSubmitting] = useState(false)
  const [useGPS, setUseGPS] = useState(false)
  const [location, setLocation] = useState<string | null>(null)

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    // Convert to base64 (for demo - in production use proper image storage)
    const photoPromises = Array.from(files).map(file => {
      return new Promise<string>((resolve) => {
        const reader = new FileReader()
        reader.onloadend = () => resolve(reader.result as string)
        reader.readAsDataURL(file)
      })
    })

    const newPhotos = await Promise.all(photoPromises)
    setPhotos([...photos, ...newPhotos].slice(0, 5)) // Max 5 photos
    toast.success(`${newPhotos.length} foto(s) toegevoegd`)
  }

  const getGPSLocation = () => {
    if (!navigator.geolocation) {
      toast.error('GPS niet beschikbaar op dit apparaat')
      return
    }

    toast.info('GPS locatie ophalen...')
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const loc = `${position.coords.latitude},${position.coords.longitude}`
        setLocation(loc)
        toast.success('GPS locatie vastgelegd!')
      },
      (error) => {
        toast.error('Kon GPS locatie niet ophalen')
        console.error('GPS error:', error)
      }
    )
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch('/api/service-completion/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          photos,
          checkInLocation: location,
          checkOutLocation: location,
          notes,
          rating
        })
      })

      const data = await res.json()

      if (data.success) {
        toast.success('Service succesvol voltooid! 🎉')
        onComplete?.()
      } else {
        toast.error(data.error || 'Er ging iets mis')
      }
    } catch (error) {
      toast.error('Er ging iets mis')
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-xl font-bold text-gray-900 mb-6">Voltooi Service</h3>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Photo Upload */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Service Foto's (Optioneel)
          </label>
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-emerald-500 transition-colors">
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoUpload}
              className="hidden"
              id="photo-upload"
            />
            <label htmlFor="photo-upload" className="cursor-pointer">
              <div className="text-6xl mb-2">📸</div>
              <p className="text-gray-600 mb-1">Klik om foto's te uploaden</p>
              <p className="text-xs text-gray-500">Max 5 foto's</p>
            </label>
          </div>

          {photos.length > 0 && (
            <div className="grid grid-cols-3 gap-2 mt-4">
              {photos.map((photo, idx) => (
                <div key={idx} className="relative">
                  <img
                    src={photo}
                    alt={`Service foto ${idx + 1}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => setPhotos(photos.filter((_, i) => i !== idx))}
                    className="absolute top-1 right-1 w-6 h-6 bg-red-500 text-white rounded-full text-xs hover:bg-red-600"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* GPS Location */}
        <div className="bg-blue-50 rounded-lg p-4 border-2 border-blue-200">
          <div className="flex items-start gap-3">
            <input
              type="checkbox"
              id="gps-checkbox"
              checked={useGPS}
              onChange={(e) => {
                setUseGPS(e.target.checked)
                if (e.target.checked) {
                  getGPSLocation()
                }
              }}
              className="mt-1"
            />
            <div className="flex-1">
              <label htmlFor="gps-checkbox" className="font-semibold text-gray-900 cursor-pointer">
                📍 GPS Locatie Vastleggen
              </label>
              <p className="text-sm text-gray-600 mt-1">
                Optioneel: Leg je locatie vast als bewijs dat je ter plaatse was
              </p>
              {location && (
                <p className="text-xs text-green-600 mt-2">
                  ✅ Locatie vastgelegd
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Service Notes */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Service Notities (Optioneel)
          </label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={4}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            placeholder="Hoe is het gegaan? Bijzonderheden?"
          />
        </div>

        {/* Self Rating */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Hoe ging het? (Jouw inschatting)
          </label>
          <div className="flex gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                className="text-3xl"
              >
                {star <= rating ? '⭐' : '☆'}
              </button>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <div className="pt-4 border-t-2">
          <button
            type="submit"
            disabled={submitting}
            className="w-full px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white rounded-lg font-semibold shadow-lg hover:shadow-xl transition-all disabled:opacity-50"
          >
            {submitting ? 'Voltooien...' : '✅ Voltooi Service & Markeer als Klaar'}
          </button>
        </div>
      </form>

      <div className="mt-6 bg-yellow-50 border-2 border-yellow-200 rounded-lg p-4">
        <p className="text-sm text-gray-700">
          <strong>💡 Tip:</strong> Foto's en notities geven de eigenaar een goed gevoel 
          en verhogen de kans op een goede review en herhaalboeking!
        </p>
      </div>
    </div>
  )
}





