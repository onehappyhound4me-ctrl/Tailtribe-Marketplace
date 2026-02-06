import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getImpersonationContext } from '@/lib/impersonation'
import { createNotification } from '@/lib/notifications'
import { SERVICE_LABELS } from '@/lib/services'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: NextRequest) {
  const session = await auth()
  const impersonation = getImpersonationContext(session)
  const effectiveRole = impersonation?.role ?? session?.user?.role
  const ownerId = impersonation?.role === 'OWNER' ? impersonation.userId : session?.user?.id

  if (!session || effectiveRole !== 'OWNER' || !ownerId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const { caregiverId, bookingIds } = body as { caregiverId?: string; bookingIds?: string[] }

  if (!caregiverId || !Array.isArray(bookingIds) || bookingIds.length === 0) {
    return NextResponse.json({ error: 'caregiverId en bookingIds zijn verplicht' }, { status: 400 })
  }

  // Only allow deleting offers for bookings owned by this owner and still unassigned.
  const owned = await prisma.booking.findMany({
    where: { id: { in: bookingIds }, ownerId },
    select: { id: true, caregiverId: true },
  })
  const allowedIds = owned.filter((b) => !b.caregiverId).map((b) => b.id)
  if (allowedIds.length === 0) {
    return NextResponse.json({ success: true, deleted: 0 })
  }

  const res = await prisma.bookingOffer.deleteMany({
    where: { bookingId: { in: allowedIds }, caregiverId },
  })

  // Notify admins + leave an admin note (best-effort) so rejections are visible in admin.
  try {
    const adminUsers = await prisma.user.findMany({
      where: { role: 'ADMIN' },
      select: { id: true },
    })

    const caregiver = await prisma.user.findUnique({
      where: { id: caregiverId },
      select: { email: true, firstName: true, lastName: true },
    })
    const caregiverName =
      caregiver
        ? `${caregiver.firstName ?? ''} ${caregiver.lastName ?? ''}`.trim() || caregiver.email
        : caregiverId

    const owner = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { email: true, firstName: true, lastName: true },
    })
    const ownerName =
      owner ? `${owner.firstName ?? ''} ${owner.lastName ?? ''}`.trim() || owner.email : ownerId

    const bookings = await prisma.booking.findMany({
      where: { id: { in: allowedIds }, ownerId },
      select: { id: true, service: true, date: true, adminNotes: true },
      orderBy: { date: 'asc' },
      take: 200,
    })

    const serviceSet = new Set<string>(bookings.map((b) => b.service))
    const serviceLabels = Array.from(serviceSet).map(
      (id) => (SERVICE_LABELS as Record<string, string>)[id] ?? id
    )

    const noteLine = `[owner rejected] ${new Date().toISOString()} • ${ownerName} weigerde ${caregiverName} (${serviceLabels.join(
      ' / '
    )})`

    await prisma.$transaction(
      bookings.map((b) =>
        prisma.booking.update({
          where: { id: b.id },
          data: {
            adminNotes: b.adminNotes ? `${b.adminNotes}\n${noteLine}` : noteLine,
          },
        })
      )
    )

    await Promise.all(
      adminUsers.map((admin) =>
        createNotification({
          userId: admin.id,
          type: 'OFFER',
          title: 'Voorstel geweigerd door eigenaar',
          message: `${ownerName} weigerde ${caregiverName} • ${res.count} dag(en) • ${serviceLabels.join(' • ')}`,
          entityId: allowedIds[0] ?? null,
        })
      )
    )
  } catch (e) {
    console.error('Failed to notify admins about rejected offer', e)
  }

  return NextResponse.json({ success: true, deleted: res.count })
}

