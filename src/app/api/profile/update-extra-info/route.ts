import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const body = await request.json()
    
    // Update user with extra info
    await db.user.update({
      where: { id: session.user.id },
      data: {
        howHeardAbout: body.howHeardAbout || null,
        perfectExperience: body.perfectExperience || null
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Update extra info error:', error)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}











































