import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { filterMessage } from '@/lib/chatModeration'

const ROOM_SLUG = 'verzorgers-community'
const ROOM_NAME = 'Community voor verzorgers'

const hasAccess = (role?: string | null) => role === 'CAREGIVER' || role === 'ADMIN'

const getRoom = async () => {
  return prisma.communityRoom.upsert({
    where: { slug: ROOM_SLUG },
    update: { name: ROOM_NAME },
    create: { slug: ROOM_SLUG, name: ROOM_NAME },
  })
}

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasAccess(session.user?.role)) {
    return NextResponse.json({ error: 'Geen toegang tot deze community.' }, { status: 403 })
  }

  const room = await getRoom()
  const messages = await prisma.communityMessage.findMany({
    where: { roomId: room.id },
    orderBy: { createdAt: 'asc' },
    take: 200,
  })

  const filtered = messages.filter((m) => {
    if (m.blockedReason && m.senderUserId !== session.user!.id && session.user!.role !== 'ADMIN') {
      return false
    }
    return true
  })

  return NextResponse.json(filtered)
}

export async function POST(req: NextRequest) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasAccess(session.user?.role)) {
    return NextResponse.json({ error: 'Geen toegang tot deze community.' }, { status: 403 })
  }

  const room = await getRoom()
  const bodyJson = await req.json().catch(() => ({}))
  const text = String(bodyJson?.body ?? '').trim()
  if (!text) {
    return NextResponse.json({ error: 'Bericht is leeg.' }, { status: 400 })
  }

  const moderation = filterMessage(text)
  if (!moderation.ok) {
    await prisma.communityMessage.create({
      data: {
        roomId: room.id,
        senderUserId: session.user!.id,
        senderRole: (session.user?.role ?? '').toUpperCase(),
        body: text,
        sanitizedBody: null,
        blockedReason: moderation.reason,
      },
    })
    return NextResponse.json({ error: moderation.reason }, { status: 400 })
  }

  const created = await prisma.communityMessage.create({
    data: {
      roomId: room.id,
      senderUserId: session.user!.id,
      senderRole: (session.user?.role ?? '').toUpperCase(),
      body: text,
      sanitizedBody: moderation.sanitizedBody,
    },
  })

  return NextResponse.json(created)
}
