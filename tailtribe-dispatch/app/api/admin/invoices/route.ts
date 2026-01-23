import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { SERVICE_LABELS } from '@/lib/services'

export const dynamic = 'force-dynamic'

const allowedStatuses = ['CONFIRMED']

function ensureAdmin(session: any) {
  return session && session.user?.role === 'ADMIN'
}

export async function GET() {
  const session = await auth()
  if (!ensureAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const drafts = await prisma.invoiceDraft.findMany({
    orderBy: { createdAt: 'desc' },
    include: {
      owner: { select: { id: true, email: true, firstName: true, lastName: true } },
      items: true,
    },
  })

  const payload = drafts.map((draft) => ({
    id: draft.id,
    status: draft.status,
    commissionPercent: draft.commissionPercent ?? null,
    createdAt: draft.createdAt.toISOString(),
    owner: {
      id: draft.owner.id,
      name: `${draft.owner.firstName ?? ''} ${draft.owner.lastName ?? ''}`.trim() || draft.owner.email,
      email: draft.owner.email,
    },
    items: draft.items.map((item) => ({
      id: item.id,
      bookingId: item.bookingId,
      service: item.service,
      serviceLabel: SERVICE_LABELS[item.service as keyof typeof SERVICE_LABELS] ?? item.service,
      serviceDate: item.serviceDate.toISOString(),
      quantity: item.quantity,
      unitPriceCents: item.unitPriceCents,
    })),
  }))

  return NextResponse.json(payload)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!ensureAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { ownerId, commissionPercent, items } = body as {
    ownerId?: string
    commissionPercent?: number | null
    items?: Array<{
      bookingId?: string | null
      service: string
      serviceDate: string
      quantity: number
      unitPriceCents: number
    }>
  }

  if (!ownerId || !Array.isArray(items) || items.length === 0) {
    return NextResponse.json({ error: 'ownerId en items zijn verplicht' }, { status: 400 })
  }

  const sanitizedCommission =
    commissionPercent !== null && commissionPercent !== undefined
      ? Math.max(0, Math.min(100, Math.round(Number(commissionPercent))))
      : null

  for (const item of items) {
    if (!item.service || !item.serviceDate || !Number.isFinite(item.quantity) || !Number.isFinite(item.unitPriceCents)) {
      return NextResponse.json({ error: 'Ongeldige factuurregels' }, { status: 400 })
    }
    if (item.quantity < 1 || item.unitPriceCents < 1) {
      return NextResponse.json({ error: 'Aantal en prijs moeten groter dan 0 zijn' }, { status: 400 })
    }
  }

  const bookingIds = items.map((item) => item.bookingId).filter(Boolean) as string[]
  if (bookingIds.length) {
    const bookings = await prisma.booking.findMany({
      where: { id: { in: bookingIds } },
      select: { id: true, ownerId: true, status: true },
    })
    const bookingMap = new Map(bookings.map((b) => [b.id, b]))
    for (const bookingId of bookingIds) {
      const booking = bookingMap.get(bookingId)
      if (!booking || booking.ownerId !== ownerId) {
        return NextResponse.json({ error: 'Alle geselecteerde opdrachten moeten bij dezelfde eigenaar horen' }, { status: 400 })
      }
      if (!allowedStatuses.includes(booking.status)) {
        return NextResponse.json({ error: 'Opdrachtstatus is niet facturatieklaar' }, { status: 400 })
      }
    }

    const alreadyLinked = await prisma.invoiceDraftItem.findMany({
      where: { bookingId: { in: bookingIds } },
      select: { bookingId: true },
    })
    if (alreadyLinked.length) {
      return NextResponse.json({ error: 'Sommige opdrachten zitten al in een factuurconcept' }, { status: 400 })
    }
  }

  const draft = await prisma.invoiceDraft.create({
    data: {
      ownerId,
      commissionPercent: sanitizedCommission,
      items: {
        create: items.map((item) => ({
          bookingId: item.bookingId ?? null,
          service: item.service,
          serviceDate: new Date(item.serviceDate),
          quantity: Math.round(item.quantity),
          unitPriceCents: Math.round(item.unitPriceCents),
        })),
      },
    },
  })

  return NextResponse.json({ success: true, id: draft.id })
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!ensureAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { id, status } = body as { id?: string; status?: string }
  if (!id || (status !== 'SENT' && status !== 'DRAFT')) {
    return NextResponse.json({ error: 'Ongeldige status' }, { status: 400 })
  }

  await prisma.invoiceDraft.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json({ success: true })
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!ensureAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { draftId, itemId } = body as { draftId?: string; itemId?: string }

  if (!draftId && !itemId) {
    return NextResponse.json({ error: 'draftId of itemId is vereist' }, { status: 400 })
  }

  if (itemId) {
    const item = await prisma.invoiceDraftItem.findUnique({
      where: { id: itemId },
      select: { id: true, invoiceId: true },
    })
    if (!item) {
      return NextResponse.json({ error: 'Factuurregel niet gevonden' }, { status: 404 })
    }
    const count = await prisma.invoiceDraftItem.count({
      where: { invoiceId: item.invoiceId },
    })
    if (count <= 1) {
      await prisma.invoiceDraft.delete({ where: { id: item.invoiceId } })
      return NextResponse.json({ success: true, deletedDraft: true })
    }
    await prisma.invoiceDraftItem.delete({ where: { id: itemId } })
    return NextResponse.json({ success: true })
  }

  await prisma.invoiceDraft.delete({ where: { id: draftId } })
  return NextResponse.json({ success: true })
}
