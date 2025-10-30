#!/usr/bin/env tsx
/**
 * AUTOMATED TESTS - RUN BEFORE USER TESTS
 * 
 * This verifies all flows work BEFORE the user sees them.
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Test results tracking
let passed = 0
let failed = 0
const errors: string[] = []

async function test(name: string, fn: () => Promise<void>) {
  try {
    await fn()
    console.log(`✅ ${name}`)
    passed++
  } catch (error: any) {
    console.log(`❌ ${name}`)
    console.log(`   Error: ${error.message}`)
    errors.push(`${name}: ${error.message}`)
    failed++
  }
}

async function runAllTests() {
  console.log('🧪 RUNNING AUTOMATED TESTS\n')
  console.log('=' .repeat(60) + '\n')

  // TEST 1: Database connection
  await test('Database connection', async () => {
    await prisma.$connect()
  })

  // TEST 2: Create owner account
  const testEmail = `test-${Date.now()}@test.com`
  let userId: string = ''
  
  await test('Create owner account', async () => {
    const user = await prisma.user.create({
      data: {
        email: testEmail,
        password: 'hashed',
        firstName: 'Test',
        lastName: 'Owner',
        role: 'OWNER'
      }
    })
    userId = user.id
    if (!user.id) throw new Error('No user ID returned')
  })

  // TEST 3: Update owner basic data
  await test('Save owner basic data (step 1)', async () => {
    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        phone: '+32 123 45 67 89',
        postalCode: '2920',
        city: 'Kalmthout',
        country: 'BE',
        lat: 51.4034558,
        lng: 4.4538449
      }
    })
    if (!updated.city) throw new Error('City not saved')
  })

  // TEST 4: Create pet
  await test('Create pet (step 2)', async () => {
    const pet = await prisma.pet.create({
      data: {
        ownerId: userId,
        name: 'TestDog',
        type: 'DOG',
        breed: 'Labrador',
        age: 3
      }
    })
    if (!pet.id) throw new Error('Pet not created')
  })

  // TEST 5: Complete onboarding
  await test('Complete owner onboarding', async () => {
    await prisma.user.update({
      where: { id: userId },
      data: {
        onboardingCompleted: true
      }
    })
  })

  // TEST 6: Retrieve owner data
  await test('Retrieve owner data', async () => {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { pets: true }
    })
    if (!user) throw new Error('User not found')
    if (user.pets.length === 0) throw new Error('Pets not found')
    if (!user.city) throw new Error('City not saved')
  })

  // TEST 7: Search caregivers
  await test('Search caregivers', async () => {
    const caregivers = await prisma.caregiverProfile.findMany({
      where: {
        city: { contains: 'Antwerpen' },
        lat: { not: null },
        lng: { not: null }
      },
      take: 5
    })
    if (caregivers.length === 0) {
      console.log('   ⚠️  No caregivers in database (seed needed)')
    }
  })

  // CLEANUP
  await test('Cleanup test data', async () => {
    await prisma.pet.deleteMany({ where: { ownerId: userId } })
    await prisma.user.delete({ where: { id: userId } })
  })

  // RESULTS
  console.log('\n' + '='.repeat(60))
  console.log(`\n📊 TEST RESULTS:\n`)
  console.log(`   ✅ Passed: ${passed}`)
  console.log(`   ❌ Failed: ${failed}`)
  
  if (failed > 0) {
    console.log('\n❌ ERRORS:\n')
    errors.forEach(err => console.log(`   - ${err}`))
    console.log('\n⚠️  FIX THESE BEFORE USER TESTS!')
  } else {
    console.log('\n🎉 ALL TESTS PASSED - READY FOR USER TESTING!')
  }
  
  console.log('\n' + '='.repeat(60))

  await prisma.$disconnect()
  process.exit(failed > 0 ? 1 : 0)
}

runAllTests().catch(console.error)




































