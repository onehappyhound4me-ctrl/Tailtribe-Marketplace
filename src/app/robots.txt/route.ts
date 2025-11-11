import { NextResponse } from 'next/server'

export function GET() {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://tailtribe.be'
  
  const robots = `User-agent: *
Allow: /
Allow: /nl

# SEO-optimized pages
Allow: /be/
Allow: /caregivers/
Allow: /search
Allow: /nl/search

# Block private areas
Disallow: /dashboard/
Disallow: /admin/
Disallow: /api/
Disallow: /auth/
Disallow: /booking/
Disallow: /messages/

# Allow specific auth pages for SEO
Allow: /auth/signin

Host: ${baseUrl.replace('https://', '')}
Sitemap: ${baseUrl}/sitemap.xml`

  return new NextResponse(robots, {
    headers: {
      'Content-Type': 'text/plain',
      'Cache-Control': 'public, max-age=86400'
    }
  })
}





