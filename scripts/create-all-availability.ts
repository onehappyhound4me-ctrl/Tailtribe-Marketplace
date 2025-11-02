import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createAllAvailability() {
  console.log('🔧 Creating availability records for all test caregivers...')

  // Find Sarah
  const sarah = await prisma.user.findUnique({
    where: { email: 'sarah@test.com' },
    include: { caregiverProfile: true }
  })

  if (sarah && sarah.caregiverProfile) {
    await prisma.availability.upsert({
      where: { caregiverId: sarah.caregiverProfile.id },
      update: {
        weeklyJson: JSON.stringify({
          monday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }],
          tuesday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }],
          wednesday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }],
          thursday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }],
          friday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }],
          saturday: [],
          sunday: []
        }),
        exceptions: JSON.stringify({})
      },
      create: {
        caregiverId: sarah.caregiverProfile.id,
        weeklyJson: JSON.stringify({
          monday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }],
          tuesday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }],
          wednesday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }],
          thursday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }],
          friday: [{ start: '09:00', end: '12:00' }, { start: '14:00', end: '17:00' }],
          saturday: [],
          sunday: []
        }),
        exceptions: JSON.stringify({})
      }
    })
    console.log('✅ Sarah availability updated')
  }

  // Find Mike
  const mike = await prisma.user.findUnique({
    where: { email: 'mike@test.com' },
    include: { caregiverProfile: true }
  })

  if (mike && mike.caregiverProfile) {
    await prisma.availability.upsert({
      where: { caregiverId: mike.caregiverProfile.id },
      update: {
        weeklyJson: JSON.stringify({
          monday: [{ start: '09:00', end: '18:00' }],
          tuesday: [{ start: '09:00', end: '18:00' }],
          wednesday: [{ start: '09:00', end: '18:00' }],
          thursday: [{ start: '09:00', end: '18:00' }],
          friday: [{ start: '09:00', end: '18:00' }],
          saturday: [],
          sunday: []
        }),
        exceptions: JSON.stringify({})
      },
      create: {
        caregiverId: mike.caregiverProfile.id,
        weeklyJson: JSON.stringify({
          monday: [{ start: '09:00', end: '18:00' }],
          tuesday: [{ start: '09:00', end: '18:00' }],
          wednesday: [{ start: '09:00', end: '18:00' }],
          thursday: [{ start: '09:00', end: '18:00' }],
          friday: [{ start: '09:00', end: '18:00' }],
          saturday: [],
          sunday: []
        }),
        exceptions: JSON.stringify({})
      }
    })
    console.log('✅ Mike availability updated')
  }

  // Ensure Lisa exists
  const lisa = await prisma.user.findUnique({
    where: { email: 'lisa@test.com' },
    include: { caregiverProfile: true }
  })

  if (lisa && lisa.caregiverProfile) {
    await prisma.availability.upsert({
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
    console.log('✅ Lisa availability updated')
  }

  console.log('✅ All availability records created!')
  await prisma.$disconnect()
}

createAllAvailability()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })













