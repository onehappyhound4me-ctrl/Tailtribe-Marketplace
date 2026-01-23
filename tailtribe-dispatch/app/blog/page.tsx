import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { getBlogPosts } from '@/lib/blog.server'
import { SafeImage } from '@/components/SafeImage'
import { getStockCoverImage, resolveCoverImage } from '@/lib/cover-image'

const formatDate = (value: string) =>
  new Date(`${value}T00:00:00Z`).toLocaleDateString('nl-BE', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })

export default function BlogIndexPage() {
  const posts = getBlogPosts()

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 flex flex-col">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />

      <main className="container mx-auto px-4 py-12 pb-32 md:pb-40 flex-1">
        <div className="max-w-5xl mx-auto">
          <header className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Blog & tips</h1>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Praktische inzichten over dierenverzorging, oppas en veilig transport.
            </p>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {posts.map((post) => (
              <Link
                key={post.slug}
                href={`/blog/${post.slug}`}
                className="group bg-white rounded-2xl shadow-sm border border-black/5 p-6 hover:shadow-tt transition"
              >
                <div className="relative w-full aspect-[16/9] rounded-xl overflow-hidden bg-gradient-to-br from-green-50 to-blue-50 mb-4">
                  <SafeImage
                    src={resolveCoverImage(post)}
                    fallbackSrc={getStockCoverImage(post)}
                    alt={post.title}
                    fill
                    className="object-cover"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                </div>
                <div className="text-sm text-gray-500 mb-2">{formatDate(post.date)}</div>
                <h2 className="text-xl font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors">
                  {post.title}
                </h2>
                <p className="text-gray-600 mt-3">{post.excerpt}</p>
                <div className="mt-4 text-sm font-semibold text-emerald-700">
                  <span>Lees artikel →</span>
                </div>
              </Link>
            ))}
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}
