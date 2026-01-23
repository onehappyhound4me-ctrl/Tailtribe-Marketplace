import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { getBlogPostBySlug, getBlogPostSlugs } from '@/lib/blog.server'
import { SafeImage } from '@/components/SafeImage'
import { getStockCoverImage, resolveCoverImage } from '@/lib/cover-image'

type Props = {
  params: { slug: string }
}

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
const toAbsoluteUrl = (url: string) => (url.startsWith('http') ? url : `${baseUrl}${url}`)

export function generateStaticParams() {
  return getBlogPostSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug)
  if (!post) {
    return { title: 'Artikel niet gevonden', description: 'Dit artikel bestaat niet.' }
  }

  const canonicalUrl = `${baseUrl}/blog/${post.slug}`
  const coverImage = resolveCoverImage(post)

  return {
    title: post.title,
    description: post.excerpt,
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: canonicalUrl,
      siteName: 'TailTribe',
      locale: 'nl_BE',
      type: 'article',
      images: [
        {
          url: toAbsoluteUrl(coverImage),
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
  }
}

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString('nl-BE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

export default function BlogPostPage({ params }: Props) {
  const post = getBlogPostBySlug(params.slug)
  if (!post) notFound()

  const canonicalUrl = `${baseUrl}/blog/${post.slug}`
  const coverImage = resolveCoverImage(post)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: [toAbsoluteUrl(coverImage)],
    datePublished: post.date,
    author: {
      '@type': 'Organization',
      name: 'TailTribe',
      url: baseUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TailTribe',
      logo: {
        '@type': 'ImageObject',
        url: `${baseUrl}/tailtribe_logo_masked_1751977129022.png`,
      },
    },
    mainEntityOfPage: canonicalUrl,
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 flex flex-col">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      <main className="container mx-auto px-4 py-12 pb-32 md:pb-40 flex-1">
        <div className="max-w-3xl mx-auto">
          <Link href="/blog" className="text-sm text-gray-600 hover:text-emerald-700">
            ← Terug naar blog
          </Link>

          <header className="mt-4 mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">{post.title}</h1>
            <div className="text-sm text-gray-500">{formatDate(post.date)}</div>
            <div className="flex flex-wrap gap-2 mt-4">
              {post.tags.map((tag) => (
                <span key={tag} className="text-xs font-semibold bg-emerald-50 text-emerald-700 px-3 py-1 rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </header>

          <div className="relative w-full aspect-[16/9] rounded-2xl overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 mb-8">
            <SafeImage
              src={coverImage}
              fallbackSrc={getStockCoverImage(post)}
              alt={post.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 60vw"
              priority
            />
          </div>

          <article className="prose prose-slate max-w-none mb-20 space-y-6 leading-7">
            {post.content.map((paragraph, index) => (
              <p key={index} className="mb-6 last:mb-0">
                {paragraph}
              </p>
            ))}
          </article>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
