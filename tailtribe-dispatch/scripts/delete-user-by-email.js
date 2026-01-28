/**
 * One-off maintenance script: delete a user by email.
 *
 * SAFE MODE (default):
 * - Refuses to delete if the user has bookings/requests/etc.
 *
 * FORCE MODE:
 * - Deletes related records first, then deletes the user.
 *
 * Usage:
 *   node scripts/delete-user-by-email.js stevenvangucht@hotmail.com
 *   node scripts/delete-user-by-email.js stevenvangucht@hotmail.com --force
 *
 * Requires DATABASE_URL to point at the DB you want to modify (local/prod).
 */

const { PrismaClient } = require('@prisma/client')

function normalizeEmail(v) {
  return String(v || '').trim().toLowerCase()
}

async function main() {
  const email = normalizeEmail(process.argv[2])
  const force = process.argv.includes('--force')

  if (!email || !email.includes('@')) {
    console.error('Usage: node scripts/delete-user-by-email.js <email> [--force]')
    process.exit(1)
  }

  const prisma = new PrismaClient()

  try {
    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, email: true, role: true },
    })

    if (!user) {
      console.log('User not found:', email)
      return
    }

    // Safety checks: avoid deleting real production data by accident.
    const [bookingsAsOwner, bookingsAsCaregiver, requestsAsOwner, invoiceDrafts, notifications] = await Promise.all([
      prisma.booking.count({ where: { ownerId: user.id } }),
      prisma.booking.count({ where: { caregiverId: user.id } }),
      prisma.ownerRequest.count({ where: { ownerId: user.id } }),
      prisma.invoiceDraft.count({ where: { ownerId: user.id } }),
      prisma.notification.count({ where: { userId: user.id } }),
    ])

    const blockers =
      bookingsAsOwner +
      bookingsAsCaregiver +
      requestsAsOwner +
      invoiceDrafts +
      notifications

    if (blockers > 0 && !force) {
      console.error(
        [
          'Refusing to delete user because related data exists.',
          `email=${user.email} role=${user.role} id=${user.id}`,
          `bookingsAsOwner=${bookingsAsOwner}`,
          `bookingsAsCaregiver=${bookingsAsCaregiver}`,
          `requestsAsOwner=${requestsAsOwner}`,
          `invoiceDrafts=${invoiceDrafts}`,
          `notifications=${notifications}`,
          '',
          'If you really want to delete everything for this user, re-run with --force.',
        ].join('\n')
      )
      process.exit(2)
    }

    // FORCE: remove dependent data first (best-effort).
    if (force) {
      await prisma.verificationToken.deleteMany({ where: { userId: user.id } }).catch(() => {})
      await prisma.session.deleteMany({ where: { userId: user.id } }).catch(() => {})
      await prisma.account.deleteMany({ where: { userId: user.id } }).catch(() => {})
      await prisma.notification.deleteMany({ where: { userId: user.id } }).catch(() => {})
      await prisma.invoiceDraft.deleteMany({ where: { ownerId: user.id } }).catch(() => {})
      await prisma.ownerProfile.deleteMany({ where: { userId: user.id } }).catch(() => {})
      await prisma.caregiverProfile.deleteMany({ where: { userId: user.id } }).catch(() => {})

      // Requests/occurrences can reference user; delete owner requests (cascades occurrences/decisions by schema).
      await prisma.ownerRequest.deleteMany({ where: { ownerId: user.id } }).catch(() => {})

      // Bookings might exist; delete them (and cascades offers/conversations via schema if configured).
      await prisma.bookingOffer.deleteMany({ where: { caregiverId: user.id } }).catch(() => {})
      await prisma.booking.deleteMany({ where: { ownerId: user.id } }).catch(() => {})
      await prisma.booking.deleteMany({ where: { caregiverId: user.id } }).catch(() => {})
    }

    await prisma.user.delete({ where: { email } })
    console.log('Deleted user:', email)
  } finally {
    // Always disconnect
    // eslint-disable-next-line no-await-in-loop
    await prisma.$disconnect().catch(() => {})
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

