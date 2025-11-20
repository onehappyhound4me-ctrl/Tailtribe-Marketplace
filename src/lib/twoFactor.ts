import crypto from 'crypto'
import { db } from './db'

const IDENTIFIER_PREFIX = '2fa:'
const CODE_EXPIRY_MS = 10 * 60 * 1000 // 10 minuten

export function generateTwoFactorCode() {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

function hashTwoFactorCode(code: string) {
  return crypto.createHash('sha256').update(code).digest('hex')
}

export async function createTwoFactorToken(userId: string) {
  const code = generateTwoFactorCode()
  const expires = new Date(Date.now() + CODE_EXPIRY_MS)
  const identifier = `${IDENTIFIER_PREFIX}${userId}`

  await db.verificationToken.deleteMany({ where: { identifier } })
  await db.verificationToken.create({
    data: {
      identifier,
      token: hashTwoFactorCode(code),
      expires,
    },
  })

  return { code, expires }
}

export async function verifyTwoFactorCode(userId: string, code: string) {
  const identifier = `${IDENTIFIER_PREFIX}${userId}`
  const record = await db.verificationToken.findFirst({
    where: { identifier },
    orderBy: { expires: 'desc' },
  })

  if (!record) {
    return false
  }

  const hashedInput = hashTwoFactorCode(code)
  const isValid = record.expires > new Date() && hashedInput === record.token

  if (isValid) {
    await db.verificationToken.deleteMany({ where: { identifier } })
  }

  return isValid
}

