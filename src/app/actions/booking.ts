'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const createBookingSchema = z.object({
  caregiverId: z.string().cuid(),
  serviceType: z.string(),
  startDate: z.string(),
  startTime: z.string(),
  endDate: z.string(),
  endTime: z.string(),
  message: z.string().optional(),
  petName: z.string().min(1),
  petType: z.string().optional(),
  petBreed: z.string().min(1),
  specialInstructions: z.string().optional(),
})

export async function createBooking(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new Error('Authentication required')
    }

    const data = {
      caregiverId: formData.get('caregiverId') as string,
      serviceType: formData.get('serviceType') as string,
      startDate: formData.get('startDate') as string,
      startTime: formData.get('startTime') as string,
      endDate: formData.get('endDate') as string,
      endTime: formData.get('endTime') as string,
      message: formData.get('message') as string,
      petName: formData.get('petName') as string,
      petType: formData.get('petType') as string,
      petBreed: formData.get('petBreed') as string,
      specialInstructions: formData.get('specialInstructions') as string,
    }

    const validatedData = createBookingSchema.parse(data)

    // Calculate start and end times
    const startAt = new Date(`${validatedData.startDate}T${validatedData.startTime}`)
    const endAt = new Date(`${validatedData.endDate}T${validatedData.endTime}`)

    // Get caregiver hourly rate
    const caregiver = await db.caregiverProfile.findUnique({
      where: { id: validatedData.caregiverId }
    })
    
    if (!caregiver) {
      throw new Error('Verzorger niet gevonden')
    }

    // Calculate hours and amount (exact hours including partial hours)
    const hours = (endAt.getTime() - startAt.getTime()) / (1000 * 60 * 60)
    const amountCents = Math.round(hours * caregiver.hourlyRate * 100)

    // Create booking
    const booking = await db.booking.create({
      data: {
        ownerId: session.user.id,
        caregiverId: validatedData.caregiverId,
        startAt,
        endAt,
        status: 'PENDING',
        amountCents,
        currency: 'EUR',
      }
    })

    // Create initial message if provided
    if (validatedData.message) {
      await db.message.create({
        data: {
          bookingId: booking.id,
          senderId: session.user.id,
          body: `${validatedData.message}\n\nHuisdier: ${validatedData.petName}${validatedData.petType ? ` (${validatedData.petType})` : ''}${validatedData.petBreed ? ` - ${validatedData.petBreed}` : ''}${validatedData.specialInstructions ? `\n\nSpeciale instructies: ${validatedData.specialInstructions}` : ''}`,
        }
      })
    }

    revalidatePath('/dashboard')
    return { success: true, bookingId: booking.id }

  } catch (error) {
    console.error('Create booking error:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Ongeldige gegevens' }
    }
    return { success: false, error: 'Er ging iets mis bij het maken van de boeking' }
  }
}

export async function updateBookingStatus(bookingId: string, status: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new Error('Authentication required')
    }

    await db.booking.update({
      where: { id: bookingId },
      data: { status }
    })

    revalidatePath('/dashboard')
    return { success: true }

  } catch (error) {
    console.error('Update booking status error:', error)
    return { success: false, error: 'Er ging iets mis bij het bijwerken van de boeking' }
  }
}

export async function getBookings() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new Error('Authentication required')
    }

    const bookings = await db.booking.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          { caregiverId: session.user.id }
        ]
      },
      include: {
        owner: {
          select: { name: true, email: true }
        },
        caregiver: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    return { success: true, bookings }

  } catch (error) {
    console.error('Get bookings error:', error)
    return { success: false, error: 'Er ging iets mis bij het ophalen van boekingen' }
  }
}

