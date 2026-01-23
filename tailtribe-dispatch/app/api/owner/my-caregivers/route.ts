import { NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import prisma from '@/lib/prisma'
import { getImpersonationContext } from '@/lib/impersonation'

export async function GET() {
  try {
    const session = await auth()
    const impersonation = getImpersonationContext(session)
    const effectiveRole = impersonation?.role ?? session?.user?.role
    if (!session || effectiveRole !== 'OWNER') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Haal alle voltooide of bevestigde bookings op waar een verzorger aan is toegewezen
    const bookings = await prisma.booking.findMany({
      where: {
        ownerId: impersonation?.role === 'OWNER' ? impersonation.userId : session.user.id,
        caregiverId: { not: null },
        status: { in: ['CONFIRMED', 'COMPLETED'] }
      },
      include: {
        caregiver: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            caregiverProfile: {
              select: {
                services: true,
                bio: true,
                city: true
              }
            }
          }
        }
      },
      orderBy: {
        date: 'desc'
      }
    })

    // Unieke verzorgers extraheren
    const uniqueCaregivers = new Map()
    
    for (const booking of bookings) {
      if (booking.caregiver && !uniqueCaregivers.has(booking.caregiver.id)) {
        uniqueCaregivers.set(booking.caregiver.id, {
          id: booking.caregiver.id,
          firstName: booking.caregiver.firstName,
          lastName: booking.caregiver.lastName,
          email: booking.caregiver.email,
          phone: booking.caregiver.phone,
          services: booking.caregiver.caregiverProfile?.services 
            ? JSON.parse(booking.caregiver.caregiverProfile.services) 
            : [],
          bio: booking.caregiver.caregiverProfile?.bio || '',
          city: booking.caregiver.caregiverProfile?.city || '',
          lastBookingDate: booking.date,
          totalBookings: bookings.filter(b => b.caregiverId === booking.caregiver!.id).length
        })
      }
    }

    return NextResponse.json(Array.from(uniqueCaregivers.values()))
  } catch (error) {
    console.error('Failed to fetch caregivers:', error)
    return NextResponse.json(
      { error: 'Failed to fetch caregivers' },
      { status: 500 }
    )
  }
}
