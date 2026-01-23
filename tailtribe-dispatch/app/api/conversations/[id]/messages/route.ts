import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { filterMessage } from '@/lib/chatModeration'
import { createNotification } from '@/lib/notifications'

async function authorize(conversationId: string, userId?: string, role?: string) {
  const convo = await prisma.conversation.findUnique({ where: { id: conversationId } })
  if (!convo) return { error: 'Not found', status: 404, convo: null }
  const isAdmin = role === 'ADMIN'
  const isOwner = convo.ownerId === userId
  const isCaregiver = convo.caregiverId === userId
  if (!isAdmin && !isOwner && !isCaregiver) {
    return { error: 'Forbidden', status: 403, convo: null }
  }
  return { convo, error: null, status: 200 }
}

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { convo, error, status } = await authorize(params.id, session.user?.id, session.user?.role)
  if (error || !convo) return NextResponse.json({ error }, { status })

  const { searchParams } = new URL(req.url)
  const sinceParam = searchParams.get('since')
  const sinceDate = sinceParam ? new Date(sinceParam) : null
  const sinceFilter =
    sinceDate && !Number.isNaN(sinceDate.getTime())
      ? { createdAt: { gt: sinceDate } }
      : {}
  const limit = Math.min(200, Math.max(20, Number(searchParams.get('limit') ?? 100) || 100))
  const offset = Math.max(0, Number(searchParams.get('offset') ?? 0) || 0)

  const messages = await prisma.message.findMany({
    where: { conversationId: convo.id, ...sinceFilter },
    orderBy: { createdAt: 'asc' },
    take: limit,
    skip: offset,
  })

  const filtered = messages.filter((m) => {
    if (m.blockedReason && m.senderUserId !== session.user!.id && session.user!.role !== 'ADMIN') {
      return false
    }
    return true
  })

  return NextResponse.json({ items: filtered, limit, offset })
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  const { convo, error, status } = await authorize(params.id, session.user?.id, session.user?.role)
  if (error || !convo) return NextResponse.json({ error }, { status })
  if (convo.status === 'LOCKED') {
    return NextResponse.json({ error: 'Gesprek is vergrendeld door admin.' }, { status: 403 })
  }

  const bodyJson = await req.json().catch(() => ({}))
  const text = String(bodyJson?.body ?? '')
  const moderation = filterMessage(text)

  if (!moderation.ok) {
    const msg = await prisma.message.create({
      data: {
        conversationId: convo.id,
        senderUserId: session.user!.id,
        senderRole: (session.user?.role ?? '').toUpperCase(),
        body: text,
        sanitizedBody: null,
        blockedReason: moderation.reason,
      },
    })
    await prisma.messageModerationLog.create({
      data: {
        messageId: msg.id,
        rule: moderation.reason,
        matchedTextHash: Buffer.from(moderation.reason).toString('base64'),
      },
    })
    return NextResponse.json({ error: moderation.reason }, { status: 400 })
  }

  const created = await prisma.message.create({
    data: {
      conversationId: convo.id,
      senderUserId: session.user!.id,
      senderRole: (session.user?.role ?? '').toUpperCase(),
      body: text,
      sanitizedBody: moderation.sanitizedBody,
    },
  })

  // Notify other participant
  const recipient =
    session.user?.id === convo.ownerId ? convo.caregiverId : session.user?.id === convo.caregiverId ? convo.ownerId : null
  if (recipient) {
    await createNotification({
      userId: recipient,
      type: 'CHAT_MESSAGE',
      title: 'Nieuw bericht over je booking',
      message: 'Je hebt een nieuw chatbericht.',
      entityId: convo.id,
    })
  }

  return NextResponse.json(created)
}
