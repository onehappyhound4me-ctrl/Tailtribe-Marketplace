import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'

const profileSchema = z.object({
  name: z.string().min(2).optional(),
  bio: z.string().max(500).optional(),
  city: z.string().min(2).optional(),
  services: z.array(z.string()).optional(),
  hourlyRate: z.number().min(5).max(200).optional(),
})

export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validated = profileSchema.parse(body)

    // Update user name if provided
    if (validated.name) {
      await db.user.update({
        where: { id: session.user.id },
        data: { name: validated.name }
      })
    }

    // If caregiver, update profile
    if (session.user.role === 'CAREGIVER') {
      const caregiverData: any = {}
      
      if (validated.bio) caregiverData.bio = validated.bio
      if (validated.city) caregiverData.city = validated.city
      if (validated.hourlyRate) caregiverData.hourlyRate = validated.hourlyRate
      if (validated.services) caregiverData.services = JSON.stringify(validated.services)

      // Check if profile exists
      const existing = await db.caregiverProfile.findUnique({
        where: { userId: session.user.id }
      })

      if (existing) {
        await db.caregiverProfile.update({
          where: { userId: session.user.id },
          data: caregiverData
        })
      } else {
        // Create new profile
        await db.caregiverProfile.create({
          data: {
            userId: session.user.id,
            city: validated.city || 'Antwerpen',
            services: JSON.stringify(validated.services || []),
            hourlyRate: validated.hourlyRate || 20,
            bio: validated.bio,
          }
        })
      }
    }

    return NextResponse.json({
      message: 'Profiel bijgewerkt!'
    })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Profile update error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}




