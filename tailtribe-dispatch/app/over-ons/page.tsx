import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
const canonicalUrl = `${baseUrl}/over-ons`
const isDev = process.env.NODE_ENV === 'development'

export const metadata: Metadata = {
  title: 'Over ons',
  description:
    'TailTribe is georganiseerd door professionele dierenverzorgers. Lees onze visie, missie en achtergrond, gebouwd op echte praktijkervaring.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Over ons',
    description:
      'TailTribe is georganiseerd door professionele dierenverzorgers. Lees onze visie, missie en achtergrond, gebouwd op echte praktijkervaring.',
    url: canonicalUrl,
    siteName: 'TailTribe',
    locale: 'nl_BE',
    type: 'website',
  },
}

const VALUES = [
  { title: 'Voor en door professionals', desc: 'Gebouwd door ervaren dierenverzorgers die weten wat in de praktijk telt.' },
  { title: 'Dierenwelzijn eerst', desc: 'Veiligheid, welzijn en duidelijke afspraken staan altijd voorop.' },
  { title: 'Transparant & persoonlijk', desc: 'Heldere prijzen, snelle reactie, één aanspreekpunt voor dispatch en opvolging.' },
  { title: 'Freelance kwaliteit', desc: 'We werken met zelfstandige verzorgers die we zorgvuldig selecteren.' },
]

const STORY = [
  'Georganiseerde huisdierenzorg, gebouwd op echte ervaring: van internationale projecten tot lokale dispatch in BE/NL.',
  'Wij geloven in organisatie, opvolging en verantwoordelijkheid — niet in losse marktplaatsen.',
  'Meer dan 2000 daguitstappen en dispatch-opdrachten, altijd met focus op dierenwelzijn, veiligheid en heldere afspraken.',
  'Technologie ondersteunt planning en opvolging, maar inzicht, ervaring en verantwoordelijkheid blijven centraal.',
]

