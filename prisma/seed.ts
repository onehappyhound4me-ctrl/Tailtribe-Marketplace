import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting database seed...')

  // Create admin user
  const admin = await prisma.user.upsert({
    where: { email: 'admin@tailtribe.be' },
    update: {},
    create: {
      email: 'admin@tailtribe.be',
      name: 'TailTribe Admin',
      role: 'ADMIN',
    },
  })

  console.log('👤 Created admin user:', admin.email)
  console.log('✅ Database seed completed successfully!')
  console.log('ℹ️  Test accounts removed - only admin user created')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Seed failed:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
