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

const categoryLabel: Record<string, string> = {
  'dog-walking': 'Hondenuitlaat',
  'pet-sitting': 'Oppas aan huis',
  transport: 'Dierentransport',
  training: 'Hondentraining',
  general: 'Keuzehulp',
}

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
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-emerald-800">Populaire vragen</p>
              <h2 className="mt-3 text-2xl font-semibold text-gray-900">Hulp voor honden in het dagelijks leven</h2>
              <p className="mt-4 text-base leading-8 text-gray-700">
                Hier vind je de vragen die hondenbaasjes het vaakst stellen over uitlaten, oppas, opvang en
                begeleiding aan huis.
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
              <p className="text-sm font-semibold uppercase tracking-[0.14em] text-slate-500">Ook voor katten</p>
              <h2 className="mt-3 text-2xl font-semibold text-gray-900">Rustige kattenoppas aan huis</h2>
              <p className="mt-4 text-base leading-8 text-gray-700">
                Zoek je vooral betrouwbare zorg voor je kat tijdens vakantie of afwezigheid? Dan vind je hier meteen
                de belangrijkste kattenpagina&apos;s terug.
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
                className="group relative overflow-hidden rounded-[1.6rem] border border-black/5 bg-white/95 p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-tt"
              >
                <div className="relative w-full aspect-[16/9] overflow-hidden rounded-[1.25rem] bg-gradient-to-br from-green-50 to-blue-50">
                  <SafeImage
                    src={resolveCoverImage(post)}
                    fallbackSrc={getStockCoverImage(post)}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                    sizes="(max-width: 768px) 100vw, 50vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/35 via-slate-900/5 to-transparent" />
                  <div className="absolute left-4 top-4 inline-flex items-center rounded-full border border-white/35 bg-white/90 px-3 py-1 text-xs font-semibold text-slate-800 shadow-sm backdrop-blur">
                    {categoryLabel[post.category ?? 'general']}
                  </div>
                </div>
                <div className="px-2 pb-2 pt-5">
                  <div className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-slate-500">
                    <span>{formatDate(post.date)}</span>
                    <span className="h-1 w-1 rounded-full bg-slate-300" />
                    <span>{post.readingTime}</span>
                  </div>
                  <h2 className="mt-3 text-[1.35rem] font-semibold leading-tight text-slate-900 transition-colors group-hover:text-emerald-700">
                    {post.title}
                  </h2>
                  <p className="mt-3 line-clamp-3 text-[1rem] leading-7 text-slate-600">{post.excerpt}</p>
                  <div className="mt-4 flex flex-wrap gap-2">
                    {post.tags.slice(0, 2).map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center rounded-full border border-emerald-100 bg-emerald-50 px-2.5 py-1 text-xs font-medium text-emerald-800"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-5 inline-flex items-center text-sm font-semibold text-emerald-700">
                    <span>Lees artikel</span>
                    <span className="ml-2 transition-transform duration-300 group-hover:translate-x-1">→</span>
                  </div>
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
