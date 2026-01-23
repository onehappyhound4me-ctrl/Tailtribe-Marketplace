import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'

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


