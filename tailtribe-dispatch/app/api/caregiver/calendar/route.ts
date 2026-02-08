import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getImpersonationContext } from '@/lib/impersonation'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const session = await auth()
    const impersonation = getImpersonationContext(session)
    const effectiveRole = impersonation?.role ?? session?.user?.role

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (effectiveRole !== 'CAREGIVER') {
      return NextResponse.json({ error: 'Not a caregiver' }, { status: 403 })
    }

    const caregiverUserId =
      impersonation?.role === 'CAREGIVER' ? impersonation.userId : session.user.id

    // Find caregiver profile
    const profile = await prisma.caregiverProfile.findUnique({
      where: { userId: caregiverUserId },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    // Fetch bookings assigned to this caregiver (caregiverId refers to User.id)
    const bookings = await prisma.booking.findMany({
      where: {
        caregiverId: caregiverUserId, // User ID, not profile ID
      },
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Fetch availability (uses CaregiverProfile.id)
    const availability = await prisma.availability.findMany({
      where: {
        caregiverId: profile.id,
      },
      orderBy: {
        date: 'asc',
      },
    })

    return NextResponse.json({
      bookings,
      availability,
    })
  } catch (error) {
    console.error('Calendar fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch calendar data' },
      { status: 500 }
    )
  }
}
