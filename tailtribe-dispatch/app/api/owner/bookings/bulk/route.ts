import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { getTodayStringInZone } from '@/lib/date-utils'
import { assertCaregiverAvailable } from '@/lib/availability'

const TIME_WINDOW_STARTS: Record<string, string> = {
  MORNING: '07:00',
  AFTERNOON: '12:00',
  EVENING: '18:00',
  NIGHT: '22:00',
}

const normalize = (value?: string | null) => (value ?? '').trim().toLowerCase()

const parseMidnightUtc = (dateStr: string) => {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0))
}

const slotStartUtc = (date: string, timeWindow?: string, time?: string) => {
  const start = time && /^\d{2}:\d{2}$/.test(time) ? time : TIME_WINDOW_STARTS[timeWindow ?? ''] ?? '00:00'
  const [hh, mm] = start.split(':').map(Number)
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, hh, mm, 0, 0))
}

export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    if (!session || session.user.role !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const ownerProfile = await prisma.ownerProfile.findUnique({
      where: { userId: session.user.id },
    })

    const { bookings } = await request.json()

    if (!Array.isArray(bookings) || bookings.length === 0) {
      return NextResponse.json(
        { error: 'Bookings array is required' },
        { status: 400 }
      )
    }

    // Valideer dat alle bookings de vereiste velden hebben
    for (const booking of bookings) {
      const resolvedCity = String(booking.city ?? '').trim() || ownerProfile?.city || ''
      const resolvedPostal = String(booking.postalCode ?? '').trim() || ownerProfile?.postalCode || ''
      if (!booking.service || booking.service === '0' || !booking.date || !booking.timeWindow || 
          !resolvedCity || !resolvedPostal || !booking.petName || !booking.petType) {
        return NextResponse.json(
          { error: 'Vul je thuisadres in of geef een locatie op bij de aanvraag.' },
          { status: 400 }
        )
      }

      const today = parseMidnightUtc(getTodayStringInZone())
      const bookingDay = parseMidnightUtc(booking.date)
      const maxDate = new Date(today)
      maxDate.setUTCDate(maxDate.getUTCDate() + 60)
      if (bookingDay.getTime() < today.getTime()) {
        return NextResponse.json(
          { error: 'Datum ligt in het verleden' },
          { status: 400 }
        )
      }
      if (bookingDay.getTime() > maxDate.getTime()) {
        return NextResponse.json(
          { error: 'Je kan maximaal 60 dagen vooruit boeken' },
          { status: 400 }
        )
      }

      if (booking.caregiverId) {
        try {
          await assertCaregiverAvailable({
            caregiverUserId: booking.caregiverId,
            date: booking.date,
            timeWindow: booking.timeWindow,
          })
        } catch (err: any) {
          return NextResponse.json(
            { error: err.message ?? 'Verzorger is niet beschikbaar voor dit tijdsblok' },
            { status: 400 }
          )
        }
      }
    }

    // Maak alle bookings aan
    const createdBookings = await Promise.all(
      bookings.map((booking: any) => {
        const slotDate = slotStartUtc(booking.date, booking.timeWindow, booking.time)
        const resolvedCity = String(booking.city ?? '').trim() || ownerProfile?.city || ''
        const resolvedPostal = String(booking.postalCode ?? '').trim() || ownerProfile?.postalCode || ''
        const resolvedAddress = String(booking.address ?? '').trim() || ownerProfile?.address || ''
        const inputRegion = String(booking.region ?? '').trim()
        const sameAsHome =
          ownerProfile &&
          normalize(resolvedCity) === normalize(ownerProfile.city) &&
          normalize(resolvedPostal) === normalize(ownerProfile.postalCode)
        const resolvedRegion = inputRegion || (sameAsHome ? ownerProfile?.region ?? null : null)

        return prisma.booking.create({
          data: {
            ownerId: session.user.id,
            service: booking.service,
            date: slotDate,
            timeWindow: booking.timeWindow,
            city: resolvedCity,
            postalCode: resolvedPostal,
            region: resolvedRegion,
            address: resolvedAddress,
            petName: booking.petName,
            petType: booking.petType,
            petDetails: booking.petDetails || '',
            message: booking.message || '',
            status: booking.status || 'PENDING', // Kan ASSIGNED zijn bij direct booking
            caregiverId: booking.caregiverId || null, // Direct toegewezen verzorger
            isRecurring: booking.isRecurring || false,
          },
        })
      })
    )

    return NextResponse.json(
      { 
        success: true, 
        count: createdBookings.length,
        bookings: createdBookings 
      },
      { status: 201 }
    )
  } catch (error) {
    console.error('Failed to create bookings:', error)
    return NextResponse.json(
      { error: 'Failed to create bookings' },
      { status: 500 }
    )
  }
}
