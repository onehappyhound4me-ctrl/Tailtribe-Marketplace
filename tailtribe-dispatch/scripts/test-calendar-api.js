// Test script om te zien wat de calendar API teruggeeft
// Run met: node scripts/test-calendar-api.js

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Testing Calendar API response...\n')
  
  // Find verzorger profile
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
  
  console.log(`✅ Verzorger: ${user.firstName} ${user.lastName}\n`)
  
  // Get availability
  const availability = await prisma.availability.findMany({
    where: { caregiverId: profile.id },
    orderBy: { date: 'asc' },
    take: 20
  })
  
  console.log(`📊 Availability Slots: ${availability.length}\n`)
  
  if (availability.length === 0) {
    console.log('❌ Geen beschikbaarheid gevonden!')
    console.log('Probeer eerst beschikbaarheid in te vullen via de kalender of bulk form.')
    return
  }
  
  // Group by date
  const byDate = {}
  availability.forEach(slot => {
    const dateStr = new Date(slot.date).toLocaleDateString('nl-BE')
    if (!byDate[dateStr]) byDate[dateStr] = []
    byDate[dateStr].push(slot.timeWindow)
  })
  
  console.log('📅 Availability per datum:\n')
  Object.entries(byDate)
    .sort((a, b) => new Date(a[0]) - new Date(b[0]))
    .forEach(([date, windows]) => {
      console.log(`  ${date}: ${windows.join(', ')}`)
    })
  
  console.log('\n✅ Data wordt correct opgeslagen!')
  console.log('\n🔍 Debug info:')
  console.log('Sample availability object:')
  console.log(JSON.stringify(availability[0], null, 2))
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
