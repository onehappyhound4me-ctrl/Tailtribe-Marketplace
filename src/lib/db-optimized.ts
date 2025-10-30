import { db } from './db'
import { getCached, CacheKeys, CacheTTL } from './cache'

/**
 * Optimized Database Queries
 * 
 * Best practices:
 * - Use select to limit fields
 * - Add indexes for frequently queried fields
 * - Cache results where appropriate
 * - Use pagination for large datasets
 * - Avoid N+1 queries with proper includes
 */

// Optimized caregiver search with caching
export async function searchCaregiversOptimized(filters: {
  city?: string
  service?: string
  maxRate?: number
  limit?: number
  offset?: number
}) {
  const cacheKey = CacheKeys.caregiversList(JSON.stringify(filters))
  
  return getCached(
    cacheKey,
    async () => {
      const { city, service, maxRate, limit = 20, offset = 0 } = filters

      const where: any = {
        isApproved: true
      }

      if (city) {
        where.city = { contains: city, mode: 'insensitive' }
      }

      if (service) {
        where.services = { contains: service }
      }

      if (maxRate) {
        where.hourlyRate = { lte: maxRate }
      }

      // Optimized query - only select needed fields
      const caregivers = await db.caregiverProfile.findMany({
        where,
        select: {
          id: true,
          city: true,
          hourlyRate: true,
          bio: true,
          services: true,
          photos: true,
          user: {
            select: {
              id: true,
              name: true,
              image: true
            }
          }
        },
        take: limit,
        skip: offset,
        orderBy: [
          { isApproved: 'desc' },
          { createdAt: 'desc' }
        ]
      })

      return caregivers
    },
    { ttl: CacheTTL.MEDIUM }
  )
}

// Get caregiver with full details (cached)
export async function getCaregiverById(id: string) {
  const cacheKey = CacheKeys.caregiverProfile(id)
  
  return getCached(
    cacheKey,
    async () => {
      return db.caregiverProfile.findUnique({
        where: { id },
        include: {
          user: {
            select: {
              id: true,
              name: true,
              email: true,
              image: true
            }
          },
          highlights: {
            where: {
              published: true,
              expiresAt: { gte: new Date() }
            },
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      })
    },
    { ttl: CacheTTL.LONG }
  )
}

// Get user bookings (paginated)
export async function getUserBookings(
  userId: string,
  role: 'owner' | 'caregiver',
  options: { limit?: number; offset?: number; status?: string } = {}
) {
  const { limit = 20, offset = 0, status } = options

  const where: any = role === 'owner' 
    ? { ownerId: userId }
    : { caregiverId: userId }

  if (status) {
    where.status = status
  }

  return db.booking.findMany({
    where,
    select: {
      id: true,
      startAt: true,
      endAt: true,
      status: true,
      amountCents: true,
      petName: true,
      caregiver: {
        select: {
          id: true,
          name: true,
          image: true,
          city: true
        }
      },
      owner: {
        select: {
          id: true,
          name: true,
          image: true
        }
      }
    },
    take: limit,
    skip: offset,
    orderBy: { startAt: 'desc' }
  })
}

// Batch operations (for migrations or bulk updates)
export async function batchUpdateBookings(
  bookingIds: string[],
  data: any,
  batchSize: number = 100
) {
  const batches = []
  
  for (let i = 0; i < bookingIds.length; i += batchSize) {
    const batch = bookingIds.slice(i, i + batchSize)
    batches.push(
      db.booking.updateMany({
        where: { id: { in: batch } },
        data
      })
    )
  }

  return Promise.all(batches)
}

// Database stats (for admin)
export async function getDatabaseStats() {
  const [
    totalUsers,
    totalCaregivers,
    approvedCaregivers,
    totalBookings,
    completedBookings,
    totalReviews
  ] = await Promise.all([
    db.user.count(),
    db.caregiverProfile.count(),
    db.caregiverProfile.count({ where: { isApproved: true } }),
    db.booking.count(),
    db.booking.count({ where: { status: 'COMPLETED' } }),
    db.review.count()
  ])

  return {
    users: totalUsers,
    caregivers: totalCaregivers,
    approvedCaregivers,
    bookings: totalBookings,
    completedBookings,
    reviews: totalReviews
  }
}

// Connection pool monitoring
export function getDbHealth() {
  // In production with PostgreSQL, you'd check pool stats
  return {
    connected: true,
    // Add more metrics with PostgreSQL pool
  }
}

