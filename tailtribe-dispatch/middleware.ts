import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'

function unauthorized() {
  return new NextResponse('Authentication required', {
    status: 401,
    headers: {
      'WWW-Authenticate': 'Basic realm="TailTribe Admin"',
    },
  })
}

function timingSafeEqual(a: string, b: string) {
  // Avoid subtle length leaks
  if (a.length !== b.length) return false
  let out = 0
  for (let i = 0; i < a.length; i++) out |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return out === 0
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const method = request.method

  const isAdminPage = pathname.startsWith('/admin')
  const isBookingsApi = pathname === '/api/bookings'

  // Customers must be able to submit bookings
  const needsAuth = isAdminPage || (isBookingsApi && method !== 'POST')
  if (!needsAuth) return NextResponse.next()

  const user = process.env.DISPATCH_BASIC_AUTH_USER
  const pass = process.env.DISPATCH_BASIC_AUTH_PASS

  // In dev: allow if not configured (so localhost keeps working)
  if (process.env.NODE_ENV !== 'production' && (!user || !pass)) {
    return NextResponse.next()
  }

  if (!user || !pass) {
    return new NextResponse('Admin auth is not configured', { status: 500 })
  }

  const header = request.headers.get('authorization') ?? ''
  const [scheme, encoded] = header.split(' ')
  if (scheme !== 'Basic' || !encoded) return unauthorized()

  let decoded = ''
  try {
    decoded = atob(encoded)
  } catch {
    return unauthorized()
  }

  const idx = decoded.indexOf(':')
  if (idx === -1) return unauthorized()

  const u = decoded.slice(0, idx)
  const p = decoded.slice(idx + 1)

  if (timingSafeEqual(u, user) && timingSafeEqual(p, pass)) {
    return NextResponse.next()
  }

  return unauthorized()
}

export const config = {
  matcher: ['/admin/:path*', '/api/bookings', '/api/admin/:path*'],
}


