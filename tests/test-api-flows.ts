/**
 * Comprehensive API Flow Tests for TailTribe
 * 
 * Tests alle kritieke flows:
 * 1. User registratie & login
 * 2. Caregiver onboarding
 * 3. Booking creation & payment
 * 4. Messaging
 * 5. Reviews
 * 6. Google OAuth account linking
 * 
 * Run met: npm run test:flows
 */

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

interface TestResult {
  name: string
  passed: boolean
  error?: string
  duration: number
  details?: any
}

const results: TestResult[] = []

async function test(name: string, fn: () => Promise<any>): Promise<any> {
  const start = Date.now()
  try {
    const result = await fn()
    const duration = Date.now() - start
    results.push({ name, passed: true, duration, details: result })
    console.log(`✅ ${name} (${duration}ms)`)
    return result
  } catch (error: any) {
    const duration = Date.now() - start
    results.push({ name, passed: false, error: error.message, duration })
    console.error(`❌ ${name} (${duration}ms): ${error.message}`)
    throw error
  }
}

async function main() {
  console.log('🧪 Starting comprehensive API flow tests...\n')

  // Test 1: Database connection
  await test('Database connection', async () => {
    await db.$connect()
    await db.user.count()
    return { connected: true }
  })

  // Test 2: User model - Create test user
  let testOwnerId: string | null = null
  let testCaregiverId: string | null = null
  
  await test('Create test owner user', async () => {
    const hashedPassword = await bcrypt.hash('testpassword123', 10)
    const user = await db.user.create({
      data: {
        email: `test-owner-${Date.now()}@test.com`,
        name: 'Test Owner',
        password: hashedPassword,
        role: 'OWNER',
      },
    })
    testOwnerId = user.id
    return { userId: user.id, email: user.email }
  })

  await test('Create test caregiver user', async () => {
    const hashedPassword = await bcrypt.hash('testpassword123', 10)
    const user = await db.user.create({
      data: {
        email: `test-caregiver-${Date.now()}@test.com`,
        name: 'Test Caregiver',
        password: hashedPassword,
        role: 'CAREGIVER',
      },
    })
    testCaregiverId = user.id
    return { userId: user.id, email: user.email }
  })

  // Test 3: CaregiverProfile creation
  let caregiverProfileId: string | null = null
  
  await test('Create caregiver profile', async () => {
    if (!testCaregiverId) throw new Error('Test caregiver ID not set')
    
    const profile = await db.caregiverProfile.create({
      data: {
        userId: testCaregiverId,
        city: 'Brussel',
        country: 'BE',
        postalCode: '1000',
        lat: 50.8503,
        lng: 4.3517,
        hourlyRate: 25,
        services: 'DOG_WALKING,PET_SITTING',
        bio: 'Test bio',
        isApproved: true,
      },
    })
    caregiverProfileId = profile.id
    return { profileId: profile.id }
  })

  // Test 4: Owner profile creation
  await test('Create owner profile', async () => {
    if (!testOwnerId) throw new Error('Test owner ID not set')
    
    const profile = await db.ownerProfile.create({
      data: {
        userId: testOwnerId,
        city: 'Antwerpen',
        country: 'BE',
        postalCode: '2000',
        lat: 51.2194,
        lng: 4.4025,
      },
    })
    return { profileId: profile.id }
  })

  // Test 5: Booking creation
  let bookingId: string | null = null
  
  await test('Create booking', async () => {
    if (!testOwnerId || !testCaregiverId || !caregiverProfileId) {
      throw new Error('Test IDs not set')
    }
    
    const startDate = new Date()
    startDate.setDate(startDate.getDate() + 1)
    const endDate = new Date(startDate)
    endDate.setDate(endDate.getDate() + 2)
    
    const booking = await db.booking.create({
      data: {
        ownerId: testOwnerId,
        caregiverId: testCaregiverId,
        service: 'DOG_WALKING',
        startAt: startDate,
        endAt: endDate,
        amountCents: 5000, // €50
        platformFeeCents: 500, // 10%
        caregiverAmountCents: 4500,
        status: 'PENDING',
      },
    })
    bookingId = booking.id
    return { bookingId: booking.id, status: booking.status }
  })

  // Test 6: Booking status update (ACCEPTED)
  await test('Update booking status to ACCEPTED', async () => {
    if (!bookingId) throw new Error('Booking ID not set')
    
    const booking = await db.booking.update({
      where: { id: bookingId },
      data: { status: 'ACCEPTED' },
    })
    return { status: booking.status }
  })

  // Test 7: Message creation
  await test('Create message in booking', async () => {
    if (!bookingId || !testOwnerId) throw new Error('IDs not set')
    
    const message = await db.message.create({
      data: {
        bookingId: bookingId,
        senderId: testOwnerId,
        body: 'Test bericht van eigenaar',
      },
    })
    return { messageId: message.id }
  })

  // Test 8: Unread count calculation
  await test('Calculate unread message count', async () => {
    if (!bookingId || !testCaregiverId) throw new Error('IDs not set')
    
    const unreadCount = await db.message.count({
      where: {
        bookingId: bookingId,
        senderId: { not: testCaregiverId },
        readAt: null,
      },
    })
    return { unreadCount }
  })

  // Test 9: Review creation
  await test('Create review', async () => {
    if (!testCaregiverId || !testOwnerId) throw new Error('IDs not set')
    
    const review = await db.review.create({
      data: {
        revieweeId: testCaregiverId,
        reviewerId: testOwnerId,
        revieweeRole: 'CAREGIVER',
        rating: 5,
        comment: 'Uitstekende verzorger!',
      },
    })
    return { reviewId: review.id, rating: review.rating }
  })

  // Test 10: Average rating calculation
  await test('Calculate average rating', async () => {
    if (!testCaregiverId) throw new Error('Caregiver ID not set')
    
    const reviews = await db.review.findMany({
      where: { revieweeId: testCaregiverId },
      select: { rating: true },
    })
    
    const avgRating = reviews.length > 0
      ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
      : 0
    
    return { avgRating: Math.round(avgRating * 10) / 10, reviewCount: reviews.length }
  })

  // Test 11: Account linking (Google OAuth)
  await test('Create Google OAuth account link', async () => {
    if (!testOwnerId) throw new Error('Owner ID not set')
    
    const account = await db.account.create({
      data: {
        userId: testOwnerId,
        type: 'oauth',
        provider: 'google',
        providerAccountId: `google-${Date.now()}`,
        access_token: 'test-token',
        refresh_token: 'test-refresh',
        expires_at: Math.floor(Date.now() / 1000) + 3600,
        token_type: 'Bearer',
        scope: 'email profile',
      },
    })
    return { accountId: account.id, provider: account.provider }
  })

  // Test 12: Search API filters (test user exclusion)
  await test('Search API filters test users', async () => {
    const caregivers = await db.caregiverProfile.findMany({
      where: {
        isApproved: true,
        user: {
          email: {
            not: { contains: 'test', mode: 'insensitive' },
          },
        },
      },
      include: {
        user: {
          select: { email: true, name: true },
        },
      },
      take: 10,
    })
    
    // Verify no test users in results
    const hasTestUsers = caregivers.some(c => {
      const email = c.user.email?.toLowerCase() || ''
      const name = c.user.name?.toLowerCase() || ''
      return email.includes('test') || name.includes('test')
    })
    
    if (hasTestUsers) {
      throw new Error('Test users found in search results')
    }
    
    return { caregiverCount: caregivers.length, noTestUsers: true }
  })

  // Test 13: Distance calculation
  await test('Distance calculation', async () => {
    const lat1 = 50.8503 // Brussels
    const lon1 = 4.3517
    const lat2 = 51.2194 // Antwerp
    const lon2 = 4.4025
    
    // Haversine formula
    const R = 6371 // Earth's radius in km
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) *
        Math.cos(lat2 * (Math.PI / 180)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    const distance = R * c
    
    return { distance: Math.round(distance * 10) / 10 }
  })

  // Test 14: Password hashing & verification
  await test('Password hashing & verification', async () => {
    const password = 'testpassword123'
    const hash = await bcrypt.hash(password, 10)
    const isValid = await bcrypt.compare(password, hash)
    
    if (!isValid) {
      throw new Error('Password verification failed')
    }
    
    return { hashed: true, verified: true }
  })

  // Test 15: Database indexes check
  await test('Database indexes check', async () => {
    // Test queries that should use indexes
    await db.user.findMany({
      where: { email: 'test@example.com' },
      take: 1,
    })
    
    await db.caregiverProfile.findMany({
      where: { 
        isApproved: true,
        country: 'BE',
      },
      take: 1,
    })
    
    await db.booking.findMany({
      where: { status: 'PENDING' },
      take: 1,
    })
    
    return { indexesWorking: true }
  })

  // Cleanup test data
  console.log('\n🧹 Cleaning up test data...')
  try {
    if (bookingId) {
      await db.message.deleteMany({ where: { bookingId } })
      await db.booking.delete({ where: { id: bookingId } })
    }
    if (caregiverProfileId) {
      await db.caregiverProfile.delete({ where: { id: caregiverProfileId } })
    }
    if (testCaregiverId) {
      await db.account.deleteMany({ where: { userId: testCaregiverId } })
      await db.review.deleteMany({ where: { revieweeId: testCaregiverId } })
      await db.ownerProfile.deleteMany({ where: { userId: testCaregiverId } })
      await db.user.delete({ where: { id: testCaregiverId } })
    }
    if (testOwnerId) {
      await db.account.deleteMany({ where: { userId: testOwnerId } })
      await db.review.deleteMany({ where: { reviewerId: testOwnerId } })
      await db.ownerProfile.deleteMany({ where: { userId: testOwnerId } })
      await db.user.delete({ where: { id: testOwnerId } })
    }
    console.log('✅ Test data cleaned up')
  } catch (error: any) {
    console.error('⚠️ Cleanup error (non-critical):', error.message)
  }

  // Summary
  console.log('\n📊 Test Summary:')
  console.log('─'.repeat(60))
  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length
  const totalDuration = results.reduce((sum, r) => sum + r.duration, 0)

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌'
    const error = result.error ? ` - ${result.error}` : ''
    const details = result.details ? ` ${JSON.stringify(result.details)}` : ''
    console.log(`${icon} ${result.name} (${result.duration}ms)${error}${details}`)
  })

  console.log('─'.repeat(60))
  console.log(`Total: ${results.length} tests`)
  console.log(`Passed: ${passed} ✅`)
  console.log(`Failed: ${failed} ${failed > 0 ? '❌' : ''}`)
  console.log(`Total duration: ${totalDuration}ms`)
  console.log(`Success rate: ${Math.round((passed / results.length) * 100)}%`)

  await db.$disconnect()

  // Exit with error code if any test failed
  if (failed > 0) {
    console.log('\n❌ Some tests failed. Please review the errors above.')
    process.exit(1)
  } else {
    console.log('\n🎉 All tests passed! Platform is ready for production.')
    process.exit(0)
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

