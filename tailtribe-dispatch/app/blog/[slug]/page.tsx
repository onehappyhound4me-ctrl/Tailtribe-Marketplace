import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { getBlogPostBySlug, getBlogPostSlugs } from '@/lib/blog.server'
import { SafeImage } from '@/components/SafeImage'
import { getStockCoverImage, resolveCoverImage } from '@/lib/cover-image'
import { getPublicAppUrl } from '@/lib/env'

type Props = {
  params: { slug: string }
}

const appUrl = getPublicAppUrl()
const toAbsoluteUrl = (url: string) => (url.startsWith('http') ? url : new URL(url, appUrl).toString())
const ARTICLE_SECTION_LABELS = {
  'dog-walking': 'Hondenuitlaat',
  'pet-sitting': 'Dierenoppas',
  transport: 'Transport huisdieren',
  training: 'Hondentraining',
  general: 'Huisdierenzorg',
} as const

export function generateStaticParams() {
  return getBlogPostSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const post = getBlogPostBySlug(params.slug)
  if (!post) {
    return { title: 'Artikel niet gevonden', description: 'Dit artikel bestaat niet.' }
  }

  const canonicalUrl = new URL(`/blog/${post.slug}`, appUrl).toString()
  const coverImage = resolveCoverImage(post)
  const articleSection = ARTICLE_SECTION_LABELS[post.category ?? 'general']
  const isoDate = `${post.date}T00:00:00Z`

  return {
    title: post.title,
    description: post.excerpt,
    keywords: post.tags,
    authors: [{ name: 'TailTribe' }],
    alternates: { canonical: canonicalUrl },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      url: canonicalUrl,
      siteName: 'TailTribe',
      locale: 'nl_BE',
      type: 'article',
      publishedTime: isoDate,
      modifiedTime: isoDate,
      authors: ['TailTribe'],
      section: articleSection,
      images: [
        {
          url: toAbsoluteUrl(coverImage),
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [toAbsoluteUrl(coverImage)],
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

  const canonicalUrl = new URL(`/blog/${post.slug}`, appUrl).toString()
  const coverImage = resolveCoverImage(post)
  const articleSection = ARTICLE_SECTION_LABELS[post.category ?? 'general']
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt,
    image: [toAbsoluteUrl(coverImage)],
    datePublished: post.date,
    dateModified: post.date,
    inLanguage: 'nl-BE',
    articleSection,
    keywords: post.tags.join(', '),
    author: {
      '@type': 'Organization',
      name: 'TailTribe',
      url: appUrl,
    },
    publisher: {
      '@type': 'Organization',
      name: 'TailTribe',
      logo: {
        '@type': 'ImageObject',
        url: new URL('/tailtribe_logo_masked_1751977129022.png', appUrl).toString(),
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
              style={{
                objectPosition: post.coverPosition ?? '50% 50%',
                objectFit: post.coverFit ?? 'cover',
              }}
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

          <section className="mb-20 rounded-3xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/60 to-sky-50 p-6 md:p-8 shadow-sm">
            <div className="max-w-2xl">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-800">Volgende stap</p>
              <h2 className="mt-3 text-2xl font-semibold text-gray-900">Hulp nodig voor jouw huisdier?</h2>
              <p className="mt-4 text-base leading-8 text-gray-700">
                Vertel ons wat je nodig hebt voor je hond, kat of ander huisdier. Daarna bekijken we welke dienst en
                welke aanpak het best passen bij jouw situatie en regio.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/boeken" className="btn-brand">
                  Aanvraag indienen
                </Link>
                <Link href="/diensten" className="btn-secondary-compact">
                  Bekijk diensten
                </Link>
              </div>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
