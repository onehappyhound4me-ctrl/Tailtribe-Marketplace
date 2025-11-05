export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { caregiverProfileSchema } from '@/lib/validation/caregiverProfile'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { caregiverProfile: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    if (user.role !== 'CAREGIVER') {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 })
    }

    // Parse JSON fields for client
    const profile = user.caregiverProfile ? {
      ...user.caregiverProfile,
      profilePhoto: user.caregiverProfile.profilePhoto,
      services: user.caregiverProfile.services ? JSON.parse(user.caregiverProfile.services) : [],
      animalTypes: user.caregiverProfile.animalTypes ? JSON.parse(user.caregiverProfile.animalTypes) : [],
      animalSizes: user.caregiverProfile.animalSizes ? JSON.parse(user.caregiverProfile.animalSizes) : [],
      certificates: user.caregiverProfile.certificates ? JSON.parse(user.caregiverProfile.certificates) : [],
      photos: user.caregiverProfile.photos ? JSON.parse(user.caregiverProfile.photos) : [],
      servicePrices: user.caregiverProfile.servicePrices ? JSON.parse(user.caregiverProfile.servicePrices) : {}
    } : null

    return NextResponse.json({ 
      profile,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        image: user.image,
        role: user.role
      },
      hasProfile: !!user.caregiverProfile
    })

  } catch (error: any) {
    console.error('Error fetching caregiver profile:', error)
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    )
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email },
      include: { caregiverProfile: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    if (user.role !== 'CAREGIVER') {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 })
    }

    const body = await req.json()
    
    // Validate input
    const validation = caregiverProfileSchema.safeParse(body)
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validatiefout', details: validation.error.format() },
        { status: 400 }
      )
    }

    const data = validation.data

    // Prepare update data
    const updateData: any = {
      city: data.city,
      bio: data.bio || null,
      postalCode: data.postalCode || null,
      profilePhoto: data.profilePhoto || null,
      actionRadius: data.actionRadius || null,
      maxAnimalsAtOnce: data.maxAnimalsAtOnce || null,
      hourlyRate: data.hourlyRate,
      customAnimalTypes: data.customAnimalTypes || null,
      // Financial info
      iban: data.iban || null,
      accountHolder: data.accountHolder || null,
      vatNumber: data.vatNumber || null,
      businessNumber: data.businessNumber || null,
      servicePrices: data.servicePrices ? JSON.stringify(data.servicePrices) : null,
      // Convert arrays to JSON strings
      services: JSON.stringify(data.services),
      animalTypes: data.animalTypes ? JSON.stringify(data.animalTypes) : null,
      animalSizes: data.animalSizes ? JSON.stringify(data.animalSizes) : null,
      certificates: data.certificates ? JSON.stringify(data.certificates) : null,
      updatedAt: new Date()
    }

    // Update or create profile
    const profile = await db.caregiverProfile.upsert({
      where: { userId: user.id },
      create: {
        ...updateData,
        userId: user.id,
        country: 'BE'
      },
      update: updateData
    })

    // Parse for response
    const responseProfile = {
      ...profile,
      services: profile.services ? JSON.parse(profile.services) : [],
      animalTypes: profile.animalTypes ? JSON.parse(profile.animalTypes) : [],
      animalSizes: profile.animalSizes ? JSON.parse(profile.animalSizes) : [],
      certificates: profile.certificates ? JSON.parse(profile.certificates) : [],
      photos: profile.photos ? JSON.parse(profile.photos) : [],
      servicePrices: profile.servicePrices ? JSON.parse(profile.servicePrices) : {}
    }

    return NextResponse.json({ 
      profile: responseProfile,
      message: 'Profiel opgeslagen'
    })

  } catch (error: any) {
    console.error('Error updating caregiver profile:', error)
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    )
  }
}





