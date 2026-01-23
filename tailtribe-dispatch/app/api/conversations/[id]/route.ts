import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

async function getConversationWithAuth(id: string, userId: string | undefined, role: string | undefined) {
  const convo = await prisma.conversation.findUnique({ where: { id } })
  if (!convo) return { error: 'Not found', status: 404, convo: null }
  const isAdmin = role === 'ADMIN'
  const isOwner = convo.ownerId === userId
  const isCaregiver = convo.caregiverId === userId
  if (!isAdmin && !isOwner && !isCaregiver) {
    return { error: 'Forbidden', status: 403, convo: null }
  }
  return { convo, error: null, status: 200 }
}

export async function GET(_: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { id } = params
  const { convo, error, status } = await getConversationWithAuth(id, session.user?.id, session.user?.role)
  if (error || !convo) return NextResponse.json({ error }, { status })
  return NextResponse.json(convo)
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }
  const { id } = params
  const body = await req.json().catch(() => ({}))
  const { status } = body as { status?: string }
  if (!status || !['ACTIVE', 'LOCKED'].includes(status)) {
    return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
  }
  const updated = await prisma.conversation.update({
    where: { id },
    data: { status },
  })
  return NextResponse.json(updated)
}
