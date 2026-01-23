import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { assertSlotNotInPast } from '@/lib/date-utils'
import { getImpersonationContext } from '@/lib/impersonation'

// Helper om datum string naar UTC datum te converteren zonder timezone shift
function parseUTCDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
}

export async function GET() {
  const session = await auth()
  const impersonation = getImpersonationContext(session)
  const effectiveRole = impersonation?.role ?? session?.user?.role

  if (!session || effectiveRole !== 'CAREGIVER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    // Get caregiver profile
    const profile = await prisma.caregiverProfile.findUnique({
      where: { userId: impersonation?.role === 'CAREGIVER' ? impersonation.userId : session.user.id },
    })

    if (!profile) {
      return NextResponse.json([])
    }

    // Get all availability slots for this caregiver
    const availability = await prisma.availability.findMany({
      where: {
        caregiverId: profile.id,
      },
      orderBy: {
        date: 'asc',
      },
    })

    return NextResponse.json(availability)
  } catch (error) {
    console.error('Failed to fetch availability:', error)
    return NextResponse.json(
      { error: 'Failed to fetch availability' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session || session.user.role !== 'CAREGIVER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { date, timeWindows } = body

    // Get caregiver profile
    const profile = await prisma.caregiverProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Profiel niet gevonden. Maak eerst een profiel aan.' },
        { status: 400 }
      )
    }

    if (!date || !timeWindows || !Array.isArray(timeWindows)) {
      return NextResponse.json(
        { error: 'Ongeldige data' },
        { status: 400 }
      )
    }

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const maxDate = new Date(today)
    maxDate.setUTCDate(maxDate.getUTCDate() + 60)
    const target = parseUTCDate(date)
    if (target.getTime() > maxDate.getTime()) {
      return NextResponse.json(
        { error: 'Je kan maximaal 60 dagen vooruit beschikbaarheid zetten.' },
        { status: 400 }
      )
    }

    try {
      for (const tw of timeWindows) {
        assertSlotNotInPast({ date, timeWindow: tw })
      }
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message ?? 'Datum ligt in het verleden' },
        { status: 400 }
      )
    }

    // Create availability slots for each time window
    const utcDate = parseUTCDate(date)
    const slots = await Promise.all(
      timeWindows.map((timeWindow: string) =>
        prisma.availability.upsert({
          where: {
            caregiverId_date_timeWindow: {
              caregiverId: profile.id,
              date: utcDate,
              timeWindow,
            },
          },
          update: {
            isAvailable: true,
          },
          create: {
            caregiverId: profile.id,
            date: utcDate,
            timeWindow,
            isAvailable: true,
          },
        })
      )
    )

    return NextResponse.json(slots)
  } catch (error) {
    console.error('Failed to save availability:', error)
    return NextResponse.json(
      { error: 'Failed to save availability' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  const session = await auth()

  if (!session || session.user.role !== 'CAREGIVER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: 'Missing id' }, { status: 400 })
    }

    await prisma.availability.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Failed to delete availability:', error)
    return NextResponse.json(
      { error: 'Failed to delete availability' },
      { status: 500 }
    )
  }
}
