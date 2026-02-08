const fs = require('fs')
const path = require('path')

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

  if (!isValidPostgresUrl(current) && isValidPostgresUrl(fromFiles)) {
    process.env.DATABASE_URL = fromFiles
  } else if (current) {
    process.env.DATABASE_URL = current
  }
}

ensureDatabaseUrl()

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  const role = (process.argv[3] || '').toUpperCase()
  if (!email || !role) {
    console.log('Usage: node scripts/set-user-role.js <email> <ADMIN|CAREGIVER|OWNER>')
    process.exit(1)
  }

  const user = await prisma.user.findUnique({ where: { email } })
  if (!user) {
    console.error('User not found:', email)
    process.exit(1)
  }

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { role },
  })

  console.log('Updated role:', { email: updated.email, role: updated.role })
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

