import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { filterMessage } from '@/lib/chatModeration'
import { checkRateLimit } from '@/lib/rate-limit'

const DEFAULT_ROOMS = [
  { slug: 'vrije-chat', name: 'Vrije chat', description: 'Algemene chat zonder topic.', sortOrder: 0 },
  { slug: 'algemeen', name: 'Algemeen', description: 'Vragen, updates en klantensituaties.', sortOrder: 1 },
  { slug: 'tips-praktijk', name: 'Tips & praktijk', description: 'Praktische tips uit het veld en best practices.', sortOrder: 2 },
  { slug: 'gedrag-veiligheid', name: 'Gedrag & veiligheid', description: 'Gedrag, training en veiligheid onderweg.', sortOrder: 3 },
]

const hasAccess = (role?: string | null) => role === 'CAREGIVER' || role === 'ADMIN'

const RATE_LIMIT_WINDOW_MS = 30_000
const RATE_LIMIT_MAX = 6

const ensureRoom = async (slug: string) => {
  const preset = DEFAULT_ROOMS.find((room) => room.slug === slug)
  if (!preset) return null
  return prisma.communityRoom.upsert({
    where: { slug },
    update: {
      name: preset.name,
      description: preset.description,
      sortOrder: preset.sortOrder,
    },
    create: preset,
  })
}

export async function GET(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasAccess(session.user?.role)) {
    return NextResponse.json({ error: 'Geen toegang tot deze community.' }, { status: 403 })
  }

  try {
    const room = await ensureRoom(params.slug)
    if (!room) return NextResponse.json({ error: 'Topic niet gevonden.' }, { status: 404 })

    const { searchParams } = new URL(req.url)
    const sinceParam = searchParams.get('since')
    const sinceDate = sinceParam ? new Date(sinceParam) : null
    const sinceFilter =
      sinceDate && !Number.isNaN(sinceDate.getTime())
        ? { createdAt: { gt: sinceDate } }
        : {}

    const messages = await prisma.communityMessage.findMany({
      where: { roomId: room.id, ...sinceFilter },
      orderBy: { createdAt: 'asc' },
      take: 200,
    })

    const senderIds = Array.from(new Set(messages.map((msg) => msg.senderUserId)))
    const senders = await prisma.user.findMany({
      where: { id: { in: senderIds } },
      select: { id: true, firstName: true, lastName: true },
    })
    const senderMap = new Map(
      senders.map((sender) => [sender.id, `${sender.firstName} ${sender.lastName}`.trim()])
    )

    const filtered = messages.filter((m) => {
      if (m.blockedReason && m.senderUserId !== session.user!.id && session.user!.role !== 'ADMIN') {
        return false
      }
      return true
    })

    return NextResponse.json(
      filtered.map((msg) => ({
        ...msg,
        senderName: senderMap.get(msg.senderUserId) ?? 'Onbekend',
      }))
    )
  } catch (error) {
    console.error('Failed to load community messages:', error)
    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(req: NextRequest, { params }: { params: { slug: string } }) {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasAccess(session.user?.role)) {
    return NextResponse.json({ error: 'Geen toegang tot deze community.' }, { status: 403 })
  }
  const rateKey = session.user?.id
    ? `community:${params.slug}:${session.user.id}`
    : null
  if (rateKey) {
    const rate = await checkRateLimit(rateKey, RATE_LIMIT_MAX, RATE_LIMIT_WINDOW_MS)
    if (!rate.allowed) {
      return NextResponse.json(
        { error: 'Je verstuurt te snel berichten. Probeer zo opnieuw.' },
        { status: 429 }
      )
    }
  }

  let room
  try {
    room = await ensureRoom(params.slug)
  } catch (error) {
    console.error('Failed to load community room:', error)
    return NextResponse.json(
      { error: 'Community is nog niet geactiveerd. Voer de database migratie uit.' },
      { status: 503 }
    )
  }
  if (!room) return NextResponse.json({ error: 'Topic niet gevonden.' }, { status: 404 })

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
