import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestCaregivers() {
  console.log('🌱 Creating test caregivers...')

  // Test Caregiver 1: Sarah - Hondenuitlaat specialist
  const sarah = await prisma.user.upsert({
    where: { email: 'sarah@test.com' },
    update: {},
    create: {
      email: 'sarah@test.com',
      name: 'Sarah Dubois',
      firstName: 'Sarah',
      lastName: 'Dubois',
      role: 'CAREGIVER',
      image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face'
    }
  })

  const sarahProfile = await prisma.caregiverProfile.upsert({
    where: { userId: sarah.id },
    update: {},
    create: {
      userId: sarah.id,
      bio: 'Ervaren hondenuitlaatster met 5 jaar ervaring. Gespecialiseerd in grote honden en gedragsproblemen.',
      city: 'Brussel',
      country: 'BE',
      hourlyRate: 2500, // €25.00
      services: 'DOG_WALKING,GROUP_DOG_WALKING'
    }
  })

  // Test Caregiver 2: Mike - Dierenoppas specialist  
  const mike = await prisma.user.upsert({
    where: { email: 'mike@test.com' },
    update: {},
    create: {
      email: 'mike@test.com',
      name: 'Mike Van Damme',
      firstName: 'Mike',
      lastName: 'Van Damme',
      role: 'CAREGIVER',
      image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face'
    }
  })

  const mikeProfile = await prisma.caregiverProfile.upsert({
    where: { userId: mike.id },
    update: {},
    create: {
      userId: mike.id,
      bio: 'Professionele dierenoppas met certificaten in dierverzorging. Gespecialiseerd in katten en kleine honden.',
      city: 'Antwerpen',
      country: 'BE',
      hourlyRate: 3000, // €30.00
      services: 'PET_SITTING,HOME_CARE'
    }
  })

  // Test Caregiver 3: Lisa - Hondentraining specialist
  const lisa = await prisma.user.upsert({
    where: { email: 'lisa@test.com' },
    update: {},
    create: {
      email: 'lisa@test.com',
      name: 'Lisa Peeters',
      firstName: 'Lisa',
      lastName: 'Peeters',
      role: 'CAREGIVER',
      image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face'
    }
  })

  const lisaProfile = await prisma.caregiverProfile.upsert({
    where: { userId: lisa.id },
    update: {},
    create: {
      userId: lisa.id,
      bio: 'Gecertificeerde hondentrainer met 8 jaar ervaring. Gespecialiseerd in puppy training en gedragsproblemen.',
      city: 'Gent',
      country: 'BE',
      hourlyRate: 4000, // €40.00
      services: 'DOG_TRAINING,DOG_WALKING'
    }
  })

  // Create availability slots for Sarah (next 7 days)
  const today = new Date()
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    date.setHours(0, 0, 0, 0)

    // Morning slots (9:00-12:00)
    await prisma.availabilitySlot.create({
      data: {
        caregiverId: sarah.id,
        serviceId: 'DOG_WALKING', // Use service type as ID
        date: date,
        startTimeMin: 9 * 60, // 09:00
        endTimeMin: 12 * 60,  // 12:00
        blocked: false
      }
    })

    // Afternoon slots (14:00-17:00)
    await prisma.availabilitySlot.create({
      data: {
        caregiverId: sarah.id,
        serviceId: 'DOG_WALKING', // Use service type as ID
        date: date,
        startTimeMin: 14 * 60, // 14:00
        endTimeMin: 17 * 60,   // 17:00
        blocked: false
      }
    })
  }

  // Create availability slots for Mike (next 5 days)
  for (let i = 0; i < 5; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    date.setHours(0, 0, 0, 0)

    // Full day availability (9:00-18:00)
    await prisma.availabilitySlot.create({
      data: {
        caregiverId: mike.id,
        serviceId: 'PET_SITTING', // Use service type as ID
        date: date,
        startTimeMin: 9 * 60,  // 09:00
        endTimeMin: 18 * 60,   // 18:00
        blocked: false
      }
    })
  }

  // Create availability slots for Lisa (next 3 days)
  for (let i = 0; i < 3; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    date.setHours(0, 0, 0, 0)

    // Morning training slots (10:00-13:00)
    await prisma.availabilitySlot.create({
      data: {
        caregiverId: lisa.id,
        serviceId: 'DOG_TRAINING', // Use service type as ID
        date: date,
        startTimeMin: 10 * 60, // 10:00
        endTimeMin: 13 * 60,   // 13:00
        blocked: false
      }
    })
  }

  console.log('✅ Test caregivers created:')
  console.log('🐕 Sarah Dubois - Hondenuitlaat (Brussel) - €25/uur')
  console.log('🐱 Mike Van Damme - Dierenoppas (Antwerpen) - €30/uur') 
  console.log('🎓 Lisa Peeters - Hondentraining (Gent) - €40/uur')
  console.log('📅 Availability slots created for next 7/5/3 days respectively')
}

createTestCaregivers()
  .catch((e) => {
    console.error('❌ Error creating test caregivers:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
