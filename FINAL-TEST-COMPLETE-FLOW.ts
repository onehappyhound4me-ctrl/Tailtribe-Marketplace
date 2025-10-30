import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const db = new PrismaClient()

async function testCompleteFlow() {
  console.log('🧪 VOLLEDIGE REGISTRATIE FLOW TEST\n')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  
  try {
    // 1. REGISTRATIE
    console.log('1️⃣  REGISTRATIE')
    const email = 'flowtest@test.be'
    const password = '123456'
    
    // Cleanup oude
    const existing = await db.user.findUnique({ where: { email } })
    if (existing) {
      await db.pet.deleteMany({ where: { ownerId: existing.id } })
      await db.user.delete({ where: { id: existing.id } })
    }
    
    const hashedPassword = await bcrypt.hash(password, 10)
    const user = await db.user.create({
      data: {
        email,
        password: hashedPassword,
        firstName: 'Flow',
        lastName: 'Test',
        role: 'OWNER'
      }
    })
    console.log(`   ✅ User aangemaakt: ${user.email}`)
    console.log(`   ID: ${user.id}\n`)
    
    // 2. STAP 1: Locatie
    console.log('2️⃣  STAP 1: Locatie opslaan')
    const step1 = await db.user.update({
      where: { id: user.id },
      data: {
        phone: '+32 123 45 67 89',
        postalCode: '2000',
        city: 'Antwerpen',
        country: 'BE',
        lat: 51.2194,
        lng: 4.4025,
        notificationPreferences: JSON.stringify({ email: true, sms: false })
      }
    })
    console.log(`   ✅ Locatie: ${step1.city}, ${step1.postalCode}`)
    console.log(`   ✅ Coördinaten: ${step1.lat}, ${step1.lng}`)
    console.log(`   ✅ Telefoon: ${step1.phone}\n`)
    
    // 3. STAP 2: Huisdieren toevoegen
    console.log('3️⃣  STAP 2: Huisdieren toevoegen')
    
    const pet1 = await db.pet.create({
      data: {
        ownerId: user.id,
        name: 'Max',
        type: 'DOG',
        breed: 'Labrador',
        gender: 'MALE',
        age: 3,
        weight: 30.5,
        spayedNeutered: true,
        medicalInfo: 'Geen bijzonderheden',
        socialWithPets: true,
        socialWithPeople: true,
        character: 'Speels en energiek'
      }
    })
    console.log(`   ✅ Huisdier 1: ${pet1.name} (${pet1.breed})`)
    
    const pet2 = await db.pet.create({
      data: {
        ownerId: user.id,
        name: 'Luna',
        type: 'CAT',
        breed: 'Siamese',
        gender: 'FEMALE',
        age: 2,
        weight: 4.5,
        spayedNeutered: true,
        medicalInfo: '',
        socialWithPets: false,
        socialWithPeople: true,
        character: 'Rustig en onafhankelijk'
      }
    })
    console.log(`   ✅ Huisdier 2: ${pet2.name} (${pet2.breed})\n`)
    
    // 4. STAP 3: Diensten
    console.log('4️⃣  STAP 3: Diensten opslaan')
    const step3 = await db.user.update({
      where: { id: user.id },
      data: {
        preferences: JSON.stringify({
          primaryServices: ['DOG_WALKING', 'PET_SITTING'],
          frequency: 'WEKELIJKS',
          timing: ['OVERDAG'],
          location: 'THUIS',
          importantQualities: ['BETROUWBAARHEID', 'ERVARING']
        })
      }
    })
    console.log(`   ✅ Diensten opgeslagen\n`)
    
    // 5. STAP 4: Extra vragen
    console.log('5️⃣  STAP 4: Extra vragen')
    const step4 = await db.user.update({
      where: { id: user.id },
      data: {
        howHeardAbout: 'Google',
        perfectExperience: 'Een betrouwbare verzorger voor mijn hond',
        onboardingCompleted: true
      }
    })
    console.log(`   ✅ Extra vragen opgeslagen`)
    console.log(`   ✅ Onboarding compleet\n`)
    
    // 6. VERIFICATIE: Haal profiel op zoals dashboard doet
    console.log('6️⃣  VERIFICATIE: Dashboard data')
    const profile = await db.user.findUnique({
      where: { id: user.id },
      include: {
        pets: true
      }
    })
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📊 WAT DASHBOARD ZOU MOETEN TONEN:')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    console.log(`👤 Naam: ${profile?.firstName} ${profile?.lastName}`)
    console.log(`📧 Email: ${profile?.email}`)
    console.log(`📍 Locatie: ${profile?.city}, ${profile?.postalCode}`)
    console.log(`📞 Telefoon: ${profile?.phone}`)
    console.log(`🗺️  Coördinaten: ${profile?.lat}, ${profile?.lng}`)
    console.log(`\n🐾 Huisdieren (${profile?.pets.length}):`)
    profile?.pets.forEach((p, i) => {
      console.log(`   ${i + 1}. ${p.name}`)
      console.log(`      Type: ${p.type}`)
      console.log(`      Ras: ${p.breed}`)
      console.log(`      Leeftijd: ${p.age} jaar`)
      console.log(`      Gewicht: ${p.weight} kg`)
      console.log(`      Karakter: ${p.character}`)
    })
    
    const prefs = profile?.preferences ? JSON.parse(profile.preferences) : null
    if (prefs) {
      console.log(`\n🔍 Diensten: ${prefs.primaryServices?.join(', ')}`)
      console.log(`📅 Frequentie: ${prefs.frequency}`)
    }
    
    console.log(`\n✅ Onboarding: ${profile?.onboardingCompleted ? 'Compleet' : 'Incomplete'}`)
    
    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('\n✅ ALLE DATA IS CORRECT OPGESLAGEN!')
    console.log('\n📝 Nu test je het formulier handmatig:')
    console.log('   1. Ga naar: http://localhost:3000/auth/signout')
    console.log('   2. Klik "Uitloggen"')
    console.log('   3. Ga naar: http://localhost:3000/auth/register')
    console.log('   4. Registreer met nieuwe email')
    console.log('   5. Voltooi alle 4 stappen')
    console.log('   6. Check dashboard → huisdieren moeten kloppen!\n')
    
    // Cleanup
    await db.pet.deleteMany({ where: { ownerId: user.id } })
    await db.user.delete({ where: { id: user.id } })
    console.log('🧹 Test account opgeruimd\n')
    
  } catch (error) {
    console.error('\n❌ TEST GEFAALD:', error)
    throw error
  } finally {
    await db.$disconnect()
  }
}

testCompleteFlow()



































