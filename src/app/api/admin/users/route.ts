import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Geen toegang' },
        { status: 403 }
      )
    }

    const { searchParams } = new URL(request.url)
    const role = searchParams.get('role')
    const search = searchParams.get('search')

    const where: any = {}
    if (role) where.role = role
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
      ]
    }

    const users = await db.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        caregiverProfile: {
          select: {
            city: true,
            isApproved: true,
            hourlyRate: true,
          }
        },
        _count: {
          select: {
            bookingsOwned: true,
            bookingsAsCarer: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    return NextResponse.json({ users })

  } catch (error) {
    console.error('Admin users error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

// Update user (approve caregiver, change role, etc)
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user || session.user.role !== 'ADMIN') {
      return NextResponse.json(
        { error: 'Geen toegang' },
        { status: 403 }
      )
    }

    const { userId, action, value } = await request.json()

    if (!userId || !action) {
      return NextResponse.json(
        { error: 'userId and action are required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'approve_caregiver':
        await db.caregiverProfile.update({
          where: { userId },
          data: { isApproved: true }
        })
        break

      case 'reject_caregiver':
        await db.caregiverProfile.update({
          where: { userId },
          data: { isApproved: false }
        })
        break

      case 'change_role':
        if (!['OWNER', 'CAREGIVER', 'ADMIN'].includes(value)) {
          return NextResponse.json(
            { error: 'Invalid role' },
            { status: 400 }
          )
        }
        await db.user.update({
          where: { id: userId },
          data: { role: value }
        })
        break

      default:
        return NextResponse.json(
          { error: 'Unknown action' },
          { status: 400 }
        )
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Admin update error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}




