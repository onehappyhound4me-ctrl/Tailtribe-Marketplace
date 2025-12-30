import type { MetadataRoute } from 'next'
import { allProvinceSlugs, allPlaceTriples } from '@/data/be-geo'

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
  const lastModified = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: `${appUrl}/`, lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: `${appUrl}/boeken`, lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${appUrl}/be`, lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${appUrl}/help`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${appUrl}/contact`, lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: `${appUrl}/terms`, lastModified, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${appUrl}/privacy`, lastModified, changeFrequency: 'yearly', priority: 0.2 },
    { url: `${appUrl}/cookies`, lastModified, changeFrequency: 'yearly', priority: 0.2 },
  ]

  const provincePages = allProvinceSlugs().map((slug) => ({
    url: `${appUrl}/be/${slug}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const cityPages = allPlaceTriples().map(({ province, place }) => ({
    url: `${appUrl}/be/${province}/${place}`,
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...provincePages, ...cityPages]
}



