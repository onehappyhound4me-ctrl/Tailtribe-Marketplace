/**
 * Convenience helper to switch back to SQLite + run db push.
 *
 * Usage:
 *   npm run db:push:sqlite
 */
const path = require('path')
const { spawnSync } = require('child_process')

function run(cmd, args, opts = {}) {
  const res = spawnSync(cmd, args, { stdio: 'inherit', shell: true, ...opts })
  if (res.status !== 0) process.exit(res.status ?? 1)
}

const root = path.join(__dirname, '..')

run('node', ['scripts/select-prisma-schema.js', 'sqlite'], { cwd: root })
run('npx', ['prisma', 'db', 'push', '--schema', 'prisma/schema.prisma'], { cwd: root })

console.log('[db:push:sqlite] Done.')

