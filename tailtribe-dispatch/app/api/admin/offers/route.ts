import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { DISPATCH_SERVICES } from '@/lib/services'
import { createNotification } from '@/lib/notifications'
import { sendCaregiverOfferEmail, sendOwnerOfferEmail } from '@/lib/email'

const ALLOWED_UNITS = ['HALF_HOUR', 'HOUR', 'HALF_DAY', 'DAY'] as const
export const runtime = 'nodejs'

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
      status: true,
      caregiverId: true,
      owner: { select: { id: true, email: true, firstName: true, lastName: true } },
    },
  })
  if (!booking) {
    return NextResponse.json({ error: 'Booking niet gevonden' }, { status: 404 })
  }
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
  const priceEntry = pricing[booking.service]
  if (!priceEntry || !ALLOWED_UNITS.includes(priceEntry.unit as any) || !priceEntry.priceCents) {
    const label =
      DISPATCH_SERVICES.find((s) => s.id === booking.service)?.name || booking.service
    return NextResponse.json(
      { error: `Verzorger heeft geen prijs ingesteld voor ${label}.` },
      { status: 400 }
    )
  }

  try {
    await prisma.bookingOffer.create({
      data: {
        bookingId: booking.id,
        caregiverId,
        unit: priceEntry.unit,
        priceCents: priceEntry.priceCents,
      },
    })
  } catch (e) {
    return NextResponse.json(
      { error: 'Deze verzorger is al voorgesteld voor deze aanvraag.' },
      { status: 400 }
    )
  }

  // Notify owner + caregiver (best-effort)
  try {
    const serviceLabel =
      DISPATCH_SERVICES.find((s) => s.id === booking.service)?.name || booking.service

    const ownerName =
      `${booking.owner.firstName ?? ''} ${booking.owner.lastName ?? ''}`.trim() || booking.owner.email

    const caregiver = await prisma.user.findUnique({
      where: { id: caregiverId },
      select: { id: true, email: true, firstName: true, lastName: true },
    })
    const caregiverName =
      caregiver
        ? `${caregiver.firstName ?? ''} ${caregiver.lastName ?? ''}`.trim() || caregiver.email
        : 'Verzorger'

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
    const ownerLink = `${appUrl}/dashboard/owner/bookings`
    const caregiverLink = `${appUrl}/dashboard/caregiver`

    await createNotification({
      userId: booking.ownerId,
      type: 'OFFER',
      title: 'Nieuwe verzorger voorgesteld',
      message: `${serviceLabel} • Verzorger: ${caregiverName}`,
      entityId: booking.id,
    })

    if (caregiver?.id) {
      await createNotification({
        userId: caregiver.id,
        type: 'OFFER',
        title: 'Je bent voorgesteld',
        message: `${serviceLabel} • Wacht op bevestiging van de eigenaar`,
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
    console.error('Failed to send offer notification/email', notifyErr)
  }

  return NextResponse.json({ success: true })
}
