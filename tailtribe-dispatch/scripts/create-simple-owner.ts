import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const email = 'test@test.nl'
  const password = 'test123'
  
  // Check if exists
  const existing = await prisma.user.findUnique({
    where: { email }
  })

  if (existing) {
    console.log('✅ Account bestaat al!')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('📧 Email:     test@test.nl')
    console.log('🔒 Wachtwoord: test123')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log('🌐 Login:     http://localhost:3001/login')
    return
  }

  const hashedPassword = await bcrypt.hash(password, 10)

  const user = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword,
      role: 'OWNER',
      firstName: 'Test',
      lastName: 'User',
      emailVerified: new Date(), // Direct geverifieerd!
    },
  })

  // Maak owner profiel
  await prisma.ownerProfile.create({
    data: {
      userId: user.id,
      city: 'Antwerpen',
      postalCode: '2000',
      region: 'Antwerpen',
    },
  })

  console.log('✅ Test account aangemaakt!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📧 Email:     test@test.nl')
  console.log('🔒 Wachtwoord: test123')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🌐 Login:     http://localhost:3001/login')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
