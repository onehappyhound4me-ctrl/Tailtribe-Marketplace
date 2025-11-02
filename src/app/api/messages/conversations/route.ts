import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      )
    }

    // Get all bookings for this user (as owner or caregiver)
    const bookings = await db.booking.findMany({
      where: {
        OR: [
          { ownerId: session.user.id },
          { caregiverId: session.user.id }
        ]
      },
      include: {
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                image: true
              }
            }
          }
        },
        owner: {
          select: {
            id: true,
            name: true,
            image: true
          }
        },
        caregiver: {
          select: {
            id: true,
            name: true,
            image: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    // Format conversations
    const conversations = bookings.map(booking => {
      const otherUser = booking.ownerId === session.user.id 
        ? booking.caregiver 
        : booking.owner

      const lastMessage = booking.messages[0]

      return {
        bookingId: booking.id,
        otherUser: {
          id: otherUser.id,
          name: otherUser.name || 'Onbekende gebruiker',
          image: otherUser.image
        },
        lastMessage: lastMessage ? {
          content: lastMessage.body,
          createdAt: lastMessage.createdAt.toISOString()
        } : {
          content: 'Geen berichten',
          createdAt: booking.createdAt.toISOString()
        },
        unreadCount: 0 // TODO: Calculate unread count
      }
    })

    return NextResponse.json({ conversations })

  } catch (error) {
    console.error('Get conversations error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}













