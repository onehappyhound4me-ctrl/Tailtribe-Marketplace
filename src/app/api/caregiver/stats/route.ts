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

    const caregiverUserId = session.user.id

    const [bookings, reviews] = await Promise.all([
      db.booking.findMany({
        where: { caregiverId: caregiverUserId },
        select: {
          ownerId: true,
          status: true,
          amountCents: true,
          caregiverAmountCents: true,
          startAt: true,
        },
      }),
      db.review.findMany({
        where: {
          revieweeId: caregiverUserId,
          revieweeRole: 'CAREGIVER',
        },
        select: { rating: true },
      }),
    ])

    const completedStatuses = ['PAID', 'COMPLETED']
    const completedBookings = bookings.filter(b => completedStatuses.includes(b.status))
    const servedClients = new Set(completedBookings.map(b => b.ownerId)).size
    const totalEarningsCents = completedBookings.reduce((sum, booking) => {
      const payout = booking.caregiverAmountCents ?? Math.round(booking.amountCents * 0.8)
      return sum + payout
    }, 0)

    const averageRating =
      reviews.length > 0
        ? reviews.reduce((sum, review) => sum + review.rating, 0) / reviews.length
        : 0

    const stats = {
      totalBookings: bookings.length,
      servedClients,
      averageRating: Number(averageRating.toFixed(1)),
      totalReviews: reviews.length,
      totalEarnings: totalEarningsCents / 100,
      pendingBookings: bookings.filter(b => b.status === 'PENDING').length,
      upcomingBookings: bookings.filter(
        b => new Date(b.startAt) > new Date() && !['CANCELLED', 'DECLINED'].includes(b.status)
      ).length,
    }

    return NextResponse.json({ stats })
  } catch (error) {
    console.error('Error fetching caregiver stats:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
