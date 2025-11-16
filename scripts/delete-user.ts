import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteUser(email: string) {
  try {
    console.log(`Zoeken naar gebruiker met email: ${email}...`)
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        accounts: true,
        sessions: true,
        caregiverProfile: true,
        bookingsOwned: true,
        bookingsAsCarer: true,
        reviewsGiven: true,
        reviewsReceived: true,
        favorites: true,
        pets: true,
      }
    })

    if (!user) {
      console.log(`❌ Geen gebruiker gevonden met email: ${email}`)
      return
    }

    console.log(`✅ Gebruiker gevonden: ${user.name || `${user.firstName} ${user.lastName}`} (${user.email})`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Accounts: ${user.accounts.length}`)
    console.log(`   Sessions: ${user.sessions.length}`)
    console.log(`   Bookings (owner): ${user.bookingsOwned.length}`)
    console.log(`   Bookings (caregiver): ${user.bookingsAsCarer.length}`)
    console.log(`   Reviews given: ${user.reviewsGiven.length}`)
    console.log(`   Reviews received: ${user.reviewsReceived.length}`)
    console.log(`   Favorites: ${user.favorites.length}`)
    console.log(`   Pets: ${user.pets.length}`)
    console.log(`   Caregiver profile: ${user.caregiverProfile ? 'Ja' : 'Nee'}`)

    // Delete user (cascade will handle related records)
    console.log(`\n🗑️  Verwijderen van gebruiker en alle gerelateerde data...`)
    await prisma.user.delete({
      where: { email }
    })

    console.log(`✅ Gebruiker ${email} succesvol verwijderd!`)
  } catch (error) {
    console.error('❌ Fout bij verwijderen:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Get email from command line args
const email = process.argv[2]

if (!email) {
  console.error('❌ Geef een email adres op als argument')
  console.log('Gebruik: npx tsx scripts/delete-user.ts email@example.com')
  process.exit(1)
}

deleteUser(email)
  .then(() => {
    console.log('\n✅ Klaar!')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n❌ Fout:', error)
    process.exit(1)
  })

