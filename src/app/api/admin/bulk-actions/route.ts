import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

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

    const { action, ids } = await req.json()

    let result: any

    switch (action) {
      case 'approve_caregivers':
        result = await db.caregiverProfile.updateMany({
          where: { id: { in: ids } },
          data: { isApproved: true }
        })
        break

      case 'reject_caregivers':
        result = await db.caregiverProfile.updateMany({
          where: { id: { in: ids } },
          data: { isApproved: false }
        })
        break

      case 'delete_users':
        result = await db.user.deleteMany({
          where: { id: { in: ids } }
        })
        break

      case 'cancel_bookings':
        result = await db.booking.updateMany({
          where: { id: { in: ids } },
          data: { status: 'CANCELLED' }
        })
        break

      default:
        return NextResponse.json({ error: 'Ongeldige actie' }, { status: 400 })
    }

    return NextResponse.json({ 
      success: true,
      affected: result.count,
      message: `${result.count} item(s) bijgewerkt`
    })

  } catch (error: any) {
    console.error('Error in bulk action:', error)
    return NextResponse.json(
      { error: error.message || 'Bulk action failed' },
      { status: 500 }
    )
  }
}





