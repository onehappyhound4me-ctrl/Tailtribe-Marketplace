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
const fs = require('fs')
const path = require('path')

function normalizeEmail(v) {
  return String(v || '').trim().toLowerCase()
}

function loadEnvFile(filePath) {
  if (!fs.existsSync(filePath)) return {}
  const raw = fs.readFileSync(filePath, 'utf8')
  const out = {}
  for (const line of raw.split(/\r?\n/)) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const idx = trimmed.indexOf('=')
    if (idx === -1) continue
    const key = trimmed.slice(0, idx).trim()
    let val = trimmed.slice(idx + 1).trim()
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

function sanitizeDatabaseUrl(value) {
  let v = String(value || '')

  // Trim and remove common invisible characters that break URL parsing when copy/pasted.
  // (e.g. zero-width space, BOM)
  v = v.replace(/[\u200B-\u200D\uFEFF]/g, '').trim()

  // strip wrapping quotes
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim()
  }

  return v
}

function ensureDatabaseUrl() {
  // Prefer explicit env var, else fall back to .env.local/.env (same convention as other scripts).
  if (process.env.DATABASE_URL) {
    const current = sanitizeDatabaseUrl(process.env.DATABASE_URL)
    // Only treat it as valid if it looks like a Postgres URL.
    // This avoids accidentally using a leftover SQLite `file:` URL from another script/shell.
    if (current && (current.startsWith('postgresql://') || current.startsWith('postgres://'))) {
      process.env.DATABASE_URL = current
      return
    }
  }
  const root = path.join(__dirname, '..')
  const envLocal = loadEnvFile(path.join(root, '.env.local'))
  const env = loadEnvFile(path.join(root, '.env'))
  const databaseUrl = sanitizeDatabaseUrl(envLocal.DATABASE_URL || env.DATABASE_URL || '')
  if (databaseUrl) {
    process.env.DATABASE_URL = databaseUrl
  }
}

async function main() {
  const email = normalizeEmail(process.argv[2])
  const force = process.argv.includes('--force')

  if (!email || !email.includes('@')) {
    console.error('Usage: node scripts/delete-user-by-email.js <email> [--force]')
    process.exit(1)
  }

  ensureDatabaseUrl()
  if (!process.env.DATABASE_URL || !sanitizeDatabaseUrl(process.env.DATABASE_URL)) {
    console.error('DATABASE_URL is missing. Set it as an env var or in tailtribe-dispatch/.env.local')
    process.exit(1)
  }

  process.env.DATABASE_URL = sanitizeDatabaseUrl(process.env.DATABASE_URL)

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

