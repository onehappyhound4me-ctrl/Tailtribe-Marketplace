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

    // Get owner's bookings
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
      }
    })

    // Calculate stats
    const totalBookings = bookings.length
    const pendingBookings = bookings.filter(b => b.status === 'PENDING').length
    const completedBookings = bookings.filter(b => b.status === 'COMPLETED').length
    const totalSpent = bookings.reduce((sum, booking) => sum + (booking.amountCents || 0), 0) / 100

    return NextResponse.json({
      totalBookings,
      pendingBookings,
      completedBookings,
      totalSpent
    })

  } catch (error) {
    console.error('Error fetching owner stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}













