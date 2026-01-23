import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { assertSlotNotInPast } from '@/lib/date-utils'
import { isCaregiverAvailable } from '@/lib/availability'

function generateDatesFromPattern(
  startDate: Date,
  endDate: Date,
  pattern: string
): Date[] {
  const dates: Date[] = []
  const start = new Date(startDate)
  const end = new Date(endDate)

  for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
    const dayOfWeek = d.getDay() // 0 = Sunday, 6 = Saturday

    let include = false
    if (pattern === 'DAILY') {
      include = true
    } else if (pattern === 'WEEKDAYS' && dayOfWeek >= 1 && dayOfWeek <= 5) {
      include = true
    } else if (pattern === 'WEEKEND' && (dayOfWeek === 0 || dayOfWeek === 6)) {
      include = true
    } else if (pattern === 'WEEKLY' && dayOfWeek === start.getDay()) {
      include = true
    }

    if (include) {
      dates.push(new Date(d))
    }
  }

  return dates
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    // Check admin auth
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not an admin' }, { status: 403 })
    }

    const body = await request.json()
    const { bookingId, caregiverId } = body

    if (!bookingId || !caregiverId) {
      return NextResponse.json(
        { error: 'Booking ID and Caregiver ID required' },
        { status: 400 }
      )
    }

    // Fetch master booking
    const masterBooking = await prisma.booking.findUnique({
      where: { id: bookingId },
    })

    if (!masterBooking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    if (!masterBooking.isRecurring) {
      return NextResponse.json(
        { error: 'This is not a recurring booking' },
        { status: 400 }
      )
    }

    if (!masterBooking.recurringPattern || !masterBooking.recurringEndDate) {
      return NextResponse.json(
        { error: 'Missing recurring pattern or end date' },
        { status: 400 }
      )
    }

    // Verify caregiver exists
    const caregiver = await prisma.user.findUnique({
      where: { id: caregiverId },
    })

    if (!caregiver || caregiver.role !== 'CAREGIVER') {
      return NextResponse.json(
        { error: 'Caregiver not found' },
        { status: 404 }
      )
    }

    // Generate all dates based on pattern
    const dates = generateDatesFromPattern(
      masterBooking.date,
      masterBooking.recurringEndDate,
      masterBooking.recurringPattern
    )

    const validDates = dates.filter((date) => {
      const dateStr = date.toISOString().slice(0, 10)
      try {
        assertSlotNotInPast({
          date: dateStr,
          time: masterBooking.time ?? undefined,
          timeWindow: masterBooking.timeWindow ?? undefined,
        })
        return true
      } catch {
        return false
      }
    })

    if (validDates.length === 0) {
      return NextResponse.json(
        { error: 'Alle gegenereerde datums liggen in het verleden' },
        { status: 400 }
      )
    }

    console.log(`Generating ${dates.length} bookings from pattern ${masterBooking.recurringPattern}`)

    const skippedDates: { date: string; reason: string }[] = []
    const childBookings = []
    for (const date of validDates) {
      const dayStart = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 0, 0, 0, 0))
      const dayEnd = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate(), 23, 59, 59, 999))
      const dateLabel = dayStart.toISOString().slice(0, 10)

      const available = await isCaregiverAvailable({
        caregiverUserId: caregiverId,
        date: dayStart,
        timeWindow: masterBooking.timeWindow,
      })
      if (!available) {
        skippedDates.push({ date: dateLabel, reason: 'Geen beschikbaarheid' })
        continue
      }

      const conflictBooking = await prisma.booking.findFirst({
        where: {
          caregiverId,
          timeWindow: masterBooking.timeWindow,
          status: { not: 'CANCELLED' },
          date: { gte: dayStart, lte: dayEnd },
        },
        select: { id: true },
      })
      if (conflictBooking) {
        skippedDates.push({ date: dateLabel, reason: 'Conflict met bestaande booking' })
        continue
      }

      const conflictOccurrence = await prisma.bookingOccurrence.findFirst({
        where: {
          assignedCaregiverId: caregiverId,
          timeWindow: masterBooking.timeWindow ?? undefined,
          status: { not: 'CANCELLED' },
          scheduledDate: { gte: dayStart, lte: dayEnd },
        },
        select: { id: true },
      })
      if (conflictOccurrence) {
        skippedDates.push({ date: dateLabel, reason: 'Conflict met toegewezen aanvraag' })
        continue
      }

      const existingChild = await prisma.booking.findFirst({
        where: {
          recurringParentId: masterBooking.id,
          timeWindow: masterBooking.timeWindow,
          date: { gte: dayStart, lte: dayEnd },
        },
        select: { id: true },
      })
      if (existingChild) {
        skippedDates.push({ date: dateLabel, reason: 'Reeks bestaat al' })
        continue
      }

      childBookings.push({
        ownerId: masterBooking.ownerId,
        service: masterBooking.service,
        date: date,
        time: masterBooking.time,
        timeWindow: masterBooking.timeWindow,
        city: masterBooking.city,
        postalCode: masterBooking.postalCode,
        region: masterBooking.region,
        address: masterBooking.address,
        petName: masterBooking.petName,
        petType: masterBooking.petType,
        petDetails: masterBooking.petDetails,
        contactPreference: masterBooking.contactPreference,
        message: masterBooking.message,
        status: 'ASSIGNED',
        caregiverId: caregiverId,
        isRecurring: true,
        recurringParentId: masterBooking.id,
        recurringGenerated: true,
      })
    }

    if (childBookings.length === 0) {
      return NextResponse.json(
        { error: 'Geen beschikbare datums gevonden', skippedDates },
        { status: 400 }
      )
    }

    // Create all child bookings
    const result = await prisma.booking.createMany({
      data: childBookings,
    })

    // Update master booking
    await prisma.booking.update({
      where: { id: bookingId },
      data: {
        status: 'ASSIGNED',
        caregiverId: caregiverId,
      },
    })

    console.log(`Successfully created ${result.count} recurring bookings`)

    return NextResponse.json({
      success: true,
      count: result.count,
      skippedDates,
      pattern: masterBooking.recurringPattern,
      startDate: masterBooking.date,
      endDate: masterBooking.recurringEndDate,
    })
  } catch (error) {
    console.error('Bulk assign recurring error:', error)
    return NextResponse.json(
      { error: 'Failed to assign recurring bookings' },
      { status: 500 }
    )
  }
}
