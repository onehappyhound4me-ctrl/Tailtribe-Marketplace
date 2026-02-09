import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getTodayStringInZone } from '@/lib/date-utils'
import { getImpersonationContext } from '@/lib/impersonation'
import { createNotification } from '@/lib/notifications'
import { sendAdminOwnerConfirmedEmail, sendAssignmentEmail, sendOwnerAssignmentEmail } from '@/lib/email'
import { SERVICE_LABELS } from '@/lib/services'

export async function GET(request: NextRequest) {
  const session = await auth()
  const impersonation = getImpersonationContext(session)
  const effectiveRole = impersonation?.role ?? session?.user?.role

  if (!session || effectiveRole !== 'OWNER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { searchParams } = new URL(request.url)
    const view = searchParams.get('view') === 'history' ? 'history' : 'active'

    // Professional default:
    // - Active view: upcoming + last 90 days (excluding ARCHIVED)
    // - History view: older than 90 days OR explicitly ARCHIVED
    const todayUtc = parseMidnightUtc(getTodayStringInZone())
    const cutoffUtc = new Date(todayUtc)
    cutoffUtc.setUTCDate(cutoffUtc.getUTCDate() - 90)

    const ownerId = impersonation?.role === 'OWNER' ? impersonation.userId : session.user.id

    const bookings = await prisma.booking.findMany({
      where: {
        ownerId,
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
        caregiver: {
          select: {
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        offers: {
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
          orderBy: { createdAt: 'asc' },
        },
      },
      orderBy: {
        date: 'desc',
      },
    })

    const payload = bookings.map((booking) => ({
      ...booking,
      offers: booking.offers.map((offer) => ({
        id: offer.id,
        caregiverId: offer.caregiver.id,
        caregiver: offer.caregiver,
        unit: offer.unit,
        priceCents: offer.priceCents,
      })),
    }))

    return NextResponse.json(payload)
  } catch (error) {
    console.error('Failed to fetch owner bookings:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

const TIME_WINDOW_STARTS: Record<string, string> = {
  MORNING: '07:00',
  AFTERNOON: '12:00',
  EVENING: '18:00',
  NIGHT: '22:00',
}

function parseMidnightUtc(dateStr: string) {
  const [y, m, d] = dateStr.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, 0, 0, 0, 0))
}

function slotStartUtc(date: string, timeWindow?: string, time?: string) {
  const start = time && /^\d{2}:\d{2}$/.test(time) ? time : TIME_WINDOW_STARTS[timeWindow ?? ''] ?? '00:00'
  const [hh, mm] = start.split(':').map(Number)
  const [y, m, d] = date.split('-').map(Number)
  return new Date(Date.UTC(y, m - 1, d, hh, mm, 0, 0))
}

export async function POST(request: NextRequest) {
  const session = await auth()

  if (!session || session.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const {
      service,
      date,
      time,
      timeWindow,
      city,
      postalCode,
      region,
      address,
      petName,
      petType,
      petDetails,
      contactPreference,
      message,
    } = body

    // Validation
    if (!service || service === '0' || !date || !timeWindow || !city || !postalCode || !petName || !petType) {
      return NextResponse.json(
        { error: 'Vul alle verplichte velden in' },
        { status: 400 }
      )
    }

    // Only block strikt vóór vandaag (Europe/Brussels)
    const today = parseMidnightUtc(getTodayStringInZone())
    const bookingDay = parseMidnightUtc(date)
    if (bookingDay.getTime() < today.getTime()) {
      return NextResponse.json({ error: 'Datum ligt in het verleden' }, { status: 400 })
    }

    const slotStart = slotStartUtc(date, timeWindow, time)

    // Create booking
    const booking = await prisma.booking.create({
      data: {
        ownerId: session.user.id,
        service,
        date: slotStart,
        time: time || null,
        timeWindow,
        city,
        postalCode,
        region: region || null,
        address: address || null,
        petName,
        petType,
        petDetails: petDetails || null,
        contactPreference: contactPreference || 'email',
        message: message || null,
        status: 'PENDING',
      },
    })

    return NextResponse.json(booking)
  } catch (error) {
    console.error('Failed to create booking:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  const session = await auth()

  if (!session || session.user.role !== 'OWNER') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await request.json().catch(() => ({}))
  const { id, status, caregiverId } = body as { id?: string; status?: string; caregiverId?: string }
  if (!id) {
    return NextResponse.json({ error: 'Ongeldige aanvraag' }, { status: 400 })
  }

  const booking = await prisma.booking.findUnique({
    where: { id },
    select: {
      id: true,
      status: true,
      ownerId: true,
      caregiverId: true,
      service: true,
      date: true,
      timeWindow: true,
      time: true,
      city: true,
      postalCode: true,
      owner: {
        select: { id: true, email: true, firstName: true, lastName: true, phone: true },
      },
    },
  })
  if (!booking || booking.ownerId !== session.user.id) {
    return NextResponse.json({ error: 'Booking niet gevonden' }, { status: 404 })
  }

  if (caregiverId) {
    const offer = await prisma.bookingOffer.findUnique({
      where: {
        bookingId_caregiverId: {
          bookingId: booking.id,
          caregiverId,
        },
      },
      select: {
        caregiver: {
          select: { id: true, email: true, firstName: true, lastName: true },
        },
      },
    })
    if (!offer) {
      return NextResponse.json({ error: 'Deze verzorger is niet voorgesteld.' }, { status: 400 })
    }

    await prisma.booking.update({
      where: { id: booking.id },
      data: { caregiverId, status: 'CONFIRMED' },
    })

    await prisma.bookingOffer.deleteMany({ where: { bookingId: booking.id } })

    const serviceLabel =
      SERVICE_LABELS[booking.service as keyof typeof SERVICE_LABELS] ?? booking.service
    const caregiverName =
      `${offer.caregiver.firstName ?? ''} ${offer.caregiver.lastName ?? ''}`.trim() ||
      offer.caregiver.email
    const ownerName =
      `${booking.owner.firstName ?? ''} ${booking.owner.lastName ?? ''}`.trim() || booking.owner.email
    const ownerContact = [booking.owner.email, booking.owner.phone].filter(Boolean).join(' / ')
    const location = `${booking.city ?? ''}${booking.postalCode ? ` ${booking.postalCode}` : ''}`.trim()

    await createNotification({
      userId: offer.caregiver.id,
      type: 'ASSIGNMENT',
      title: `Nieuwe opdracht: ${serviceLabel}`,
      message: `${location} • ${new Date(booking.date).toLocaleDateString('nl-BE')}`,
      entityId: booking.id,
    })
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
    await sendAssignmentEmail({
      caregiverEmail: offer.caregiver.email,
      service: serviceLabel,
      date: booking.date,
      timeWindow: booking.timeWindow,
      time: booking.time ?? null,
      ownerName,
      ownerContact,
      location: location || 'Onbekend',
      link: `${baseUrl}/dashboard/caregiver`,
    })

    await createNotification({
      userId: booking.owner.id,
      type: 'ASSIGNMENT',
      title: 'Aanvraag bevestigd',
      message: `${serviceLabel} • Verzorger: ${caregiverName}`,
      entityId: booking.id,
    })
    await sendOwnerAssignmentEmail({
      ownerEmail: booking.owner.email,
      service: serviceLabel,
      date: booking.date,
      timeWindow: booking.timeWindow,
      time: booking.time ?? null,
      caregiverName,
      caregiverContact: offer.caregiver.email,
      location: location || 'Onbekend',
      link: `${baseUrl}/dashboard/owner/bookings`,
    })
    await sendAdminOwnerConfirmedEmail({
      service: serviceLabel,
      date: booking.date,
      timeWindow: booking.timeWindow,
      time: booking.time ?? null,
      ownerName,
      caregiverName,
      location: location || 'Onbekend',
      link: `${baseUrl}/admin`,
    })

    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    })
    await Promise.all(
      adminUsers.map((admin) =>
        createNotification({
          userId: admin.id,
          type: 'ASSIGNMENT',
          title: 'Owner bevestigde opdracht',
          message: `${serviceLabel} • ${ownerName} bevestigde ${caregiverName}`,
          entityId: booking.id,
        })
      )
    )

    return NextResponse.json({ success: true })
  }

  if (status !== 'CONFIRMED') {
    return NextResponse.json({ error: 'Ongeldige aanvraag' }, { status: 400 })
  }
  if (!booking.caregiverId || booking.status !== 'ASSIGNED') {
    return NextResponse.json({ error: 'Status kan niet worden bevestigd' }, { status: 400 })
  }

  await prisma.booking.update({
    where: { id },
    data: { status: 'CONFIRMED' },
  })

  return NextResponse.json({ success: true })
}