import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

const TEST_OWNER_EMAIL = 'test.owner@tailtribe.nl'
const TEST_OWNER_PASSWORD = 'test123456'

async function createOrResetTestOwner() {
  try {
    console.log('🔍 Zoeken naar test owner account...')
    
    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { email: TEST_OWNER_EMAIL },
      include: {
        accounts: true,
        pets: true,
        bookingsOwned: true,
        bookingsAsCarer: true,
      }
    })

    if (existingUser) {
      console.log(`✅ Gebruiker gevonden: ${existingUser.email}`)
      console.log(`   ID: ${existingUser.id}`)
      console.log(`   Role: ${existingUser.role}`)
      console.log(`   Heeft wachtwoord: ${!!existingUser.password}`)
      console.log(`   Accounts: ${existingUser.accounts.length}`)
      console.log(`   Pets: ${existingUser.pets.length}`)
      console.log(`   Bookings (owner): ${existingUser.bookingsOwned.length}`)
      console.log(`   Bookings (caregiver): ${existingUser.bookingsAsCarer.length}`)
      
      // Hash password
      const hashedPassword = await bcrypt.hash(TEST_OWNER_PASSWORD, 10)
      
      // Update user
      console.log('\n🔄 Updaten van test owner account...')
      const updatedUser = await prisma.user.update({
        where: { email: TEST_OWNER_EMAIL },
        data: {
          password: hashedPassword,
          role: 'OWNER',
          firstName: 'Test',
          lastName: 'Owner',
          name: 'Test Owner',
          emailVerified: new Date(), // Mark as verified
        }
      })
      
      console.log('✅ Test owner account geüpdatet!')
      console.log(`   Email: ${updatedUser.email}`)
      console.log(`   Role: ${updatedUser.role}`)
      console.log(`   Password: ${TEST_OWNER_PASSWORD}`)
      console.log(`   Email verified: ${updatedUser.emailVerified ? 'Ja' : 'Nee'}`)
    } else {
      console.log('❌ Gebruiker niet gevonden, aanmaken...')
      
      // Hash password
      const hashedPassword = await bcrypt.hash(TEST_OWNER_PASSWORD, 10)
      
      // Create user
      const newUser = await prisma.user.create({
        data: {
          email: TEST_OWNER_EMAIL,
          password: hashedPassword,
          role: 'OWNER',
          firstName: 'Test',
          lastName: 'Owner',
          name: 'Test Owner',
          emailVerified: new Date(), // Mark as verified
        }
      })
      
      console.log('✅ Test owner account aangemaakt!')
      console.log(`   ID: ${newUser.id}`)
      console.log(`   Email: ${newUser.email}`)
      console.log(`   Role: ${newUser.role}`)
      console.log(`   Password: ${TEST_OWNER_PASSWORD}`)
    }
    
    console.log('\n📋 Test Account Gegevens:')
    console.log(`   Email: ${TEST_OWNER_EMAIL}`)
    console.log(`   Password: ${TEST_OWNER_PASSWORD}`)
    console.log(`   Role: OWNER`)
    console.log('\n✅ Klaar! Je kunt nu inloggen met deze gegevens.')
    
  } catch (error) {
    console.error('❌ Error:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

createOrResetTestOwner()

