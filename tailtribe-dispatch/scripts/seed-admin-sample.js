// Seeds a sample owner, caregiver, and one booking for admin view
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const password = 'Test!234'
  const hash = await bcrypt.hash(password, 10)

  const owner = await prisma.user.upsert({
    where: { email: 'owner@test.nl' },
    update: { passwordHash: hash, role: 'OWNER', firstName: 'Owner', lastName: 'Demo' },
    create: { email: 'owner@test.nl', passwordHash: hash, role: 'OWNER', firstName: 'Owner', lastName: 'Demo' },
  })

  const caregiver = await prisma.user.upsert({
    where: { email: 'caregiver@test.nl' },
    update: { passwordHash: hash, role: 'CAREGIVER', firstName: 'Care', lastName: 'Giver' },
    create: { email: 'caregiver@test.nl', passwordHash: hash, role: 'CAREGIVER', firstName: 'Care', lastName: 'Giver' },
  })

  const workRegions = JSON.stringify(['Antwerpen', 'Vlaams-Brabant'])
  const services = JSON.stringify(['DOG_WALKING', 'PET_SITTING'])

  await prisma.caregiverProfile.upsert({
    where: { userId: caregiver.id },
    update: {
      city: 'Antwerpen',
      postalCode: '2000',
      region: 'Antwerpen',
      workRegions,
      maxDistance: 20,
      companyName: 'Test Zorg',
      isSelfEmployed: true,
      hasLiabilityInsurance: true,
      services,
      experience: '5 jaar ervaring met honden en katten',
      bio: 'Betrouwbare verzorger, beschikbaar regio Antwerpen.',
      isApproved: true,
      isActive: true,
    },
    create: {
      id: caregiver.id,
      userId: caregiver.id,
      city: 'Antwerpen',
      postalCode: '2000',
      region: 'Antwerpen',
      workRegions,
      maxDistance: 20,
      companyName: 'Test Zorg',
      isSelfEmployed: true,
      hasLiabilityInsurance: true,
      services,
      experience: '5 jaar ervaring met honden en katten',
      bio: 'Betrouwbare verzorger, beschikbaar regio Antwerpen.',
      isApproved: true,
      isActive: true,
    },
  })

  const future = new Date()
  future.setDate(future.getDate() + 2)
  future.setHours(10, 0, 0, 0)

  await prisma.booking.create({
    data: {
      ownerId: owner.id,
      service: 'DOG_WALKING',
      date: future,
      timeWindow: 'MORNING',
      city: 'Antwerpen',
      postalCode: '2000',
      region: 'Antwerpen',
      address: 'Teststraat 1',
      petName: 'Bello',
      petType: 'Hond',
      petDetails: 'Lief en energiek',
      contactPreference: 'email',
      message: 'Test booking admin view',
      status: 'PENDING',
    },
  })

  console.log('Sample data ready:')
  console.log('- owner@test.nl / Test!234')
  console.log('- caregiver@test.nl / Test!234')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
