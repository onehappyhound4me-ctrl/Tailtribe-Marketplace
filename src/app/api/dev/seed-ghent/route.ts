import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST() {
  try {
    const email = 'ghent.sitter@example.com'
    let user = await db.user.findUnique({ where: { email } })
    if (!user) {
      user = await db.user.create({
        data: {
          email,
          name: 'Gentse Dierenoppas',
          role: 'CAREGIVER',
        },
      })
    }

    let profile = await db.caregiverProfile.findUnique({ where: { userId: user.id } })
    if (!profile) {
      profile = await db.caregiverProfile.create({
        data: {
          userId: user.id,
          city: 'Gent',
          lat: 51.0543,
          lng: 3.7174,
          services: JSON.stringify(['PET_SITTING', 'Dierenoppas']),
          hourlyRate: 24,
          bio: 'Ervaren dierenoppas in Gent.',
          photos: JSON.stringify([]),
          isApproved: true,
        },
      })
    } else if (!profile.isApproved) {
      profile = await db.caregiverProfile.update({
        where: { id: profile.id },
        data: { isApproved: true, city: 'Gent' },
      })
    }

    return NextResponse.json({ ok: true, user, profile })
  } catch (e) {
    console.error('Seed ghent error:', e)
    return NextResponse.json({ ok: false }, { status: 500 })
  }
}


