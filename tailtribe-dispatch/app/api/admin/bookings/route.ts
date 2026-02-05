import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { assertSlotNotInPast } from '@/lib/date-utils'
import { createNotification } from '@/lib/notifications'
import { sendAssignmentEmail, sendCancellationEmail, sendOwnerAssignmentEmail } from '@/lib/email'
import { assertCaregiverAvailable } from '@/lib/availability'
import { SERVICE_LABELS } from '@/lib/services'
import { provinceSlugFromPostalCode } from '@/data/be-geo'

export const dynamic = 'force-dynamic'

async function ensureConversation(bookingId: string, ownerId: string, caregiverId: string) {
  await prisma.conversation.upsert({
    where: { bookingId },
    update: { ownerId, caregiverId, status: 'ACTIVE' },
    create: { bookingId, ownerId, caregiverId, status: 'ACTIVE' },
  })
}

export async function GET(request: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const limitParam = searchParams.get('limit')
  const offsetParam = searchParams.get('offset')
  const limit = Math.min(200, Math.max(10, Number(limitParam ?? 100) || 100))
  const offset = Math.max(0, Number(offsetParam ?? 0) || 0)
  const usePagination = limitParam !== null || offsetParam !== null

  const bookings = await prisma.booking.findMany({
    orderBy: { createdAt: 'desc' },
    ...(usePagination ? { skip: offset, take: limit } : {}),
    include: {
      owner: {
        include: {
          ownerProfile: true,
        },
      },
      caregiver: true,
    },
  })

  const payload = bookings.map((b) => {
    const caregiverName = b.caregiver
      ? `${b.caregiver.firstName ?? ''} ${b.caregiver.lastName ?? ''}`.trim() || b.caregiver.email
      : null
    const adminNotes = b.adminNotes ?? null
    const assignedTo =
      caregiverName ??
      (adminNotes
        ? adminNotes.replace(/^Toegewezen aan:\s*/i, '').trim() || adminNotes
        : null)

    return {
      id: b.id,
      ownerId: b.ownerId,
      service: b.service,
      date: b.date.toISOString(),
      time: b.time ?? null,
      timeWindow: b.timeWindow,
      city: b.city,
      postalCode: b.postalCode,
      region: b.region ?? provinceSlugFromPostalCode(b.postalCode ?? '') ?? null,
      petName: b.petName,
      petType: b.petType,
      status: b.status as any,
      caregiverId: b.caregiverId ?? null,
      caregiverName: caregiverName,
      assignedTo,
      ownerName:
        `${b.owner.firstName ?? ''} ${b.owner.lastName ?? ''}`.trim() ||
        (b as any).owner?.name ||
        b.owner.email,
      ownerEmail: b.owner.email,
      ownerPhone: (b.owner as any).phone ?? null,
      ownerAddress: b.owner.ownerProfile?.address ?? null,
      ownerCity: b.owner.ownerProfile?.city ?? null,
      ownerPostalCode: b.owner.ownerProfile?.postalCode ?? null,
      ownerRegion:
        b.owner.ownerProfile?.region ??
        provinceSlugFromPostalCode(b.owner.ownerProfile?.postalCode ?? '') ??
        null,
      ownerPetsInfo: b.owner.ownerProfile?.petsInfo ?? null,
      adminNotes,
      createdAt: b.createdAt.toISOString(),
    }
  })

  if (usePagination) {
    const total = await prisma.booking.count()
    return NextResponse.json({ items: payload, total, limit, offset })
  }

  return NextResponse.json(payload)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { id, status, caregiverName, adminNotes, assignedTo, caregiverId } = body as {
    id?: string
    status?: string
    caregiverName?: string
    adminNotes?: string
    assignedTo?: string
    caregiverId?: string
  }

  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  const data: any = {}
  if (status) data.status = status
  if (caregiverId) data.caregiverId = caregiverId
  const resolvedNote =
    caregiverName ??
    assignedTo ??
    (adminNotes ? adminNotes.replace(/^Toegewezen aan:\s*/i, '').trim() : null)
  if (resolvedNote) data.adminNotes = `Toegewezen aan: ${resolvedNote}`
  if (caregiverId && !data.status) data.status = 'ASSIGNED'

  try {
          const booking = await prisma.booking.findUnique({
            where: { id },
            select: {
              id: true,
              date: true,
              timeWindow: true,
              time: true,
              service: true,
              city: true,
              postalCode: true,
              region: true,
              address: true,
              petDetails: true,
              message: true,
              owner: {
                select: { id: true, firstName: true, lastName: true, email: true, phone: true },
              },
            },
          })
    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    try {
      assertSlotNotInPast({
        date: booking.date.toISOString().slice(0, 10),
        timeWindow: booking.timeWindow,
        time: booking.time ?? undefined,
      })
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message ?? 'Datum ligt in het verleden' },
        { status: 400 }
      )
    }

    if (caregiverId) {
      try {
        await assertCaregiverAvailable({
          caregiverUserId: caregiverId,
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

            const updated = await prisma.booking.update({
              where: { id },
              data,
            })

            if (caregiverId) {
              try {
                const caregiver = await prisma.user.findUnique({
                  where: { id: caregiverId },
                  select: { email: true, firstName: true, lastName: true },
                })
                if (caregiver?.email && booking) {
                  const serviceLabel =
                    SERVICE_LABELS[booking.service as keyof typeof SERVICE_LABELS] ?? booking.service
                  await ensureConversation(id, booking.owner.id, caregiverId)
                  const ownerName =
                    `${booking.owner?.firstName ?? ''} ${booking.owner?.lastName ?? ''}`.trim() ||
                    booking.owner?.email ||
                    'Owner'
                  const ownerContact = [booking.owner?.email, booking.owner?.phone].filter(Boolean).join(' / ')
                  const caregiverName =
                    `${caregiver.firstName ?? ''} ${caregiver.lastName ?? ''}`.trim() || caregiver.email
                  const location = `${booking.city ?? ''}${booking.postalCode ? ` ${booking.postalCode}` : ''}`.trim()
                  const petNotes = booking.petDetails || booking.message || undefined
                  const link = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'}/dashboard/caregiver`
                  await createNotification({
                    userId: caregiverId,
                    type: 'ASSIGNMENT',
                    title: `Nieuwe opdracht: ${serviceLabel}`,
                    message: `${location} • ${new Date(booking.date).toLocaleDateString('nl-BE')}`,
                    entityId: updated.id,
                  })
                  await sendAssignmentEmail({
                    caregiverEmail: caregiver.email,
                    service: serviceLabel,
                    date: booking.date,
                    timeWindow: booking.timeWindow,
                    time: booking.time ?? null,
                    ownerName,
                    ownerContact,
                    location: location || 'Onbekend',
                    petNotes,
                    link,
                  })

                  await createNotification({
                    userId: booking.owner.id,
                    type: 'ASSIGNMENT',
                    title: 'Aanvraag toegewezen',
                    message: `${serviceLabel} • Verzorger: ${caregiverName}`,
                    entityId: updated.id,
                  })

                  await sendOwnerAssignmentEmail({
                    ownerEmail: booking.owner.email,
                    service: serviceLabel,
                    date: booking.date,
                    timeWindow: booking.timeWindow,
                    time: booking.time ?? null,
                    caregiverName,
                    caregiverContact: caregiver.email,
                    location: location || 'Onbekend',
                    link: `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'}/dashboard/owner/bookings`,
                  })
                }
              } catch (notifyErr) {
                console.error('Failed to send assignment notification/email', notifyErr)
              }
            }

            return NextResponse.json({ success: true })
  } catch (e) {
    console.error('PATCH /api/admin/bookings', e)
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!session || session.user.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const { id } = body as { id?: string }
  if (!id) return NextResponse.json({ error: 'id is required' }, { status: 400 })

  try {
    const booking = await prisma.booking.findUnique({
      where: { id },
      include: {
        owner: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true },
        },
        caregiver: {
          select: { id: true, email: true, firstName: true, lastName: true, phone: true },
        },
      },
    })

    await prisma.booking.delete({ where: { id } })

    if (booking) {
      const serviceLabel =
        SERVICE_LABELS[booking.service as keyof typeof SERVICE_LABELS] ?? booking.service
      const location = `${booking.city ?? ''}${booking.postalCode ? ` ${booking.postalCode}` : ''}`.trim()
      const ownerLink = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'}/dashboard/owner/bookings`
      const caregiverLink = `${process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'}/dashboard/caregiver`

      await createNotification({
        userId: booking.owner.id,
        type: 'CANCELLED',
        title: 'Aanvraag verwijderd',
        message: `${serviceLabel} • ${new Date(booking.date).toLocaleDateString('nl-BE')}`,
        entityId: booking.id,
      })

      await sendCancellationEmail({
        recipientEmail: booking.owner.email,
        recipientRole: 'OWNER',
        service: serviceLabel,
        date: booking.date,
        timeWindow: booking.timeWindow,
        time: booking.time ?? null,
        location: location || 'Onbekend',
        link: ownerLink,
      })

      if (booking.caregiver?.id && booking.caregiver.email) {
        await createNotification({
          userId: booking.caregiver.id,
          type: 'CANCELLED',
          title: 'Opdracht verwijderd',
          message: `${serviceLabel} • ${new Date(booking.date).toLocaleDateString('nl-BE')}`,
          entityId: booking.id,
        })

        await sendCancellationEmail({
          recipientEmail: booking.caregiver.email,
          recipientRole: 'CAREGIVER',
          service: serviceLabel,
          date: booking.date,
          timeWindow: booking.timeWindow,
          time: booking.time ?? null,
          location: location || 'Onbekend',
          link: caregiverLink,
        })
      }
    }
    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('DELETE /api/admin/bookings', e)
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 })
  }
}
