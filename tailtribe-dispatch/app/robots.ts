import type { MetadataRoute } from 'next'
import { getPublicAppUrl } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  const appUrl = getPublicAppUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/admin', '/dashboard', '/login', '/register', '/chat', '/community', '/api', '/bedankt'],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  }
}


