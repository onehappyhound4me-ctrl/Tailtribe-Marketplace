import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export const dynamic = 'force-dynamic'
export const revalidate = 0

// Get caregiver statistics
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'CAREGIVER') {
      return NextResponse.json(
        { error: 'Alleen verzorgers hebben toegang' },
        { status: 403 }
      )
    }

    const caregiverProfile = await db.caregiverProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!caregiverProfile) {
      return NextResponse.json({
        bookingsThisMonth: 0,
        earningsThisMonth: 0,
        averageRating: 0,
        totalReviews: 0,
      })
    }

    // Get bookings this month
    const startOfMonth = new Date()
    startOfMonth.setDate(1)
    startOfMonth.setHours(0, 0, 0, 0)

    const bookingsThisMonth = await db.booking.count({
      where: {
        caregiverId: session.user.id,
        status: { in: ['ACCEPTED', 'PAID', 'COMPLETED'] },
        createdAt: { gte: startOfMonth }
      }
    })

    // Calculate earnings this month
    const earnings = await db.booking.aggregate({
      where: {
        caregiverId: session.user.id,
        status: 'PAID',
        paidAt: { gte: startOfMonth }
      },
      _sum: {
        caregiverAmountCents: true
      }
    })

    const earningsThisMonth = (earnings._sum.caregiverAmountCents || 0) / 100

    // Fetch reviews using new schema
    const reviews = await db.review.findMany({
      where: {
        revieweeId: session.user.id,
        revieweeRole: 'CAREGIVER'
      },
      select: {
        rating: true
      }
    })

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0

    return NextResponse.json({
      bookingsThisMonth,
      earningsThisMonth,
      averageRating: Math.round(avgRating * 10) / 10,
      totalReviews: reviews.length,
    })

  } catch (error) {
    console.error('Caregiver stats error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}




