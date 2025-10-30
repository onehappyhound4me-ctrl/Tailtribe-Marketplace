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
    
    // Update user with service needs and preferences
    await db.user.update({
      where: { id: session.user.id },
      data: {
        preferences: JSON.stringify({
          primaryServices: body.services,
          frequency: body.frequency,
          timing: body.timing,
          location: body.location, // Now an array
          importantQualities: [] // Removed from UI, keep empty array for compatibility
        }),
        howHeardAbout: body.howHeard || null,
        perfectExperience: body.perfectExperience || null
      }
    })

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Update service needs error:', error)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}




