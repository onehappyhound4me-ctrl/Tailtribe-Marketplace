import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'verzorger@test.nl'
  const password = 'test123'
  
  // Check if exists
  const existing = await prisma.user.findUnique({
    where: { email }
  })

  if (existing) {
    console.log('✅ Verzorger account bestaat al!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:     verzorger@test.nl')
    console.log('🔒 Wachtwoord: test123')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🌐 Login:     http://localhost:3000/login')
    return
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      role: 'CAREGIVER',
      firstName: 'Tom',
      lastName: 'Janssens',
      phone: '0471234567',
      emailVerified: new Date(),
    },
  })

  // Maak caregiver profiel
  const profile = await prisma.caregiverProfile.create({
    data: {
      userId: user.id,
      city: 'Antwerpen',
      postalCode: '2000',
      region: 'Antwerpen',
      workRegions: JSON.stringify(['Antwerpen', 'Vlaams-Brabant']),
      maxDistance: 30,
      services: JSON.stringify(['DOG_WALKING', 'CAT_SITTING', 'PET_SITTING', 'DOG_DAYCARE']),
      experience: '3+ jaar ervaring met honden en katten. Dagelijks beschikbaar.',
      bio: 'Hallo! Ik ben Tom en ik zorg graag voor jullie huisdieren. Betrouwbaar en flexibel!',
      isApproved: true,
      isActive: true,
    },
  })

  // Voeg wat beschikbaarheid toe voor de komende week
  const today = new Date()
  const timeWindows = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT']
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    
    for (const window of timeWindows) {
      await prisma.availability.create({
        data: {
          caregiverId: profile.id, // Use profile.id, not user.id!
          date: date,
          timeWindow: window,
          isAvailable: true,
        },
      })
    }
  }

  console.log('✅ Verzorger account aangemaakt!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📧 Email:     verzorger@test.nl')
  console.log('🔒 Wachtwoord: test123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('👤 Naam:      Tom Janssens')
  console.log('📍 Locatie:   Antwerpen')
  console.log('✅ Profiel:   Compleet')
  console.log('📅 Beschikb:  7 dagen ingevuld')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🌐 Login:     http://localhost:3000/login')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
