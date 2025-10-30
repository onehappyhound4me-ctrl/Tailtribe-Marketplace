import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    if (session.user.role !== 'CAREGIVER') {
      return NextResponse.json({ error: 'Alleen verzorgers kunnen hun profiel bijwerken' }, { status: 403 })
    }

    const body = await req.json()

    // Find caregiver profile
    const profile = await db.caregiverProfile.findUnique({
      where: { userId: session.user.id }
    })

    if (!profile) {
      return NextResponse.json({ error: 'Profiel niet gevonden' }, { status: 404 })
    }

    // Update profile
    await db.caregiverProfile.update({
      where: { id: profile.id },
      data: {
        city: body.city,
        postalCode: body.postalCode,
        actionRadius: body.actionRadius,
        bio: body.bio,
        services: body.services,
        animalTypes: body.animalTypes,
        customAnimalTypes: body.customAnimalTypes,
        animalSizes: body.animalSizes,
        maxAnimalsAtOnce: body.maxAnimalsAtOnce,
        servicePrices: body.servicePrices,
        iban: body.iban,
        accountHolder: body.accountHolder,
        vatNumber: body.vatNumber,
        businessNumber: body.businessNumber
      }
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('Error updating caregiver profile:', error)
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    )
  }
}















