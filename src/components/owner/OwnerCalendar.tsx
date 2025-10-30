'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { serviceLabels } from '@/lib/types'
import { Badge } from '@/components/ui/badge'
import { Legend } from '@/components/owner/Legend'
import { toast } from 'sonner'

interface Props {
  ownerId?: string
}

export function OwnerCalendar({ ownerId }: Props) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [dayData, setDayData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)

  useEffect(() => {
    if (ownerId) {
      fetchCalendarData()
    }
  }, [ownerId, currentMonth])

  const fetchCalendarData = async () => {
    setLoading(true)
    try {
      const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
      const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
      
      const url = `/api/owner/calendar?from=${firstDay.toISOString()}&to=${lastDay.toISOString()}`
      
      const res = await fetch(url, {
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        }
      })
      
      if (res.ok) {
        const data = await res.json()
        setDayData(data.days || [])
      } else {
        const errorData = await res.json()
        toast.error('Fout bij ophalen kalenderdata: ' + (errorData.error || 'Onbekende fout'))
      }
    } catch (error) {
      console.error('Error fetching calendar data:', error)
      toast.error('Netwerkfout bij ophalen kalenderdata')
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

    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }

    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }

    return days
  }

  const handleDayClick = (date: Date, dayInfo: any) => {
    if (!dayInfo) {
      toast.info('Geen data beschikbaar voor deze dag')
      return
    }

    if (dayInfo.availableCaregivers.length > 0) {
      setSelectedDate(date)
    } else if (dayInfo.bookings.length > 0) {
      toast.info(`Je hebt al een boeking op deze dag`)
    } else if (dayInfo.isBlocked) {
      toast.info('Deze dag is geblokkeerd')
    } else {
      toast.info('Geen beschikbare verzorgers op deze dag')
    }
  }

  const days = getDaysInMonth()
  const monthName = currentMonth.toLocaleDateString('nl-NL', { month: 'long', year: 'numeric' })

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-gray-900 capitalize">{monthName}</h2>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}>
            ←
          </Button>
          <Button variant="outline" onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}>
            →
          </Button>
        </div>
      </div>

      <div className="mb-6">
        <Legend />
      </div>

      <div className="grid grid-cols-7 gap-2">
        {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map(day => (
          <div key={day} className="p-2 text-center text-sm font-semibold text-gray-500">
            {day}
          </div>
        ))}
        
        {days.map((date, index) => {
          if (!date) return <div key={`empty-${index}`} className="p-2" />
          
          const dateString = date.toISOString().split('T')[0]
          const dayInfo = dayData.find((d: any) => {
            const dayDate = typeof d.date === 'string' ? new Date(d.date) : d.date
            return dayDate.toISOString().split('T')[0] === dateString
          })

          const today = new Date()
          today.setHours(0, 0, 0, 0)
          const checkDate = new Date(date)
          checkDate.setHours(0, 0, 0, 0)
          const isPast = checkDate < today

          let bgColor = 'bg-gray-50'
          let borderColor = 'border-gray-200'
          let text = ''
          let cursor = 'cursor-pointer'

          if (isPast) {
            bgColor = 'bg-gray-100'
            borderColor = 'border-gray-300'
            cursor = 'cursor-not-allowed'
          } else if (dayInfo) {
            if (dayInfo.availableCaregivers.length > 0) {
              bgColor = 'bg-emerald-100'
              borderColor = 'border-emerald-400'
              text = `${dayInfo.availableCaregivers.length} beschikbaar`
            } else if (dayInfo.bookings.length > 0) {
              bgColor = 'bg-blue-100'
              borderColor = 'border-blue-400'
              text = 'Geboekt'
            } else if (dayInfo.isBlocked) {
              bgColor = 'bg-rose-100'
              borderColor = 'border-rose-400'
              text = 'Geblokkeerd'
              cursor = 'cursor-not-allowed'
            }
          }

          return (
            <div
              key={date.toISOString()}
              className={`p-2 border-2 rounded-lg ${bgColor} ${borderColor} ${cursor} hover:opacity-80 transition-opacity`}
              onClick={() => !isPast && dayInfo && handleDayClick(date, dayInfo)}
            >
              <div className="text-center">
                <div className="text-sm font-semibold">{date.getDate()}</div>
                {text && <div className="text-xs mt-1">{text}</div>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Caregiver Selection Modal */}
      {selectedDate && (
        <DayModal 
          date={selectedDate} 
          dayData={dayData} 
          onClose={() => setSelectedDate(null)} 
        />
      )}
    </div>
  )
}

// Separate modal component
function DayModal({ date, dayData, onClose }: { date: Date, dayData: any[], onClose: () => void }) {
  const dateString = date.toISOString().split('T')[0]
  const dayInfo = dayData.find((d: any) => {
    const dayDate = typeof d.date === 'string' ? new Date(d.date) : d.date
    return dayDate.toISOString().split('T')[0] === dateString
  })
  
  if (!dayInfo) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6">
          <p>Geen data beschikbaar</p>
          <Button onClick={onClose}>Sluiten</Button>
        </div>
      </div>
    )
  }

  if (dayInfo.availableCaregivers.length === 0) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-xl p-6">
          <p>Geen beschikbare verzorgers op deze dag</p>
          <Button onClick={onClose}>Sluiten</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50" onClick={onClose}>
      <div className="bg-white rounded-xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-gray-900">
            {date.toLocaleDateString('nl-NL', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </h3>
          <Button variant="outline" onClick={onClose}>
            ✕
          </Button>
        </div>

        <div className="space-y-3">
          {dayInfo.availableCaregivers.map((caregiver: any) => {
            console.log('Caregiver data in modal:', caregiver)
            return (
              <div key={caregiver.id} className="border border-gray-200 rounded-lg p-3 hover:bg-gray-50">
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium">{caregiver.name}</span>
                  <span className="text-sm font-semibold text-green-600">€{caregiver.pricePerHour}/uur</span>
                </div>
                <div className="text-sm text-gray-600 mb-3">
                  <p>{caregiver.city}</p>
                  <p className="mt-1">{caregiver.services.map((s: string) => serviceLabels[s as keyof typeof serviceLabels] || s).join(', ')}</p>
                  {caregiver.timeSlots && caregiver.timeSlots.length > 0 && (
                    <div className="mt-2">
                      <p className="font-medium text-gray-700 mb-1">Beschikbaar:</p>
                      <div className="flex flex-wrap gap-1">
                        {caregiver.timeSlots.map((slot: any, idx: number) => (
                          <Badge 
                            key={idx} 
                            variant="outline" 
                            className="text-xs bg-green-50 text-green-700 border-green-200"
                          >
                            {slot.start} - {slot.end}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
                <Button 
                  size="sm" 
                  className="w-full bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    console.log('Booking caregiver:', caregiver.id, 'date:', dateString)
                    window.location.href = `/booking/new?caregiver=${caregiver.id}&date=${dateString}&from=calendar`
                  }}
                >
                  Boek Nu
                </Button>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
