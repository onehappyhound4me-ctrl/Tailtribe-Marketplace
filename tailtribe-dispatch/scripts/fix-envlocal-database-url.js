/**
 * Fix common copy/paste mistakes in .env.local DATABASE_URL.
 * - Removes repeated "DATABASE_URL=" prefixes in the value
 * - Extracts the first postgresql:// (or postgres://) URL if extra text exists
 * - If URL host contains "-pooler" and no port is specified, sets port 6432
 *
 * Does NOT print the secret URL.
 *
 * Usage:
 *   node scripts/fix-envlocal-database-url.js
 */
const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..')
const envLocalPath = path.join(root, '.env.local')

if (!fs.existsSync(envLocalPath)) {
  console.error('[fix-envlocal-database-url] .env.local not found')
  process.exit(1)
}

const raw = fs.readFileSync(envLocalPath, 'utf8')
const lines = raw.split(/\r?\n/)

let changed = false

function normalizeValue(input) {
  let v = String(input || '').trim()

  // Strip wrapping quotes
  if ((v.startsWith('"') && v.endsWith('"')) || (v.startsWith("'") && v.endsWith("'"))) {
    v = v.slice(1, -1)
  }

  // Remove repeated DATABASE_URL= prefixes
  while (v.startsWith('DATABASE_URL=')) {
    v = v.slice('DATABASE_URL='.length)
    v = v.trim()
  }

  // If the value still contains garbage before the actual URL, extract it
  const idxPg = v.indexOf('postgresql://')
  const idxP = v.indexOf('postgres://')
  const idx = idxPg !== -1 ? idxPg : idxP
  if (idx > 0) v = v.slice(idx)

  // Fix pooler default port (Neon pooler usually uses 6432)
  try {
    const u = new URL(v)
    if (u.hostname.includes('-pooler')) {
      // Prefer direct (non-pooled) endpoint for Prisma migrations/db push.
      // Neon pooler host is typically the same host without "-pooler".
      u.hostname = u.hostname.replace('-pooler', '')
      u.port = ''
      v = u.toString()
    } else if (!u.port) {
      // leave default port empty (5432 implied)
    }
  } catch {
    // ignore
  }

  return v
}

const out = lines.map((line) => {
  const trimmed = line.trim()
  if (!trimmed.startsWith('DATABASE_URL=')) return line

  const prefix = line.slice(0, line.indexOf('=') + 1)
  const currentValRaw = line.slice(line.indexOf('=') + 1)
  const normalized = normalizeValue(currentValRaw)

  if (normalized !== currentValRaw.trim()) changed = true
  return `${prefix}${normalized}`
})

if (!changed) {
  console.log('[fix-envlocal-database-url] No changes needed.')
  process.exit(0)
}

fs.writeFileSync(envLocalPath, out.join('\n'), 'utf8')
console.log('[fix-envlocal-database-url] Fixed DATABASE_URL line in .env.local.')
