import { PrismaClient } from '@prisma/client'

const db = new PrismaClient()

async function check() {
  // Find the most recently created owner
  const latestOwner = await db.user.findFirst({
    where: { role: 'OWNER' },
    include: {
      pets: true
    },
    orderBy: { createdAt: 'desc' }
  })
  
  if (!latestOwner) {
    console.log('❌ Geen owner gevonden in database')
    await db.$disconnect()
    return
  }
  
  console.log('👤 Meest recente OWNER:')
  console.log(`   Email: ${latestOwner.email}`)
  console.log(`   Naam: ${latestOwner.firstName} ${latestOwner.lastName}`)
  console.log(`   Locatie: ${latestOwner.city}, ${latestOwner.postalCode}`)
  console.log(`   Created: ${latestOwner.createdAt}`)
  console.log(`   🐾 ${latestOwner.pets.length} huisdieren:`)
  
  latestOwner.pets.forEach(p => {
    console.log(`      - ${p.name} (${p.type}, ${p.breed})`)
    console.log(`        Leeftijd: ${p.age}, Gewicht: ${p.weight}`)
    console.log(`        Karakter: ${p.character || 'Niet ingevuld'}`)
  })
  
  // Check if there are any pets from seed data (old pet owners from seed.ts)
  const seedPets = await db.pet.findMany({
    where: {
      owner: {
        email: {
          in: ['jan.vermeersch@example.com', 'marie.dubois@example.com', 'peter.vandenberg@example.com']
        }
      }
    },
    include: {
      owner: {
        select: {
          email: true
        }
      }
    }
  })
  
  if (seedPets.length > 0) {
    console.log('\n⚠️  SEED PETS GEVONDEN (moeten weg!):')
    seedPets.forEach(p => {
      console.log(`   - ${p.name} van ${p.owner.email}`)
    })
  }
  
  await db.$disconnect()
}

check()



































