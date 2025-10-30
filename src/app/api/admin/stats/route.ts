import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Geen toegang' },
        { status: 403 }
      )
    }

    // Get platform statistics
    const [
      totalUsers,
      totalCaregivers,
      totalBookings,
      totalRevenue,
      pendingBookings,
      recentBookings,
      recentUsers,
    ] = await Promise.all([
      db.user.count(),
      db.caregiverProfile.count(),
      db.booking.count(),
      db.booking.aggregate({
        where: { status: 'PAID' },
        _sum: { platformFeeCents: true }
      }),
      db.booking.count({ where: { status: 'PENDING' } }),
      db.booking.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        include: {
          owner: { select: { name: true, email: true } },
          caregiver: { select: { name: true, email: true } }
        }
      }),
      db.user.findMany({
        take: 10,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
          createdAt: true
        }
      })
    ])

    return NextResponse.json({
      stats: {
        totalUsers,
        totalCaregivers,
        totalBookings,
        totalRevenue: (totalRevenue._sum.platformFeeCents || 0) / 100,
        pendingBookings,
      },
      recentBookings,
      recentUsers,
    })

  } catch (error) {
    console.error('Admin stats error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}




