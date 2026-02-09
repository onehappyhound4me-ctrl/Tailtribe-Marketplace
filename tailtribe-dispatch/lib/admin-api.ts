import { NextResponse } from 'next/server'

export function requireAdmin(session: any) {
  if (!session || session.user?.role !== 'ADMIN') {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  return null
}

