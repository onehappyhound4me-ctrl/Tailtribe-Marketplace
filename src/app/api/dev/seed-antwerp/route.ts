import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    const email = 'antwerp.dogwalker@example.com'
    let user = await db.user.findUnique({ where: { email } })
    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name: 'Antwerpse Hondenuitlater',
          role: 'CAREGIVER',
        },
      })
    }

    let profile = await db.caregiverProfile.findUnique({ where: { userId: user.id } })
    if (!profile) {
      profile = await db.caregiverProfile.create({
        data: {
          userId: user.id,
          city: 'Antwerpen',
          lat: 51.2194,
          lng: 4.4025,
          services: JSON.stringify(['DOG_WALKING', 'Hondenuitlaat']),
          hourlyRate: 22,
          bio: 'Betrouwbare hondenuitlater in Antwerpen.',
          photos: JSON.stringify([]),
          isApproved: true,
        },
      })
    } else if (!profile.isApproved) {
      profile = await db.caregiverProfile.update({
        where: { id: profile.id },
        data: { isApproved: true, city: 'Antwerpen' },
      })
    }

    return NextResponse.json({ ok: true, user, profile })
  } catch (e) {
    console.error('Seed antwerp error:', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}


