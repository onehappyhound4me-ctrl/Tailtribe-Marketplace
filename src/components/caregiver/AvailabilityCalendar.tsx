'use client'

import React, { useState, useEffect, useRef, useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { TimeSlot, DayData } from '@/lib/calendar/types'
import { toast } from 'sonner'
import { Legend } from './Legend'
import { DayManagementModal } from './DayManagementModal'
import { DayHoverTooltip } from '@/components/common/DayHoverTooltip'
import { getMonthGrid, isIn90DayRange, isToday, isPast, formatDateForAriaLabel, toISOString } from '@/lib/calendar/dateUtils'
import '../../styles/calendar.css'

interface HoveredDay {
  anchorEl: HTMLElement
  date: Date
  segments: { available: TimeSlot[], booked: TimeSlot[], blocked: boolean, isPast: boolean, isWeekend?: boolean }
}

interface Props {
  caregiverId: string
  serviceId?: string
}

export function AvailabilityCalendar({ caregiverId, serviceId }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarData, setCalendarData] = useState<DayData[]>([])
  const [loading, setLoading] = useState(false)
  const [hoveredDay, setHoveredDay] = useState<HoveredDay | null>(null)
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  const [selectedDay, setSelectedDay] = useState<DayData | null>(null)
  const [showDayModal, setShowDayModal] = useState(false)

  const fetchCalendarData = useCallback(async () => {
    setLoading(true)
    try {
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
      
      const res = await fetch(`/api/calendar/caregiver?caregiverId=${caregiverId}&from=${firstDay.toISOString()}&to=${lastDay.toISOString()}${serviceId ? `&serviceId=${serviceId}` : ''}`)
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
  }, [caregiverId, currentMonth, serviceId])

  useEffect(() => {
    if (caregiverId) {
      fetchCalendarData()
    }
    // Cleanup on unmount or month change
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current)
      if (closeTimeoutRef.current) clearTimeout(closeTimeoutRef.current)
    }
  }, [caregiverId, fetchCalendarData])

  // Already handled by getMonthGrid

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
      toast.info('Verleden dagen kunnen niet worden bewerkt.')
      return
    }

    const dateString = date.toISOString().split('T')[0]
    const dayInfo = calendarData.find(d => d.date === dateString)
    
    setSelectedDay(dayInfo || {
      date: dateString,
      available: [],
      booked: [],
      blocked: false,
      isPast: false
    })
    setShowDayModal(true)
  }

  const handleGridMouseEnter = (e: React.MouseEvent<HTMLDivElement>) => {
    const el = (e.target as HTMLElement).closest('[data-date]') as HTMLElement
    if (!el) return
    
    const dateStr = el.getAttribute('data-date')!
    const inRange = el.getAttribute('data-inrange') === 'true'
    const date = new Date(dateStr)
    
    // Only show tooltip for in-range days that are not past
    if (!inRange || isPast(date)) return
    
    const dayInfo = calendarData.find(d => d.date === dateStr)
    
    // Check if it's a weekend day (Saturday = 6, Sunday = 0)
    const isWeekend = date.getDay() === 0 || date.getDay() === 6
    
    // Always provide segments, even if empty - including weekend flag in segments
    const segments = {
      available: dayInfo?.available || [],
      booked: dayInfo?.booked || [],
      blocked: dayInfo?.blocked || false,
      isPast: isPast(date),
      isWeekend: isWeekend
    }
    
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
      closeTimeoutRef.current = null
    }
    
    hoverTimeoutRef.current = setTimeout(() => {
      setHoveredDay({
        anchorEl: el,
        date,
        segments
      })
    }, 150)
  }

  const handleGridMouseLeave = (e: React.MouseEvent<HTMLDivElement>) => {
    // Check if we're leaving the grid entirely, not just moving to another cell
    const relatedTarget = e.relatedTarget as HTMLElement
    if (relatedTarget && e.currentTarget.contains(relatedTarget)) {
      return // Still within the grid
    }
    
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    
    closeTimeoutRef.current = setTimeout(() => {
      setHoveredDay(null)
    }, 100)
  }

  const handleTooltipClose = () => {
    if (closeTimeoutRef.current) {
      clearTimeout(closeTimeoutRef.current)
    }
    setHoveredDay(null)
  }

  const handleSaveAvailability = async (dayData: DayData) => {
    try {
      const res = await fetch('/api/calendar/availability', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          caregiverId,
          serviceId: serviceId || 'GENERAL', // Fallback for backward compatibility
          date: dayData.date,
          slots: dayData.available,
          blocked: dayData.blocked
        })
      })

      if (res.ok) {
        toast.success('Beschikbaarheid opgeslagen.')
        setShowDayModal(false)
        fetchCalendarData() // Refresh calendar
      } else {
        const error = await res.json()
        toast.error(error.message || 'Fout bij opslaan beschikbaarheid.')
      }
    } catch (error) {
      console.error('Error saving availability:', error)
      toast.error('Netwerkfout bij opslaan beschikbaarheid.')
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

  const monthGrid = getMonthGrid(currentMonth)
  const monthName = currentMonth.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 capitalize">{monthName}</h2>
        <div className="flex gap-2">
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
      <div 
        className="grid grid-cols-7 gap-2" 
        onMouseEnter={handleGridMouseEnter}
        onMouseLeave={handleGridMouseLeave}
      >
        {/* Week days header */}
        {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-semibold text-gray-500">
            {day}
          </div>
        ))}
        
        {/* Calendar days */}
        {monthGrid.map((row, rowIndex) => 
          row.map((date, colIndex) => {
            const status = getDayStatus(date)
            const isTodayDate = isToday(date)
            const dateStr = toISOString(date)
            const dayInfo = calendarData.find(d => d.date === dateStr)
            const inRange = isIn90DayRange(date)
            const isPastDate = isPast(date)

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
                cursor = 'cursor-pointer hover:bg-blue-200'
                break
              case 'blocked':
                bgColor = 'bg-rose-100'
                borderColor = 'border-rose-400'
                textColor = 'text-rose-800'
                cursor = 'cursor-not-allowed'
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
                cursor = 'cursor-pointer hover:bg-gray-100'
                break
            }

            if (isTodayDate) {
              bgColor += ' ring-2 ring-blue-500'
            }

            return (
              <button
                key={`${dateStr}-${rowIndex}-${colIndex}`}
                data-date={dateStr}
                data-inrange={inRange}
                className={`tt-day p-2 border-2 rounded-lg ${bgColor} ${borderColor} ${textColor} ${cursor} transition-colors`}
                onClick={() => handleDayClick(date)}
                disabled={isPastDate}
                aria-label={formatDateForAriaLabel(date, dayInfo?.available.length || 0, dayInfo?.booked.length || 0)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleDayClick(date)
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
              </button>
            )
          })
        )}
      </div>

      {/* Hover Tooltip */}
      {hoveredDay && (
        <DayHoverTooltip
          date={hoveredDay.date}
          segments={hoveredDay.segments}
          anchorEl={hoveredDay.anchorEl}
          onRequestClose={handleTooltipClose}
        />
      )}

      {/* Instructions */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <p className="text-sm text-blue-800">
          💡 <strong>Tip:</strong> Klik op een toekomstige datum om je beschikbaarheid te beheren. Voeg tijdslots toe of blokkeer de hele dag.
        </p>
        <div className="mt-2 text-xs text-blue-600">
          <strong>Navigatie:</strong> Beperkt tot +90 dagen | Groen = Beschikbaar | Blauw = Geboekt | Rood = Geblokkeerd | Grijs = Verleden
        </div>
      </div>

      {/* Day Management Modal */}
      {showDayModal && selectedDay && (
        <DayManagementModal
          dayData={selectedDay}
          onSave={handleSaveAvailability}
          onClose={() => setShowDayModal(false)}
        />
      )}
    </div>
  )
}