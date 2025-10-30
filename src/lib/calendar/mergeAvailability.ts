import { DayData, TimeSlot } from './types'

interface AvailabilitySlot {
  startTimeMin: number
  endTimeMin: number
  blocked: boolean
}

interface Booking {
  startAt: Date
  endAt: Date
}

export function mergeAvailability(
  availabilitySlots: AvailabilitySlot[],
  bookings: Booking[],
  date: string
): DayData {
  const dayBookings = bookings.filter(booking => {
    const bookingDate = booking.startAt.toISOString().split('T')[0]
    return bookingDate === date
  })

  // Convert availability slots to TimeSlot format
  const available: TimeSlot[] = availabilitySlots
    .filter(slot => !slot.blocked)
    .map(slot => ({
      start: minutesToTime(slot.startTimeMin),
      end: minutesToTime(slot.endTimeMin)
    }))

  // Convert bookings to TimeSlot format
  const booked: TimeSlot[] = dayBookings.map(booking => ({
    start: booking.startAt.toLocaleTimeString('nl-NL', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    }),
    end: booking.endAt.toLocaleTimeString('nl-NL', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: false 
    })
  }))

  // Check if day is blocked
  const blocked = availabilitySlots.some(slot => slot.blocked)

  return {
    date,
    available,
    booked,
    blocked,
    isPast: new Date(date) < new Date()
  }
}

function minutesToTime(minutes: number): string {
  const hours = Math.floor(minutes / 60)
  const mins = minutes % 60
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`
}
