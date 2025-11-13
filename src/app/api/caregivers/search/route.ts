export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { calculateDistance } from '@/lib/distance'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    
    const city = searchParams.get('city') || undefined
    const service = searchParams.get('service') || undefined
    const country = searchParams.get('country') || undefined // NEW: Country filter
    const minRate = searchParams.get('minRate') ? parseInt(searchParams.get('minRate')!) : undefined
    const maxRate = searchParams.get('maxRate') ? parseInt(searchParams.get('maxRate')!) : undefined
    const userLat = searchParams.get('userLat') ? parseFloat(searchParams.get('userLat')!) : undefined
    const userLng = searchParams.get('userLng') ? parseFloat(searchParams.get('userLng')!) : undefined
    
    console.log('🔍 API Search params:', { country, city, service, minRate, maxRate, userLat, userLng })

    // Build where clause
    const where: any = {
      // Remove isApproved filter for testing - show all caregivers
    }

    // NEW: Filter by country (BE or NL)
    if (country) {
      where.country = country
    }

    if (city) {
      where.city = {
        contains: city
      }
    }

    if (service) {
      where.services = {
        contains: service
      }
    }

    if (minRate !== undefined || maxRate !== undefined) {
      where.hourlyRate = {}
      if (minRate) where.hourlyRate.gte = minRate
      if (maxRate) where.hourlyRate.lte = maxRate
    }

    // Get caregivers with user data
    const caregivers = await db.caregiverProfile.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            name: true,
            image: true,
            email: true,
            reviewsReceived: {
              select: {
                rating: true,
                comment: true,
                createdAt: true,
                author: {
                  select: {
                    name: true
                  }
                }
              },
              orderBy: {
                createdAt: 'desc'
              },
              take: 5
            },
            _count: {
              select: {
                reviewsReceived: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 50 // Limit results
    })

    // Calculate average rating and distance for each caregiver
    const results = caregivers.map(caregiver => {
      const reviews = caregiver.user.reviewsReceived
      const avgRating = reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0

      // Calculate distance if user location and caregiver location are available
      let distance: number | undefined = undefined
      if (userLat && userLng && caregiver.lat && caregiver.lng) {
        distance = calculateDistance(userLat, userLng, caregiver.lat, caregiver.lng)
      }

      return {
        id: caregiver.id,
        userId: caregiver.userId,
        name: caregiver.user.name,
        image: caregiver.user.image,
        city: caregiver.city,
        country: caregiver.country,
        lat: caregiver.lat,
        lng: caregiver.lng,
        bio: caregiver.bio,
        hourlyRate: caregiver.hourlyRate,
        services: caregiver.services ? caregiver.services.split(',') : [],
        photos: caregiver.photos ? JSON.parse(caregiver.photos) : [],
        profilePhoto: caregiver.profilePhoto,
        averageRating: Math.round(avgRating * 10) / 10,
        reviewCount: caregiver.user._count.reviewsReceived,
        reviews: reviews.slice(0, 3), // Return top 3 reviews
        distance // Distance in km
      }
    })

    console.log(`✅ Found ${results.length} caregivers`)
    
    return NextResponse.json({
      caregivers: results,
      total: results.length
    })

  } catch (error) {
    console.error('Search error:', error)
    return NextResponse.json(
      { error: 'Er ging iets mis bij het zoeken' },
      { status: 500 }
    )
  }
}
