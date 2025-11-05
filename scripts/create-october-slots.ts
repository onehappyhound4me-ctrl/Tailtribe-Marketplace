import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createOctoberSlots() {
  console.log('🔧 Creating availability slots for October 2025...')

  // Find test caregivers
  const lisa = await prisma.user.findUnique({
    where: { email: 'lisa@test.com' }
  })
  const sarah = await prisma.user.findUnique({
    where: { email: 'sarah@test.com' }
  })
  const mike = await prisma.user.findUnique({
    where: { email: 'mike@test.com' }
  })

  if (!lisa || !sarah || !mike) {
    console.log('❌ Not all test caregivers found')
    return
  }

  // Get their first service as serviceId (required field)
  const lisaProfile = await prisma.caregiverProfile.findUnique({
    where: { userId: lisa.id }
  })
  const sarahProfile = await prisma.caregiverProfile.findUnique({
    where: { userId: sarah.id }
  })
  const mikeProfile = await prisma.caregiverProfile.findUnique({
    where: { userId: mike.id }
  })

  const lisaService = lisaProfile?.services?.split(',')[0] || 'DOG_TRAINING'
  const sarahService = sarahProfile?.services?.split(',')[0] || 'DOG_WALKING'
  const mikeService = mikeProfile?.services?.split(',')[0] || 'PET_SITTING'

  // October 2025: 1st to 31st
  const startDate = new Date('2025-10-01')
  const endDate = new Date('2025-10-31')

  const today = new Date()
  today.setHours(0, 0, 0, 0)

  for (let date = new Date(startDate); date <= endDate; date.setDate(date.getDate() + 1)) {
    const dateStr = date.toISOString().split('T')[0]
    const dayOfWeek = date.getDay() // 0 = Sunday, 6 = Saturday
    
    // Skip past dates
    if (date < today) continue

    // Sarah: Monday-Friday, 09:00-12:00 and 14:00-17:00
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      await prisma.availabilitySlot.create({
        data: {
          caregiverId: sarah.id,
          serviceId: sarahService,
          date: new Date(dateStr),
          startTimeMin: 9 * 60,
          endTimeMin: 12 * 60,
          blocked: false
        }
      })
      await prisma.availabilitySlot.create({
        data: {
          caregiverId: sarah.id,
          serviceId: sarahService,
          date: new Date(dateStr),
          startTimeMin: 14 * 60,
          endTimeMin: 17 * 60,
          blocked: false
        }
      })
    }

    // Mike: Monday-Friday, 09:00-18:00
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      await prisma.availabilitySlot.create({
        data: {
          caregiverId: mike.id,
          serviceId: mikeService,
          date: new Date(dateStr),
          startTimeMin: 9 * 60,
          endTimeMin: 18 * 60,
          blocked: false
        }
      })
    }

    // Lisa: Monday-Friday, 10:00-13:00
    if (dayOfWeek >= 1 && dayOfWeek <= 5) {
      await prisma.availabilitySlot.create({
        data: {
          caregiverId: lisa.id,
          serviceId: lisaService,
          date: new Date(dateStr),
          startTimeMin: 10 * 60,
          endTimeMin: 13 * 60,
          blocked: false
        }
      })
    }
  }

  console.log('✅ October 2025 availability slots created!')
  await prisma.$disconnect()
}

createOctoberSlots()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })














