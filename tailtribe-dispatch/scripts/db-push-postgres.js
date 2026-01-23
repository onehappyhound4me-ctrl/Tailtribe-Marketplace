/**
 * One-command helper for Windows users.
 *
 * - Reads DATABASE_URL from .env.local (preferred) or .env
 * - Switches Prisma schema to Postgres
 * - Runs `prisma db push`
 *
 * Usage:
 *   npm run db:push:pg
 */
const fs = require('fs')
const path = require('path')
const { spawnSync } = require('child_process')

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
    // strip wrapping quotes
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1)
    }
    out[key] = val
  }
  return out
}

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: true, ...opts })
  if (res.status !== 0) process.exit(res.status ?? 1)
}

const root = path.join(__dirname, '..')
const envLocal = loadEnvFile(path.join(root, '.env.local'))
const env = loadEnvFile(path.join(root, '.env'))

const databaseUrl = envLocal.DATABASE_URL || env.DATABASE_URL || ''

if (!databaseUrl) {
  console.error('[db:push:pg] DATABASE_URL not found in .env.local or .env')
  process.exit(1)
}

if (!(databaseUrl.startsWith('postgresql://') || databaseUrl.startsWith('postgres://'))) {
  console.error('[db:push:pg] DATABASE_URL must start with postgresql:// or postgres://')
  process.exit(1)
}

// Switch schema to Postgres
run('node', ['scripts/select-prisma-schema.js', 'postgres'], { cwd: root })

// Ensure Prisma uses the right DATABASE_URL regardless of which env file it loads.
const childEnv = { ...process.env, DATABASE_URL: databaseUrl }

run('npx', ['prisma', 'db', 'push', '--schema', 'prisma/schema.prisma'], { cwd: root, env: childEnv })

console.log('[db:push:pg] Done.')

