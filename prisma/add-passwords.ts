import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  const password = await bcrypt.hash('password123', 10)

  // Update all existing users with password
  await prisma.user.updateMany({
    data: {
      password
    }
  })

  console.log('✅ Passwords added to all users')
  console.log('🔑 Default password: password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())




