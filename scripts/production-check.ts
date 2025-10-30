// Production readiness check
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkProduction() {
  console.log('🔍 Checking production readiness...\n')

  const checks = {
    database: false,
    env: false,
    admin: false,
    caregivers: false,
  }

  // 1. Database connection
  try {
    await prisma.$connect()
    console.log('✅ Database connection: OK')
    checks.database = true
  } catch (error) {
    console.log('❌ Database connection: FAILED')
  }

  // 2. Environment variables
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_SECRET_KEY',
    'PLATFORM_COMMISSION_PERCENTAGE',
  ]

  const missing = requiredEnvVars.filter(key => !process.env[key])
  
  if (missing.length === 0) {
    console.log('✅ Environment variables: OK')
    checks.env = true
  } else {
    console.log('❌ Environment variables: MISSING')
    console.log('   Missing:', missing.join(', '))
  }

  // 3. Admin account exists
  try {
    const admin = await prisma.user.findFirst({
      where: { role: 'ADMIN' }
    })
    if (admin) {
      console.log('✅ Admin account: OK')
      checks.admin = true
    } else {
      console.log('⚠️  Admin account: NOT FOUND')
    }
  } catch (error) {
    console.log('❌ Admin account check: FAILED')
  }

  // 4. Caregivers
  try {
    const count = await prisma.caregiverProfile.count()
    console.log(`✅ Caregivers in database: ${count}`)
    checks.caregivers = count > 0
  } catch (error) {
    console.log('❌ Caregiver check: FAILED')
  }

  // 5. Stripe mode
  const isTestMode = process.env.STRIPE_SECRET_KEY?.includes('test')
  if (isTestMode) {
    console.log('⚠️  Stripe: TEST MODE')
  } else {
    console.log('✅ Stripe: LIVE MODE')
  }

  // Summary
  console.log('\n' + '='.repeat(50))
  const allPassed = Object.values(checks).every(c => c)
  
  if (allPassed) {
    console.log('🎉 PRODUCTION READY!')
    console.log('   Run: npm run build && npm start')
  } else {
    console.log('⚠️  NOT READY - Fix issues above')
    process.exit(1)
  }

  await prisma.$disconnect()
}

checkProduction().catch(console.error)




