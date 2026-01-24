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
      <div className="container mx-auto px-4 py-4 md:py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 pt-3 md:pt-4 pb-4 md:pb-6">
          <div>
            <div className="mt-0 flex items-center mb-0 overflow-hidden rounded-lg">
              <Image
                src="/tailtribe_logo_masked_1751977129022.png"
                alt="TailTribe Logo"
                width={700}
                height={700}
                sizes="(max-width: 768px) 220px, 260px"
                className="h-auto w-[180px] sm:w-[220px] md:w-[260px] object-contain object-left"
                style={{
                  filter: 'sepia(0.08) saturate(1.08) hue-rotate(-4deg) brightness(1.08)',
                  // Crop tiny artifact/smear in the bottom-right of the source image (footer-only).
                  // Slightly stronger than header because the dark footer background makes it more visible.
                  clipPath: 'inset(0 7% 14% 0)',
                }}
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
                <Link href="/verzorger-aanmelden" className="text-slate-300 hover:text-white">
                  Aanmelden als verzorger
                </Link>
              </li>
              <li>
                <Link href="/help" className="text-slate-300 hover:text-white">
                  FAQ
                </Link>
              </li>
              <li className="pt-1">
                <Link href="/contact" className="text-emerald-300 hover:text-white font-medium">
                  Contact opnemen →
                </Link>
              </li>
              <li className="pt-1">
                <a
                  href="https://www.instagram.com/1happyhound/?hl=nl"
                  target="_blank"
                  rel="noreferrer noopener"
                  className="inline-flex items-center gap-2 text-emerald-300 hover:text-white font-medium"
                  aria-label="Instagram"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                    <path d="M7 3h10a4 4 0 0 1 4 4v10a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4Zm0 2a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2H7Zm10.25 1.25a1.25 1.25 0 1 1-2.5 0 1.25 1.25 0 0 1 2.5 0ZM12 8.5A3.5 3.5 0 1 1 8.5 12 3.5 3.5 0 0 1 12 8.5Zm0 2a1.5 1.5 0 1 0 1.5 1.5A1.5 1.5 0 0 0 12 10.5Z" />
                  </svg>
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-700 pt-3 md:pt-4 text-sm text-slate-300">
          <div className="flex flex-wrap items-center justify-center gap-3 mb-2 md:mb-3">
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


