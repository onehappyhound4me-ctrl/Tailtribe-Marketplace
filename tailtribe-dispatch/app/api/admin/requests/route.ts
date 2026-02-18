import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { getEligibleCaregiversWithOptions } from '@/lib/matching'
import { assertSlotNotInPast } from '@/lib/date-utils'
import { createNotification } from '@/lib/notifications'
import { sendAssignmentEmail, sendCancellationEmail, sendOwnerAssignmentEmail } from '@/lib/email'
import { assertCaregiverAvailable } from '@/lib/availability'
import { SERVICE_LABELS } from '@/lib/services'
import { provinceSlugFromPostalCode } from '@/data/be-geo'
import { getPublicAppUrl } from '@/lib/env'

export const dynamic = 'force-dynamic'

const appUrl = getPublicAppUrl()

async function ensureConversation(bookingId: string, ownerId: string, caregiverId: string) {
  await prisma.conversation.upsert({
    where: { bookingId },
    update: { ownerId, caregiverId, status: 'ACTIVE' },
    create: { bookingId, ownerId, caregiverId, status: 'ACTIVE' },
  })
}

function ensureAdmin(session: any) {
  return session && session.user?.role === 'ADMIN'
}

export async function GET(req: NextRequest) {
  const session = await auth()
  if (!ensureAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(req.url)
  const includeUnavailable = searchParams.get('includeUnavailable') === '1'

  // Memoize eligible caregiver results within this request to avoid N+1 blowups
  const eligibleCache = new Map<string, Awaited<ReturnType<typeof getEligibleCaregiversWithOptions>>>()
  const eligibleFor = async (input: Parameters<typeof getEligibleCaregiversWithOptions>[0]) => {
    const dateKey = new Date(input.date).toISOString().slice(0, 10)
    const key = [
      input.service,
      input.timeWindow,
      dateKey,
      (input.region ?? '').trim(),
      (input.postalCode ?? '').trim(),
      includeUnavailable ? 'all' : 'available',
    ].join('|')
    const cached = eligibleCache.get(key)
    if (cached) return cached
    const computed = await getEligibleCaregiversWithOptions(input, {
      requireAvailability: !includeUnavailable,
    })
    eligibleCache.set(key, computed)
    return computed
  }

  const limitParam = searchParams.get('limit')
  const offsetParam = searchParams.get('offset')
  const limit = Math.min(100, Math.max(10, Number(limitParam ?? 50) || 50))
  const offset = Math.max(0, Number(offsetParam ?? 0) || 0)
  const usePagination = limitParam !== null || offsetParam !== null

  const requests = await prisma.ownerRequest.findMany({
    orderBy: { createdAt: 'desc' },
    ...(usePagination ? { skip: offset, take: limit } : {}),
    include: {
      owner: {
        include: {
          ownerProfile: true,
        },
      },
      occurrences: {
        orderBy: { scheduledDate: 'asc' },
        include: { assignedCaregiver: true },
      },
    },
  })

  const payload = []
  for (const reqItem of requests) {
    const occurrences = []
    for (const occ of reqItem.occurrences) {
      const eligible = await eligibleFor({
        service: occ.service,
        postalCode: occ.postalCode,
        region: occ.region ?? reqItem.region,
        date: occ.scheduledDate,
        timeWindow: occ.timeWindow,
      })
      occurrences.push({
        id: occ.id,
        scheduledDate: occ.scheduledDate,
        timeWindow: occ.timeWindow,
        time: occ.time,
        status: occ.status,
        assignedCaregiverId: occ.assignedCaregiverId,
        assignedCaregiverName: occ.assignedCaregiver
          ? `${occ.assignedCaregiver.firstName ?? ''} ${occ.assignedCaregiver.lastName ?? ''}`.trim() ||
            occ.assignedCaregiver.email
          : null,
        adminNotes: occ.adminNotes,
        eligibleCaregivers: eligible,
      })
    }

    payload.push({
      id: reqItem.id,
      owner: {
        id: reqItem.ownerId,
        name: `${reqItem.owner.firstName ?? ''} ${reqItem.owner.lastName ?? ''}`.trim() || reqItem.owner.email,
        email: reqItem.owner.email,
        phone: (reqItem.owner as any).phone ?? null,
        address: reqItem.owner.ownerProfile?.address ?? null,
        city: reqItem.owner.ownerProfile?.city ?? null,
        postalCode: reqItem.owner.ownerProfile?.postalCode ?? null,
        region:
          reqItem.owner.ownerProfile?.region ??
          provinceSlugFromPostalCode(reqItem.owner.ownerProfile?.postalCode ?? '') ??
          null,
        petsInfo: reqItem.owner.ownerProfile?.petsInfo ?? null,
      },
      service: reqItem.service,
      city: reqItem.city,
      postalCode: reqItem.postalCode,
      address: reqItem.address,
      region: reqItem.region ?? provinceSlugFromPostalCode(reqItem.postalCode ?? '') ?? null,
      preferredTime: reqItem.preferredTime,
      startDate: reqItem.startDate,
      recurrence: reqItem.recurrence,
      status: reqItem.status,
      notes: reqItem.notes,
      createdAt: reqItem.createdAt,
      occurrences,
    })
  }

  if (usePagination) {
    const total = await prisma.ownerRequest.count()
    return NextResponse.json({ items: payload, total, limit, offset })
  }

  return NextResponse.json(payload)
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  if (!ensureAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const { occurrenceId, caregiverId, status, adminNotes } = body as {
    occurrenceId?: string
    caregiverId?: string
    status?: string
    adminNotes?: string
  }
  if (!occurrenceId) {
    return NextResponse.json({ error: 'occurrenceId required' }, { status: 400 })
  }

  try {
    const occurrence = await prisma.bookingOccurrence.findUnique({
      where: { id: occurrenceId },
      select: {
        scheduledDate: true,
        timeWindow: true,
        time: true,
        requestId: true,
        service: true,
        city: true,
        postalCode: true,
        region: true,
        adminNotes: true,
        request: {
          select: {
            notes: true,
            service: true,
            city: true,
            postalCode: true,
            region: true,
            recurrence: true,
            owner: {
              select: { id: true, firstName: true, lastName: true, email: true, phone: true },
            },
          },
        },
      },
    })
    if (!occurrence) {
      return NextResponse.json({ error: 'Occurrence not found' }, { status: 404 })
    }
    try {
      assertSlotNotInPast({
        date: occurrence.scheduledDate.toISOString().slice(0, 10),
        timeWindow: occurrence.timeWindow,
        time: occurrence.time ?? undefined,
      })
    } catch (err: any) {
      return NextResponse.json(
        { error: err.message ?? 'Kan geen gebeurtenis in het verleden aanpassen' },
        { status: 400 }
      )
    }

    const data: any = {}
    if (status) data.status = status
    if (caregiverId) data.assignedCaregiverId = caregiverId
    if (adminNotes) data.adminNotes = adminNotes
    if (caregiverId) {
      data.status = 'ASSIGNED'
      data.adminNotes = adminNotes ?? `Toegewezen aan: ${caregiverId}`
    }

    if (caregiverId) {
      try {
        await assertCaregiverAvailable({
          caregiverUserId: caregiverId,
          date: occurrence.scheduledDate,
          timeWindow: occurrence.timeWindow,
        })
      } catch (err: any) {
        return NextResponse.json(
          { error: err.message ?? 'Verzorger is niet beschikbaar voor dit tijdsblok' },
          { status: 400 }
        )
      }
    }

    await prisma.bookingOccurrence.update({
      where: { id: occurrenceId },
      data,
    })

    // log decision
    await prisma.adminDecision.create({
      data: {
        requestId: occurrence.requestId,
        adminId: session!.user!.id,
        action: caregiverId ? 'ASSIGN' : status ? status : 'UPDATE',
        note: adminNotes,
      },
    })

    if (caregiverId) {
      try {
        const caregiver = await prisma.user.findUnique({
          where: { id: caregiverId },
          select: { email: true, firstName: true, lastName: true },
        })
        if (caregiver?.email) {
          const serviceLabel =
            SERVICE_LABELS[occurrence.service as keyof typeof SERVICE_LABELS] ?? occurrence.service
          await ensureConversation(occurrenceId, occurrence.request?.owner?.id ?? '', caregiverId)
          const ownerName =
            `${occurrence.request?.owner?.firstName ?? ''} ${occurrence.request?.owner?.lastName ?? ''}`.trim() ||
            occurrence.request?.owner?.email ||
            'Owner'
          const ownerContact = [occurrence.request?.owner?.email, occurrence.request?.owner?.phone]
            .filter(Boolean)
            .join(' / ')
          const caregiverName =
            `${caregiver.firstName ?? ''} ${caregiver.lastName ?? ''}`.trim() || caregiver.email
          const location = `${occurrence.city ?? occurrence.request?.city ?? ''}${
            occurrence.postalCode ?? occurrence.request?.postalCode
              ? ` ${occurrence.postalCode ?? occurrence.request?.postalCode}`
              : ''
          }`.trim()
          const petNotes = occurrence.adminNotes || occurrence.request?.notes || undefined
          const link = `${appUrl}/dashboard/caregiver`

          await createNotification({
            userId: caregiverId,
            type: 'ASSIGNMENT',
            title: `Nieuwe opdracht: ${serviceLabel}`,
            message: `${location} • ${new Date(occurrence.scheduledDate).toLocaleDateString('nl-BE')}`,
            entityId: occurrenceId,
          })

          await sendAssignmentEmail({
            caregiverEmail: caregiver.email,
            service: serviceLabel,
            date: occurrence.scheduledDate,
            timeWindow: occurrence.timeWindow,
            time: occurrence.time ?? null,
            ownerName,
            ownerContact,
            location: location || 'Onbekend',
            petNotes,
            link,
            recurringInfo: occurrence.request?.recurrence ?? null,
          })

          if (occurrence.request?.owner?.id && occurrence.request?.owner?.email) {
            await createNotification({
              userId: occurrence.request.owner.id,
              type: 'ASSIGNMENT',
              title: 'Aanvraag toegewezen',
              message: `${serviceLabel} • Verzorger: ${caregiverName}`,
              entityId: occurrenceId,
            })

            await sendOwnerAssignmentEmail({
              ownerEmail: occurrence.request.owner.email,
              service: serviceLabel,
              date: occurrence.scheduledDate,
              timeWindow: occurrence.timeWindow,
              time: occurrence.time ?? null,
              caregiverName,
              caregiverContact: caregiver.email,
              location: location || 'Onbekend',
              link: `${appUrl}/dashboard/owner/bookings`,
            })
          }
        }
      } catch (notifyErr) {
        console.error('Failed to send assignment notification/email (requests)', notifyErr)
      }
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('PATCH /api/admin/requests', e)
    return NextResponse.json({ error: 'Failed to update occurrence' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const session = await auth()
  if (!ensureAdmin(session)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  const body = await req.json().catch(() => ({}))
  const { occurrenceId, requestId } = body as { occurrenceId?: string; requestId?: string }

  if (!occurrenceId && !requestId) {
    return NextResponse.json({ error: 'occurrenceId or requestId required' }, { status: 400 })
  }

  try {
    if (occurrenceId) {
      const occurrence = await prisma.bookingOccurrence.findUnique({
        where: { id: occurrenceId },
        include: {
          assignedCaregiver: {
            select: { id: true, email: true, firstName: true, lastName: true },
          },
          request: {
            include: {
              owner: { select: { id: true, email: true, firstName: true, lastName: true } },
            },
          },
        },
      })
      await prisma.bookingOccurrence.delete({ where: { id: occurrenceId } })
      if (occurrence?.request?.owner?.id && occurrence.request.owner.email) {
        const serviceLabel =
          SERVICE_LABELS[occurrence.service as keyof typeof SERVICE_LABELS] ?? occurrence.service
        const location = `${occurrence.city ?? occurrence.request?.city ?? ''}${
          occurrence.postalCode ?? occurrence.request?.postalCode
            ? ` ${occurrence.postalCode ?? occurrence.request?.postalCode}`
            : ''
        }`.trim()
        const ownerLink = `${appUrl}/dashboard/owner/bookings`
        await createNotification({
          userId: occurrence.request.owner.id,
          type: 'CANCELLED',
          title: 'Aanvraag verwijderd',
          message: `${serviceLabel} • ${new Date(occurrence.scheduledDate).toLocaleDateString('nl-BE')}`,
          entityId: occurrenceId,
        })
        await sendCancellationEmail({
          recipientEmail: occurrence.request.owner.email,
          recipientRole: 'OWNER',
          service: serviceLabel,
          date: occurrence.scheduledDate,
          timeWindow: occurrence.timeWindow,
          time: occurrence.time ?? null,
          location: location || 'Onbekend',
          link: ownerLink,
        })
      }
      if (occurrence?.assignedCaregiver?.id && occurrence.assignedCaregiver.email) {
        const serviceLabel =
          SERVICE_LABELS[occurrence.service as keyof typeof SERVICE_LABELS] ?? occurrence.service
        const location = `${occurrence.city ?? occurrence.request?.city ?? ''}${
          occurrence.postalCode ?? occurrence.request?.postalCode
            ? ` ${occurrence.postalCode ?? occurrence.request?.postalCode}`
            : ''
        }`.trim()
        const caregiverLink = `${appUrl}/dashboard/caregiver`
        await createNotification({
          userId: occurrence.assignedCaregiver.id,
          type: 'CANCELLED',
          title: 'Opdracht verwijderd',
          message: `${serviceLabel} • ${new Date(occurrence.scheduledDate).toLocaleDateString('nl-BE')}`,
          entityId: occurrenceId,
        })
        await sendCancellationEmail({
          recipientEmail: occurrence.assignedCaregiver.email,
          recipientRole: 'CAREGIVER',
          service: serviceLabel,
          date: occurrence.scheduledDate,
          timeWindow: occurrence.timeWindow,
          time: occurrence.time ?? null,
          location: location || 'Onbekend',
          link: caregiverLink,
        })
      }
      return NextResponse.json({ success: true, deleted: 'occurrence' })
    }
    if (requestId) {
      const request = await prisma.ownerRequest.findUnique({
        where: { id: requestId },
        include: {
          owner: { select: { id: true, email: true, firstName: true, lastName: true } },
          occurrences: {
            include: {
              assignedCaregiver: {
                select: { id: true, email: true, firstName: true, lastName: true },
              },
            },
          },
        },
      })
      await prisma.ownerRequest.delete({ where: { id: requestId } })
      if (request?.owner?.id && request.owner.email) {
        const serviceLabel =
          SERVICE_LABELS[request.service as keyof typeof SERVICE_LABELS] ?? request.service
        const ownerLink = `${appUrl}/dashboard/owner/bookings`
        await createNotification({
          userId: request.owner.id,
          type: 'CANCELLED',
          title: 'Aanvraag verwijderd',
          message: `${serviceLabel}`,
          entityId: requestId,
        })
        await sendCancellationEmail({
          recipientEmail: request.owner.email,
          recipientRole: 'OWNER',
          service: serviceLabel,
          date: request.startDate,
          timeWindow: null,
          time: null,
          location: `${request.city ?? ''}${request.postalCode ? ` ${request.postalCode}` : ''}`.trim() || 'Onbekend',
          link: ownerLink,
        })
      }
      if (request?.occurrences?.length) {
        const caregiverLink = `${appUrl}/dashboard/caregiver`
        const notified = new Set<string>()
        for (const occ of request.occurrences) {
          const caregiver = occ.assignedCaregiver
          if (!caregiver?.id || !caregiver.email || notified.has(caregiver.id)) continue
          notified.add(caregiver.id)
          const serviceLabel =
            SERVICE_LABELS[request.service as keyof typeof SERVICE_LABELS] ?? request.service
          const location = `${occ.city ?? request.city ?? ''}${
            occ.postalCode ?? request.postalCode ? ` ${occ.postalCode ?? request.postalCode}` : ''
          }`.trim()
          await createNotification({
            userId: caregiver.id,
            type: 'CANCELLED',
            title: 'Opdracht verwijderd',
            message: `${serviceLabel}`,
            entityId: requestId,
          })
          await sendCancellationEmail({
            recipientEmail: caregiver.email,
            recipientRole: 'CAREGIVER',
            service: serviceLabel,
            date: occ.scheduledDate,
            timeWindow: occ.timeWindow,
            time: occ.time ?? null,
            location: location || 'Onbekend',
            link: caregiverLink,
          })
        }
      }
      return NextResponse.json({ success: true, deleted: 'request' })
    }
  } catch (e) {
    console.error('DELETE /api/admin/requests', e)
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500 })
  }
}
