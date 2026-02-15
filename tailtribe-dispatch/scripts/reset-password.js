/**
 * Reset a user's password directly in the database.
 *
 * Usage (PowerShell):
 *   $env:DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/DB?sslmode=require"
 *   node scripts/reset-password.js steven@tailtribe.be "NewStrongPassword123"
 *
 * Notes:
 * - This bypasses email delivery (useful when forgot-password emails don't arrive).
 * - Requires access to the production DATABASE_URL.
 */
const fs = require('fs')
const path = require('path')

function sanitizeDatabaseUrl(value) {
  let v = String(value || '')
  // remove common invisible characters that break parsing (BOM/zero-width)
  v = v.replace(/[\u200B-\u200D\uFEFF]/g, '').trim()
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim()
  }
  return v
}

function isValidPostgresUrl(url) {
  const v = sanitizeDatabaseUrl(url)
  return v.startsWith('postgresql://') || v.startsWith('postgres://')
}

function maskDatabaseUrl(url) {
  const v = sanitizeDatabaseUrl(url)
  // best-effort: show scheme + hostname without leaking credentials
  try {
    const u = new URL(v)
    return `${u.protocol}//${u.hostname}${u.port ? `:${u.port}` : ''}${u.pathname || ''}`
  } catch {
    const scheme = v.split(':')[0] || 'unknown'
    return `${scheme}://(invalid)`
  }
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

function ensureDatabaseUrl() {
  const root = path.join(__dirname, '..')
  const envLocal = loadEnvFile(path.join(root, '.env.local'))
  const env = loadEnvFile(path.join(root, '.env'))

  const fromFiles = sanitizeDatabaseUrl(envLocal.DATABASE_URL || env.DATABASE_URL || '')
  const current = sanitizeDatabaseUrl(process.env.DATABASE_URL || '')

  // Prefer repo env files if current env is missing/invalid.
  if (!isValidPostgresUrl(current) && isValidPostgresUrl(fromFiles)) {
    process.env.DATABASE_URL = fromFiles
  } else if (current) {
    process.env.DATABASE_URL = current
  }
}

async function main() {
  ensureDatabaseUrl()
  const databaseUrl = sanitizeDatabaseUrl(process.env.DATABASE_URL || '')
  if (!isValidPostgresUrl(databaseUrl)) {
    console.error(
      [
        '[reset-password] DATABASE_URL is missing or invalid.',
        'This script expects a Postgres URL (postgresql:// or postgres://).',
        `Current: ${maskDatabaseUrl(databaseUrl)}`,
        '',
        'Tip (PowerShell):',
        '  $env:DATABASE_URL="postgresql://..."',
        '  node scripts/reset-password.js <email> "<newPassword>"',
      ].join('\n')
    )
    process.exit(1)
  }

  const emailRaw = process.argv[2]
  const newPassword = process.argv[3]
  const email = String(emailRaw || '').trim().toLowerCase()

  if (!email || !email.includes('@')) {
    console.error('Usage: node scripts/reset-password.js <email> "<newPassword>"')
    process.exit(1)
  }
  if (!newPassword || String(newPassword).length < 6) {
    console.error('New password must be at least 6 characters.')
    process.exit(1)
  }

  const { PrismaClient } = require('@prisma/client')
  const bcrypt = require('bcryptjs')
  const prisma = new PrismaClient()

  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true } })
    if (!user) {
      console.error(`[reset-password] User not found: ${email}`)
      process.exit(2)
    }

    const passwordHash = await bcrypt.hash(String(newPassword), 10)
    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          passwordHash,
          emailVerified: new Date(),
        },
      })
      // Clean up any existing reset tokens.
      await tx.verificationToken.deleteMany({
        where: { identifier: `reset:${email}` },
      })
    })

    console.log(`[reset-password] OK: updated password for ${email}`)
  } finally {
    await prisma.$disconnect().catch(() => {})
  }
}

main().catch((e) => {
  console.error('[reset-password] Failed:', e)
  process.exit(1)
})

