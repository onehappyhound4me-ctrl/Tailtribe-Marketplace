import prisma from '@/lib/prisma'

export async function runRetentionCleanup(days: number) {
  const safeDays = Math.max(1, Math.min(365, Math.round(Number(days ?? 30))))
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const cutoff = new Date(today)
  cutoff.setDate(cutoff.getDate() - safeDays)

  const bookingCandidates = await prisma.booking.findMany({
    where: {
      status: { in: ['CONFIRMED', 'COMPLETED', 'CANCELLED'] },
      date: { lt: cutoff },
    },
    select: { id: true },
  })
  const bookingIds = bookingCandidates.map((b) => b.id)

  const occurrenceCandidates = await prisma.bookingOccurrence.findMany({
    where: {
      status: { in: ['CONFIRMED', 'COMPLETED', 'CANCELLED', 'NO_SHOW', 'ISSUE'] },
      scheduledDate: { lt: cutoff },
    },
    select: { id: true },
  })
  const occurrenceIds = occurrenceCandidates.map((o) => o.id)

  let bookingsDeleted = 0
  let occurrencesDeleted = 0
  let requestsDeleted = 0

  if (bookingIds.length > 0) {
    const deleted = await prisma.booking.deleteMany({ where: { id: { in: bookingIds } } })
    bookingsDeleted = deleted.count
    await prisma.conversation.deleteMany({ where: { bookingId: { in: bookingIds } } })
  }

  if (occurrenceIds.length > 0) {
    const deleted = await prisma.bookingOccurrence.deleteMany({ where: { id: { in: occurrenceIds } } })
    occurrencesDeleted = deleted.count
    await prisma.conversation.deleteMany({ where: { bookingId: { in: occurrenceIds } } })
  }

  const requestCleanup = await prisma.ownerRequest.deleteMany({
    where: {
      status: { in: ['APPROVED', 'REJECTED', 'CANCELLED'] },
      occurrences: { none: {} },
    },
  })
  requestsDeleted = requestCleanup.count

  return {
    bookingsDeleted,
    occurrencesDeleted,
    requestsDeleted,
    cutoff: cutoff.toISOString(),
  }
}
