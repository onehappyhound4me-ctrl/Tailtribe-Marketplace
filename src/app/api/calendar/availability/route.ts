import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { TimeSlot } from '@/lib/calendar/types'

// Helper to convert "HH:MM" to minutes
const timeToMinutes = (time: string): number => {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user || session.user.role !== 'CAREGIVER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { caregiverId, date, slots, blocked, serviceId } = await request.json() as {
      caregiverId: string
      date: string
      slots: TimeSlot[]
      blocked: boolean
      serviceId?: string
    }

    // Use 'GENERAL' as default serviceId if not provided (for backward compatibility)
    const finalServiceId = serviceId || 'GENERAL'

    if (caregiverId !== session.user.id) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const targetDate = new Date(date)
    targetDate.setHours(0, 0, 0, 0) // Normalize to start of day

    const today = new Date()
    today.setHours(0, 0, 0, 0)
    const ninetyDaysFromNow = new Date()
    ninetyDaysFromNow.setDate(ninetyDaysFromNow.getDate() + 90)
    ninetyDaysFromNow.setHours(0, 0, 0, 0)

    if (targetDate < today || targetDate > ninetyDaysFromNow) {
      return NextResponse.json({ error: 'Buiten toegestane periode (90 dagen).' }, { status: 400 })
    }

    // Check for conflicts with existing bookings
    const existingBookings = await db.booking.findMany({
      where: {
        caregiverId: caregiverId,
        startAt: {
          gte: targetDate,
          lt: new Date(targetDate.getTime() + 24 * 60 * 60 * 1000) // Up to end of day
        },
        status: {
          not: 'CANCELLED'
        }
      }
    })

    for (const slot of slots) {
      const slotStartMin = timeToMinutes(slot.start)
      const slotEndMin = timeToMinutes(slot.end)

      if (slotEndMin <= slotStartMin) {
        return NextResponse.json({ error: 'Ongeldig tijdsbereik.' }, { status: 400 })
      }

      for (const booking of existingBookings) {
        const bookingStartMin = timeToMinutes(new Date(booking.startAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Brussels' }))
        const bookingEndMin = timeToMinutes(new Date(booking.endAt).toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Brussels' }))

        // Check for overlap
        if (Math.max(slotStartMin, bookingStartMin) < Math.min(slotEndMin, bookingEndMin)) {
          return NextResponse.json({ error: 'Reeds geboekt – conflicten gevonden.' }, { status: 409 })
        }
      }
    }

    // Delete existing slots for this date, caregiver, and service
    await db.availabilitySlot.deleteMany({
      where: {
        caregiverId: caregiverId,
        serviceId: finalServiceId,
        date: targetDate
      }
    })

    // Insert new slots
    if (!blocked && slots.length > 0) {
      await db.availabilitySlot.createMany({
        data: slots.map(slot => ({
          caregiverId: caregiverId,
          serviceId: finalServiceId,
          date: targetDate,
          startTimeMin: timeToMinutes(slot.start),
          endTimeMin: timeToMinutes(slot.end),
          blocked: false
        }))
      })
    } else if (blocked) {
      // Create a single blocked slot for the entire day if blocked is true
      await db.availabilitySlot.create({
        data: {
          caregiverId: caregiverId,
          serviceId: finalServiceId,
          date: targetDate,
          startTimeMin: 0, // Full day blocked
          endTimeMin: 24 * 60, // Full day blocked
          blocked: true
        }
      })
    }

    return NextResponse.json({ success: true, message: 'Beschikbaarheid opgeslagen.' })
  } catch (error) {
    console.error('Error setting caregiver availability:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}