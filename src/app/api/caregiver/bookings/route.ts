export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'CAREGIVER') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    // Get caregiver profile
    const caregiverProfile = await db.caregiverProfile.findFirst({
      where: { userId: session.user.id },
      include: {
        user: true
      }
    })

    if (!caregiverProfile) {
      return NextResponse.json({ error: 'Caregiver profile not found' }, { status: 404 })
    }

    // Get all bookings for this caregiver
    const bookings = await db.booking.findMany({
      where: {
        caregiverId: session.user.id
      },
      include: {
        owner: {
          select: {
            name: true,
            email: true,
            phone: true
          }
        },
        caregiver: {
          select: {
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        startAt: 'desc'
      }
    })

    // Transform bookings to match frontend interface
    const transformedBookings = bookings.map(booking => ({
      id: booking.id,
      status: booking.status,
      startAt: booking.startAt.toISOString(),
      endAt: booking.endAt.toISOString(),
      amountCents: booking.amountCents,
      petName: booking.petName,
      petType: booking.petType,
      customAnimalType: booking.customAnimalType,
      petBreed: booking.petBreed,
      specialInstructions: booking.specialInstructions,
      owner: booking.owner,
      caregiver: booking.caregiver
    }))

    return NextResponse.json({
      bookings: transformedBookings
    })

  } catch (error) {
    console.error('Error fetching caregiver bookings:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}






