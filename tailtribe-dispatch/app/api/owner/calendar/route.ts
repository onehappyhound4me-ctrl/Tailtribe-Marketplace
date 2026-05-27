import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/effective-session'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const session = await auth()
    const authz = requireRole(session, ['OWNER'])
    if (!authz.ok) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch bookings for this owner
    const bookings = await prisma.booking.findMany({
      where: {
        ownerId: authz.userId,
      },
      include: {
        caregiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    return NextResponse.json({ bookings })
  } catch (error) {
    console.error('Owner calendar fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar data' },
      { status: 500 }
    )
  }
}
