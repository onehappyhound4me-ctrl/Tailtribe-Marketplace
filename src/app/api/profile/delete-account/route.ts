import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    // Delete user and all related data (Prisma cascades will handle relations)
    await db.user.delete({
      where: { id: session.user.id }
    })

    return NextResponse.json({ 
      success: true,
      message: 'Account succesvol verwijderd'
    })

  } catch (error) {
    console.error('Delete account error:', error)
    return NextResponse.json({ error: 'Er ging iets mis bij het verwijderen van je account' }, { status: 500 })
  }
}




