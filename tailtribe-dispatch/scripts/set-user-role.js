const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

function loadEnvFile(filePath) {
  const fs = require('fs')
  if (!fs.existsSync(filePath)) return
  const raw = fs.readFileSync(filePath, 'utf8')
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
    if (!process.env[key]) process.env[key] = val
  }
}

// Ensure DATABASE_URL is available for Prisma scripts.
const path = require('path')
const root = path.join(__dirname, '..')
loadEnvFile(path.join(root, '.env.local'))
loadEnvFile(path.join(root, '.env'))

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

