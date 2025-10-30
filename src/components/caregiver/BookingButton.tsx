'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'

interface BookingButtonProps {
  caregiverId: string
  caregiverName: string
  hourlyRate: number
}

export function BookingButton({ caregiverId, caregiverName, hourlyRate }: BookingButtonProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    startDate: '',
    startTime: '',
    endDate: '',
    endTime: '',
    notes: ''
  })
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Combine date and time
      const startAt = new Date(`${formData.startDate}T${formData.startTime}`)
      const endAt = new Date(`${formData.endDate}T${formData.endTime}`)

      if (startAt >= endAt) {
        toast.error('Eindtijd moet na starttijd zijn')
        setLoading(false)
        return
      }

      const res = await fetch('/api/bookings/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId,
          startAt: startAt.toISOString(),
          endAt: endAt.toISOString(),
          service: 'DOG_WALKING',
          notes: formData.notes
        })
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Boeking mislukt')
      }

      toast.success('Boeking aangemaakt! De verzorger ontvangt een notificatie.')
      setIsOpen(false)
      router.push(`/booking/${data.booking.id}`)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message)
    } finally {
      setLoading(false)
    }
  }

  // Calculate estimated price (exact hours including partial hours)
  const calculatePrice = () => {
    if (!formData.startDate || !formData.startTime || !formData.endDate || !formData.endTime) {
      return null
    }
    const start = new Date(`${formData.startDate}T${formData.startTime}`)
    const end = new Date(`${formData.endDate}T${formData.endTime}`)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    return hours > 0 ? Math.round(hours * hourlyRate * 100) / 100 : null // Round to 2 decimal places
  }

  const price = calculatePrice()

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-6 text-lg"
      >
        Boek {caregiverName}
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl max-w-md w-full p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold">Boek {caregiverName}</h2>
          <button
            onClick={() => setIsOpen(false)}
            className="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Start Date/Time */}
          <div>
            <label className="block text-sm font-medium mb-2">Startdatum & tijd</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                required
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                min={new Date().toISOString().split('T')[0]}
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="time"
                required
                value={formData.startTime}
                onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* End Date/Time */}
          <div>
            <label className="block text-sm font-medium mb-2">Einddatum & tijd</label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="date"
                required
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                min={formData.startDate || new Date().toISOString().split('T')[0]}
                className="px-4 py-2 border rounded-lg"
              />
              <input
                type="time"
                required
                value={formData.endTime}
                onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                className="px-4 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-medium mb-2">Opmerkingen (optioneel)</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={3}
              className="w-full px-4 py-2 border rounded-lg"
              placeholder="Speciale verzoeken of informatie..."
            />
          </div>

          {/* Price Estimate */}
          {price && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Geschatte prijs:</span>
                <span className="text-2xl font-bold text-green-600">€{price}</span>
              </div>
              <p className="text-xs text-gray-500 mt-1">
                Gebaseerd op €{hourlyRate}/uur
              </p>
            </div>
          )}

          {/* Submit */}
          <Button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white font-semibold py-4"
          >
            {loading ? 'Bezig met boeken...' : 'Bevestig boeking'}
          </Button>

          <p className="text-xs text-gray-500 text-center">
            Je kunt betalen nadat de verzorger je boeking accepteert
          </p>
        </form>
      </div>
    </div>
  )
}




