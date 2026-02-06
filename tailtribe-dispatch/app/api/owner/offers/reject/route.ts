import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { getImpersonationContext } from '@/lib/impersonation'

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

  return NextResponse.json({ success: true, deleted: res.count })
}

