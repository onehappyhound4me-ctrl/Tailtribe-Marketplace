import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

const allowedStatuses = ['CONFIRMED', 'COMPLETED']

async function getBookingContext(bookingId: string) {
  const booking = await prisma.booking.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      status: true,
      ownerId: true,
      caregiverId: true,
      service: true,
      date: true,
      timeWindow: true,
      time: true,
    },
  })
  if (booking) {
    return {
      bookingId: booking.id,
      ownerId: booking.ownerId,
      caregiverId: booking.caregiverId,
      status: booking.status,
      type: 'BOOKING' as const,
      service: booking.service,
      date: booking.date,
      timeWindow: booking.timeWindow,
      time: booking.time,
    }
  }
  const occurrence = await prisma.bookingOccurrence.findUnique({
    where: { id: bookingId },
    select: {
      id: true,
      status: true,
      assignedCaregiverId: true,
      scheduledDate: true,
      timeWindow: true,
      time: true,
      service: true,
      request: { select: { ownerId: true } },
    },
  })
  if (occurrence) {
    return {
      bookingId: occurrence.id,
      ownerId: occurrence.request?.ownerId ?? '',
      caregiverId: occurrence.assignedCaregiverId ?? null,
      status: occurrence.status,
      type: 'REQUEST' as const,
      service: occurrence.service,
      date: occurrence.scheduledDate,
      timeWindow: occurrence.timeWindow,
      time: occurrence.time,
    }
  }
  return null
}

function isEligible(ctx: Awaited<ReturnType<typeof getBookingContext>>) {
  if (!ctx) return false
  if (!ctx.caregiverId) return false
  return allowedStatuses.includes(ctx.status)
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const { searchParams } = new URL(req.url)
  const bookingId = searchParams.get('bookingId')
  if (!bookingId) {
    if (session.user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'bookingId is required' }, { status: 400 })
    }
    const convos = await prisma.conversation.findMany({
      orderBy: { createdAt: 'desc' },
      take: 50,
    })
    return NextResponse.json(convos)
  }

  const ctx = await getBookingContext(bookingId)
  if (!ctx) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

  const isAdmin = session.user?.role === 'ADMIN'
  const isOwner = session.user?.id === ctx.ownerId
  const isCaregiver = session.user?.id === ctx.caregiverId

  if (!isAdmin && !isOwner && !isCaregiver) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  if (!isEligible(ctx)) {
    return NextResponse.json(
      { error: 'Chat beschikbaar na bevestiging door de eigenaar.' },
      { status: 403 }
    )
  }

  const convo = await prisma.conversation.upsert({
    where: { bookingId: ctx.bookingId },
    update: { ownerId: ctx.ownerId, caregiverId: ctx.caregiverId!, status: 'ACTIVE' },
    create: {
      bookingId: ctx.bookingId,
      ownerId: ctx.ownerId,
      caregiverId: ctx.caregiverId!,
      status: 'ACTIVE',
    },
  })

  return NextResponse.json({
    ...convo,
    context: {
      type: ctx.type,
      service: ctx.service,
      date: ctx.date,
      timeWindow: ctx.timeWindow,
      time: ctx.time,
    },
  })
}
