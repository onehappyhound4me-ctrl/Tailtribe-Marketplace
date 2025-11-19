import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'

export const dynamic = 'force-dynamic'
export const revalidate = 0

export async function DELETE(request: NextRequest) {
  try {
    const session = await auth()
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const userId = session.user.id

    await db.$transaction(async (tx) => {
      await tx.session.deleteMany({ where: { userId } })
      await tx.account.deleteMany({ where: { userId } })
      await tx.booking.deleteMany({ where: { ownerId: userId } })
      await tx.booking.deleteMany({ where: { caregiverId: userId } })
      await tx.review.deleteMany({ where: { authorId: userId } })
      await tx.review.deleteMany({ where: { revieweeId: userId } })
      await tx.favorite.deleteMany({ where: { ownerId: userId } })
      await tx.favorite.deleteMany({ where: { caregiverId: userId } })
      await tx.pet.deleteMany({ where: { ownerId: userId } })
      await tx.message.deleteMany({ where: { senderId: userId } })
      await tx.referral.deleteMany({ where: { referrerId: userId } })
      await tx.flaggedMessage.deleteMany({ where: { userId } })
      await tx.caregiverProfile.deleteMany({ where: { userId } })
      await tx.user.delete({ where: { id: userId } })
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