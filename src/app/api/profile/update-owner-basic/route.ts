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
    const { firstName, lastName, phone, postalCode, city, country, lat, lng, notificationPreferences } = body

    // Build update data
    const updateData: any = {}
    
    if (firstName !== undefined) {
      updateData.firstName = firstName
      updateData.name = `${firstName} ${lastName || ''}`.trim()
    }
    if (lastName !== undefined) {
      updateData.lastName = lastName
      if (firstName) updateData.name = `${firstName} ${lastName}`.trim()
    }
    if (phone !== undefined) updateData.phone = phone
    if (postalCode !== undefined) updateData.postalCode = postalCode
    if (city !== undefined) updateData.city = city
    if (country !== undefined) updateData.country = country
    if (lat !== undefined) updateData.lat = lat
    if (lng !== undefined) updateData.lng = lng
    if (notificationPreferences !== undefined) {
      // Handle both string (already JSON) and object
      updateData.notificationPreferences = typeof notificationPreferences === 'string' 
        ? notificationPreferences 
        : JSON.stringify(notificationPreferences)
    }

    // Update user profile
    await db.user.update({
      where: { id: session.user.id },
      data: updateData
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Update owner basic error:', error)
    console.error('Error details:', {
      message: error.message,
      code: error.code,
      meta: error.meta
    })
    return NextResponse.json({ 
      error: 'Er ging iets mis', 
      details: error.message 
    }, { status: 500 })
  }
}

