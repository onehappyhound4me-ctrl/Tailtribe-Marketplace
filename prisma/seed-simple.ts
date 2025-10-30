import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tailtribe.be' },
    update: {},
    create: {
      email: 'admin@tailtribe.be',
      name: 'TailTribe Admin',
      role: 'ADMIN',
    },
  })

  console.log('👤 Created admin user:', admin.email)

  // Sample caregiver data for major Belgian cities
  const caregiverData = [
    {
      name: 'Sarah Janssens',
      email: 'sarah.janssens@example.com',
      city: 'Antwerpen',
      lat: 51.2194,
      lng: 4.4025,
      services: '["DOG_WALKING", "PET_SITTING"]',
      hourlyRate: 18,
      bio: 'Ervaren dierenverzorger met meer dan 5 jaar ervaring. Ik houd van lange wandelingen met honden en geef graag de beste zorg aan jouw huisdier.',
      photos: '["https://images.unsplash.com/photo-1544348817-5f2cf14b88c8?w=400", "https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400"]'
    },
    {
      name: 'Tom Vermeulen',
      email: 'tom.vermeulen@example.com',
      city: 'Gent',
      lat: 51.0543,
      lng: 3.7174,
      services: '["DOG_WALKING", "TRAINING"]',
      hourlyRate: 22,
      bio: 'Gecertificeerde hondentrainer gespecialiseerd in gedragsproblemen en basisgehoorzaamheid.',
      photos: '["https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400"]'
    },
    {
      name: 'Lisa De Vries',
      email: 'lisa.devries@example.com',
      city: 'Brussel-Stad',
      lat: 50.8503,
      lng: 4.3517,
      services: '["PET_SITTING", "TRANSPORT"]',
      hourlyRate: 25,
      bio: 'Dierenliefhebber uit Brussel met ruime ervaring in het verzorgen van verschillende huisdieren.',
      photos: '["https://images.unsplash.com/photo-1494790108755-2616c560e7e4?w=400"]'
    },
    {
      name: 'Kevin Peeters',
      email: 'kevin.peeters@example.com',
      city: 'Leuven',
      lat: 50.8798,
      lng: 4.7005,
      services: '["DOG_WALKING", "PET_SITTING", "TRAINING"]',
      hourlyRate: 20,
      bio: 'Voormalig veterinair assistent met passie voor dierenwelzijn.',
      photos: '["https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400"]'
    },
    {
      name: 'Emma Claes',
      email: 'emma.claes@example.com',
      city: 'Brugge',
      lat: 51.2093,
      lng: 3.2247,
      services: '["PET_SITTING", "DOG_WALKING"]',
      hourlyRate: 16,
      bio: 'Studente diergeneeskunde met flexibele uren. Geduldig en betrouwbaar.',
      photos: '["https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=400"]'
    },
    {
      name: 'Michiel Hendricks',
      email: 'michiel.hendricks@example.com',
      city: 'Hasselt',
      lat: 50.9306,
      lng: 5.3378,
      services: '["DOG_WALKING", "TRANSPORT"]',
      hourlyRate: 19,
      bio: 'Gepensioneerde leraar met veel tijd en liefde voor dieren.',
      photos: '["https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400"]'
    }
  ]

  // Create caregivers
  for (const data of caregiverData) {
    const user = await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        name: data.name,
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
        services: data.services,
        hourlyRate: data.hourlyRate,
        bio: data.bio,
        photos: data.photos,
        isApproved: true, // Pre-approve for demo
      },
    })

    // Create availability
    await prisma.availability.upsert({
      where: { caregiverId: profile.id },
      update: {},
      create: {
        caregiverId: profile.id,
        weeklyJson: JSON.stringify({
          monday: [{ start: '09:00', end: '17:00' }],
          tuesday: [{ start: '09:00', end: '17:00' }],
          wednesday: [{ start: '09:00', end: '17:00' }],
          thursday: [{ start: '09:00', end: '17:00' }],
          friday: [{ start: '09:00', end: '17:00' }],
          saturday: [{ start: '10:00', end: '16:00' }],
          sunday: []
        }),
      },
    })

    // Create listings
    await prisma.listing.create({
      data: {
        caregiverId: profile.id,
        title: `Dierenverzorging in ${data.city}`,
        description: `Betrouwbare dierenverzorging service in ${data.city}. ${data.bio.substring(0, 100)}...`,
        minRate: data.hourlyRate,
        photos: data.photos,
        active: true,
      },
    })

    console.log(`👨‍⚕️ Created caregiver: ${data.name} in ${data.city}`)
  }

  // Create sample pet owners
  const ownerData = [
    { name: 'Jan Vermeersch', email: 'jan.vermeersch@example.com' },
    { name: 'Marie Dubois', email: 'marie.dubois@example.com' },
    { name: 'Peter Van Den Berg', email: 'peter.vandenberg@example.com' },
  ]

  for (const data of ownerData) {
    await prisma.user.upsert({
      where: { email: data.email },
      update: {},
      create: {
        email: data.email,
        name: data.name,
        role: 'OWNER',
      },
    })
    console.log(`🐾 Created pet owner: ${data.name}`)
  }

  // Create sample reviews
  const caregivers = await prisma.caregiverProfile.findMany({
    include: { user: true }
  })
  const owners = await prisma.user.findMany({
    where: { role: 'OWNER' }
  })

  const sampleReviews = [
    { rating: 5, comment: 'Fantastische service! Sarah heeft perfect voor onze hond gezorgd tijdens ons weekend weg.' },
    { rating: 4, comment: 'Tom is een uitstekende trainer. Onze hond luistert nu veel beter.' },
    { rating: 5, comment: 'Lisa is zeer betrouwbaar en professioneel. Onze kat was in goede handen.' },
    { rating: 4, comment: 'Kevin geeft goede adviezen en zorgt goed voor de dieren.' },
    { rating: 5, comment: 'Emma is lief en geduldig met onze puppy. Zeer tevreden!' },
  ]

  for (let i = 0; i < sampleReviews.length && i < caregivers.length; i++) {
    await prisma.review.create({
      data: {
        revieweeId: caregivers[i].id,
        revieweeRole: 'CAREGIVER',
        authorId: owners[i % owners.length].id,
        authorRole: 'OWNER',
        rating: sampleReviews[i].rating,
        comment: sampleReviews[i].comment,
      },
    })
  }

  console.log('⭐ Created sample reviews')

  // Create sample story highlights
  for (let i = 0; i < Math.min(2, caregivers.length); i++) {
    await prisma.storyHighlight.create({
      data: {
        caregiverId: caregivers[i].id,
        platform: i === 0 ? 'YOUTUBE' : 'VIMEO',
        videoUrl: i === 0 ? 'https://youtu.be/dQw4w9WgXcQ' : 'https://vimeo.com/123456789',
        title: i === 0 ? 'Wandeling in het park' : 'Training sessie',
        transcript: i === 0 ? 
          'Een mooie wandeling met Max in het Stadspark van Antwerpen.' :
          'Gedragstraining met een jonge hond.',
        published: true,
        expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
      },
    })
  }

  console.log('📹 Created sample story highlights')
  console.log('✅ Database seed completed successfully!')
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

