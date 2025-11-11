import { MetadataRoute } from 'next'
import { services, Service } from '../../lib/services'

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
  const lastModified = new Date()

  const staticPages = [
    {
      url: `${appUrl}/`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 1,
    },
    {
      url: `${appUrl}/nl`,
      lastModified,
      changeFrequency: 'weekly' as const,
      priority: 0.95,
    },
    {
      url: `${appUrl}/diensten`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.9,
    },
    {
      url: `${appUrl}/search`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.85,
    },
    {
      url: `${appUrl}/nl/search`,
      lastModified,
      changeFrequency: 'daily' as const,
      priority: 0.8,
    },
    {
      url: `${appUrl}/help`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${appUrl}/contact`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    {
      url: `${appUrl}/about`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    },
    {
      url: `${appUrl}/terms`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${appUrl}/privacy`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
    {
      url: `${appUrl}/cookies`,
      lastModified,
      changeFrequency: 'yearly' as const,
      priority: 0.3,
    },
  ]

  const servicePages = services.map((service: Service) => ({
    url: `${appUrl}/diensten/${service.slug}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }))

  const belgianLocations = [
    'antwerpen',
    'oost-vlaanderen',
    'vlaams-brabant',
    'brussel',
  ].map((slug) => ({
    url: `${appUrl}/be/${slug}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const dutchLocations = [
    'gelderland',
    'noord-brabant',
    'noord-holland',
    'utrecht',
    'zuid-holland',
  ].map((slug) => ({
    url: `${appUrl}/nl/${slug}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.55,
  }))

  return [
    ...staticPages,
    ...servicePages,
    {
      url: `${appUrl}/be`,
      lastModified,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    },
    ...belgianLocations,
    ...dutchLocations,
  ]
}
