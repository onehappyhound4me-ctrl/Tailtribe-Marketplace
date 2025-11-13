import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'
import { checkRateLimit, getRateLimitKey, RATE_LIMITS } from '@/lib/rate-limit'

// Fallback in-memory rate limiting (used if database fails)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

async function rateLimit(ip: string, pathname: string, limit: number = 100, windowMs: number = 60000) {
  // Try database-backed rate limiting first
  try {
    const key = getRateLimitKey(ip, pathname)
    const result = await checkRateLimit({
      identifier: key,
      limit,
      windowMs
    })
    
    if (!result.allowed) {
      return {
        allowed: false,
        resetTime: result.resetTime
      }
    }
    
    return {
      allowed: true,
      resetTime: result.resetTime
    }
  } catch (error) {
    // Fallback to in-memory if database fails
    console.error('Database rate limit failed, using in-memory fallback:', error)
    
    const now = Date.now()
    const record = rateLimitMap.get(ip)

    if (!record || now > record.resetTime) {
      rateLimitMap.set(ip, {
        count: 1,
        resetTime: now + windowMs
      })
      return { allowed: true, resetTime: new Date(now + windowMs) }
    }

    if (record.count >= limit) {
      return { allowed: false, resetTime: new Date(record.resetTime) }
    }

    record.count++
    return { allowed: true, resetTime: new Date(record.resetTime) }
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hostname = request.headers.get('host') || ''
  
  // Normalize www vs non-www - redirect www to non-www for consistency
  // MUST be done FIRST, before any other checks
  const normalizedHost = hostname.replace(/^www\./, '')
  const expectedHost = process.env.NEXTAUTH_URL?.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '') || 'tailtribe.be'
  
  // Redirect www to non-www (but preserve the path and query params)
  if (hostname.includes('www.') && normalizedHost === expectedHost) {
    const url = request.nextUrl.clone()
    url.host = normalizedHost
    console.log('[MIDDLEWARE] Redirecting www to non-www:', { from: hostname, to: normalizedHost, pathname })
    return NextResponse.redirect(url, 301) // Permanent redirect
  }
  
  // Domain-based country routing
  const isNLDomain = hostname.includes('tailtribe.nl')
  const isBEDomain = hostname.includes('tailtribe.be')
  
  // If on NL domain and path starts with /nl, remove the prefix
  if (isNLDomain && pathname.startsWith('/nl')) {
    const newPath = pathname.replace(/^\/nl/, '') || '/'
    const url = request.nextUrl.clone()
    url.pathname = newPath
    return NextResponse.redirect(url)
  }
  
  // If on BE domain and accessing root, ensure it's BE (no /nl prefix needed)
  // This is handled by the app structure already

  // CRITICAL: Skip ALL checks for NextAuth routes - let NextAuth handle everything
  if (pathname.startsWith('/api/auth/')) {
    const response = NextResponse.next()
    // Add security headers
    response.headers.set('X-DNS-Prefetch-Control', 'on')
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('X-Frame-Options', 'SAMEORIGIN')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    return response
  }

  // Rate limiting for API routes
  if (pathname.startsWith('/api/')) {
    const ip = request.ip || request.headers.get('x-forwarded-for')?.split(',')[0] || 'unknown'
    
    // Determine rate limit based on route
    let rateLimitConfig: { limit: number; windowMs: number } = RATE_LIMITS.API
    if (pathname.startsWith('/api/auth/')) {
      rateLimitConfig = RATE_LIMITS.AUTH
    } else if (pathname.startsWith('/api/caregivers/search')) {
      rateLimitConfig = RATE_LIMITS.SEARCH
    } else if (pathname.startsWith('/api/bookings/create')) {
      rateLimitConfig = RATE_LIMITS.BOOKING
    } else if (pathname.startsWith('/api/stripe/')) {
      rateLimitConfig = RATE_LIMITS.PAYMENT
    }
    
    const rateLimitResult = await rateLimit(
      ip,
      pathname,
      rateLimitConfig.limit,
      rateLimitConfig.windowMs
    )
    
    if (!rateLimitResult.allowed) {
      const response = NextResponse.json(
        { 
          error: 'Te veel verzoeken. Probeer het later opnieuw.',
          retryAfter: Math.ceil((rateLimitResult.resetTime.getTime() - Date.now()) / 1000)
        },
        { status: 429 }
      )
      response.headers.set('Retry-After', Math.ceil((rateLimitResult.resetTime.getTime() - Date.now()) / 1000).toString())
      response.headers.set('X-RateLimit-Limit', rateLimitConfig.limit.toString())
      response.headers.set('X-RateLimit-Remaining', '0')
      response.headers.set('X-RateLimit-Reset', Math.ceil(rateLimitResult.resetTime.getTime() / 1000).toString())
      return response
    }
  }

  // Protected routes - require authentication
  const protectedPaths = [
    '/dashboard',
    '/profile',
    '/booking',
    '/messages',
    '/settings',
    '/reviews',
  ]

  const isProtected = protectedPaths.some(path => pathname.startsWith(path))

  if (isProtected) {
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET
    })

    console.log('[MIDDLEWARE] Protected route check:', { 
      pathname, 
      hasToken: !!token, 
      tokenRole: token?.role,
      tokenSub: token?.sub,
      hostname
    })

    // If no token, redirect to signin (but NOT if already on signin page to avoid loops)
    if (!token || !token.sub) {
      if (pathname !== '/auth/signin' && pathname !== '/auth/register') {
        console.log('[MIDDLEWARE] No token, redirecting to signin')
        const url = request.nextUrl.clone()
        url.pathname = '/auth/signin'
        url.searchParams.set('callbackUrl', pathname)
        return NextResponse.redirect(url)
      }
      // If already on signin page and no token, allow it (let NextAuth handle it)
      return NextResponse.next()
    }

    // Redirect /dashboard to role-specific dashboard
    if (pathname === '/dashboard') {
      const url = request.nextUrl.clone()
      const role = token.role || 'OWNER' // Default to OWNER if no role
      if (role === 'CAREGIVER') {
        url.pathname = '/dashboard/caregiver'
      } else if (role === 'OWNER') {
        url.pathname = '/dashboard/owner'
      } else if (role === 'ADMIN') {
        url.pathname = '/admin'
      } else {
        url.pathname = '/dashboard/owner' // fallback
      }
      return NextResponse.redirect(url)
    }

    // Admin only routes
    if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }
  
  // Create response for non-protected routes
  const response = NextResponse.next()
  
  // Add security headers to response
  response.headers.set('X-DNS-Prefetch-Control', 'on')
  response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'SAMEORIGIN')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  
  // CORS for API routes (if needed)
  if (pathname.startsWith('/api/')) {
    response.headers.set('Access-Control-Allow-Origin', process.env.NEXT_PUBLIC_APP_URL || '*')
    response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS')
    response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  }
  
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
}
