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

    const { phone, city, country } = await request.json()

    if (!phone || !city) {
      return NextResponse.json({ error: 'Telefoon en stad zijn verplicht' }, { status: 400 })
    }

    // Update user profile
    const user = await db.user.update({
      where: { id: session.user.id },
      data: {
        phone,
        city,
        country: country || 'BE' // Default to Belgium if not provided
      }
    })

    return NextResponse.json({ success: true, user }, { status: 200 })
  } catch (error) {
    console.error('Update owner profile error:', error)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}

