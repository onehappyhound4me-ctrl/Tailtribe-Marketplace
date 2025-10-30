import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting advanced seed with bookings & messages...')

  const password = await bcrypt.hash('password123', 10)

  // Create admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tailtribe.be' },
    update: {},
    create: {
      email: 'admin@tailtribe.be',
      name: 'Admin TailTribe',
      password,
      role: 'ADMIN',
    },
  })

  // Create owners
  const owner1 = await prisma.user.upsert({
    where: { email: 'jan.vermeersch@example.com' },
    update: {},
    create: {
      email: 'jan.vermeersch@example.com',
      name: 'Jan Vermeersch',
      password,
      role: 'OWNER',
    },
  })

  const owner2 = await prisma.user.upsert({
    where: { email: 'marie.dubois@example.com' },
    update: {},
    create: {
      email: 'marie.dubois@example.com',
      name: 'Marie Dubois',
      password,
      role: 'OWNER',
    },
  })

  // Create caregivers
  const caregiver1 = await prisma.user.upsert({
    where: { email: 'sarah.janssens@example.com' },
    update: {},
    create: {
      email: 'sarah.janssens@example.com',
      name: 'Sarah Janssens',
      password,
      role: 'CAREGIVER',
      caregiverProfile: {
        create: {
          city: 'Antwerpen',
          lat: 51.2194,
          lng: 4.4025,
          services: JSON.stringify(['DOG_WALKING', 'PET_SITTING']),
          hourlyRate: 18,
          bio: 'Ervaren dierenverzorger met meer dan 5 jaar ervaring. Ik houd van lange wandelingen met honden.',
          photos: JSON.stringify(['https://images.unsplash.com/photo-1544348817-5f2cf14b88c8?w=400']),
          isApproved: true,
        }
      }
    },
  })

  const caregiver2 = await prisma.user.upsert({
    where: { email: 'tom.vermeulen@example.com' },
    update: {},
    create: {
      email: 'tom.vermeulen@example.com',
      name: 'Tom Vermeulen',
      password,
      role: 'CAREGIVER',
      caregiverProfile: {
        create: {
          city: 'Gent',
          lat: 51.0543,
          lng: 3.7174,
          services: JSON.stringify(['DOG_WALKING', 'DOG_TRAINING']),
          hourlyRate: 22,
          bio: 'Gecertificeerde hondentrainer gespecialiseerd in gedragsproblemen.',
          photos: JSON.stringify(['https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400']),
          isApproved: true,
        }
      }
    },
  })

  console.log('✅ Users created')

  // Create sample bookings
  const booking1 = await prisma.booking.create({
    data: {
      ownerId: owner1.id,
      caregiverId: caregiver1.id,
      startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // +2 hours
      status: 'PENDING',
      amountCents: 3600, // €36 (2 hours × €18)
      platformFeeCents: 720, // 20%
      caregiverAmountCents: 2880,
      currency: 'EUR',
    }
  })

  const booking2 = await prisma.booking.create({
    data: {
      ownerId: owner2.id,
      caregiverId: caregiver2.id,
      startAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      endAt: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000 + 3 * 60 * 60 * 1000), // +3 hours
      status: 'ACCEPTED',
      amountCents: 6600, // €66 (3 hours × €22)
      platformFeeCents: 1320, // 20%
      caregiverAmountCents: 5280,
      currency: 'EUR',
    }
  })

  console.log('✅ Sample bookings created')

  // Create messages
  await prisma.message.create({
    data: {
      bookingId: booking1.id,
      senderId: owner1.id,
      body: 'Hallo Sarah! Is 10:00 uur goed voor de wandeling?',
    }
  })

  await prisma.message.create({
    data: {
      bookingId: booking1.id,
      senderId: caregiver1.id,
      body: 'Ja perfect! Ik zal er zijn. Hoe heet je hond?',
    }
  })

  await prisma.message.create({
    data: {
      bookingId: booking1.id,
      senderId: owner1.id,
      body: 'Super! Zijn naam is Max, een 3-jarige golden retriever 🐕',
    }
  })

  console.log('✅ Sample messages created')

  // Create reviews
  const caregiver1Profile = await prisma.caregiverProfile.findUnique({
    where: { userId: caregiver1.id }
  })

  if (caregiver1Profile) {
    await prisma.review.create({
      data: {
        revieweeId: caregiver1.id,
        revieweeRole: 'CAREGIVER',
        authorId: owner1.id,
        authorRole: 'OWNER',
        rating: 5,
        comment: 'Fantastische ervaring! Sarah is heel zorgzaam met Max. Absolute aanrader!',
      }
    })
  }

  console.log('✅ Sample reviews created')

  console.log('\n🎉 Advanced seed completed!')
  console.log('\n📊 Summary:')
  console.log('   - 1 Admin')
  console.log('   - 2 Owners')
  console.log('   - 2 Caregivers (approved)')
  console.log('   - 2 Bookings (PENDING + ACCEPTED)')
  console.log('   - 3 Messages')
  console.log('   - 1 Review')
  console.log('\n🔑 Login: sarah.janssens@example.com / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())




