import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { notifyCaregiversAboutNewOwner } from '@/lib/email-notifications'

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const { preferences } = await request.json()

    // Update user - mark onboarding as complete
    // Don't overwrite preferences if not provided
    const updateData: any = {
      onboardingCompleted: true
    }
    
    // Only update preferences if explicitly provided
    if (preferences) {
      updateData.preferences = JSON.stringify(preferences)
    }
    
    const user = await db.user.update({
      where: { id: session.user.id },
      data: updateData,
      include: {
        pets: {
          select: {
            name: true
          }
        }
      }
    })

    // Send email notifications to caregivers if owner has city
    if (user.role === 'OWNER' && user.city) {
      const petNames = user.pets.map(p => p.name)
      
      // Fire and forget - don't block response
      notifyCaregiversAboutNewOwner({
        ownerName: user.name || 'Nieuwe eigenaar',
        ownerCity: user.city,
        petNames
      }).catch(err => console.error('Email notification failed:', err))
    }

    return NextResponse.json({ success: true, user }, { status: 200 })
  } catch (error) {
    console.error('Complete onboarding error:', error)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}

