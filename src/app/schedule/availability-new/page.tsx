'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardLink } from '@/components/common/DashboardLink'

interface TimeSlot {
  start: string
  end: string
  available: boolean
}

interface DaySchedule {
  available: boolean
  slots: TimeSlot[]
}

interface WeeklySchedule {
  monday: DaySchedule
  tuesday: DaySchedule
  wednesday: DaySchedule
  thursday: DaySchedule
  friday: DaySchedule
  saturday: DaySchedule
  sunday: DaySchedule
}

const DAYS = [
  { id: 'monday', name: 'Maandag', short: 'Ma', color: 'bg-blue-50 border-blue-200' },
  { id: 'tuesday', name: 'Dinsdag', short: 'Di', color: 'bg-green-50 border-green-200' },
  { id: 'wednesday', name: 'Woensdag', short: 'Wo', color: 'bg-purple-50 border-purple-200' },
  { id: 'thursday', name: 'Donderdag', short: 'Do', color: 'bg-orange-50 border-orange-200' },
  { id: 'friday', name: 'Vrijdag', short: 'Vr', color: 'bg-pink-50 border-pink-200' },
  { id: 'saturday', name: 'Zaterdag', short: 'Za', color: 'bg-teal-50 border-teal-200' },
  { id: 'sunday', name: 'Zondag', short: 'Zo', color: 'bg-red-50 border-red-200' }
]

const TIME_SLOTS = [
  { start: '06:00', end: '08:00', label: 'Vroeg (6-8u)' },
  { start: '08:00', end: '10:00', label: 'Ochtend (8-10u)' },
  { start: '10:00', end: '12:00', label: 'Late ochtend (10-12u)' },
  { start: '12:00', end: '14:00', label: 'Middag (12-14u)' },
  { start: '14:00', end: '16:00', label: 'Namiddag (14-16u)' },
  { start: '16:00', end: '18:00', label: 'Late namiddag (16-18u)' },
  { start: '18:00', end: '20:00', label: 'Avond (18-20u)' },
  { start: '20:00', end: '22:00', label: 'Late avond (20-22u)' }
]

