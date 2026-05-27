import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { requireRole } from '@/lib/effective-session'

export async function GET() {
  const session = await auth()
  const authz = requireRole(session, ['OWNER'])
  if (!authz.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const profile = await prisma.ownerProfile.findUnique({
      where: { userId: authz.userId },
    })

    if (!profile) {
      return NextResponse.json(null)
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Failed to fetch owner profile:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  const session = await auth()
  const authz = requireRole(session, ['OWNER'])
  if (!authz.ok) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { city, postalCode, region, address, petsInfo } = body

    // Check if profile exists
    const existing = await prisma.ownerProfile.findUnique({
      where: { userId: authz.userId },
    })

    let profile

    if (existing) {
      // Update
      profile = await prisma.ownerProfile.update({
        where: { userId: authz.userId },
        data: {
          city,
          postalCode,
          region: region || null,
          address: address || null,
          petsInfo: petsInfo ? String(petsInfo).trim() : null,
        },
      })
    } else {
      // Create
      profile = await prisma.ownerProfile.create({
        data: {
          userId: authz.userId,
          city,
          postalCode,
          region: region || null,
          address: address || null,
          petsInfo: petsInfo ? String(petsInfo).trim() : null,
        },
      })
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error('Failed to save owner profile:', error)
    return NextResponse.json(
      { error: 'Failed to save profile' },
      { status: 500 }
    )
  }
}
