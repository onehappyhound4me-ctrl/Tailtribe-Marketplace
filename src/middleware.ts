import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  try {
    const { pathname } = request.nextUrl

    // CRITICAL: Skip ALL checks for NextAuth routes - let NextAuth handle everything
    if (pathname.startsWith('/api/auth/')) {
      return NextResponse.next()
    }

    // CRITICAL: Skip auth pages from token check to prevent loops
    // Let NextAuth handle auth pages completely
    if (pathname.startsWith('/auth/')) {
      return NextResponse.next()
    }

    // Get token for protected routes
    // CRITICAL: Use the same secret as NextAuth config
    // Don't specify cookieName - let getToken auto-detect based on secure flag
    const token = await getToken({
      req: request,
      secret: process.env.NEXTAUTH_SECRET,
    })

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
      console.log('[MIDDLEWARE] Protected path:', pathname)
      console.log('[MIDDLEWARE] Token present:', !!token)
      console.log('[MIDDLEWARE] Token sub:', token?.sub)
      console.log('[MIDDLEWARE] Token id:', token?.id)
      console.log('[MIDDLEWARE] Token role:', token?.role)
      console.log('[MIDDLEWARE] Token email:', token?.email)
      console.log('[MIDDLEWARE] Full token:', JSON.stringify(token, null, 2))

      // CRITICAL: Check for token.sub OR token.id (fallback for compatibility)
      const hasValidToken = token && (token.sub || token.id)
      
      if (!hasValidToken) {
        console.log('[MIDDLEWARE] No valid token found (no sub or id), redirecting to signin')
        console.log('[MIDDLEWARE] Token object:', token)
        if (pathname !== '/auth/signin' && pathname !== '/auth/register') {
          const url = request.nextUrl.clone()
          url.pathname = '/auth/signin'
          url.searchParams.set('callbackUrl', pathname)
          return NextResponse.redirect(url)
        }
        // If already on signin page and no token, allow it (let NextAuth handle it)
        console.log('[MIDDLEWARE] Already on signin page, allowing access')
        return NextResponse.next()
      }

      // Ensure token.sub is set if only token.id exists
      if (!token.sub && token.id) {
        token.sub = String(token.id)
        console.log('[MIDDLEWARE] Set token.sub from token.id')
      }

      console.log('[MIDDLEWARE] Token validated successfully, role:', token.role, 'sub:', token.sub)

      // Redirect /dashboard to role-specific dashboard
      if (pathname === '/dashboard') {
        const url = request.nextUrl.clone()
        const role = token.role || 'OWNER'
        if (role === 'CAREGIVER') {
          url.pathname = '/dashboard/caregiver'
        } else if (role === 'OWNER') {
          url.pathname = '/dashboard/owner'
        } else if (role === 'ADMIN') {
          url.pathname = '/admin'
        } else {
          url.pathname = '/dashboard/owner'
        }
        return NextResponse.redirect(url)
      }

      // Admin only routes
      if (pathname.startsWith('/admin') && token.role !== 'ADMIN') {
        return NextResponse.redirect(new URL('/', request.url))
      }
    }
    
    // Create response for all routes
    const response = NextResponse.next()
    
    // Add security headers (but NOT CSP - that's handled by next.config.js)
    // Don't set CSP here to avoid conflicts with next.config.js headers
    response.headers.set('X-DNS-Prefetch-Control', 'on')
    response.headers.set('Strict-Transport-Security', 'max-age=31536000; includeSubDomains')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    // Note: X-Frame-Options is set in next.config.js as DENY, don't override here
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
    
    return response
  } catch (error) {
    console.error('[MIDDLEWARE] Error:', error)
    // If middleware fails, just continue with the request
    return NextResponse.next()
  }
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    '/((?!_next/static|_next/image|favicon.ico).*)',
  ],
}