export default function OverOnsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-5xl mx-auto space-y-10">
          <section className="bg-white rounded-2xl shadow-tt p-8 md:p-10 border border-black/5">
            <div className="space-y-4 text-emerald-900/90">
              <p className="text-sm uppercase tracking-wide text-emerald-700 font-semibold">Over TailTribe</p>
              <h1 className="text-3xl md:text-[2.6rem] lg:text-[2.8rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 leading-snug">
                Gebouwd op echte ervaring
              </h1>
              <p>
                TailTribe is ontstaan uit jaren praktijkervaring in de dagelijkse zorg voor huisdieren. We weten uit de sector zelf
                wat werkt én wat vaak ontbreekt: betrouwbare verzorging voor verschillende diersoorten, duidelijke afspraken en een
                professionele opvolging. Daarom bouwden we TailTribe — voor verzorgers en door verzorgers — zodat eigenaars kunnen
                rekenen op echte expertise, veiligheid en consistente kwaliteit. Je kiest niet zomaar iemand, je kiest een aanpak
                die bewezen is en vertrouwen geeft.
              </p>
              <div className="mt-6 bg-gradient-to-br from-emerald-50 via-white to-blue-50 border border-emerald-100 rounded-2xl p-8 text-center shadow-sm">
                <p className="text-2xl md:text-3xl font-semibold text-emerald-900 mb-3 leading-snug">
                  “The greatness of a nation and its moral progress can be judged by the way its animals are treated.”
                </p>
                <p className="text-gray-600 font-medium text-lg">– Mahatma Gandhi</p>
              </div>
              <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 mt-6">
                Onze benadering
              </h2>
              <p>
                TailTribe organiseert huisdierenzorg met structuur en vakkennis. Geen losse afspraken, wel een heldere intake,
                zorgvuldige match, duidelijke planning en opvolging. Zo weten eigenaars exact waar ze aan toe zijn.
              </p>
              <p>
                We bieden hondenuitlaat (individueel en in kleine groepen), oppas aan huis, verzorging op maat en ondersteuning
                tijdens afwezigheid. Elke aanvraag wordt afgestemd op soort, karakter, routine en omgeving.
              </p>
              <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 mt-6">
                Kwaliteit boven kwantiteit
              </h2>
              <p>
                We kiezen bewust voor een beperkt netwerk van gescreende verzorgers, met duidelijke afspraken rond planning,
                veiligheid en dierenwelzijn. Door selectie, begeleiding en opvolging leveren we consistente kwaliteit waarop je
                kan rekenen.
              </p>
              <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 mt-6">
                Vertrouwd door honderden baasjes
              </h2>
              <p>
                Vertrouwen komt niet uit beloften, maar uit resultaten. Dankzij jaren praktijkervaring, heldere communicatie en
                betrouwbare opvolging kiezen steeds meer baasjes voor TailTribe als vaste partner in huisdierenzorg.
              </p>
              <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 mt-6">
                Gebouwd vanuit praktijkervaring
              </h2>
              <p>
                TailTribe is geen theorie, maar praktijk. Jaren ervaring met groepsuitlaat, gedrag en dagelijkse zorg bepalen onze
                standaarden. We weten wat werkt in het veld en vertalen dat naar veilige, professionele begeleiding.
              </p>
              <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 mt-6">
                Onze visie
              </h2>
              <p>
                Wij geloven dat huisdierenzorg professioneel georganiseerd hoort te zijn: transparant, menselijk en met respect
                voor dier, eigenaar en verzorger.
              </p>
              <p className="font-semibold text-emerald-800">
                TailTribe wil een betrouwbare referentie zijn voor georganiseerde huisdierenzorg, waarbij kwaliteit en dierenwelzijn
                altijd vooropstaan.
              </p>
              <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 mt-6">
                TailTribe voor alle huisdieren
              </h2>
              <p>
                We ondersteunen honden, katten, kleine huisdieren en boerderijdieren. Alles wordt afgestemd op soort, karakter en
                routine: van check-ins en kattenbak tot langere oppas, altijd met veiligheid en welzijn als basis.
              </p>
              <div className="grid md:grid-cols-2 gap-4 mt-6">
                {VALUES.map((v) => (
                  <div key={v.title} className="bg-white rounded-2xl border border-black/5 p-5 shadow-sm">
                    <h3 className="text-lg font-semibold text-emerald-900">{v.title}</h3>
                    <p className="text-emerald-900/85 mt-2">{v.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          <section className="bg-white rounded-2xl border border-black/5 p-8 shadow-sm">
            <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 mb-4">
              Team
            </h2>
            <p className="text-emerald-900/85 mb-4">
              De visie achter TailTribe is nauw verbonden met de achtergrond van oprichter Steven Van Gucht. Zijn interesse in
              dierengedrag begon op jonge leeftijd en groeide uit tot internationale praktijkervaring in dierenzorg en
              gedragsbegeleiding, met telkens welzijn, gedrag en samenwerking tussen mens en dier centraal.
            </p>
            <p className="text-emerald-900/85 mb-4">
              In 2007 werkte Steven als vrijwilliger in één van de grootste hondenasielen van Spanje, gespecialiseerd in de
              rehabilitatie van mishandelde en verwaarloosde Greyhounds en Galgos. Een jaar later volgde vrijwilligerswerk in een
              Wildlife Rescue Park in Thailand, waar verwaarloosde exotische dieren een tweede kans kregen. In 2012 verbleef hij
              meer dan drie jaar in de California Bay Area om zich te verdiepen in hondengedrag, werkte samen met trainers,
              begeleidde roedels en ondersteunde eigenaars bij gedragstrajecten aan huis.
            </p>
            <p className="text-emerald-900/85 mb-4">
              Doorheen de jaren begeleidde hij meer dan 2000 groepsuitstappen met honden in binnen- en buitenland, waarvan meer dan zeven jaar
              met het OneHappyHound-team in België. Deze praktijkervaring vormt vandaag de kern van TailTribe.
            </p>
            <div className="flex justify-end items-start mb-6">
              <div className="bg-gradient-to-br from-green-500 via-emerald-400 to-blue-500 p-[3px] rounded-3xl shadow-[0_10px_30px_rgba(16,185,129,0.18)]">
                <div className="relative w-full sm:w-[36vw] md:w-[24vw] lg:w-[16vw] aspect-[3/4] bg-white rounded-[calc(1.5rem-3px)] overflow-hidden border border-white/60">
                  {isDev ? (
                    <img
                      src="/assets/bezieler.jpg"
                      alt="Bezieler TailTribe"
                      className="h-full w-full object-cover md:[filter:brightness(1.08)_contrast(0.92)_saturate(0.85)_blur(0.4px)]"
                      style={{ objectPosition: '20% 72%' }}
                    />
                  ) : (
                    <Image
                      src="/assets/bezieler.jpg"
                      alt="Bezieler TailTribe"
                      fill
                      priority
                      unoptimized={isDev}
                      className="object-cover md:[filter:brightness(1.08)_contrast(0.92)_saturate(0.85)_blur(0.4px)]"
                      style={{ objectPosition: '20% 72%' }}
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 36vw, (max-width: 1280px) 24vw, 16vw"
                    />
                  )}
                </div>
              </div>
            </div>
            <div className="space-y-2 text-emerald-900/85">
              <div className="font-semibold text-emerald-900">Academische en professionele achtergrond</div>
              <ul className="list-disc pl-5 space-y-1">
                <li>Bachelor Agro-biotechnologie, optie dierenzorg (Gent, 2008) – Thesis: De effecten van hondengedrag op menselijke feedback.</li>
                <li>Hondenuitlaatservices en gedragstraining (California Bay Area); wildlife rescue (Thailand); dierenartsassistent (Antwerpen); greyhound rescue (Spanje).</li>
                <li>7+ jaar owner One Happy Hound: team, opvang, training en avontuurlijke daguitstappen.</li>
              </ul>
            </div>
          </section>

          <section className="bg-gradient-to-br from-blue-50 to-green-50 rounded-2xl border border-black/5 p-8 shadow-sm mb-14">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div className="space-y-3">
                <h2 className="text-2xl font-semibold text-transparent bg-clip-text bg-gradient-to-r from-emerald-700 to-blue-700 mb-3">
                  Klaar voor veilige, professionele dierenzorg?
                </h2>
                <p className="text-emerald-900/85">
                  Dien je aanvraag in en we plannen een passende verzorger in. Werk je zelf als ervaren freelancer? Meld je aan en we
                  nemen je graag mee in onze pool.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center items-center">
                <Link href="/boeken" className="btn-brand text-center">
                  Aanvraag indienen
                </Link>
                <Link
                  href="/verzorger-aanmelden"
                  className="inline-flex items-center justify-center px-6 py-3 rounded-tt border border-emerald-200 bg-white text-gray-900 hover:bg-gray-50 transition"
                >
                  Aanmelden als verzorger
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

