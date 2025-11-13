import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { sendBookingRequestEmail } from '@/lib/email-notifications'

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

    // Calculate duration and price
    const start = new Date(validated.startAt)
    const end = new Date(validated.endAt)
    const hours = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60))
    const amountCents = hours * caregiver.hourlyRate * 100 // Convert to cents

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

    // Send email notifications
    try {
      await sendBookingRequestEmail({
        caregiverEmail: booking.caregiver.email,
        caregiverName: booking.caregiver.name,
        ownerName: booking.owner.name,
        serviceName: validated.service,
        date: `${start.toLocaleDateString('nl-NL')} - ${end.toLocaleDateString('nl-NL')}`,
        bookingId: booking.id
      })
    } catch (emailError) {
      console.error('Error sending booking request email:', emailError)
      // Don't fail the request if email fails
    }

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




