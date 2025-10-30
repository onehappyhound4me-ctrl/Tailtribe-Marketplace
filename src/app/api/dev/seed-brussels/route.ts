import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    // Ensure a user exists
    const email = 'brussels.dogwalker@example.com'
    let user = await db.user.findUnique({ where: { email } })
    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name: 'Brusselse Hondenuitlater',
          role: 'CAREGIVER',
        },
      })
    }

    // Ensure a caregiver profile exists and is approved
    let profile = await db.caregiverProfile.findUnique({ where: { userId: user.id } })
    if (!profile) {
      profile = await db.caregiverProfile.create({
        data: {
          userId: user.id,
          city: 'Brussel-Stad',
          lat: 50.8503,
          lng: 4.3517,
          services: JSON.stringify(['DOG_WALKING', 'Hondenuitlaat']),
          hourlyRate: 20,
          bio: 'Betrouwbare hondenuitlater in regio Brussel.',
          photos: JSON.stringify([]),
          isApproved: true,
        },
      })
    } else if (!profile.isApproved) {
      profile = await db.caregiverProfile.update({
        where: { id: profile.id },
        data: { isApproved: true, city: 'Brussel-Stad' },
      })
    }

    return NextResponse.json({ ok: true, user, profile })
  } catch (e) {
    console.error('Seed error:', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}


