import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { DISPATCH_SERVICES } from '@/lib/services'

const ALLOWED_UNITS = ['HALF_HOUR', 'HOUR', 'HALF_DAY', 'DAY'] as const

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
    select: { id: true, ownerId: true, service: true, status: true, caregiverId: true },
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

  return NextResponse.json({ success: true })
}
