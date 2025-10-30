import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 })
    }

    const { searchParams } = new URL(req.url)
    const severity = searchParams.get('severity')
    const reviewed = searchParams.get('reviewed')

    // Get flagged messages
    const messages = await db.flaggedMessage.findMany({
      where: {
        ...(severity && { severity }),
        ...(reviewed !== null && { reviewed: reviewed === 'true' })
      },
      orderBy: [
        { severity: 'desc' },
        { createdAt: 'desc' }
      ],
      take: 100
    })

    // Get user details for flagged messages
    const userIds = [...new Set(messages.map(m => m.userId))]
    const users = await db.user.findMany({
      where: { id: { in: userIds } },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    })

    const userMap = Object.fromEntries(users.map(u => [u.id, u]))

    const messagesWithUser = messages.map(msg => ({
      ...msg,
      user: userMap[msg.userId]
    }))

    return NextResponse.json({
      success: true,
      messages: messagesWithUser,
      stats: {
        total: messages.length,
        high: messages.filter(m => m.severity === 'HIGH').length,
        medium: messages.filter(m => m.severity === 'MEDIUM').length,
        unreviewed: messages.filter(m => !m.reviewed).length
      }
    })

  } catch (error: any) {
    console.error('Error fetching flagged messages:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch flagged messages' },
      { status: 500 }
    )
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (user?.role !== 'ADMIN') {
      return NextResponse.json({ error: 'Niet geautoriseerd' }, { status: 403 })
    }

    const { messageId, action } = await req.json()

    // Update flagged message
    const updated = await db.flaggedMessage.update({
      where: { id: messageId },
      data: {
        reviewed: true,
        reviewedBy: user.id,
        reviewedAt: new Date(),
        action
      }
    })

    // If action is WARNING_SENT or ACCOUNT_SUSPENDED, handle it
    if (action === 'ACCOUNT_SUSPENDED') {
      // TODO: Implement account suspension
      // await db.user.update({
      //   where: { id: updated.userId },
      //   data: { suspended: true, suspendedUntil: ... }
      // })
      
      // TODO: Send email notification
    }

    return NextResponse.json({
      success: true,
      message: 'Actie uitgevoerd',
      updated
    })

  } catch (error: any) {
    console.error('Error updating flagged message:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to update flagged message' },
      { status: 500 }
    )
  }
}





