/**
 * Debug helper: prints sanitized DATABASE_URL from .env.local and .env.
 * Does NOT print passwords.
 *
 * Usage:
 *   node scripts/print-dburl.js
 */
const fs = require('fs')
const path = require('path')

function pick(filePath) {
  if (!fs.existsSync(filePath)) return null
  const raw = fs.readFileSync(filePath, 'utf8')
  const line = raw
    .split(/\r?\n/)
    .map((l) => l.trim())
    .find((l) => l.startsWith('DATABASE_URL=') && !l.startsWith('#'))
  if (!line) return null
  let val = line.split('=').slice(1).join('=').trim()
  if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
    val = val.slice(1, -1)
  }
  return val
}

function summarize(name, val) {
  if (!val) {
    console.log(`${name}: <none>`)
    return
  }
  try {
    const parsed = new URL(val)
    const user = parsed.username || '<none>'
    const host = parsed.host
    const db = parsed.pathname.replace(/^\//, '')
    const keys = Array.from(parsed.searchParams.keys()).join('&')
    const suffix = keys ? `?${keys}` : ''
    console.log(`${name}: ${parsed.protocol}//${user}:***@${host}/${db}${suffix}`)
  } catch {
    console.log(`${name}: <invalid>`)
  }
}

const root = path.join(__dirname, '..')
summarize('.env.local', pick(path.join(root, '.env.local')))
summarize('.env', pick(path.join(root, '.env')))

