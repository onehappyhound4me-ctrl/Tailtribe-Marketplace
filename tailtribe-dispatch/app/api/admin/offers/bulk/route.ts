import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { DISPATCH_SERVICES } from '@/lib/services'
import { createNotification } from '@/lib/notifications'
import { sendCaregiverOfferEmail, sendOwnerOfferEmail } from '@/lib/email'

const ALLOWED_UNITS = ['HALF_HOUR', 'HOUR', 'HALF_DAY', 'DAY'] as const
export const runtime = 'nodejs'

function startOfToday() {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { bookingId, caregiverId } = body as { bookingId?: string; caregiverId?: string }
  if (!bookingId || !caregiverId) {
    return NextResponse.json({ error: 'bookingId en caregiverId zijn verplicht' }, { status: 400 })
  }

  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      ownerId: true,
      service: true,
      caregiverId: true,
      owner: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
  })
  if (!booking) return NextResponse.json({ error: 'Booking niet gevonden' }, { status: 404 })
  if (booking.caregiverId) {
    return NextResponse.json({ error: 'Deze aanvraag heeft al een verzorger.' }, { status: 400 })
  }

  const caregiverProfile = await prisma.caregiverProfile.findUnique({
    where: { userId: caregiverId },
    select: { services: true, servicePricing: true },
  })
  if (!caregiverProfile) {
    return NextResponse.json({ error: 'Verzorger niet gevonden' }, { status: 404 })
  }

  let services: string[] = []
  try {
    services = JSON.parse(caregiverProfile.services || '[]')
    if (!Array.isArray(services)) services = []
  } catch {
    services = []
  }
  if (!services.includes(booking.service)) {
    return NextResponse.json({ error: 'Verzorger biedt deze dienst niet aan.' }, { status: 400 })
  }

  let pricing: Record<string, { unit: string; priceCents: number }> = {}
  try {
    pricing = JSON.parse(caregiverProfile.servicePricing || '{}')
    if (!pricing || typeof pricing !== 'object') pricing = {}
  } catch {
    pricing = {}
  }
  // SPEED/SHIP: allow bulk propose even if pricing isn't configured yet.
  // The owner UI will show "Prijs in overleg" when priceCents is 0.
  const priceEntryRaw = pricing[booking.service]
  const priceEntry =
    priceEntryRaw && ALLOWED_UNITS.includes(priceEntryRaw.unit as any)
      ? priceEntryRaw
      : { unit: 'DAY', priceCents: 0 }

  const targets = await prisma.booking.findMany({
    where: {
      ownerId: booking.ownerId,
      service: booking.service,
      caregiverId: null,
      // only upcoming (avoid old items)
      date: { gte: startOfToday() },
    },
    select: { id: true },
    orderBy: { date: 'asc' },
    take: 120,
  })

  if (targets.length === 0) {
    return NextResponse.json({ success: true, created: 0, total: 0 })
  }

  const res = await prisma.bookingOffer.createMany({
    data: targets.map((t) => ({
      bookingId: t.id,
      caregiverId,
      unit: priceEntry.unit,
      priceCents: priceEntry.priceCents,
    })),
    skipDuplicates: true,
  })

  // Notify once (best-effort)
  try {
    const serviceLabel = DISPATCH_SERVICES.find((s) => s.id === booking.service)?.name || booking.service
    const ownerName =
      `${booking.owner.firstName ?? ''} ${booking.owner.lastName ?? ''}`.trim() || booking.owner.email
    const caregiver = await prisma.user.findUnique({
      where: { id: caregiverId },
      select: { id: true, email: true, firstName: true, lastName: true },
    })
    const caregiverName =
      caregiver ? `${caregiver.firstName ?? ''} ${caregiver.lastName ?? ''}`.trim() || caregiver.email : 'Verzorger'

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
    const ownerLink = `${appUrl}/dashboard/owner/bookings`
    const caregiverLink = `${appUrl}/dashboard/caregiver`

    await createNotification({
      userId: booking.ownerId,
      type: 'OFFER',
      title: 'Nieuwe verzorger voorgesteld',
      message: `${serviceLabel} • ${res.count} dag(en)`,
      entityId: booking.id,
    })

    if (caregiver?.id) {
      await createNotification({
        userId: caregiver.id,
        type: 'OFFER',
        title: 'Je bent voorgesteld',
        message: `${serviceLabel} • ${res.count} dag(en) • Wacht op bevestiging van de eigenaar`,
        entityId: booking.id,
      })
    }

    if (booking.owner.email) {
      await sendOwnerOfferEmail({
        ownerEmail: booking.owner.email,
        ownerName,
        serviceLabel,
        caregiverName,
        link: ownerLink,
      })
    }

    if (caregiver?.email) {
      await sendCaregiverOfferEmail({
        caregiverEmail: caregiver.email,
        caregiverName,
        serviceLabel,
        link: caregiverLink,
      })
    }
  } catch (notifyErr) {
    console.error('Failed to send bulk offer notification/email', notifyErr)
  }

  return NextResponse.json({ success: true, created: res.count, total: targets.length })
}

