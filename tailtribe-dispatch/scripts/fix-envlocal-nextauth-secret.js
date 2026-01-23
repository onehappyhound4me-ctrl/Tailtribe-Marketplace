/**
 * Fixes NEXTAUTH_SECRET in .env.local if it's missing, weak, or pasted as code.
 * - Replaces obvious placeholders / code / too-short values with a secure random 32-byte hex secret.
 * - Does NOT print the secret.
 *
 * Usage:
 *   node scripts/fix-envlocal-nextauth-secret.js
 */
const fs = require('fs')
const path = require('path')
const crypto = require('crypto')

const root = path.join(__dirname, '..')
const envLocalPath = path.join(root, '.env.local')

if (!fs.existsSync(envLocalPath)) {
  console.error('[fix-envlocal-nextauth-secret] .env.local not found')
  process.exit(1)
}

const raw = fs.readFileSync(envLocalPath, 'utf8')
const lines = raw.split(/\r?\n/)

let found = false
let changed = false

function needsReplace(val) {
  if (!val) return true
  const v = val.trim()
  if (v.length < 32) return true
  // common bad values
  if (v === '12345678901234567890123456789012') return true
  if (v.includes('console.log') || v.includes('randomBytes') || v.includes('require(')) return true
  return false
}

function genSecret() {
  return crypto.randomBytes(32).toString('hex')
}

const out = lines.map((line) => {
  const trimmed = line.trim()
  if (!trimmed.startsWith('NEXTAUTH_SECRET=')) return line
  found = true

  const prefix = line.slice(0, line.indexOf('=') + 1)
  let val = line.slice(line.indexOf('=') + 1).trim()
  // strip wrapping quotes
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1)
  }

  if (!needsReplace(val)) return `${prefix}${val}`

  changed = true
  return `${prefix}${genSecret()}`
})

if (!found) {
  changed = true
  out.push(`NEXTAUTH_SECRET=${genSecret()}`)
}

if (!changed) {
  console.log('[fix-envlocal-nextauth-secret] No changes needed.')
  process.exit(0)
}

fs.writeFileSync(envLocalPath, out.join('\n'), 'utf8')
console.log('[fix-envlocal-nextauth-secret] Updated NEXTAUTH_SECRET in .env.local.')

