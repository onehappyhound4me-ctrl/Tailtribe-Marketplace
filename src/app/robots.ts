import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
  
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/api/',
          '/admin/',
          '/dashboard/',
          '/auth/',
          '/settings/',
          '/booking/',
          '/messages/',
          '/reviews/',
          '/favorites/',
          '/pets/',
          '/profile/',
          '/onboarding/',
          '/debug-session/',
          '/clear-session/',
        ],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
  }
}

