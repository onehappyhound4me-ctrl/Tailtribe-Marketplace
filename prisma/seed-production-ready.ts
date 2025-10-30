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
    // Antwerpen
    {
      name: 'Sarah Janssens',
      email: 'sarah@tailtribe.be',
      city: 'Antwerpen',
      lat: 51.2194,
      lng: 4.4025,
      services: ['DOG_WALKING', 'GROUP_DOG_WALKING'],
      hourlyRate: 18,
      bio: 'Ervaren hondenuitlater met 5+ jaar ervaring. Gespecialiseerd in groepsuitjes en individuele wandelingen in en rond Antwerpen.',
      photos: [],
    },
    // Gent
    {
      name: 'Tom Vermeulen',
      email: 'tom@tailtribe.be',
      city: 'Gent',
      lat: 51.0543,
      lng: 3.7174,
      services: ['DOG_TRAINING'],
      hourlyRate: 35,
      bio: 'Gecertificeerde hondentrainer. Gespecialiseerd in gedragsproblemen en gehoorzaamheidstraining.',
      photos: [],
    },
    // Brussel
    {
      name: 'Lisa De Vries',
      email: 'lisa@tailtribe.be',
      city: 'Brussel-Stad',
      lat: 50.8503,
      lng: 4.3517,
      services: ['PET_SITTING', 'PET_BOARDING'],
      hourlyRate: 22,
      bio: 'Dierenliefhebber uit Brussel met ruime ervaring in het verzorgen van katten, honden en kleinvee.',
      photos: [],
    },
    // Leuven
    {
      name: 'Emma Willems',
      email: 'emma@tailtribe.be',
      city: 'Leuven',
      lat: 50.8798,
      lng: 4.7005,
      services: ['HOME_CARE', 'PET_SITTING'],
      hourlyRate: 20,
      bio: 'Vriendelijke oppas gespecialiseerd in verzorging aan huis. Beschikbaar op weekdagen en weekends.',
      photos: [],
    },
    // Brugge
    {
      name: 'Kevin Peeters',
      email: 'kevin@tailtribe.be',
      city: 'Brugge',
      lat: 51.2093,
      lng: 3.2247,
      services: ['PET_TRANSPORT', 'DOG_WALKING'],
      hourlyRate: 16,
      bio: 'Flexibele verzorger in Brugge. Biedt transportdiensten en dagelijkse wandelingen.',
      photos: [],
    },
    // Gent (extra)
    {
      name: 'Sophie Maes',
      email: 'sophie@tailtribe.be',
      city: 'Gent',
      lat: 51.0543,
      lng: 3.7174,
      services: ['SMALL_ANIMAL_CARE'],
      hourlyRate: 15,
      bio: 'Gespecialiseerd in de verzorging van konijnen, cavia\'s en andere kleine huisdieren.',
      photos: [],
    },
    // Brussel (extra)
    {
      name: 'Mohamed Alami',
      email: 'mohamed@tailtribe.be',
      city: 'Brussel-Stad',
      lat: 50.8503,
      lng: 4.3517,
      services: ['DOG_WALKING', 'HOME_CARE'],
      hourlyRate: 19,
      bio: 'Betrouwbare verzorger met focus op actieve honden. Beschikbaar ochtend, middag en avond.',
      photos: [],
    },
    // Antwerpen (extra)
    {
      name: 'Julie Claes',
      email: 'julie@tailtribe.be',
      city: 'Antwerpen',
      lat: 51.2194,
      lng: 4.4025,
      services: ['PET_SITTING', 'EVENT_COMPANION'],
      hourlyRate: 24,
      bio: 'Professionele dierenoppas. Ideaal voor vakanties en events waarbij je dier meegaat.',
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
    console.log(`✅ Caregiver: ${data.name} (${data.city})`)
  }

  // PRODUCTION DATA - Pet Owners
  const ownerData = [
    { name: 'Jan Vermeersch', email: 'jan@tailtribe.be' },
    { name: 'Marie Dubois', email: 'marie@tailtribe.be' },
    { name: 'Peter Van Den Berg', email: 'peter@tailtribe.be' },
    { name: 'Charlotte Janssen', email: 'charlotte@tailtribe.be' },
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

  // Create reviews
  const reviews = [
    { rating: 5, comment: 'Sarah is fantastisch! Heeft perfect voor onze hond Max gezorgd tijdens ons weekend weg. Zeer aan te raden!' },
    { rating: 5, comment: 'Tom is een uitstekende trainer. Onze hond luistert nu veel beter na slechts een paar sessies.' },
    { rating: 4, comment: 'Lisa is betrouwbaar en professioneel. Onze kat was duidelijk in goede handen.' },
    { rating: 5, comment: 'Emma is een lieve verzorgster. Ze kwam dagelijks langs tijdens onze vakantie. Perfect!' },
    { rating: 5, comment: 'Kevin is flexibel en vriendelijk. Onze hond houdt van hem!' },
  ]

  for (let i = 0; i < reviews.length && i < caregivers.length; i++) {
    await prisma.review.create({
      data: {
        revieweeId: caregivers[i].user.id,
        revieweeRole: 'CAREGIVER',
        authorId: owners[i % owners.length].id,
        authorRole: 'OWNER',
        rating: reviews[i].rating,
        comment: reviews[i].comment,
      },
    })
  }
  console.log('⭐ Reviews created')

  // Create availability for caregivers (weekly schedule)
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
  console.log('📅 Availability schedules created')

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
