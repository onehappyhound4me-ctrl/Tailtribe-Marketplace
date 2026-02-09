import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getImpersonationContext } from '@/lib/impersonation'
import { getTodayStringInZone } from '@/lib/date-utils'

export const dynamic = 'force-dynamic'

function parseMidnightUtc(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0))
}

export async function GET(request: NextRequest) {
  const session = await auth()
  const impersonation = getImpersonationContext(session)
  const effectiveRole = impersonation?.role ?? session?.user?.role

  if (!session || effectiveRole !== 'CAREGIVER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') === 'history' ? 'history' : 'active'

    const todayUtc = parseMidnightUtc(getTodayStringInZone())
    const cutoffUtc = new Date(todayUtc)
    cutoffUtc.setUTCDate(cutoffUtc.getUTCDate() - 90)

    const bookings = await prisma.booking.findMany({
      where: {
        caregiverId: impersonation?.role === 'CAREGIVER' ? impersonation.userId : session.user.id,
        ...(view === 'history'
          ? {
              OR: [{ status: 'ARCHIVED' }, { date: { lt: cutoffUtc } }],
            }
          : {
              status: { not: 'ARCHIVED' },
              date: { gte: cutoffUtc },
            }),
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
