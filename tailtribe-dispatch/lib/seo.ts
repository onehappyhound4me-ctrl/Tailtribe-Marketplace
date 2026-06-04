import type { Metadata } from 'next'
import { getPublicAppUrl } from '@/lib/env'

export const SITE_NAME = 'TailTribe'
export const DEFAULT_OG_IMAGE_PATH = '/assets/hero-marketplace.jpg'

/** Absolute URL for a site path (leading slash). */
export function absoluteUrl(path: string): string {
  const base = getPublicAppUrl().replace(/\/$/, '')
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}

export function defaultOgImage(path = DEFAULT_OG_IMAGE_PATH): string {
  return absoluteUrl(path)
}

type PageMetadataOptions = {
  title: string
  description: string
  /** Path on site, e.g. `/diensten` — resolved via metadataBase for canonical/OG URL. */
  path: string
  ogImage?: string
  ogImageAlt?: string
  type?: 'website' | 'article'
  publishedTime?: string
  modifiedTime?: string
  keywords?: string | string[]
  authors?: Metadata['authors']
  robots?: Metadata['robots']
}

/** Shared Open Graph + Twitter + canonical for public marketing pages. */
export function buildPageMetadata(opts: PageMetadataOptions): Metadata {
  const canonicalPath = opts.path.startsWith('/') ? opts.path : `/${opts.path}`
  const canonicalUrl = absoluteUrl(canonicalPath)
  const ogImage = opts.ogImage ?? defaultOgImage()
  const ogType = opts.type ?? 'website'

  const openGraph: Metadata['openGraph'] = {
    title: opts.title,
    description: opts.description,
    url: canonicalUrl,
    siteName: SITE_NAME,
    locale: 'nl_BE',
    type: ogType,
    images: [
      {
        url: ogImage,
        width: 1200,
        height: 630,
        alt: opts.ogImageAlt ?? `${SITE_NAME} – ${opts.title}`,
      },
    ],
    ...(ogType === 'article' && opts.publishedTime
      ? {
          publishedTime: opts.publishedTime,
          modifiedTime: opts.modifiedTime ?? opts.publishedTime,
        }
      : {}),
  }

  return {
    title: opts.title,
    description: opts.description,
    ...(opts.keywords ? { keywords: opts.keywords } : {}),
    ...(opts.authors ? { authors: opts.authors } : {}),
    ...(opts.robots ? { robots: opts.robots } : {}),
    alternates: { canonical: canonicalPath },
    openGraph,
    twitter: {
      card: 'summary_large_image',
      title: opts.title,
      description: opts.description,
      images: [ogImage],
    },
  }
}
