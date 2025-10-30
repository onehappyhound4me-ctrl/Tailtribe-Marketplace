import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    // Get all pets for this user
    const pets = await db.pet.findMany({
      where: { ownerId: session.user.id },
      orderBy: { createdAt: 'desc' }
    })

    return NextResponse.json({ pets })

  } catch (error) {
    console.error('List pets error:', error)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}




































