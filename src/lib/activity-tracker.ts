/**
 * Activity Tracker - Monitor caregiver activity
 * Tracks when caregivers last had activity on the platform
 */

import { db } from '@/lib/db'

export interface InactiveCaregiver {
  id: string
  userId: string
  name: string
  email: string
  city: string
  lastActivity: Date | null
  daysSinceActivity: number
  status: 'inactive_30' | 'inactive_60' | 'inactive_90'
}

/**
 * Get list of inactive caregivers
 * @param thresholdDays - Number of days without activity to consider inactive (default: 30)
 */
export async function getInactiveCaregivers(thresholdDays: number = 30): Promise<InactiveCaregiver[]> {
  const thresholdDate = new Date()
  thresholdDate.setDate(thresholdDate.getDate() - thresholdDays)

  try {
    // Get all approved caregivers
    const caregivers = await db.caregiverProfile.findMany({
      where: {
        isApproved: true,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            updatedAt: true,
          }
        }
      }
    })

    const inactiveCaregivers: InactiveCaregiver[] = []

    for (const caregiver of caregivers) {
      // Check last booking activity
      const lastBooking = await db.booking.findFirst({
        where: {
          caregiverId: caregiver.userId,
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      // Check last message activity
      const lastMessage = await db.message.findFirst({
        where: {
          senderId: caregiver.userId,
        },
        orderBy: {
          createdAt: 'desc'
        }
      })

      // Check last profile update
      const lastProfileUpdate = caregiver.updatedAt
      const lastUserUpdate = caregiver.user.updatedAt

      // Determine most recent activity
      const activities = [
        lastBooking?.createdAt,
        lastMessage?.createdAt,
        lastProfileUpdate,
        lastUserUpdate
      ].filter((date): date is Date => date !== null && date !== undefined)

      const lastActivity = activities.length > 0 
        ? new Date(Math.max(...activities.map(d => d.getTime())))
        : null

      // Calculate days since last activity
      const daysSinceActivity = lastActivity 
        ? Math.floor((Date.now() - lastActivity.getTime()) / (1000 * 60 * 60 * 24))
        : 999

      // If inactive beyond threshold, add to list
      if (daysSinceActivity >= thresholdDays) {
        let status: 'inactive_30' | 'inactive_60' | 'inactive_90'
        if (daysSinceActivity >= 90) {
          status = 'inactive_90'
        } else if (daysSinceActivity >= 60) {
          status = 'inactive_60'
        } else {
          status = 'inactive_30'
        }

        inactiveCaregivers.push({
          id: caregiver.id,
          userId: caregiver.userId,
          name: caregiver.user.name || 'Onbekend',
          email: caregiver.user.email,
          city: caregiver.city,
          lastActivity,
          daysSinceActivity,
          status
        })
      }
    }

    // Sort by days inactive (most inactive first)
    return inactiveCaregivers.sort((a, b) => b.daysSinceActivity - a.daysSinceActivity)
  } catch (error) {
    console.error('Error fetching inactive caregivers:', error)
    return []
  }
}

/**
 * Get count of inactive caregivers by threshold
 */
export async function getInactivityStats() {
  const [inactive30, inactive60, inactive90] = await Promise.all([
    getInactiveCaregivers(30),
    getInactiveCaregivers(60),
    getInactiveCaregivers(90)
  ])

  return {
    inactive30Days: inactive30.length,
    inactive60Days: inactive60.length,
    inactive90Days: inactive90.length,
    total: inactive30.length
  }
}

/**
 * Send reminder email to inactive caregiver (placeholder - implement with your email service)
 */
export async function sendInactivityReminder(caregiverId: string) {
  // TODO: Implement email sending logic
  console.log(`Sending inactivity reminder to caregiver: ${caregiverId}`)
  
  // Example:
  // await sendEmail({
  //   to: caregiver.email,
  //   subject: 'We missen je op TailTribe!',
  //   template: 'inactivity-reminder',
  //   data: { name: caregiver.name }
  // })
  
  return { success: true }
}




















