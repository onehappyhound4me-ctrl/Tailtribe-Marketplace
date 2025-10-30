'use server'

import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const sendMessageSchema = z.object({
  bookingId: z.string().cuid(),
  body: z.string().min(1).max(1000),
})

const createConversationSchema = z.object({
  caregiverId: z.string().cuid(),
  message: z.string().min(1).max(1000),
})

export async function sendMessage(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new Error('Authentication required')
    }

    const data = {
      bookingId: formData.get('bookingId') as string,
      body: formData.get('body') as string,
    }

    const validatedData = sendMessageSchema.parse(data)

    // Create message
    await db.message.create({
      data: {
        bookingId: validatedData.bookingId,
        senderId: session.user.id,
        body: validatedData.body,
      }
    })

    revalidatePath(`/messages/${validatedData.bookingId}`)
    return { success: true }

  } catch (error) {
    console.error('Send message error:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Ongeldige gegevens' }
    }
    return { success: false, error: 'Er ging iets mis bij het versturen van het bericht' }
  }
}

export async function createConversation(formData: FormData) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new Error('Authentication required')
    }

    const data = {
      caregiverId: formData.get('caregiverId') as string,
      message: formData.get('message') as string,
    }

    const validatedData = createConversationSchema.parse(data)

    // Create a temporary booking for the conversation
    const booking = await db.booking.create({
      data: {
        ownerId: session.user.id,
        caregiverId: validatedData.caregiverId,
        startAt: new Date(),
        endAt: new Date(),
        status: 'PENDING',
        amountCents: 0,
        currency: 'EUR',
      }
    })

    // Create initial message
    await db.message.create({
      data: {
        bookingId: booking.id,
        senderId: session.user.id,
        body: validatedData.message,
      }
    })

    revalidatePath('/dashboard')
    return { success: true, conversationId: booking.id }

  } catch (error) {
    console.error('Create conversation error:', error)
    if (error instanceof z.ZodError) {
      return { success: false, error: 'Ongeldige gegevens' }
    }
    return { success: false, error: 'Er ging iets mis bij het maken van het gesprek' }
  }
}

export async function getMessages(bookingId: string) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new Error('Authentication required')
    }

    const messages = await db.message.findMany({
      where: { bookingId },
      include: {
        sender: {
          select: { name: true, email: true }
        }
      },
      orderBy: { createdAt: 'asc' }
    })

    // Mark messages as read
    await db.message.updateMany({
      where: {
        bookingId,
        senderId: { not: session.user.id },
        readAt: null
      },
      data: {
        readAt: new Date()
      }
    })

    return { success: true, messages }

  } catch (error) {
    console.error('Get messages error:', error)
    return { success: false, error: 'Er ging iets mis bij het ophalen van berichten' }
  }
}

export async function getConversations() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      throw new Error('Authentication required')
    }

    const conversations = await db.booking.findMany({
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
        },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: { name: true }
            }
          }
        },
        _count: {
          select: {
            messages: {
              where: {
                senderId: { not: session.user.id },
                readAt: null
              }
            }
          }
        }
      },
      orderBy: { updatedAt: 'desc' }
    })

    return { success: true, conversations }

  } catch (error) {
    console.error('Get conversations error:', error)
    return { success: false, error: 'Er ging iets mis bij het ophalen van gesprekken' }
  }
}

