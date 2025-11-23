import crypto from 'crypto'
import { db } from './db'

const TOKEN_PREFIX = 'password-reset:'
const EXPIRY_MS = 60 * 60 * 1000 // 60 minutes

function hashToken(token: string) {
  return crypto.createHash('sha256').update(token).digest('hex')
}

export async function createPasswordResetToken(userId: string) {
  const rawToken = crypto.randomBytes(32).toString('hex')
  const hashedToken = hashToken(rawToken)
  const expires = new Date(Date.now() + EXPIRY_MS)
  const identifier = `${TOKEN_PREFIX}${userId}`

  await db.verificationToken.deleteMany({ where: { identifier } })
  await db.verificationToken.create({
    data: {
      identifier,
      token: hashedToken,
      expires,
    },
  })

  return { token: rawToken, expires }
}

export async function consumePasswordResetToken(rawToken: string) {
  if (!rawToken) return null

  const hashedToken = hashToken(rawToken)
  const record = await db.verificationToken.findFirst({
    where: {
      token: hashedToken,
      identifier: { startsWith: TOKEN_PREFIX },
    },
  })

  if (!record || record.expires < new Date()) {
    return null
  }

  await db.verificationToken.deleteMany({
    where: { identifier: record.identifier },
  })

  return record.identifier.replace(TOKEN_PREFIX, '')
}

export function getResetPasswordUrl(token: string, _origin?: string) {
  const rawBase = (process.env.NEXT_PUBLIC_APP_URL || 'https://tailtribe.be').trim()
  const withProtocol = rawBase.startsWith('http://') || rawBase.startsWith('https://')
    ? rawBase
    : `https://${rawBase}`

  const base = withProtocol.replace(/\/$/, '')
  const url = new URL('/reset-password', base)
  url.searchParams.set('token', token)
  return url.toString()
}

