export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get owner's recent bookings (last 10)
    const bookings = await db.booking.findMany({
      where: {
        ownerId: session.user.id
      },
      include: {
        caregiver: {
          include: {
            caregiverProfile: true
          }
        }
      },
      orderBy: {
        startAt: 'desc'
      },
      take: 10
    })

    // Format bookings for frontend
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      startAt: booking.startAt,
      endAt: booking.endAt,
      status: booking.status,
      amountCents: booking.amountCents,
      petName: booking.petName,
      specialInstructions: booking.specialInstructions,
      caregiver: {
        id: booking.caregiver.id,
        name: booking.caregiver.name,
        city: booking.caregiver.caregiverProfile?.city,
        hourlyRate: booking.caregiver.caregiverProfile?.hourlyRate
      }
    }))

    return NextResponse.json({
      bookings: formattedBookings
    })

  } catch (error) {
    console.error('Error fetching owner bookings:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}






