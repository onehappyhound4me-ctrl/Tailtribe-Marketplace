/**
 * Fixes common mistakes in .env.local DATABASE_URL for Neon.
 * - Ensures the DB name in the URL path is the provided dbName (default: tailtribe_prod)
 * - Fixes common typo: channel_binding=requires -> channel_binding=require
 *
 * It does NOT print the secret connection string.
 *
 * Usage:
 *   node scripts/fix-envlocal-neon-db.js tailtribe_prod
 */
const fs = require('fs')
const path = require('path')

const dbName = (process.argv[2] || 'tailtribe_prod').trim()
if (!dbName) {
  console.error('[fix-envlocal-neon-db] Missing dbName')
  process.exit(1)
}

const root = path.join(__dirname, '..')
const envLocalPath = path.join(root, '.env.local')

if (!fs.existsSync(envLocalPath)) {
  console.error('[fix-envlocal-neon-db] .env.local not found in project root')
  process.exit(1)
}

const raw = fs.readFileSync(envLocalPath, 'utf8')
const lines = raw.split(/\r?\n/)

let changed = false

const newLines = lines.map((line) => {
  const trimmed = line.trim()
  if (!trimmed.startsWith('DATABASE_URL=')) return line

  const prefix = line.slice(0, line.indexOf('=') + 1)
  let val = line.slice(line.indexOf('=') + 1).trim()

  // Preserve wrapping quotes if they exist
  const quote = (val.startsWith('"') && val.endsWith('"')) ? '"' : (val.startsWith("'") && val.endsWith("'")) ? "'" : ''
  if (quote) val = val.slice(1, -1)

  // Fix known typo
  const beforeTypoFix = val
  val = val.replace('channel_binding=requires', 'channel_binding=require')

  // Swap DB name in path if it's a postgres url
  if (val.startsWith('postgresql://') || val.startsWith('postgres://')) {
    try {
      const u = new URL(val)
      const currentDb = u.pathname.replace(/^\//, '')
      if (currentDb && currentDb !== dbName) {
        u.pathname = `/${dbName}`
        val = u.toString()
      }
    } catch {
      // If URL parsing fails, don't touch it (user can re-paste)
    }
  }

  if (val !== beforeTypoFix) changed = true

  return quote ? `${prefix}${quote}${val}${quote}` : `${prefix}${val}`
})

if (!changed) {
  // Still write to normalize line endings? no.
  console.log('[fix-envlocal-neon-db] No changes needed.')
  process.exit(0)
}

fs.writeFileSync(envLocalPath, newLines.join('\n'), 'utf8')
console.log('[fix-envlocal-neon-db] Updated .env.local DATABASE_URL.')

