import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { getImpersonationContext } from '@/lib/impersonation'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

export async function GET() {
  const session = await auth()
  const impersonation = getImpersonationContext(session)
  const userId = impersonation?.userId ?? session?.user?.id
  if (!session || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const items = await prisma.notification.findMany({
    where: { userId },
    orderBy: { createdAt: 'desc' },
    take: 20,
  })

  return NextResponse.json(
    items.map((n) => ({
      id: n.id,
      type: n.type,
      title: n.title,
      message: n.message,
      entityId: n.entityId,
      readAt: n.readAt ? n.readAt.toISOString() : null,
      createdAt: n.createdAt.toISOString(),
    }))
  )
}

export async function PATCH(req: NextRequest) {
  const session = await auth()
  const impersonation = getImpersonationContext(session)
  const userId = impersonation?.userId ?? session?.user?.id
  if (!session || !userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const body = await req.json().catch(() => ({}))
  const idsRaw = Array.isArray(body?.ids) ? body.ids : body?.id ? [body.id] : []
  const ids = idsRaw.map((x: any) => String(x)).filter(Boolean)
  if (ids.length === 0) {
    return NextResponse.json({ error: 'Missing id(s)' }, { status: 400 })
  }

  const res = await prisma.notification.updateMany({
    where: { userId, id: { in: ids }, readAt: null },
    data: { readAt: new Date() },
  })

  return NextResponse.json({ success: true, updated: res.count })
}
