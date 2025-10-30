import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const bookingSchema = z.object({
  caregiverId: z.string(),
  listingId: z.string().optional(),
  startAt: z.string(), // ISO date string
  endAt: z.string(), // ISO date string
  service: z.string(),
  notes: z.string().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn om te boeken' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validated = bookingSchema.parse(body)

    // Get caregiver to calculate price
    const caregiver = await db.caregiverProfile.findUnique({
      where: { userId: validated.caregiverId }
    })

    if (!caregiver) {
      return NextResponse.json(
        { error: 'Verzorger niet gevonden' },
        { status: 404 }
      )
    }

    // Calculate duration and price (exact hours including partial hours)
    const start = new Date(validated.startAt)
    const end = new Date(validated.endAt)
    const hours = (end.getTime() - start.getTime()) / (1000 * 60 * 60)
    const amountCents = Math.round(hours * caregiver.hourlyRate * 100) // Convert to cents

    // VALIDATION: Check if caregiver is available at requested time
    const bookingDate = new Date(start.toISOString().split('T')[0]) // Get date only (YYYY-MM-DD)
    
    // Get availability slots for this date
    const availabilitySlots = await db.availabilitySlot.findMany({
      where: {
        caregiverId: validated.caregiverId,
        date: bookingDate,
        blocked: false
      }
    })

    // Convert booking times to minutes since midnight
    const timeToMinutes = (date: Date) => {
      const hours = date.getHours()
      const minutes = date.getMinutes()
      return hours * 60 + minutes
    }
    
    const bookingStartMin = timeToMinutes(start)
    const bookingEndMin = timeToMinutes(end)

    // Check if booking time falls within any availability slot
    const isWithinAvailability = availabilitySlots.some(slot => {
      return bookingStartMin >= slot.startTimeMin && bookingEndMin <= slot.endTimeMin
    })

    if (!isWithinAvailability && availabilitySlots.length > 0) {
      return NextResponse.json(
        { 
          error: 'Verzorger is niet beschikbaar op de geselecteerde tijd. Kies een ander tijdstip.',
          availableSlots: availabilitySlots.map(slot => ({
            start: `${Math.floor(slot.startTimeMin / 60)}:${String(slot.startTimeMin % 60).padStart(2, '0')}`,
            end: `${Math.floor(slot.endTimeMin / 60)}:${String(slot.endTimeMin % 60).padStart(2, '0')}`
          }))
        },
        { status: 409 }
      )
    }

    // Check if no availability slots exist for this date (i.e., caregiver is blocked or has no availability)
    if (availabilitySlots.length === 0) {
      // Check if caregiver explicitly blocked this day
      const blockedSlot = await db.availabilitySlot.findFirst({
        where: {
          caregiverId: validated.caregiverId,
          date: bookingDate,
          blocked: true
        }
      })

      if (blockedSlot) {
        return NextResponse.json(
          { error: 'Verzorger heeft deze dag geblokkeerd.' },
          { status: 409 }
        )
      }

      // No availability set for this date
      return NextResponse.json(
        { error: 'Geen beschikbaarheid ingesteld voor deze dag.' },
        { status: 409 }
      )
    }

    // Check for overlapping bookings with same caregiver
    const existingBookings = await db.booking.findMany({
      where: {
        caregiverId: validated.caregiverId,
        startAt: {
          gte: start
        },
        endAt: {
          lte: end
        },
        status: {
          not: 'CANCELLED'
        }
      }
    })

    // Check for any overlap
    const hasOverlap = existingBookings.some(booking => {
      return (start < booking.endAt && end > booking.startAt)
    })

    if (hasOverlap) {
      return NextResponse.json(
        { error: 'Deze tijdstip is al geboekt door een andere klant.' },
        { status: 409 }
      )
    }

    // Create booking
    const booking = await db.booking.create({
      data: {
        ownerId: session.user.id,
        caregiverId: validated.caregiverId,
        listingId: validated.listingId,
        startAt: start,
        endAt: end,
        status: 'PENDING',
        amountCents,
        currency: 'EUR',
      },
      include: {
        caregiver: {
          select: {
            name: true,
            email: true,
          }
        },
        owner: {
          select: {
            name: true,
            email: true,
          }
        }
      }
    })

    // TODO: Send email notification to caregiver
    // TODO: Send confirmation email to owner

    return NextResponse.json({
      booking: {
        id: booking.id,
        startAt: booking.startAt,
        endAt: booking.endAt,
        status: booking.status,
        amount: amountCents / 100,
        currency: booking.currency,
        caregiver: booking.caregiver,
      },
      message: 'Boeking succesvol aangemaakt! De verzorger ontvangt een notificatie.'
    }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden bij het maken van de boeking' },
      { status: 500 }
    )
  }
}

// Get user's bookings
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const asCaregiver = searchParams.get('asCaregiver') === 'true'

    const bookings = await db.booking.findMany({
      where: asCaregiver
        ? { caregiverId: session.user.id }
        : { ownerId: session.user.id },
      include: {
        caregiver: {
          select: {
            name: true,
            email: true,
            image: true,
          }
        },
        owner: {
          select: {
            name: true,
            email: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ bookings })

  } catch (error) {
    console.error('Get bookings error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}




