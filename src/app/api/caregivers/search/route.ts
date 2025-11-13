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

    // Build where clause - Filter out test users
    const where: any = {
      isApproved: true, // Only show approved caregivers
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

    // Note: User filtering will be done client-side after fetching
    // Prisma nested filters can be complex, so we filter after query

    // Get caregivers with user data - Filter out test users
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

    // Client-side filtering to exclude test users
    // Filter out test patterns: test, example.com, demo, fake, temp, sample, jan.vermeersch, sarah.janssens
    const filteredCaregivers = caregivers.filter(caregiver => {
      const email = caregiver.user.email?.toLowerCase() || ''
      const name = caregiver.user.name?.toLowerCase() || ''
      
      // Test patterns to exclude
      const testPatterns = [
        'test',
        'example.com',
        'demo',
        'fake',
        'temp',
        'sample',
        'jan.vermeersch',
        'sarah.janssens',
        'password123', // Common test password
      ]
      
      // Check if email or name contains any test pattern
      const isTestUser = testPatterns.some(pattern => 
        email.includes(pattern) || name.includes(pattern)
      )
      
      // Also check for common test email domains
      const testDomains = ['@test.', '@example.', '@demo.', '@fake.']
      const hasTestDomain = testDomains.some(domain => email.includes(domain))
      
      return !isTestUser && !hasTestDomain
    })
    
    console.log(`🔍 Filtered ${caregivers.length} → ${filteredCaregivers.length} caregivers (removed ${caregivers.length - filteredCaregivers.length} test users)`)

    // Calculate average rating and distance for each caregiver
    const results = filteredCaregivers.map(caregiver => {
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
