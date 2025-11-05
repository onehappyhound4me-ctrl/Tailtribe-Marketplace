import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting PRODUCTION-READY database seed...')
  const password = await bcrypt.hash('Password123!', 10)

  // Create admin
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tailtribe.be' },
    update: {},
    create: {
      email: 'admin@tailtribe.be',
      name: 'TailTribe Admin',
      password,
      role: 'ADMIN',
    },
  })
  console.log('👤 Admin created:', admin.email)

  // PRODUCTION DATA - Belgian Caregivers
  const caregiverData = [
    {
      name: 'Sarah Janssens',
      email: 'sarah@tailtribe.be',
      city: 'Antwerpen',
      lat: 51.2194,
      lng: 4.4025,
      services: ['DOG_WALKING', 'GROUP_DOG_WALKING'],
      hourlyRate: 18,
      bio: 'Ervaren hondenuitlater met 5+ jaar ervaring in Antwerpen.',
      photos: [],
    },
    {
      name: 'Tom Vermeulen',
      email: 'tom@tailtribe.be',
      city: 'Gent',
      lat: 51.0543,
      lng: 3.7174,
      services: ['DOG_TRAINING'],
      hourlyRate: 35,
      bio: 'Gecertificeerde hondentrainer in Gent.',
      photos: [],
    },
    {
      name: 'Lisa De Vries',
      email: 'lisa@tailtribe.be',
      city: 'Brussel-Stad',
      lat: 50.8503,
      lng: 4.3517,
      services: ['PET_SITTING', 'PET_BOARDING'],
      hourlyRate: 22,
      bio: 'Dierenliefhebber uit Brussel.',
      photos: [],
    },
    {
      name: 'Emma Willems',
      email: 'emma@tailtribe.be',
      city: 'Leuven',
      lat: 50.8798,
      lng: 4.7005,
      services: ['HOME_CARE', 'PET_SITTING'],
      hourlyRate: 20,
      bio: 'Vriendelijke oppas in Leuven.',
      photos: [],
    },
    {
      name: 'Kevin Peeters',
      email: 'kevin@tailtribe.be',
      city: 'Brugge',
      lat: 51.2093,
      lng: 3.2247,
      services: ['PET_TRANSPORT', 'DOG_WALKING'],
      hourlyRate: 16,
      bio: 'Flexibele verzorger in Brugge.',
      photos: [],
    },
  ]

  const caregivers = []
  for (const data of caregiverData) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: { name: data.name },
      create: {
        email: data.email,
        name: data.name,
        password,
        role: 'CAREGIVER',
      },
    })

    const profile = await prisma.caregiverProfile.upsert({
      where: { userId: user.id },
      update: {},
      create: {
        userId: user.id,
        city: data.city,
        lat: data.lat,
        lng: data.lng,
        services: JSON.stringify(data.services),
        hourlyRate: data.hourlyRate,
        bio: data.bio,
        photos: JSON.stringify(data.photos),
        isApproved: true,
      },
    })
    caregivers.push({ user, profile })
    console.log(`✅ Caregiver: ${data.name}`)
  }

  // Owners
  const ownerData = [
    { name: 'Jan Vermeersch', email: 'jan@tailtribe.be' },
    { name: 'Marie Dubois', email: 'marie@tailtribe.be' },
    { name: 'Peter Van Den Berg', email: 'peter@tailtribe.be' },
  ]

  const owners = []
  for (const data of ownerData) {
    const owner = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        name: data.name,
        password,
        role: 'OWNER',
      },
    })
    owners.push(owner)
    console.log(`🐾 Owner: ${data.name}`)
  }

  // Reviews with proper fields
  const reviews = [
    { rating: 5, comment: 'Sarah is fantastisch! Zeer aan te raden.' },
    { rating: 5, comment: 'Tom is een uitstekende trainer.' },
    { rating: 4, comment: 'Lisa is betrouwbaar en professioneel.' },
    { rating: 5, comment: 'Emma is een lieve verzorgster.' },
    { rating: 5, comment: 'Kevin is flexibel en vriendelijk.' },
  ]

  for (let i = 0; i < reviews.length && i < caregivers.length; i++) {
    await prisma.review.create({
      data: {
        revieweeId: caregivers[i].user.id, // Caregiver being reviewed
        revieweeRole: 'CAREGIVER',
        authorId: owners[i % owners.length].id,
        authorRole: 'OWNER',
        rating: reviews[i].rating,
        comment: reviews[i].comment,
      },
    })
  }
  console.log('⭐ Reviews created')

  // Weekly availability
  const weeklySchedule = {
    monday: [{ start: '09:00', end: '17:00' }],
    tuesday: [{ start: '09:00', end: '17:00' }],
    wednesday: [{ start: '09:00', end: '17:00' }],
    thursday: [{ start: '09:00', end: '17:00' }],
    friday: [{ start: '09:00', end: '17:00' }],
    saturday: [],
    sunday: [],
  }

  for (const { profile } of caregivers) {
    await prisma.availability.upsert({
      where: { caregiverId: profile.id },
      update: {},
      create: {
        caregiverId: profile.id,
        weeklyJson: JSON.stringify(weeklySchedule),
      },
    })
  }
  console.log('📅 Availability created')

  console.log('✅ PRODUCTION seed completed!')
  console.log(`👥 Created: ${caregivers.length} caregivers, ${owners.length} owners`)
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })














