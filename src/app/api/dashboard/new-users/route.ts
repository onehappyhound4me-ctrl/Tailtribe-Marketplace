export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

/**
 * Get new users in the same city
 * - For caregivers: show new owners
 * - For owners: show new caregivers
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { id: session.user.id },
      select: { role: true, city: true }
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)

    if (user.role === 'CAREGIVER') {
      // Show new owners in same city
      const caregiver = await db.caregiverProfile.findUnique({
        where: { userId: session.user.id },
        select: { city: true }
      })

      if (!caregiver?.city) {
        return NextResponse.json({ newUsers: [] }, { status: 200 })
      }

      const newOwners = await db.user.findMany({
        where: {
          role: 'OWNER',
          city: caregiver.city,
          createdAt: { gte: sevenDaysAgo },
          NOT: { id: session.user.id }
        },
        select: {
          id: true,
          name: true,
          email: true,
          city: true,
          createdAt: true,
          pets: {
            select: {
              id: true,
              name: true,
              type: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })

      const sanitizedOwners = newOwners.filter(owner => {
        const email = owner.email?.toLowerCase() || ''
        const name = owner.name?.toLowerCase() || ''
        return !email.includes('test') && !email.includes('example') && !name.includes('test')
      })

      return NextResponse.json({ 
        newUsers: sanitizedOwners.map(owner => ({
          id: owner.id,
          name: owner.name,
          city: owner.city,
          createdAt: owner.createdAt,
          pets: owner.pets,
          userType: 'OWNER',
          petCount: owner.pets.length
        }))
      }, { status: 200 })
    } else {
      // Show new caregivers in same city
      if (!user.city) {
        return NextResponse.json({ newUsers: [] }, { status: 200 })
      }

      const newCaregivers = await db.caregiverProfile.findMany({
        where: {
          city: user.city,
          isApproved: true,
          createdAt: { gte: sevenDaysAgo }
        },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              createdAt: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      })

      // Fetch reviews separately using the new schema
      const caregiverUserIds = newCaregivers.map(c => c.userId)
      const reviews = await db.review.findMany({
        where: {
          revieweeId: { in: caregiverUserIds },
          revieweeRole: 'CAREGIVER'
        },
        select: {
          revieweeId: true,
          rating: true
        }
      })

      // Group reviews by caregiver
      const reviewsByCaregiver = reviews.reduce((acc, review) => {
        if (!acc[review.revieweeId]) {
          acc[review.revieweeId] = []
        }
        acc[review.revieweeId].push(review.rating)
        return acc
      }, {} as Record<string, number[]>)

      const sanitizedCaregivers = newCaregivers.filter(caregiver => {
        const email = caregiver.user.email?.toLowerCase() || ''
        const name = caregiver.user.name?.toLowerCase() || ''
        return !email.includes('test') && !email.includes('example') && !name.includes('test')
      })

      return NextResponse.json({ 
        newUsers: sanitizedCaregivers.map(caregiver => {
          const caregiverReviews = reviewsByCaregiver[caregiver.userId] || []
          const avgRating = caregiverReviews.length > 0
            ? caregiverReviews.reduce((sum, r) => sum + r, 0) / caregiverReviews.length
            : 0

          return {
            id: caregiver.id,
            userId: caregiver.user.id,
            name: caregiver.user.name,
            city: caregiver.city,
            createdAt: caregiver.user.createdAt,
            hourlyRate: caregiver.hourlyRate,
            avgRating,
            reviewCount: caregiverReviews.length,
            userType: 'CAREGIVER'
          }
        })
      }, { status: 200 })
    }
  } catch (error) {
    console.error('Get new users error:', error)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}




