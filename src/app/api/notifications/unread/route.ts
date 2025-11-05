export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'

// Get unread counts for notifications
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      )
    }

    // Count unread messages
    const unreadMessages = await db.message.count({
      where: {
        readAt: null,
        sender: {
          id: { not: session.user.id }
        },
        booking: {
          OR: [
            { ownerId: session.user.id },
            { caregiverId: session.user.id }
          ]
        }
      }
    })

    // Count pending bookings (for caregivers)
    let pendingBookings = 0
    if (session.user.role === 'CAREGIVER') {
      pendingBookings = await db.booking.count({
        where: {
          caregiverId: session.user.id,
          status: 'PENDING'
        }
      })
    }

    // Count accepted bookings waiting for payment (for owners)
    let awaitingPayment = 0
    if (session.user.role === 'OWNER') {
      awaitingPayment = await db.booking.count({
        where: {
          ownerId: session.user.id,
          status: 'ACCEPTED'
        }
      })
    }

    return NextResponse.json({
      unreadMessages,
      pendingBookings,
      awaitingPayment,
      total: unreadMessages + pendingBookings + awaitingPayment
    })

  } catch (error) {
    console.error('Notification count error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}




