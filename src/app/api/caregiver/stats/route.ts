import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Get caregiver profile
    const caregiver = await db.caregiverProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!caregiver) {
      return NextResponse.json({ error: 'Caregiver profile not found' }, { status: 404 })
    }

    // Get bookings for this caregiver
    const bookings = await db.booking.findMany({
      where: { caregiverId: caregiver.id },
      include: {
        owner: true,
        caregiver: true
      },
      orderBy: { startAt: 'desc' }
    })

    // Calculate stats
    const now = new Date()
    const weekStart = new Date(now.setDate(now.getDate() - now.getDay()))
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    const weeklyBookings = bookings.filter(b => new Date(b.startAt) >= weekStart)
    const monthlyBookings = bookings.filter(b => new Date(b.startAt) >= monthStart)

    const stats = {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(b => b.status === 'PENDING').length,
      confirmedBookings: bookings.filter(b => b.status === 'CONFIRMED').length,
      completedBookings: bookings.filter(b => b.status === 'COMPLETED').length,
      weeklyEarnings: weeklyBookings.reduce((sum, b) => sum + (b.amountCents / 100), 0),
      monthlyEarnings: monthlyBookings.reduce((sum, b) => sum + (b.amountCents / 100), 0),
      averageRating: 4.8, // TODO: Implement rating system
      totalReviews: 12, // TODO: Implement review system
      recentBookings: bookings.slice(0, 5).map(booking => ({
        id: booking.id,
        status: booking.status,
        startAt: booking.startAt,
        endAt: booking.endAt,
        amountCents: booking.amountCents,
        petName: booking.petName,
        petType: booking.petType,
        service: 'Dienstverlening',
        owner: {
          name: booking.owner.name,
          email: booking.owner.email,
          phone: booking.owner.phone
        },
        specialInstructions: booking.specialInstructions,
        location: 'Locatie' // TODO: Add location field to booking
      }))
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching caregiver stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
