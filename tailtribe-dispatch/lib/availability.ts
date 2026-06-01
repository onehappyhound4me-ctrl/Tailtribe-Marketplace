import prisma from '@/lib/prisma'
import type { Prisma } from '@prisma/client'

// Accepts either the base client or an interactive transaction client,
// so conflict checks can run inside the same transaction as the confirm.
type DbClient = typeof prisma | Prisma.TransactionClient

type AvailabilityCheck = {
  caregiverUserId: string
  date: Date | string
  timeWindow?: string
}

export const toUtcDate = (input: Date | string) => {
  if (typeof input === 'string') {
    const [year, month, day] = input.split('-').map(Number)
    return new Date(Date.UTC(year, month - 1, day, 0, 0, 0, 0))
  }

  return new Date(Date.UTC(input.getUTCFullYear(), input.getUTCMonth(), input.getUTCDate(), 0, 0, 0, 0))
}

export const isCaregiverAvailable = async ({ caregiverUserId, date, timeWindow }: AvailabilityCheck) => {
  const profile = await prisma.caregiverProfile.findUnique({
    where: { userId: caregiverUserId },
    select: { id: true },
  })

  if (!profile) return false

  const availability = await prisma.availability.findFirst({
    where: {
      caregiverId: profile.id,
      date: toUtcDate(date),
      isAvailable: true,
      ...(timeWindow ? { timeWindow } : {}),
    },
    select: { id: true },
  })

  return Boolean(availability)
}

export const assertCaregiverAvailable = async (params: AvailabilityCheck) => {
  const ok = await isCaregiverAvailable(params)
  if (!ok) {
    throw new Error('Verzorger is niet beschikbaar op deze dag')
  }
}

type DoubleBookingCheck = AvailabilityCheck & {
  excludeBookingId?: string
  excludeOccurrenceId?: string
}

/** Reject when caregiver already has another active assignment in the same date + timeWindow. */
export const assertCaregiverNotDoubleBooked = async (
  {
    caregiverUserId,
    date,
    timeWindow,
    excludeBookingId,
    excludeOccurrenceId,
  }: DoubleBookingCheck,
  client: DbClient = prisma
) => {
  if (!timeWindow) {
    throw new Error('timeWindow is required for conflict check')
  }

  const dayStart = toUtcDate(date)
  const dayEnd = new Date(dayStart)
  dayEnd.setUTCHours(23, 59, 59, 999)

  const conflictBooking = await client.booking.findFirst({
    where: {
      caregiverId: caregiverUserId,
      timeWindow,
      status: { notIn: ['CANCELLED', 'ARCHIVED'] },
      date: { gte: dayStart, lte: dayEnd },
      ...(excludeBookingId ? { id: { not: excludeBookingId } } : {}),
    },
    select: { id: true },
  })
  if (conflictBooking) {
    throw new Error('Verzorger is al toegewezen aan een andere opdracht in dit tijdsblok')
  }

  const conflictOccurrence = await client.bookingOccurrence.findFirst({
    where: {
      assignedCaregiverId: caregiverUserId,
      timeWindow,
      status: { not: 'CANCELLED' },
      scheduledDate: { gte: dayStart, lte: dayEnd },
      ...(excludeOccurrenceId ? { id: { not: excludeOccurrenceId } } : {}),
    },
    select: { id: true },
  })
  if (conflictOccurrence) {
    throw new Error('Verzorger is al toegewezen aan een andere opdracht in dit tijdsblok')
  }
}
