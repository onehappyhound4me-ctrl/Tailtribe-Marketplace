import 'server-only'

import type { BlogPost } from '@/lib/blog.server'
import { STOCK_IMAGES } from '@/lib/stock-images'

const isAbsoluteHttpUrl = (value: string) => /^https?:\/\//i.test(value)

const hashSlug = (slug: string) => {
  let hash = 0
  for (let i = 0; i < slug.length; i += 1) {
    hash = (hash * 31 + slug.charCodeAt(i)) % 2147483647
  }
  return hash
}

export const getStockCoverImage = (post: Pick<BlogPost, 'slug' | 'category'>) => {
  const category = post.category ?? 'general'
  const images = STOCK_IMAGES[category] ?? STOCK_IMAGES.general
  const index = hashSlug(post.slug) % images.length
  return images[index]
}

export const resolveCoverImage = (post: BlogPost) => {
  const coverImage = post.coverImage?.trim()
  if (coverImage && isAbsoluteHttpUrl(coverImage)) {
    return coverImage
  }
  return getStockCoverImage(post)
}
