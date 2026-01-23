const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking availability data...\n')
  
  const availability = await prisma.availability.findMany({
    take: 10,
    orderBy: { date: 'desc' },
    include: {
      caregiver: {
        include: {
          user: {
            select: {
              email: true,
              firstName: true,
              lastName: true,
            }
          }
        }
      }
    }
  })

  console.log(`Found ${availability.length} availability slots:\n`)
  
  availability.forEach((slot, i) => {
    console.log(`${i + 1}. ${slot.caregiver.user.firstName} ${slot.caregiver.user.lastName} (${slot.caregiver.user.email})`)
    console.log(`   Date: ${new Date(slot.date).toLocaleDateString('nl-BE')}`)
    console.log(`   Time: ${slot.timeWindow}`)
    console.log(`   Available: ${slot.isAvailable}`)
    console.log('')
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
