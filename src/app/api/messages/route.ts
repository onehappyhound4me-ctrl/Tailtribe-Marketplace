import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { auth } from '@/lib/auth'
import { z } from 'zod'
import { filterMessage, getFilterErrorMessage, logFilteredMessage, checkViolationCount } from '@/lib/message-filter'

const messageSchema = z.object({
  bookingId: z.string(),
  body: z.string().min(1).max(2000),
})

// Send message
export async function POST(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { bookingId, body: messageBody } = messageSchema.parse(body)

    // 🛡️ FILTER MESSAGE FOR CONTACT INFO & SUSPICIOUS CONTENT
    const filterResult = filterMessage(messageBody)
    
    if (!filterResult.allowed) {
      // Log for admin review
      await logFilteredMessage(
        session.user.id,
        messageBody,
        filterResult.blockedReasons,
        filterResult.suspiciousPatterns
      )
      
      // Check violation count
      const violations = await checkViolationCount(session.user.id)
      
      // Send appropriate error message
      const errorMsg = getFilterErrorMessage(filterResult.blockedReasons)
      
      // If multiple violations, add warning
      if (violations.shouldSuspend) {
        return NextResponse.json(
          { 
            error: '⚠️ Je account is tijdelijk geschorst wegens herhaalde overtredingen van platformregels. Neem contact op met support: steven@tailtribe.be',
            blocked: true,
            suspended: true
          },
          { status: 403 }
        )
      } else if (violations.shouldWarn) {
        return NextResponse.json(
          { 
            error: `${errorMsg}\n\n⚠️ Dit is je ${violations.count}e waarschuwing. Bij 3 overtredingen wordt je account geschorst.`,
            blocked: true,
            warnings: violations.count
          },
          { status: 400 }
        )
      } else {
        return NextResponse.json(
          { 
            error: errorMsg,
            blocked: true,
            warnings: violations.count
          },
          { status: 400 }
        )
      }
    }
    
    // If suspicious but allowed, use masked version
    const finalMessage = filterResult.maskedMessage || messageBody

    // Verify user is part of booking
    const booking = await db.booking.findUnique({
      where: { id: bookingId }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Boeking niet gevonden' },
        { status: 404 }
      )
    }

    if (booking.ownerId !== session.user.id && booking.caregiverId !== session.user.id) {
      return NextResponse.json(
        { error: 'Geen toegang' },
        { status: 403 }
      )
    }

    // Create message with filtered content
    const message = await db.message.create({
      data: {
        bookingId,
        senderId: session.user.id,
        body: finalMessage,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      }
    })
    
    // If suspicious patterns detected, log for admin review
    if (filterResult.suspiciousPatterns.length > 0) {
      await logFilteredMessage(
        session.user.id,
        messageBody,
        [],
        filterResult.suspiciousPatterns
      )
    }

    return NextResponse.json({ message, filtered: filterResult.filtered }, { status: 201 })

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }

    console.error('Message error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}

// Get messages for booking
export async function GET(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Je moet ingelogd zijn' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('bookingId')

    if (!bookingId) {
      return NextResponse.json(
        { error: 'bookingId is verplicht' },
        { status: 400 }
      )
    }

    // Get booking with user details and verify access
    const booking = await db.booking.findUnique({
      where: { id: bookingId },
      include: {
        owner: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true
          }
        },
        caregiver: {
          select: {
            id: true,
            name: true,
            image: true,
            role: true
          }
        }
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Boeking niet gevonden' },
        { status: 404 }
      )
    }

    if (booking.ownerId !== session.user.id && booking.caregiverId !== session.user.id) {
      return NextResponse.json(
        { error: 'Geen toegang' },
        { status: 403 }
      )
    }

    // Get messages
    const messages = await db.message.findMany({
      where: { bookingId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            image: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Mark as read
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

    return NextResponse.json({ 
      messages,
      booking
    })

  } catch (error) {
    console.error('Get messages error:', error)
    return NextResponse.json(
      { error: 'Er is een fout opgetreden' },
      { status: 500 }
    )
  }
}
