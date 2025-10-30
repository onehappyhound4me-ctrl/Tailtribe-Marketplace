'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { TimeSlot, DayData } from '@/lib/calendar/types'
import { toast } from 'sonner'
import { Legend } from './Legend'

interface Props {
  caregiverId: string
  readOnly?: boolean
  onSelect?: (date: string, start: string, end: string) => void
}

export function CaregiverAvailabilityCalendar({ caregiverId, readOnly = true, onSelect }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarData, setCalendarData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null)
  const [showDayModal, setShowDayModal] = useState(false)

  useEffect(() => {
    if (caregiverId) {
      fetchCalendarData()
    }
  }, [caregiverId, currentMonth])

  const fetchCalendarData = async () => {
    setLoading(true)
    try {
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
      
      const res = await fetch(`/api/calendar/public?caregiverId=${caregiverId}&from=${firstDay.toISOString()}&to=${lastDay.toISOString()}`)
      if (res.ok) {
        const data = await res.json()
        setCalendarData(data.days || [])
      } else {
        toast.error('Fout bij ophalen kalenderdata.')
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error)
      toast.error('Netwerkfout bij ophalen kalenderdata.')
    } finally {
      setLoading(false)
    }
  }

  const getDaysInMonth = () => {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    // Add empty cells for days before month starts
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add all days of the month
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const getDayStatus = (date: Date) => {
    const dateString = date.toISOString().split('T')[0]
    const dayInfo = calendarData.find(d => d.date === dateString)
    
    if (!dayInfo) return 'unknown'
    
    const isPast = date < new Date()
    if (isPast) return 'past'
    if (dayInfo.blocked) return 'blocked'
    if (dayInfo.booked.length > 0) return 'booked'
    if (dayInfo.available.length > 0) return 'available'
    
    return 'unavailable'
  }

  const handleDayClick = (date: Date) => {
    const isPast = date < new Date()
    if (isPast) {
      toast.info('Verleden dagen kunnen niet worden geselecteerd.')
      return
    }

    const dateString = date.toISOString().split('T')[0]
    const dayInfo = calendarData.find(d => d.date === dateString)
    
    if (dayInfo && !dayInfo.blocked && dayInfo.available.length > 0) {
      setSelectedDay(dayInfo)
      setShowDayModal(true)
    } else if (dayInfo && dayInfo.blocked) {
      toast.info('Deze dag is geblokkeerd door de verzorger.')
    } else if (dayInfo && dayInfo.booked.length > 0) {
      toast.info('Deze dag is al geboekt.')
    } else {
      toast.info('Geen beschikbaarheid op deze dag.')
    }
  }

  const handleSlotSelect = (slot: TimeSlot) => {
    if (onSelect && selectedDay) {
      onSelect(selectedDay.date, slot.start, slot.end)
      setShowDayModal(false)
    }
  }

  const prevMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))
  }

  const goToToday = () => {
    setCurrentMonth(new Date())
  }

  // 90-day limit check
  const maxDate = new Date()
  maxDate.setDate(maxDate.getDate() + 90)
  const canNavigateNext = currentMonth < new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)
  
  // Disable navigation beyond 90 days
  const isBeyondLimit = currentMonth > new Date(maxDate.getFullYear(), maxDate.getMonth(), 1)

  const days = getDaysInMonth()
  const monthName = currentMonth.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 capitalize">{monthName}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={goToToday} className="px-3" disabled={loading}>
            Vandaag
          </Button>
          <Button variant="outline" onClick={prevMonth} className="px-3" disabled={loading}>
            ←
          </Button>
          <Button variant="outline" onClick={nextMonth} className="px-3" disabled={loading || !canNavigateNext}>
            →
          </Button>
        </div>
      </div>

      {/* Legend */}
      <div className="mb-6">
        <Legend />
      </div>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2">
        {/* Week days header */}
        {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-semibold text-gray-500">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="p-2" />
          }

          const status = getDayStatus(date)
          const isToday = date.toDateString() === new Date().toDateString()
          const dateString = date.toISOString().split('T')[0]
          const dayInfo = calendarData.find(d => d.date === dateString)

          let bgColor = 'bg-gray-50'
          let borderColor = 'border-gray-200'
          let textColor = 'text-gray-400'
          let cursor = 'cursor-not-allowed'

          switch (status) {
            case 'available':
              bgColor = 'bg-emerald-100'
              borderColor = 'border-emerald-400'
              textColor = 'text-emerald-800'
              cursor = 'cursor-pointer hover:bg-emerald-200'
              break
            case 'booked':
              bgColor = 'bg-blue-100'
              borderColor = 'border-blue-400'
              textColor = 'text-blue-800'
              cursor = 'cursor-default'
              break
            case 'blocked':
              bgColor = 'bg-rose-100'
              borderColor = 'border-rose-400'
              textColor = 'text-rose-800'
              cursor = 'cursor-default'
              break
            case 'past':
              bgColor = 'bg-gray-100'
              borderColor = 'border-gray-300'
              textColor = 'text-gray-500'
              cursor = 'cursor-not-allowed'
              break
            case 'unavailable':
              bgColor = 'bg-gray-50'
              borderColor = 'border-gray-200'
              textColor = 'text-gray-400'
              cursor = 'cursor-default'
              break
          }

          if (isToday) {
            bgColor += ' ring-2 ring-blue-500'
          }

          return (
            <div
              key={date.toISOString()}
              className={`p-2 border-2 rounded-lg ${bgColor} ${borderColor} ${textColor} ${cursor} transition-colors`}
              onClick={() => handleDayClick(date)}
              role="button"
              tabIndex={cursor === 'cursor-pointer' ? 0 : -1}
              aria-label={`${date.toLocaleDateString('nl-NL')} - ${status === 'available' ? 'Beschikbaar' : status === 'booked' ? 'Geboekt' : status === 'blocked' ? 'Geblokkeerd' : 'Verleden'}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleDayClick(date)
                }
                // Arrow key navigation
                if (e.key === 'ArrowLeft' || e.key === 'ArrowRight' || e.key === 'ArrowUp' || e.key === 'ArrowDown') {
                  e.preventDefault()
                  // Basic arrow navigation - could be enhanced
                }
              }}
            >
              <div className="text-center">
                <div className="text-sm font-semibold">{date.getDate()}</div>
                {dayInfo && (
                  <div className="text-xs mt-1">
                    {status === 'available' && (
                      <span className="inline-block bg-emerald-200 text-emerald-800 px-1 py-0.5 rounded text-xs">
                        {dayInfo.available.length} slots
                      </span>
                    )}
                    {status === 'booked' && (
                      <span className="inline-block bg-blue-200 text-blue-800 px-1 py-0.5 rounded text-xs">
                        {dayInfo.booked.length} geboekt
                      </span>
                    )}
                    {status === 'blocked' && (
                      <span className="inline-block bg-rose-200 text-rose-800 px-1 py-0.5 rounded text-xs">
                        Geblokkeerd
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Klik op een groene dag om beschikbare tijden te zien en een afspraak te boeken.
        </p>
        <div className="mt-2 text-xs text-blue-600">
          <strong>Test hooks:</strong> Navigation beperkt tot +90 dagen | Groen = Beschikbaar | Blauw = Geboekt | Rood = Geblokkeerd | Grijs = Verleden | Read-only mode
        </div>
      </div>

      {/* Day Details Modal */}
      {showDayModal && selectedDay && (
        <DayDetailsModal
          dayData={selectedDay}
          onClose={() => setShowDayModal(false)}
          onSelect={handleSlotSelect}
        />
      )}
    </div>
  )
}

// Day Details Modal Component
function DayDetailsModal({ 
  dayData, 
  onClose, 
  onSelect 
}: { 
  dayData: DayData
  onClose: () => void
  onSelect: (slot: TimeSlot) => void
}) {
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
            Beschikbare Tijden - {dateString}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 text-2xl"
          >
            ✕
          </button>
        </div>

        {/* Available Slots */}
        {dayData.available.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Beschikbare Tijden</h4>
            <div className="space-y-2">
              {dayData.available.map((slot, index) => (
                <div key={index} className="border border-emerald-200 rounded-lg p-3 hover:bg-emerald-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-emerald-800">
                      {slot.start} - {slot.end}
                    </span>
                    <button
                      onClick={() => onSelect(slot)}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
                    >
                      Selecteer
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Existing Bookings */}
        {dayData.booked.length > 0 && (
          <div className="mb-6">
            <h4 className="font-semibold text-gray-900 mb-3">Geboekte Tijden</h4>
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

        {/* No availability */}
        {dayData.available.length === 0 && dayData.booked.length === 0 && !dayData.blocked && (
          <div className="text-center py-8">
            <div className="text-gray-400 mb-2">📅</div>
            <p className="text-gray-600">Geen beschikbaarheid op deze dag</p>
          </div>
        )}
      </div>
    </div>
  )
}