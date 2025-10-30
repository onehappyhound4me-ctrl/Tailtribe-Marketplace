import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { sendCaregiverApprovalEmail, notifyOwnersAboutNewCaregiver } from '@/lib/email-notifications'

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
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

    const { action } = await req.json()

    // Update caregiver approval status
    const updated = await db.caregiverProfile.update({
      where: { id: params.id },
      data: { isApproved: action === 'approve' },
      include: {
        user: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    // Send email notification to caregiver
    await sendCaregiverApprovalEmail({
      caregiverEmail: updated.user.email,
      caregiverName: updated.user.name || 'Verzorger',
      approved: action === 'approve'
    })

    // If approved, notify owners in the same city
    if (action === 'approve' && updated.city) {
      const services = updated.services ? updated.services.split(',') : []
      
      // Fire and forget - don't block response
      notifyOwnersAboutNewCaregiver({
        caregiverName: updated.user.name || 'Nieuwe verzorger',
        caregiverCity: updated.city,
        services,
        hourlyRate: updated.hourlyRate
      }).catch(err => console.error('Owner notification failed:', err))
    }

    return NextResponse.json({ 
      success: true,
      message: action === 'approve' ? 'Verzorger goedgekeurd' : 'Verzorger afgekeurd',
      caregiver: updated
    })

  } catch (error: any) {
    console.error('Error updating caregiver:', error)
    return NextResponse.json(
      { error: error.message || 'Server error' },
      { status: 500 }
    )
  }
}

