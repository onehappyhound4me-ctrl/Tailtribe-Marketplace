const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking caregiver profiles...\n')
  
  const profiles = await prisma.caregiverProfile.findMany({
    include: {
      user: {
        select: { email: true, name: true }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 3
  })

  if (profiles.length === 0) {
    console.log('❌ No caregiver profiles found!')
    return
  }

  profiles.forEach((profile, index) => {
    console.log(`\n📋 Profile ${index + 1}: ${profile.user.name || 'Unnamed'} (${profile.user.email})`)
    console.log('   Created:', profile.createdAt)
    console.log('   City:', profile.city)
    console.log('   Services:', profile.services || '❌ NULL')
    console.log('   AnimalTypes:', profile.animalTypes || '❌ NULL')
    console.log('   ServicePrices:', profile.servicePrices || '❌ NULL')
    console.log('   AvailabilityData:', profile.availabilityData || '❌ NULL')
    console.log('   Bio:', profile.bio ? `"${profile.bio.substring(0, 50)}..."` : '❌ NULL')
    console.log('   IBAN:', profile.iban ? '✅ Set' : '❌ NULL')
    console.log('   First Aid:', profile.firstAid ? '✅ Yes' : '❌ No')
    console.log('   Insurance:', profile.insurance ? '✅ Set' : '❌ NULL')
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())

























