/**
 * Select Prisma schema based on target provider.
 *
 * Usage:
 *   node scripts/select-prisma-schema.js sqlite
 *   node scripts/select-prisma-schema.js postgres
 *
 * Defaults to "sqlite" if no argument is provided.
 */
const fs = require('fs')
const path = require('path')

const target = (process.argv[2] || 'sqlite').toLowerCase()
const root = path.join(__dirname, '..')
const prismaDir = path.join(root, 'prisma')

const source =
  target === 'postgres' || target === 'postgresql'
    ? path.join(prismaDir, 'schema.postgres.prisma')
    : path.join(prismaDir, 'schema.sqlite.prisma')

const dest = path.join(prismaDir, 'schema.prisma')

if (!fs.existsSync(source)) {
  console.error(`[select-prisma-schema] Missing source schema: ${source}`)
  process.exit(1)
}

fs.copyFileSync(source, dest)
console.log(`[select-prisma-schema] Using ${path.basename(source)} -> prisma/schema.prisma`)

