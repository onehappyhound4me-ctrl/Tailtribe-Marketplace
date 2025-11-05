import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createLisaAvailability() {
  console.log('🔧 Creating availability for Lisa...')

  // Find Lisa's caregiver profile
  const lisa = await prisma.user.findUnique({
    where: { email: 'lisa@test.com' },
    include: { caregiverProfile: true }
  })

  if (!lisa || !lisa.caregiverProfile) {
    console.log('❌ Lisa not found')
    return
  }

  console.log('✅ Found Lisa:', lisa.name)
  console.log('📋 Profile ID:', lisa.caregiverProfile.id)

  // Create or update Availability record
  const availability = await prisma.availability.upsert({
    where: { caregiverId: lisa.caregiverProfile.id },
    update: {
      weeklyJson: JSON.stringify({
        monday: [{ start: '10:00', end: '13:00' }],
        tuesday: [{ start: '10:00', end: '13:00' }],
        wednesday: [{ start: '10:00', end: '13:00' }],
        thursday: [{ start: '10:00', end: '13:00' }],
        friday: [{ start: '10:00', end: '13:00' }],
        saturday: [],
        sunday: []
      }),
      exceptions: JSON.stringify({})
    },
    create: {
      caregiverId: lisa.caregiverProfile.id,
      weeklyJson: JSON.stringify({
        monday: [{ start: '10:00', end: '13:00' }],
        tuesday: [{ start: '10:00', end: '13:00' }],
        wednesday: [{ start: '10:00', end: '13:00' }],
        thursday: [{ start: '10:00', end: '13:00' }],
        friday: [{ start: '10:00', end: '13:00' }],
        saturday: [],
        sunday: []
      }),
      exceptions: JSON.stringify({})
    }
  })

  console.log('✅ Availability created!')
  console.log('📅 Weekly schedule:', availability.weeklyJson)

  await prisma.$disconnect()
}

createLisaAvailability()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })














