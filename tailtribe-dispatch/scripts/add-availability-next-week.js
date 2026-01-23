const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Adding availability for next 7 days...\n')
  
  // Find verzorger
  const user = await prisma.user.findUnique({
    where: { email: 'verzorger@test.nl' }
  })
  
  if (!user) {
    console.log('❌ Verzorger niet gevonden!')
    return
  }
  
  const profile = await prisma.caregiverProfile.findUnique({
    where: { userId: user.id }
  })
  
  if (!profile) {
    console.log('❌ Caregiver profile niet gevonden!')
    return
  }
  
  console.log(`✅ Verzorger: ${user.firstName} ${user.lastName}`)
  console.log(`   Profile ID: ${profile.id}\n`)
  
  const today = new Date()
  const timeWindows = ['MORNING', 'AFTERNOON', 'EVENING', 'NIGHT']
  let count = 0
  
  for (let i = 0; i < 7; i++) {
    const date = new Date(today)
    date.setDate(date.getDate() + i)
    date.setHours(0, 0, 0, 0) // Reset tijd naar midnight
    
    console.log(`📅 ${date.toLocaleDateString('nl-BE')}:`)
    
    for (const window of timeWindows) {
      try {
        await prisma.availability.create({
          data: {
            caregiverId: profile.id,
            date: date,
            timeWindow: window,
            isAvailable: true,
          },
        })
        console.log(`   ✅ ${window}`)
        count++
      } catch (error) {
        if (error.code === 'P2002') {
          console.log(`   ⚠️  ${window} (bestaat al)`)
        } else {
          console.log(`   ❌ ${window} (error: ${error.message})`)
        }
      }
    }
  }
  
  console.log(`\n✅ ${count} nieuwe slots toegevoegd!`)
  console.log('\n🎯 Test nu je kalender:')
  console.log('1. Log in als verzorger@test.nl')
  console.log('2. Ga naar Dashboard → 📅 Kalender')
  console.log('3. Je zou groene beschikbaarheid moeten zien!')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
