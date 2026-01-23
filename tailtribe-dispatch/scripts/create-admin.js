const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function main() {
  const email = 'admin@test.nl'
  const password = 'admin123'
  const hash = await bcrypt.hash(password, 10)

  const existing = await prisma.user.findUnique({ where: { email } })
  if (!existing) {
    await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        role: 'ADMIN',
        firstName: 'Admin',
        lastName: 'Test',
        emailVerified: new Date(),
      },
    })
    console.log('Admin aangemaakt:', email)
  } else {
    await prisma.user.update({
      where: { email },
      data: { passwordHash: hash, role: 'ADMIN' },
    })
    console.log('Admin geüpdatet:', email)
  }
  console.log('Wachtwoord:', password)
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
