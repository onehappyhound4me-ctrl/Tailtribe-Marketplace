import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'

const hasAccess = (role?: string | null) => role === 'CAREGIVER' || role === 'ADMIN'

export async function GET() {
  const session = await auth()
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  if (!hasAccess(session.user?.role)) {
    return NextResponse.json({ error: 'Geen toegang tot deze community.' }, { status: 403 })
  }

  const caregivers = await prisma.user.findMany({
    where: { role: 'CAREGIVER' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      image: true,
      caregiverProfile: {
        select: {
          city: true,
          region: true,
          isApproved: true,
          isActive: true,
        },
      },
    },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    take: 200,
  })

  const admins = await prisma.user.findMany({
    where: { role: 'ADMIN' },
    select: {
      id: true,
      firstName: true,
      lastName: true,
      image: true,
    },
    orderBy: [{ firstName: 'asc' }, { lastName: 'asc' }],
    take: 50,
  })

  return NextResponse.json({
    caregivers: caregivers.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      image: user.image,
      city: user.caregiverProfile?.city ?? '',
      region: user.caregiverProfile?.region ?? '',
      isApproved: user.caregiverProfile?.isApproved ?? false,
      isActive: user.caregiverProfile?.isActive ?? false,
    })),
    admins: admins.map((user) => ({
      id: user.id,
      name: `${user.firstName} ${user.lastName}`.trim(),
      image: user.image,
    })),
  })
}
