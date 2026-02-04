import { NextResponse } from 'next/server'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function normalizeEnvValue(value?: string | null) {
  const v = String(value ?? '').trim()
  if (!v) return ''
  const first = v[0]
  const last = v[v.length - 1]
  if ((first === '"' && last === '"') || (first === "'" && last === "'") || (first === '`' && last === '`')) {
    return v.slice(1, -1).trim()
  }
  return v
}

function maskEmail(email: string) {
  const e = String(email || '').trim()
  const at = e.indexOf('@')
  if (at <= 1) return '***'
  const name = e.slice(0, at)
  const domain = e.slice(at + 1)
  return `${name.slice(0, 1)}***@${domain}`
}

export async function GET() {
  const rawEmail = process.env.ADMIN_LOGIN_EMAIL ?? ''
  const rawPassword = process.env.ADMIN_LOGIN_PASSWORD ?? ''
  const email = normalizeEnvValue(rawEmail).trim().toLowerCase()
  const password = normalizeEnvValue(rawPassword)

  const configured = Boolean(email && password)

  // Safe debug info only (no secrets).
  return NextResponse.json({
    configured,
    emailMasked: email ? maskEmail(email) : null,
    passwordLength: password ? password.length : 0,
    hadQuotes: {
      email: rawEmail.trim().length > 0 && rawEmail.trim() !== normalizeEnvValue(rawEmail),
      password: rawPassword.trim().length > 0 && rawPassword.trim() !== normalizeEnvValue(rawPassword),
    },
    nodeEnv: process.env.NODE_ENV ?? null,
  })
}

