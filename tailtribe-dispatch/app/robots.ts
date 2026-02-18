import type { MetadataRoute } from 'next'
import { getPublicAppUrl } from '@/lib/env'

export default function robots(): MetadataRoute.Robots {
  const appUrl = getPublicAppUrl()

  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        // Only block private / non-index-worthy routes.
        disallow: ['/dashboard', '/admin', '/api', '/auth', '/checkout', '/account', '/chat', '/community', '/bedankt'],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  }
}


