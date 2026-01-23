import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getImpersonationContext } from '@/lib/impersonation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  try {
    const session = await auth()
    const impersonation = getImpersonationContext(session)
    const effectiveRole = impersonation?.role ?? session?.user?.role

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (effectiveRole !== 'OWNER') {
      return NextResponse.json({ error: 'Not an owner' }, { status: 403 })
    }

    // Fetch bookings for this owner
    const bookings = await prisma.booking.findMany({
      where: {
        ownerId: impersonation?.role === 'OWNER' ? impersonation.userId : session.user.id,
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
