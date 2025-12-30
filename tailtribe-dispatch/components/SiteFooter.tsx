import Link from 'next/link'
import Image from 'next/image'
import { PROVINCES, getPopularProvinces } from '@/data/be-geo'

export function SiteFooter() {
  const year = new Date().getFullYear()
  const popular = getPopularProvinces()
    .map((slug) => PROVINCES.find((p) => p.slug === slug))
    .filter(Boolean)

  // Keep footer short + avoid duplicates like "Antwerpen" (province + city)
  const popularProvincesShort = popular.slice(0, 3)
  const provinceNames = new Set(popularProvincesShort.map((p) => String(p!.name).toLowerCase()))

  const popularPlaces = popularProvincesShort
    .flatMap((p) => (p?.topPlaces ?? []).map((pl) => ({ province: p!.slug, provinceName: p!.name, ...pl })))
    .filter((pl) => !provinceNames.has(String(pl.name).toLowerCase()))
    .reduce<{ province: string; provinceName: string; name: string; slug: string; lat: number; lng: number }[]>(
      (acc, pl) => {
        const key = `${pl.province}:${pl.slug}`
        if (acc.some((x) => `${x.province}:${x.slug}` === key)) return acc
        if (acc.some((x) => x.name.toLowerCase() === pl.name.toLowerCase())) return acc
        acc.push(pl)
        return acc
      },
      []
    )
    .slice(0, 4)

  return (
    <footer className="bg-gradient-to-br from-slate-800 via-slate-900 to-gray-900 text-slate-100 border-t border-slate-700">
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 pb-6">
          <div>
            <div className="mt-0 flex items-center mb-0 overflow-hidden">
              <Image
                src="/assets/tailtribe-logo.png"
                alt="TailTribe"
                width={180}
                height={90}
                className="object-contain object-left filter brightness-110 contrast-110 drop-shadow"
                style={{ clipPath: 'inset(0 6% 0 0)' }}
              />
            </div>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">Streken (België)</h4>
            <ul className="space-y-1 text-sm">
              {popularProvincesShort.map((p) => (
                <li key={p!.slug}>
                  <Link href={`/be/${p!.slug}`} className="text-slate-300 hover:text-white">
                    {p!.name}
                  </Link>
                </li>
              ))}
              {popularPlaces.length > 0 && (
                <>
                  {popularPlaces.map((pl) => (
                    <li key={`${pl.province}:${pl.slug}`}>
                      <Link href={`/be/${pl.province}/${pl.slug}`} className="text-slate-300 hover:text-white">
                        {pl.name}
                      </Link>
                    </li>
                  ))}
                </>
              )}
              <li className="pt-1">
                <Link href="/be" className="text-emerald-300 hover:text-white font-medium">
                  Alle streken →
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-semibold text-white mb-2">Contact & info</h4>
            <ul className="space-y-1 text-sm">
              <li>
                <Link href="/help" className="text-slate-300 hover:text-white">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/privacy" className="text-slate-300 hover:text-white">
                  Privacybeleid
                </Link>
              </li>
              <li>
                <Link href="/cookies" className="text-slate-300 hover:text-white">
                  Cookiebeleid
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-slate-300 hover:text-white">
                  Algemene Voorwaarden
                </Link>
              </li>
              <li className="pt-1">
                <Link href="/contact" className="text-emerald-300 hover:text-white font-medium">
                  Contact opnemen →
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-4 text-sm text-slate-300">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-3">
            <Link href="/terms" className="hover:text-white">
              Algemene Voorwaarden
            </Link>
            <span className="opacity-40">|</span>
            <Link href="/privacy" className="hover:text-white">
              Privacybeleid
            </Link>
            <span className="opacity-40">|</span>
            <Link href="/cookies" className="hover:text-white">
              Cookiebeleid
            </Link>
          </div>
          <p className="text-center">&copy; {year} TailTribe. Alle rechten voorbehouden.</p>
        </div>
      </div>
    </footer>
  )
}


