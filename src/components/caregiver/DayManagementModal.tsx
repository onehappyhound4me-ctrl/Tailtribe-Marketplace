'use client'

import React, { useState } from 'react'
import { Button } from '@/components/ui/button'
import { DayData, TimeSlot } from '@/lib/calendar/types'
import { toast } from 'sonner'

interface Props {
  dayData: DayData
  onSave: (dayData: DayData) => void
  onClose: () => void
}

export function DayManagementModal({ dayData, onSave, onClose }: Props) {
  const [slots, setSlots] = useState<TimeSlot[]>(dayData.available || [])
  const [blocked, setBlocked] = useState(dayData.blocked || false)
  const [loading, setLoading] = useState(false)

  const addSlot = () => {
    setSlots([...slots, { start: '09:00', end: '17:00' }])
  }

  const removeSlot = (index: number) => {
    setSlots(slots.filter((_, i) => i !== index))
  }

  const updateSlot = (index: number, field: 'start' | 'end', value: string) => {
    const newSlots = [...slots]
    newSlots[index] = { ...newSlots[index], [field]: value }
    setSlots(newSlots)
  }

  const validateSlots = () => {
    for (const slot of slots) {
      if (slot.start >= slot.end) {
        return 'Start tijd moet voor eind tijd liggen.'
      }
      
      // Check for overlaps
      for (const otherSlot of slots) {
        if (slot !== otherSlot) {
          if ((slot.start < otherSlot.end && slot.end > otherSlot.start)) {
            return 'Tijdslots mogen niet overlappen.'
          }
        }
      }
    }
    return null
  }

  const checkBookingConflicts = () => {
    // Check if any new slots conflict with existing bookings
    for (const slot of slots) {
      for (const booking of dayData.booked) {
        if ((slot.start < booking.end && slot.end > booking.start)) {
          return `Conflicteert met bestaande boeking: ${booking.start}-${booking.end}`
        }
      }
    }
    return null
  }

  const handleSave = async () => {
    if (blocked) {
      onSave({
        ...dayData,
        blocked: true,
        available: []
      })
      return
    }

    const validationError = validateSlots()
    if (validationError) {
      toast.error(validationError)
      return
    }

    const bookingConflict = checkBookingConflicts()
    if (bookingConflict) {
      toast.error(bookingConflict)
      return
    }

    setLoading(true)
    try {
      onSave({
        ...dayData,
        available: slots,
        blocked: false
      })
      toast.success('Beschikbaarheid opgeslagen.')
    } catch (error) {
      toast.error('Fout bij opslaan beschikbaarheid.')
    } finally {
      setLoading(false)
    }
  }

  const date = new Date(dayData.date)
  const dateString = date.toLocaleDateString('nl-NL', { 
    weekday: 'long', 
    day: 'numeric', 
    month: 'long', 
    year: 'numeric' 
  })

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            Beschikbaarheid beheren - {dateString}
          </h3>
          <Button variant="outline" onClick={onClose}>
            ✕
          </Button>
        </div>

        {/* Block Day Toggle */}
        <div className="mb-6">
          <label className="flex items-center gap-3">
            <input
              type="checkbox"
              checked={blocked}
              onChange={(e) => setBlocked(e.target.checked)}
              className="w-4 h-4 text-red-600 border-gray-300 rounded focus:ring-red-500"
            />
            <span className="text-sm font-medium text-gray-700">
              Dag blokkeren (geen beschikbaarheid)
            </span>
          </label>
        </div>

        {/* Time Slots */}
        {!blocked && (
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h4 className="font-semibold text-gray-900">Tijdslots</h4>
              <Button size="sm" onClick={addSlot} className="bg-emerald-600 hover:bg-emerald-700">
                + Voeg slot toe
              </Button>
            </div>

            <div className="space-y-3">
              {slots.map((slot, index) => (
                <div key={index} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Van:</label>
                    <input
                      type="time"
                      value={slot.start}
                      onChange={(e) => updateSlot(index, 'start', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <label className="text-sm text-gray-600">Tot:</label>
                    <input
                      type="time"
                      value={slot.end}
                      onChange={(e) => updateSlot(index, 'end', e.target.value)}
                      className="border border-gray-300 rounded px-2 py-1 text-sm"
                    />
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => removeSlot(index)}
                    className="text-red-600 border-red-300 hover:bg-red-50"
                  >
                    Verwijder
                  </Button>
                </div>
              ))}

              {slots.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <p>Geen tijdslots toegevoegd</p>
                  <p className="text-sm">Klik op "Voeg slot toe" om beschikbaarheid in te stellen</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Existing Bookings */}
        {dayData.booked.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Bestaande Boekingen</h4>
            <div className="space-y-2">
              {dayData.booked.map((booking, index) => (
                <div key={index} className="border border-blue-200 rounded-lg p-3 bg-blue-50">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-blue-800">
                      {booking.start} - {booking.end}
                    </span>
                    <span className="text-sm text-blue-600 bg-blue-100 px-2 py-1 rounded">
                      Geboekt
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-end gap-3">
          <Button variant="outline" onClick={onClose} disabled={loading}>
            Annuleren
          </Button>
          <Button 
            onClick={handleSave} 
            disabled={loading}
            className="bg-emerald-600 hover:bg-emerald-700"
          >
            {loading ? 'Opslaan...' : 'Opslaan'}
          </Button>
        </div>
      </div>
    </div>
  )
}