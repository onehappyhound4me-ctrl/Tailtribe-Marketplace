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

  // IMPORTANT: some Windows shells have a global DATABASE_URL set (sometimes invalid).
  // Prefer the repo's .env.local when the current env value is missing/invalid.
  if (!isValidPostgresUrl(current) && isValidPostgresUrl(fromFiles)) {
    process.env.DATABASE_URL = fromFiles
  } else if (current) {
    process.env.DATABASE_URL = current
  }
}

ensureDatabaseUrl()
const databaseUrl = sanitizeDatabaseUrl(process.env.DATABASE_URL || '')
if (!isValidPostgresUrl(databaseUrl)) {
  console.error(
    [
      '[inspect-user] DATABASE_URL is missing or invalid.',
      'This script expects a Postgres URL (postgresql:// or postgres://).',
      `Current: ${maskDatabaseUrl(databaseUrl)}`,
      '',
      'Tip (PowerShell):',
      '  $env:DATABASE_URL=\"postgresql://...\"',
      '  node scripts/inspect-user.js <email>',
    ].join('\n')
  )
  process.exit(1)
}

process.env.DATABASE_URL = databaseUrl

const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.log('Usage: node scripts/inspect-user.js <email>')
    return
  }
  const user = await prisma.user.findUnique({ where: { email } })
  console.log(user)
}

main()
  .catch((e) => console.error(e))
  .finally(async () => {
    await prisma.$disconnect()
  })
