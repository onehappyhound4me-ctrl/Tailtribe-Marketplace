'use client'

import { useState } from 'react'

interface DateRangePickerProps {
  selectedDates: string[]
  onDatesChange: (dates: string[]) => void
  availability?: {
    days: string[] // ['MONDAY', 'TUESDAY', etc.]
    times: string[] // ['MORNING', 'AFTERNOON', 'EVENING']
    exactDailySlots?: Record<string, { start: string; end: string }[]> // 'YYYY-MM-DD': [{start,end}]
  }
  minDate?: Date
}

export function DateRangePicker({ 
  selectedDates, 
  onDatesChange, 
  availability,
  minDate = new Date()
}: DateRangePickerProps) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [hoveredDate, setHoveredDate] = useState<string | null>(null)

  const daysOfWeek = ['Zo', 'Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za']
  const monthNames = [
    'Januari', 'Februari', 'Maart', 'April', 'Mei', 'Juni',
    'Juli', 'Augustus', 'September', 'Oktober', 'November', 'December'
  ]

  const dayToNumber: Record<string, number> = {
    'SUNDAY': 0,
    'MONDAY': 1,
    'TUESDAY': 2,
    'WEDNESDAY': 3,
    'THURSDAY': 4,
    'FRIDAY': 5,
    'SATURDAY': 6,
    // Dutch abbreviations
    'ZO': 0,
    'MA': 1,
    'DI': 2,
    'WO': 3,
    'DO': 4,
    'VR': 5,
    'ZA': 6
  }

  // Get days in month
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days: (Date | null)[] = []

    // Add empty days for padding
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    // Add actual days
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const isDateAvailable = (date: Date) => {
    // If no availability data or no days specified, all days are available
    if (!availability || !availability.days || availability.days.length === 0) {
      return true
    }
    
    const dayOfWeek = date.getDay()
    
    // Map dayOfWeek to Dutch abbreviations
    const dayMapping = {
      0: 'ZO', // Sunday
      1: 'MA', // Monday
      2: 'DI', // Tuesday
      3: 'WO', // Wednesday
      4: 'DO', // Thursday
      5: 'VR', // Friday
      6: 'ZA'  // Saturday
    }
    
    const dutchDayName = dayMapping[dayOfWeek]
    
    return availability.days.includes(dutchDayName)
  }

  const isDateSelected = (date: Date) => {
    // Use consistent date string format
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth()+1).padStart(2,'0')
    const dd = String(date.getDate()).padStart(2,'0')
    const dateString = `${yyyy}-${mm}-${dd}`
    return selectedDates.includes(dateString)
  }

  const isDateDisabled = (date: Date) => {
    // Use UTC dates to avoid timezone issues
    const today = new Date()
    const todayUTC = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const checkDate = new Date(date.getFullYear(), date.getMonth(), date.getDate())
    
    // 90 days in the future limit
    const maxDate = new Date(todayUTC)
    maxDate.setDate(todayUTC.getDate() + 90)
    
    return checkDate < todayUTC || checkDate > maxDate || !isDateAvailable(date)
  }

  const toggleDate = (date: Date) => {
    if (isDateDisabled(date)) return

    // Use consistent date string format
    const yyyy = date.getFullYear()
    const mm = String(date.getMonth()+1).padStart(2,'0')
    const dd = String(date.getDate()).padStart(2,'0')
    const dateString = `${yyyy}-${mm}-${dd}`
    
    if (selectedDates.includes(dateString)) {
      onDatesChange(selectedDates.filter(d => d !== dateString))
    } else {
      onDatesChange([...selectedDates, dateString].sort())
    }
  }

  const goToPreviousMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))
  }

  const goToNextMonth = () => {
    setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))
  }

  const days = getDaysInMonth(currentMonth)

  return (
    <div className="bg-white rounded-lg border-2 border-gray-300 p-4">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          onClick={goToPreviousMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        
        <h3 className="text-lg font-bold text-gray-900">
          {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
        </h3>
        
        <button
          type="button"
          onClick={goToNextMonth}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      {/* Days of week */}
      <div className="grid grid-cols-7 gap-1 mb-2">
        {daysOfWeek.map(day => (
          <div key={day} className="text-center text-xs font-semibold text-gray-600 p-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar days */}
      <div className="grid grid-cols-7 gap-1">
        {days.map((date, index) => {
          if (!date) {
            return <div key={`empty-${index}`} className="p-2" />
          }

          const selected = isDateSelected(date)
          const disabled = isDateDisabled(date)
          const isToday = date.toDateString() === new Date().toDateString()
          
          // Check if it's a weekend day (Saturday = 6, Sunday = 0)
          const dayOfWeek = date.getDay()
          const isWeekend = dayOfWeek === 0 || dayOfWeek === 6

          // Use consistent date string format
          const yyyy = date.getFullYear()
          const mm = String(date.getMonth()+1).padStart(2,'0')
          const dd = String(date.getDate()).padStart(2,'0')
          const dateString = `${yyyy}-${mm}-${dd}`
          const isHovered = hoveredDate === dateString
          
          // Get available time slots for this specific day
          let availableSlots: string[] = []
          const key = dateString
          if (availability?.exactDailySlots && availability.exactDailySlots[key]) {
            availableSlots = availability.exactDailySlots[key].map(s => `${s.start}-${s.end}`)
          } else if (availability?.times) {
            availableSlots = availability.times
            if ((availability as any).daySpecific) {
              const dayOfWeek = date.getDay()
              const dayMapping = { 0: 'ZO', 1: 'MA', 2: 'DI', 3: 'WO', 4: 'DO', 5: 'VR', 6: 'ZA' }
              const dutchDayName = dayMapping[dayOfWeek]
              if ((availability as any).daySpecific[dutchDayName]) {
                availableSlots = (availability as any).daySpecific[dutchDayName]
              }
            }
          }

          // Human-friendly labels; if both AVOND and OCHTEND available, prefer showing Overnachting
          const friendly = (() => {
            const hasEvening = availableSlots.includes('AVOND')
            const hasMorning = availableSlots.includes('OCHTEND')
            const list: string[] = []
            // If exact slots exist, show exact slots
            if (availability?.exactDailySlots && availability.exactDailySlots[key] && availability.exactDailySlots[key].length > 0) {
              return availability.exactDailySlots[key].map(s => `${s.start}–${s.end}`)
            }
            if (availableSlots.includes('OVERDAG')) list.push('Overdag (09:00–17:00)')
            if (hasEvening && hasMorning) {
              list.push('Overnachting (22:00–06:00)')
            } else if (hasEvening) {
              list.push('Avond (17:00–22:00)')
            } else if (hasMorning) {
              list.push('Ochtend (06:00–12:00)')
            }
            return list
          })()

          // Check if date is actually available (has slots)
          const hasAvailability = friendly.length > 0
          
          return (
            <div key={date.toISOString()} className="relative">
              <button
                type="button"
                onClick={() => toggleDate(date)}
                disabled={disabled || !hasAvailability}
                onMouseEnter={() => setHoveredDate(dateString)}
                onMouseLeave={() => setHoveredDate(null)}
                className={`
                  p-2 text-sm rounded-lg transition-all w-full
                  ${disabled || !hasAvailability ? 'text-gray-400 cursor-not-allowed bg-gray-200 border border-gray-300' : 'hover:bg-emerald-200 cursor-pointer bg-emerald-100 border border-emerald-300'}
                  ${selected ? 'bg-emerald-500 text-white font-bold hover:bg-emerald-600 border-emerald-500' : 'text-gray-700'}
                  ${isToday && !selected && hasAvailability ? 'border-2 border-emerald-500' : ''}
                `}
              >
                {disabled || !hasAvailability ? '🚫' : date.getDate()}
              </button>
              
              {/* Tooltip with available times or weekend message */}
              {isHovered && !disabled && (friendly.length > 0 || (isWeekend && friendly.length === 0)) && (
                <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap z-10 shadow-lg">
                  {isWeekend && friendly.length === 0 ? (
                    <>
                      <div className="font-semibold">Weekend - niet beschikbaar</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </>
                  ) : (
                    <>
                      <div className="font-semibold mb-1">Beschikbaar:</div>
                      <div>{friendly.join(', ')}</div>
                      <div className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-transparent border-t-gray-900"></div>
                    </>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
        <p className="text-xs font-semibold text-gray-700 mb-2">📖 Legenda:</p>
        <div className="grid grid-cols-2 gap-3 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 text-white font-bold flex items-center justify-center shadow-sm"></div>
            <span className="text-gray-700 font-medium">Geselecteerd</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 border border-emerald-300 flex items-center justify-center text-gray-700"></div>
            <span className="text-gray-700 font-medium">Beschikbaar</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gray-200 border border-gray-300 flex items-center justify-center text-gray-400">🚫</div>
            <span className="text-gray-700 font-medium">Niet beschikbaar</span>
          </div>
        </div>
        <p className="text-xs text-gray-500 mt-2 italic">
          💡 Grijze dagen met 🚫 zijn in het verleden, meer dan 90 dagen vooruit, of geblokkeerd door de verzorger
        </p>
        <p className="text-xs text-gray-500 mt-1 italic">
          🖱️ Hover over een dag om beschikbare tijden te zien
        </p>
      </div>

      {/* Selected dates info */}
      {selectedDates.length > 0 && (
        <div className="mt-3 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
          <p className="text-sm font-semibold text-emerald-900 mb-1">
            ✅ {selectedDates.length} {selectedDates.length === 1 ? 'dag' : 'dagen'} geselecteerd
          </p>
          <p className="text-xs text-emerald-700">
            Klik op een datum om te selecteren/deselecteren
          </p>
        </div>
      )}
    </div>
  )
}

