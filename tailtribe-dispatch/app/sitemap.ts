import type { MetadataRoute } from 'next'
import { allProvinceSlugs, allPlaceTriples } from '@/data/be-geo'
import { DISPATCH_SERVICES } from '@/lib/services'
import { getBlogPostSlugs } from '@/lib/blog.server'
import { getPublicAppUrl } from '@/lib/env'

export default function sitemap(): MetadataRoute.Sitemap {
  const appUrl = getPublicAppUrl()
  const lastModified = new Date()

  const abs = (path: string) => new URL(path, appUrl).toString()

  const staticPages: MetadataRoute.Sitemap = [
    { url: abs('/'), lastModified, changeFrequency: 'weekly', priority: 1 },
    { url: abs('/boeken'), lastModified, changeFrequency: 'weekly', priority: 0.9 },
    { url: abs('/over-ons'), lastModified, changeFrequency: 'yearly', priority: 0.4 },
    { url: abs('/diensten'), lastModified, changeFrequency: 'monthly', priority: 0.7 },
    { url: abs('/blog'), lastModified, changeFrequency: 'weekly', priority: 0.6 },
    { url: abs('/be'), lastModified, changeFrequency: 'monthly', priority: 0.8 },
    { url: abs('/help'), lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: abs('/contact'), lastModified, changeFrequency: 'monthly', priority: 0.6 },
    { url: abs('/verzorger-aanmelden'), lastModified, changeFrequency: 'monthly', priority: 0.5 },
    { url: abs('/terms'), lastModified, changeFrequency: 'yearly', priority: 0.2 },
    { url: abs('/privacy'), lastModified, changeFrequency: 'yearly', priority: 0.2 },
    { url: abs('/cookies'), lastModified, changeFrequency: 'yearly', priority: 0.2 },
  ]

  const servicePages = DISPATCH_SERVICES.map((s) => ({
    url: abs(`/diensten/${s.slug}`),
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.7,
  }))

  const blogPages = getBlogPostSlugs().map((slug) => ({
    url: abs(`/blog/${slug}`),
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  const provincePages = allProvinceSlugs().map((slug) => ({
    url: abs(`/be/${slug}`),
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.6,
  }))

  const cityPages = allPlaceTriples().map(({ province, place }) => ({
    url: abs(`/be/${province}/${place}`),
    lastModified,
    changeFrequency: 'monthly' as const,
    priority: 0.5,
  }))

  return [...staticPages, ...servicePages, ...blogPages, ...provincePages, ...cityPages]
}



