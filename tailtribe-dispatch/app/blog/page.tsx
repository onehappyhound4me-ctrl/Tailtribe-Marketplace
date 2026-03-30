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
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">Vragen van huisdiereigenaars</h1>
            <p className="text-lg text-gray-600 max-w-3xl mx-auto">
              Praktische antwoorden op veelgestelde vragen over dierenoppas, hondenuitlaatservice aan huis, prijzen,
              vertrouwen en hulp in jouw regio.
            </p>
          </header>

          <section className="grid gap-4 md:grid-cols-2 mb-10">
            <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-white via-emerald-50/60 to-sky-50 p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-800">Focuscluster</p>
              <h2 className="mt-3 text-2xl font-semibold text-gray-900">Honden eerst voor SEO en leadintentie</h2>
              <p className="mt-4 text-base leading-8 text-gray-700">
                De sterkste zoekintentie zit vandaag bij hondenuitlaat, hondenoppas, hondenopvang en hondentraining.
                Daarom verzamelen we hier eerst de belangrijkste hondenvragen.
              </p>
              <div className="mt-5 flex flex-wrap gap-2">
                {[
                  { href: '/blog/wie-kan-mijn-hond-uitlaten-als-ik-werk', label: 'Hondenuitlaat' },
                  { href: '/blog/wat-kost-hondenoppas-aan-huis', label: 'Hondenoppas' },
                  { href: '/blog/waar-moet-ik-op-letten-bij-hondenopvang', label: 'Hondenopvang' },
                  { href: '/blog/wat-doet-een-hondentrainer-aan-huis', label: 'Hondentraining' },
                ].map((item) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className="inline-flex items-center rounded-full border border-emerald-100 bg-white px-3 py-1.5 text-sm font-medium text-gray-700 shadow-sm"
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-black/5 bg-white p-6 shadow-sm">
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Fase 2</p>
              <h2 className="mt-3 text-2xl font-semibold text-gray-900">Kattenoppas blijft een aparte pijler</h2>
              <p className="mt-4 text-base leading-8 text-gray-700">
                Na honden is kattenoppas de belangrijkste aparte cluster. Daarom linken we kattenbewust door naar de
                dedicated landingspagina en het bestaande kattenartikel.
              </p>
              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <Link href="/diensten/kattenoppas" className="btn-brand-compact">
                  Kattenoppas aan huis
                </Link>
                <Link href="/blog/kattenoppas-aan-huis-wat-te-verwachten" className="btn-secondary-compact">
                  Lees kattenartikel
                </Link>
              </div>
            </div>
          </section>

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
