const bcrypt = require('bcryptjs')
const fs = require('fs')
const path = require('path')

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

// Prisma Client does NOT automatically load `.env.local` for plain `node` scripts.
// Next.js does, but this script runs outside Next.
const root = path.join(__dirname, '..')
const envLocal = loadEnvFile(path.join(root, '.env.local'))
const env = loadEnvFile(path.join(root, '.env'))

function sanitizeDatabaseUrl(value) {
  let v = String(value || '')
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

// Prefer .env.local when current env is missing/invalid (common on Windows with global env vars).
const current = sanitizeDatabaseUrl(process.env.DATABASE_URL || '')
const fromFiles = sanitizeDatabaseUrl(envLocal.DATABASE_URL || env.DATABASE_URL || '')
if (!isValidPostgresUrl(current) && isValidPostgresUrl(fromFiles)) {
  process.env.DATABASE_URL = fromFiles
} else if (current) {
  process.env.DATABASE_URL = current
}

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  if (!process.env.DATABASE_URL) {
    throw new Error('DATABASE_URL ontbreekt. Zet DATABASE_URL in .env.local of export $env:DATABASE_URL in PowerShell.')
  }
  const email = 'admin@test.nl'
  const password = 'admin123'
  const hash = await bcrypt.hash(password, 10)

  const existing = await prisma.user.findUnique({ where: { email } })
  if (!existing) {
    await prisma.user.create({
      data: {
        email,
        passwordHash: hash,
        role: 'ADMIN',
        firstName: 'Admin',
        lastName: 'Test',
        emailVerified: new Date(),
      },
    })
    console.log('Admin aangemaakt:', email)
  } else {
    await prisma.user.update({
      where: { email },
      data: { passwordHash: hash, role: 'ADMIN' },
    })
    console.log('Admin geüpdatet:', email)
  }
  console.log('Wachtwoord:', password)
}

main()
  .catch((e) => {
    console.error(e)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
