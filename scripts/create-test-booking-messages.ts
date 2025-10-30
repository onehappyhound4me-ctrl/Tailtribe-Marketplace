import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function createTestBookingWithMessages() {
  console.log('🔧 Creating test booking with messages...')

  // Find an owner
  const owner = await prisma.user.findFirst({
    where: {
      role: 'OWNER'
    }
  })

  if (!owner) {
    console.log('❌ No owner found')
    return
  }

  console.log('✅ Found owner:', owner.email)

  // Find a caregiver
  const caregiver = await prisma.user.findFirst({
    where: {
      role: 'CAREGIVER'
    }
  })

  if (!caregiver) {
    console.log('❌ No caregiver found')
    return
  }

  console.log('✅ Found caregiver:', caregiver.email)

  // Create a booking
  const booking = await prisma.booking.create({
    data: {
      ownerId: owner.id,
      caregiverId: caregiver.id,
      startAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 1 week from now
      endAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000 + 2 * 60 * 60 * 1000), // +2 hours
      status: 'PENDING',
      amountCents: 3600, // €36
      currency: 'EUR',
      petName: 'Max',
      petType: 'DOG',
      petBreed: 'Labrador',
    }
  })

  console.log('✅ Created booking:', booking.id)

  // Create initial message from owner
  await prisma.message.create({
    data: {
      bookingId: booking.id,
      senderId: owner.id,
      body: 'Hallo! Ik ben geïnteresseerd in je hondenuitlaatservice. Zou je mijn hond Max kunnen uitlaten volgende week?'
    }
  })

  console.log('✅ Created message from owner')

  // Create response from caregiver
  await prisma.message.create({
    data: {
      bookingId: booking.id,
      senderId: caregiver.id,
      body: 'Hallo! Bedankt voor je bericht. Ik zou Max graag willen uitlaten. Wat is een goed tijdstip voor jou?'
    }
  })

  console.log('✅ Created message from caregiver')

  // Create another message from owner
  await prisma.message.create({
    data: {
      bookingId: booking.id,
      senderId: owner.id,
      body: 'Geweldig! Zou maandag om 10:00 uur goed uitkomen?'
    }
  })

  console.log('✅ Created second message from owner')

  console.log('✅ Test booking with messages created successfully!')
  console.log('📝 Owner:', owner.email)
  console.log('📝 Caregiver:', caregiver.email)
  console.log('📝 Booking ID:', booking.id)
  
  await prisma.$disconnect()
}

createTestBookingWithMessages()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
