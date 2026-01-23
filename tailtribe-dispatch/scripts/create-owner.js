const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2] || 'owner@test.nl'
  const password = process.argv[3] || 'test123'

  const existing = await prisma.user.findUnique({ where: { email } })
  if (existing) {
    console.log(`\n✅ Bestaat al: ${email}\n`)
    await prisma.$disconnect()
    return
  }

  const hash = await bcrypt.hash(password, 10)
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hash,
      role: 'OWNER',
      firstName: 'Test',
      lastName: 'Owner',
      emailVerified: new Date(),
      ownerProfile: {
        create: {
          city: 'Gent',
          postalCode: '9000',
        },
      },
    },
  })

  console.log('\n✅ Owner aangemaakt!\n', {
    email: user.email,
    password,
  })
  await prisma.$disconnect()
}

main().catch((e) => {
  console.error(e)
  prisma.$disconnect()
})
