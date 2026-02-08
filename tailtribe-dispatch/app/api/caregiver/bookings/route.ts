import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getImpersonationContext } from '@/lib/impersonation'

export const dynamic = 'force-dynamic'

export async function GET() {
  const session = await auth()
  const impersonation = getImpersonationContext(session)
  const effectiveRole = impersonation?.role ?? session?.user?.role

  if (!session || effectiveRole !== 'CAREGIVER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const bookings = await prisma.booking.findMany({
      where: {
        caregiverId: impersonation?.role === 'CAREGIVER' ? impersonation.userId : session.user.id,
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
        date: 'desc',
      },
    })

    return NextResponse.json(bookings)
  } catch (error) {
    console.error('Failed to fetch caregiver bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

export async function PATCH(req: NextRequest) {
  const session = await auth()

  if (!session || session.user.role !== 'CAREGIVER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  return NextResponse.json(
    { error: 'Alleen de eigenaar kan de opdracht bevestigen.' },
    { status: 403 }
  )
}
