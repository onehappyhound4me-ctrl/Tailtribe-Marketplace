const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] || 'owner@test.nl'
  const user = await prisma.user.findUnique({
    where: { email },
    include: { ownerProfile: true, caregiverProfile: true },
  })

  console.log('\nUSER RECORD:\n', user)
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
})
