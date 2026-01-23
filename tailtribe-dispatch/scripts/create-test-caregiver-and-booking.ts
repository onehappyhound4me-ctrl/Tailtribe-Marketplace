import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Vind de test owner
  const owner = await prisma.user.findUnique({
    where: { email: 'test@test.nl' }
  })

  if (!owner) {
    console.log('❌ Owner niet gevonden!')
    return
  }

  // Check of verzorger al bestaat
  let caregiver = await prisma.user.findUnique({
    where: { email: 'lisa@test.nl' }
  })

  if (!caregiver) {
    const hashedPassword = await bcrypt.hash('test123', 10)
    
    // Maak verzorger account
    caregiver = await prisma.user.create({
      data: {
        email: 'lisa@test.nl',
        passwordHash: hashedPassword,
        role: 'CAREGIVER',
        firstName: 'Lisa',
        lastName: 'De Vries',
        phone: '0478123456',
        emailVerified: new Date(),
      },
    })

    // Maak verzorger profiel
    await prisma.caregiverProfile.create({
      data: {
        userId: caregiver.id,
        city: 'Antwerpen',
        postalCode: '2000',
        region: 'Antwerpen',
        workRegions: JSON.stringify(['Antwerpen', 'Vlaams-Brabant']),
        maxDistance: 25,
        services: JSON.stringify(['DOG_WALKING', 'CAT_SITTING', 'PET_SITTING']),
        experience: 'Meer dan 5 jaar ervaring met honden en katten',
        bio: 'Hoi! Ik ben Lisa en ik ben dol op dieren. Ik heb zelf 2 honden en 1 kat.',
        isApproved: true,
        isActive: true,
      },
    })

    console.log('✅ Verzorger Lisa aangemaakt!')
  }

  // Maak een COMPLETED booking tussen owner en caregiver
  const existingBooking = await prisma.booking.findFirst({
    where: {
      ownerId: owner.id,
      caregiverId: caregiver.id,
      status: 'COMPLETED'
    }
  })

  if (!existingBooking) {
    await prisma.booking.create({
      data: {
        ownerId: owner.id,
        caregiverId: caregiver.id,
        service: 'DOG_WALKING',
        date: new Date('2026-01-10'),
        timeWindow: 'MORNING',
        city: 'Antwerpen',
        postalCode: '2000',
        petName: 'Max',
        petType: 'hond',
        status: 'COMPLETED', // Voltooide booking = vertrouwde verzorger!
      },
    })

    console.log('✅ Voltooide booking aangemaakt!')
  }

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ DIRECT BOOKING IS NU BESCHIKBAAR!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('\n👤 Verzorger in je lijst:')
  console.log('   Lisa De Vries')
  console.log('   📍 Antwerpen')
  console.log('   📧 lisa@test.nl')
  console.log('\n🔄 Refresh je dashboard pagina!')
  console.log('   Ga naar "Nieuwe Aanvraag"')
  console.log('   Je ziet nu de ⚡ Direct Booking sectie!')
  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
