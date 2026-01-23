import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { assertSlotNotInPast } from '@/lib/date-utils'

// Helper om datum string naar UTC datum te converteren zonder timezone shift
function parseUTCDate(dateString: string): Date {
  const [year, month, day] = dateString.split('-').map(Number)
  return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
}

export async function POST(request: Request) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'CAREGIVER') {
      return NextResponse.json({ error: 'Not a caregiver' }, { status: 403 })
    }

    // Find caregiver profile
    const profile = await prisma.caregiverProfile.findUnique({
      where: { userId: session.user.id },
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found' }, { status: 404 })
    }

    const body = await request.json()
    const { startDate, endDate, weekdays, timeWindows, days, services } = body as {
      startDate?: string
      endDate?: string
      weekdays?: number[]
      timeWindows?: string[]
      days?: { date: string; timeWindows: string[] }[]
      services?: string[]
    }

    const today = new Date()
    today.setUTCHours(0, 0, 0, 0)
    const maxDate = new Date(today)
    maxDate.setUTCDate(maxDate.getUTCDate() + 60)

    if (services && (!Array.isArray(services) || services.length === 0)) {
      return NextResponse.json(
        { error: 'Selecteer minstens één dienst' },
        { status: 400 }
      )
    }

    const notes = Array.isArray(services) && services.length > 0
      ? JSON.stringify({ services })
      : null

    const slots: {
      caregiverId: string
      date: Date
      timeWindow: string
      isAvailable: boolean
      notes?: string | null
    }[] = []

    if (days && Array.isArray(days) && days.length > 0) {
      // per-dag invoer
      for (const d of days) {
        if (!d.date || !d.timeWindows || d.timeWindows.length === 0) continue
        const dateObj = parseUTCDate(d.date)
        if (dateObj.getTime() > maxDate.getTime()) {
          return NextResponse.json(
            { error: 'Je kan maximaal 60 dagen vooruit beschikbaarheid zetten.' },
            { status: 400 }
          )
        }
        for (const tw of d.timeWindows) {
          slots.push({
            caregiverId: profile.id,
            date: dateObj,
            timeWindow: tw,
            isAvailable: true,
            notes,
          })
        }
      }

      const datesToDelete = days.map((d) => parseUTCDate(d.date))
      if (datesToDelete.length > 0) {
        const min = new Date(Math.min(...datesToDelete.map((d) => d.getTime())))
        const max = new Date(Math.max(...datesToDelete.map((d) => d.getTime())))
        await prisma.availability.deleteMany({
          where: {
            caregiverId: profile.id,
            date: { gte: min, lte: max },
          },
        })
      }
    } else {
      // fallback op range + weekdays + timeWindows
      if (!startDate || !endDate || !weekdays || !timeWindows) {
        return NextResponse.json(
          { error: 'Missing required fields' },
          { status: 400 }
        )
      }

      const start = parseUTCDate(startDate)
      const end = parseUTCDate(endDate)
      if (end.getTime() > maxDate.getTime()) {
        return NextResponse.json(
          { error: 'Je kan maximaal 60 dagen vooruit beschikbaarheid zetten.' },
          { status: 400 }
        )
      }

      for (let date = new Date(start); date <= end; date.setUTCDate(date.getUTCDate() + 1)) {
        const dayOfWeek = date.getUTCDay()
        
        if (weekdays.includes(dayOfWeek)) {
          for (const timeWindow of timeWindows) {
            slots.push({
              caregiverId: profile.id,
              date: new Date(date),
              timeWindow,
              isAvailable: true,
              notes,
            })
          }
        }
      }

      await prisma.availability.deleteMany({
        where: {
          caregiverId: profile.id,
          date: {
            gte: start,
            lte: end,
          },
        },
      })
    }

    // Filter enkel vandaag of toekomst met tz-check
    const futureSlots = slots.filter((s) => {
      try {
        assertSlotNotInPast({
          date: s.date.toISOString().slice(0, 10),
          timeWindow: s.timeWindow,
        })
        return true
      } catch {
        return false
      }
    })

    if (futureSlots.length === 0) {
      return NextResponse.json(
        { error: 'Geen geldige dagen in de toekomst geselecteerd.' },
        { status: 400 }
      )
    }

    // Create all slots at once
    const result = await prisma.availability.createMany({
      data: futureSlots,
    })

    return NextResponse.json({
      message: 'Availability created successfully',
      count: result.count,
    })
  } catch (error) {
    console.error('Bulk availability creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create availability' },
      { status: 500 }
    )
  }
}
