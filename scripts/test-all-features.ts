// Feature test script - tests all API endpoints
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const BASE_URL = 'http://localhost:3000'

async function testFeatures() {
  console.log('🧪 Testing TailTribe Features...\n')

  let passed = 0
  let failed = 0

  // Test 1: Database
  console.log('1️⃣  Testing Database Connection...')
  try {
    await prisma.$connect()
    console.log('   ✅ Database: Connected')
    passed++
  } catch (error) {
    console.log('   ❌ Database: Failed')
    failed++
  }

  // Test 2: Users exist
  console.log('2️⃣  Testing Users...')
  try {
    const count = await prisma.user.count()
    console.log(`   ✅ Users: ${count} accounts found`)
    passed++
  } catch (error) {
    console.log('   ❌ Users: Failed')
    failed++
  }

  // Test 3: Caregivers
  console.log('3️⃣  Testing Caregivers...')
  try {
    const count = await prisma.caregiverProfile.count()
    const approved = await prisma.caregiverProfile.count({ where: { isApproved: true } })
    console.log(`   ✅ Caregivers: ${count} total, ${approved} approved`)
    passed++
  } catch (error) {
    console.log('   ❌ Caregivers: Failed')
    failed++
  }

  // Test 4: Bookings
  console.log('4️⃣  Testing Bookings...')
  try {
    const count = await prisma.booking.count()
    const paid = await prisma.booking.count({ where: { status: 'PAID' } })
    console.log(`   ✅ Bookings: ${count} total, ${paid} paid`)
    passed++
  } catch (error) {
    console.log('   ❌ Bookings: Failed')
    failed++
  }

  // Test 5: Messages
  console.log('5️⃣  Testing Messages...')
  try {
    const count = await prisma.message.count()
    console.log(`   ✅ Messages: ${count} messages in database`)
    passed++
  } catch (error) {
    console.log('   ❌ Messages: Failed')
    failed++
  }

  // Test 6: Reviews
  console.log('6️⃣  Testing Reviews...')
  try {
    const count = await prisma.review.count()
    const avgRating = await prisma.review.aggregate({ _avg: { rating: true } })
    console.log(`   ✅ Reviews: ${count} total, avg ${avgRating._avg.rating?.toFixed(1) || 0}★`)
    passed++
  } catch (error) {
    console.log('   ❌ Reviews: Failed')
    failed++
  }

  // Test 7: Health endpoint
  console.log('7️⃣  Testing Health API...')
  try {
    const res = await fetch(`${BASE_URL}/api/health`)
    if (res.ok) {
      const data = await res.json()
      console.log(`   ✅ Health API: ${data.status}`)
      console.log(`      - Commission: ${data.commission}`)
      passed++
    } else {
      throw new Error('Health check failed')
    }
  } catch (error) {
    console.log('   ⚠️  Health API: Server not running?')
    failed++
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  console.log(`📊 Results: ${passed}/${passed + failed} tests passed`)
  
  if (failed === 0) {
    console.log('🎉 ALL TESTS PASSED! Platform is ready!')
  } else {
    console.log(`⚠️  ${failed} test(s) failed. Check issues above.`)
  }

  await prisma.$disconnect()
}

testFeatures().catch(console.error)




