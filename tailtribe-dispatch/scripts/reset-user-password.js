/**
 * One-off maintenance script: reset a user's password (prints the new password).
 *
 * Usage:
 *   node scripts/reset-user-password.js steven@tailtribe.be
 *   node scripts/reset-user-password.js steven@tailtribe.be "MyNewPassword123!"
 *
 * Notes:
 * - This directly updates the database pointed at by DATABASE_URL.
 * - It also sets `emailVerified` to now (so credentials login won't be blocked).
 */
const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const crypto = require('crypto')
const fs = require('fs')
const path = require('path')

function normalizeEmail(v) {
  return String(v || '').trim().toLowerCase()
}

function sanitizeDatabaseUrl(value) {
  let v = String(value || '')
  v = v.replace(/[\u200B-\u200D\uFEFF]/g, '').trim()
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1).trim()
  }
  return v
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

  // Prefer .env.local when the current env is missing/invalid.
  if (!(current.startsWith('postgresql://') || current.startsWith('postgres://')) && (fromFiles.startsWith('postgresql://') || fromFiles.startsWith('postgres://'))) {
    process.env.DATABASE_URL = fromFiles
  } else if (current) {
    process.env.DATABASE_URL = current
  }
}

function generateTempPassword() {
  return crypto.randomBytes(12).toString('base64url')
}

async function main() {
  const email = normalizeEmail(process.argv[2])
  const providedPassword = process.argv[3] ? String(process.argv[3]) : ''

  if (!email || !email.includes('@')) {
    console.error('Usage: node scripts/reset-user-password.js <email> [newPassword]')
    process.exit(1)
  }

  ensureDatabaseUrl()
  const dbUrl = sanitizeDatabaseUrl(process.env.DATABASE_URL || '')
  if (!(dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://'))) {
    console.error('DATABASE_URL is missing/invalid. Expected postgresql:// or postgres://')
    process.exit(1)
  }
  process.env.DATABASE_URL = dbUrl

  const newPassword = providedPassword.trim() || generateTempPassword()
  if (newPassword.length < 6) {
    console.error('New password must be at least 6 characters.')
    process.exit(1)
  }

  const prisma = new PrismaClient()
  try {
    const user = await prisma.user.findUnique({ where: { email }, select: { id: true, email: true, role: true } })
    if (!user) {
      console.error('User not found:', email)
      process.exit(2)
    }

    const passwordHash = await bcrypt.hash(newPassword, 10)
    await prisma.user.update({
      where: { id: user.id },
      data: { passwordHash, emailVerified: new Date() },
    })

    console.log('Password reset OK:')
    console.log(`- email: ${user.email}`)
    console.log(`- role: ${user.role}`)
    console.log(`- newPassword: ${newPassword}`)
  } finally {
    await prisma.$disconnect().catch(() => {})
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})

