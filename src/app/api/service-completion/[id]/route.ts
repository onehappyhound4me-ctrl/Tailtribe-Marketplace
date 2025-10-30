import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const { id } = params

    const completion = await db.serviceCompletion.findUnique({
      where: { id },
      include: {
        booking: {
          include: {
            owner: { select: { id: true, name: true } },
            caregiver: { select: { id: true, name: true } }
          }
        }
      }
    })

    if (!completion) {
      return NextResponse.json({ error: 'Service completion niet gevonden' }, { status: 404 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    // Check authorization
    if (
      user?.id !== completion.booking.ownerId &&
      user?.id !== completion.booking.caregiverId &&
      user?.role !== 'ADMIN'
    ) {
      return NextResponse.json({ error: 'Geen toegang' }, { status: 403 })
    }

    return NextResponse.json({
      success: true,
      completion: {
        id: completion.id,
        bookingId: completion.bookingId,
        photos: completion.photos ? JSON.parse(completion.photos) : [],
        checkInTime: completion.checkInTime,
        checkOutTime: completion.checkOutTime,
        checkInLocation: completion.checkInLocation,
        checkOutLocation: completion.checkOutLocation,
        notes: completion.notes,
        rating: completion.rating,
        completedAt: completion.completedAt,
        caregiver: completion.booking.caregiver,
        owner: completion.booking.owner
      }
    })

  } catch (error: any) {
    console.error('Error fetching service completion:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch service completion' },
      { status: 500 }
    )
  }
}





