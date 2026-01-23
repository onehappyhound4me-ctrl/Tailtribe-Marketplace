import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

// Simple distance calculation (Haversine formula)
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 6371 // Radius of Earth in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180
  const dLon = ((lon2 - lon1) * Math.PI) / 180
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2)
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  return R * c
}

export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    // Check admin auth
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (session.user.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Not an admin' }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')

    if (!bookingId) {
      return NextResponse.json(
        { error: 'Booking ID required' },
        { status: 400 }
      )
    }

    // Fetch booking details
    const booking = await prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        owner: {
          select: {
            firstName: true,
            lastName: true,
          },
        },
      },
    })

    if (!booking) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // Fetch all active caregivers
    const caregivers = await prisma.caregiverProfile.findMany({
      where: {
        isApproved: true,
        isActive: true,
      },
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
          },
        },
        availability: {
          where: {
            date: booking.date,
            isAvailable: true,
          },
        },
      },
    })

    const normalize = (value?: string | null) => (value ?? '').trim().toLowerCase()
    const parseRegions = (value?: string | null) => {
      if (!value) return [] as string[]
      try {
        const parsed = JSON.parse(value)
        return Array.isArray(parsed) ? parsed : []
      } catch {
        return []
      }
    }

    // Calculate match score for each caregiver
    const matches = caregivers
      .map((caregiver) => {
        let score = 0
        const reasons: string[] = []
        const warnings: string[] = []

        // 1. Check availability (40 points max)
        const hasAvailability = caregiver.availability.some(
          (avail) => avail.timeWindow === booking.timeWindow
        )
        if (hasAvailability) {
          score += 40
          reasons.push('✓ Beschikbaar op dit tijdstip')
        } else {
          warnings.push('⚠️ Geen beschikbaarheid ingevuld')
        }

        // 2. Check service capability (30 points max)
        let services: string[] = []
        try {
          services = JSON.parse(caregiver.services || '[]')
        } catch {
          services = []
        }
        if (services && services.includes(booking.service)) {
          score += 30
          reasons.push('✓ Heeft ervaring met deze service')
        } else {
          warnings.push('⚠️ Service niet in profiel')
        }

        // 3. Check region (province) match (30 points max)
        const targetRegion = normalize(booking.region)
        const caregiverRegion = normalize(caregiver.region)
        const caregiverWorkRegions = parseRegions(caregiver.workRegions)
          .map((region) => normalize(region))
          .filter(Boolean)
        const provinceMatch =
          targetRegion &&
          (caregiverRegion === targetRegion ||
            caregiverWorkRegions.includes(targetRegion))

        if (provinceMatch) {
          score += 30
          reasons.push('✓ Zelfde provincie')
        } else if (caregiver.city && booking.city) {
          const cityMatch =
            caregiver.city.toLowerCase() === booking.city.toLowerCase()
          if (cityMatch) {
            score += 20
            reasons.push('✓ Zelfde stad')
          } else {
            if (
              caregiver.postalCode &&
              booking.postalCode &&
              caregiver.postalCode.substring(0, 2) ===
                booking.postalCode.substring(0, 2)
            ) {
              score += 10
              reasons.push('≈ Nabije regio')
            } else {
              warnings.push('⚠️ Andere regio')
            }
          }
        }

        return {
          caregiverId: caregiver.user.id,
          caregiverProfileId: caregiver.id,
          name: `${caregiver.user.firstName} ${caregiver.user.lastName}`,
          email: caregiver.user.email,
          phone: caregiver.user.phone,
          city: caregiver.city,
          postalCode: caregiver.postalCode,
          services: services || [],
          score,
          reasons,
          warnings,
        }
      })
      .filter((match) => match.score > 0) // Only include matches with some score
      .sort((a, b) => b.score - a.score) // Sort by score descending
      .slice(0, 3) // Top 3

    return NextResponse.json({
      booking: {
        id: booking.id,
        service: booking.service,
        date: booking.date,
        timeWindow: booking.timeWindow,
        city: booking.city,
        postalCode: booking.postalCode,
        petName: booking.petName,
        petType: booking.petType,
        owner: booking.owner,
      },
      matches,
    })
  } catch (error) {
    console.error('Match caregivers error:', error)
    return NextResponse.json(
      { error: 'Failed to match caregivers' },
      { status: 500 }
    )
  }
}