export default function NewAvailabilityPage() {
  const [schedule, setSchedule] = useState<WeeklySchedule>({
    monday: { available: false, slots: [] },
    tuesday: { available: false, slots: [] },
    wednesday: { available: false, slots: [] },
    thursday: { available: false, slots: [] },
    friday: { available: false, slots: [] },
    saturday: { available: false, slots: [] },
    sunday: { available: false, slots: [] }
  })
  
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadSchedule()
  }, [])

  const loadSchedule = async () => {
    try {
      const response = await fetch('/api/availability')
      if (response.ok) {
        const data = await response.json()
        if (data.weeklyJson && typeof data.weeklyJson === 'object') {
          setSchedule(data.weeklyJson)
        }
      }
    } catch (error) {
      console.error('Error loading schedule:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleDayAvailability = (day: keyof WeeklySchedule) => {
    setSchedule(prev => ({
      ...prev,
      [day]: {
        ...(prev[day] || { available: false, slots: [] }),
        available: !(prev[day]?.available || false),
        slots: !(prev[day]?.available || false) ? [] : (prev[day]?.slots || [])
      }
    }))
  }

  const toggleTimeSlot = (day: keyof WeeklySchedule, timeSlot: typeof TIME_SLOTS[0]) => {
    setSchedule(prev => {
      const daySchedule = prev[day] || { available: false, slots: [] }
      const existingSlot = daySchedule.slots?.find(slot => slot.start === timeSlot.start)
      
      let newSlots
      if (existingSlot) {
        // Remove slot
        newSlots = (daySchedule.slots || []).filter(slot => slot.start !== timeSlot.start)
      } else {
        // Add slot
        newSlots = [...(daySchedule.slots || []), {
          start: timeSlot.start,
          end: timeSlot.end,
          available: true
        }]
      }
      
      return {
        ...prev,
        [day]: {
          ...daySchedule,
          available: newSlots.length > 0,
          slots: newSlots
        }
      }
    })
  }

  const copyToAllDays = (sourceDay: keyof WeeklySchedule) => {
    const sourceSchedule = schedule[sourceDay] || { available: false, slots: [] }
    setSchedule(prev => {
      const newSchedule = { ...prev }
      Object.keys(newSchedule).forEach(day => {
        if (day !== sourceDay) {
          newSchedule[day as keyof WeeklySchedule] = {
            available: sourceSchedule.available,
            slots: [...(sourceSchedule.slots || [])]
          }
        }
      })
      return newSchedule
    })
  }

  const saveSchedule = async () => {
    setSaving(true)
    try {
      const response = await fetch('/api/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ weeklyJson: schedule })
      })
      
      if (response.ok) {
        setSaved(true)
        setTimeout(() => setSaved(false), 3000)
      }
    } catch (error) {
      console.error('Error saving schedule:', error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Laden...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Beschikbaarheid instellen</h1>
              <p className="text-gray-600">Klik op tijdslots om je beschikbaarheid aan te geven</p>
            </div>
            <div className="flex items-center gap-4">
              <Link 
                href="/dashboard/caregiver/calendar" 
                className="px-4 py-2 text-emerald-600 hover:text-emerald-700 font-medium"
              >
                Bekijk agenda
              </Link>
              <DashboardLink className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 rounded-lg font-semibold">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
                </svg>
                Dashboard
              </DashboardLink>
            </div>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-8 py-8 max-w-7xl">
        {/* Quick Actions */}
        <div className="bg-white rounded-xl shadow-sm border p-6 mb-8">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Snelle acties</h2>
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => {
                // Set all days to available with common slots
                const commonSlots = [
                  { start: '08:00', end: '10:00', available: true },
                  { start: '10:00', end: '12:00', available: true },
                  { start: '14:00', end: '16:00', available: true },
                  { start: '16:00', end: '18:00', available: true }
                ]
                setSchedule(prev => {
                  const newSchedule = { ...prev }
                  Object.keys(newSchedule).forEach(day => {
                    newSchedule[day as keyof WeeklySchedule] = {
                      available: true,
                      slots: [...commonSlots]
                    }
                  })
                  return newSchedule
                })
              }}
              variant="outline"
              className="border-emerald-300 text-emerald-700 hover:bg-emerald-50"
            >
              🕒 Standaard werkdagen (8-18u)
            </Button>
            <Button
              onClick={() => {
                // Clear all availability
                setSchedule(prev => {
                  const newSchedule = { ...prev }
                  Object.keys(newSchedule).forEach(day => {
                    newSchedule[day as keyof WeeklySchedule] = {
                      available: false,
                      slots: []
                    }
                  })
                  return newSchedule
                })
              }}
              variant="outline"
              className="border-red-300 text-red-700 hover:bg-red-50"
            >
              🚫 Alles wissen
            </Button>
            <Button
              onClick={saveSchedule}
              disabled={saving}
              className="bg-emerald-600 hover:bg-emerald-700 text-white"
            >
              {saving ? 'Opslaan...' : saved ? '✓ Opgeslagen' : '💾 Opslaan'}
            </Button>
          </div>
        </div>

        {/* Weekly Schedule Grid */}
        <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-8 py-4">
            <h2 className="text-xl font-bold text-white">Wekelijks schema</h2>
            <p className="text-emerald-100">Klik op tijdslots om beschikbaarheid aan te geven</p>
          </div>

          <div className="p-8">
            <div className="grid grid-cols-1 lg:grid-cols-7 gap-6">
              {DAYS.map((day) => {
                const daySchedule = schedule[day.id as keyof WeeklySchedule]
                const isAvailable = daySchedule?.available || false
                
                return (
                  <div key={day.id} className={`border-2 rounded-xl p-6 ${day.color} ${
                    isAvailable ? 'border-emerald-300 bg-emerald-50' : 'border-gray-200'
                  }`}>
                    {/* Day Header */}
                    <div className="flex items-center justify-between mb-6">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{day.name}</h3>
                        <p className="text-sm text-gray-600">{day.short}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={isAvailable}
                          onChange={() => toggleDayAvailability(day.id as keyof WeeklySchedule)}
                          className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500"
                        />
                        <span className="text-sm font-medium text-gray-700">Actief</span>
                      </div>
                    </div>

                    {/* Time Slots */}
                    {isAvailable && (
                      <div className="space-y-3">
                        <p className="text-sm font-medium text-gray-700 mb-3">Beschikbare tijden:</p>
                        {TIME_SLOTS.map((timeSlot) => {
                          const isSelected = daySchedule.slots.some(slot => slot.start === timeSlot.start)
                          return (
                            <button
                              key={timeSlot.start}
                              onClick={() => toggleTimeSlot(day.id as keyof WeeklySchedule, timeSlot)}
                              className={`w-full p-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                                isSelected
                                  ? 'bg-emerald-500 text-white shadow-md'
                                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-emerald-50 hover:border-emerald-300'
                              }`}
                            >
                              {timeSlot.label}
                            </button>
                          )
                        })}
                      </div>
                    )}

                    {/* Copy Button */}
                    {isAvailable && daySchedule.slots.length > 0 && (
                      <button
                        onClick={() => copyToAllDays(day.id as keyof WeeklySchedule)}
                        className="mt-4 w-full text-xs text-emerald-600 hover:text-emerald-700 font-medium py-2 border border-emerald-200 rounded-lg hover:bg-emerald-50"
                      >
                        📋 Kopieer naar alle dagen
                      </button>
                    )}

                    {/* Status Badge */}
                    <div className="mt-4">
                      {isAvailable ? (
                        <Badge className="bg-emerald-100 text-emerald-800">
                          {daySchedule.slots.length} tijdslot{daySchedule.slots.length !== 1 ? 's' : ''}
                        </Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-600">
                          Niet beschikbaar
                        </Badge>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>

        {/* Summary */}
        <div className="mt-8 bg-white rounded-xl shadow-sm border p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Samenvatting</h3>
          <div className="grid grid-cols-1 md:grid-cols-7 gap-4">
            {DAYS.map((day) => {
              const daySchedule = schedule[day.id as keyof WeeklySchedule]
              return (
                <div key={day.id} className="text-center">
                  <p className="font-medium text-gray-900">{day.short}</p>
                  <p className="text-sm text-gray-600">
                    {daySchedule?.available 
                      ? `${daySchedule.slots.length} slot${daySchedule.slots.length !== 1 ? 's' : ''}`
                      : 'Niet actief'
                    }
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}




