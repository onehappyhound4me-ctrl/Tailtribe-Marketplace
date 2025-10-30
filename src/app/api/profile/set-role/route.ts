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

    const { role } = await req.json()

    if (!role || !['OWNER', 'CAREGIVER'].includes(role)) {
      return NextResponse.json({ error: 'Ongeldige rol' }, { status: 400 })
    }

    // Update user role
    const updatedUser = await db.user.update({
      where: { email: session.user.email },
      data: { role }
    })

    return NextResponse.json({ 
      success: true,
      user: updatedUser,
      message: 'Rol ingesteld'
    })

  } catch (error: any) {
    console.error('Error setting role:', error)
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    )
  }
}





