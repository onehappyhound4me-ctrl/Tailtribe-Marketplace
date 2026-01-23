const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.log('Usage: node scripts/inspect-user.js <email>')
    return
  }
  const user = await prisma.user.findUnique({ where: { email } })
  console.log(user)
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
