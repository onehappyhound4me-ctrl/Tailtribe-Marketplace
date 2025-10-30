import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { caregiverProfile: true }
    })

    if (!user || user.role !== 'CAREGIVER' || !user.caregiverProfile) {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 })
    }

    // Get all completed bookings for this caregiver
    const bookings = await db.booking.findMany({
      where: {
        caregiverId: user.id,
        status: { in: ['COMPLETED', 'PAID'] },
        paidAt: { not: null }
      },
      include: {
        owner: {
          select: { name: true, email: true }
        }
      },
      orderBy: { completedAt: 'desc' }
    })

    // Calculate earnings
    const earnings = bookings.map(booking => ({
      id: booking.id,
      date: booking.completedAt || booking.createdAt,
      ownerName: booking.owner.name || 'Klant',
      serviceName: 'Service',
      totalAmount: (booking.amountCents || 0) / 100,
      platformFee: (booking.platformFeeCents || 0) / 100,
      yourEarnings: (booking.caregiverAmountCents || 0) / 100,
      status: booking.status,
      paidOut: !!booking.stripeTransferId,
      payoutDate: booking.paidAt
    }))

    // Calculate stats
    const totalEarnings = earnings.reduce((sum, e) => sum + e.yourEarnings, 0)
    const pendingPayouts = earnings
      .filter(e => !e.paidOut)
      .reduce((sum, e) => sum + e.yourEarnings, 0)
    const completedPayouts = earnings
      .filter(e => e.paidOut)
      .reduce((sum, e) => sum + e.yourEarnings, 0)
    
    const now = new Date()
    const thisMonth = earnings
      .filter(e => {
        const date = new Date(e.date)
        return date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear()
      })
      .reduce((sum, e) => sum + e.yourEarnings, 0)

    return NextResponse.json({ 
      earnings,
      stats: {
        totalEarnings,
        pendingPayouts,
        completedPayouts,
        thisMonth
      }
    })

  } catch (error: any) {
    console.error('Error fetching earnings:', error)
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    )
  }
}





