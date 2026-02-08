import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

const DEFAULT_ROOMS = [
  {
    slug: 'vrije-chat',
    name: 'Vrije chat',
    description: 'Algemene chat zonder topic.',
    sortOrder: 0,
  },
  {
    slug: 'algemeen',
    name: 'Algemeen',
    description: 'Vragen, updates en klantensituaties.',
    sortOrder: 1,
  },
  {
    slug: 'tips-praktijk',
    name: 'Tips & praktijk',
    description: 'Praktische tips uit het veld en best practices.',
    sortOrder: 2,
  },
  {
    slug: 'gedrag-veiligheid',
    name: 'Gedrag & veiligheid',
    description: 'Gedrag, training en veiligheid onderweg.',
    sortOrder: 3,
  },
]

const hasAccess = (role?: string | null) => role === 'CAREGIVER' || role === 'ADMIN'

const ensureRooms = async () => {
  await Promise.all(
    DEFAULT_ROOMS.map((room) =>
      prisma.communityRoom.upsert({
        where: { slug: room.slug },
        update: {
          name: room.name,
          description: room.description,
          sortOrder: room.sortOrder,
        },
        create: room,
      })
    )
  )
}

const fallbackRooms = () =>
  DEFAULT_ROOMS.map((room) => ({
    id: room.slug,
    slug: room.slug,
    name: room.name,
    description: room.description,
    sortOrder: room.sortOrder,
  }))

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasAccess(session.user?.role)) {
    return NextResponse.json({ error: 'Geen toegang tot deze community.' }, { status: 403 })
  }

  const allowedSlugs = DEFAULT_ROOMS.map((r) => r.slug)

  try {
    await ensureRooms()
    const rooms = await prisma.communityRoom.findMany({
      where: { slug: { in: allowedSlugs } },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    })
    return NextResponse.json(rooms)
  } catch (error) {
    console.error('Failed to load community rooms:', error)
    return NextResponse.json(fallbackRooms())
  }
}
