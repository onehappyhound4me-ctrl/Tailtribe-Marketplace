import type { Metadata } from 'next'
import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { getPublicAppUrl } from '@/lib/env'

const appUrl = getPublicAppUrl()
const canonicalUrl = new URL('/diensten/kattenoppas', appUrl).toString()

export const metadata: Metadata = {
  title: 'Kattenoppas aan huis | Betrouwbare kattenoppas via TailTribe',
  description:
    'Zoek je een betrouwbare kattenoppas aan huis? Via TailTribe vind je ervaren dierenoppassers voor katten in Antwerpen, Brasschaat, Kapellen en omliggende gemeenten.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Kattenoppas aan huis in België | Kattenoppas Antwerpen',
    description:
      'Kattenoppas aan huis tijdens vakantie, weekend weg of werkreis. Vind een betrouwbare kattenoppas in Antwerpen, Brasschaat, Kapellen en omliggende gemeenten via TailTribe.',
    url: canonicalUrl,
    siteName: 'TailTribe',
    locale: 'nl_BE',
    type: 'website',
  },
}

export default function KattenoppasPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: 'Wat doet een kattenoppas?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Een kattenoppas komt bij jou thuis langs om je kat(ten) te verzorgen: voeding geven, vers water voorzien, de kattenbak schoonmaken, controleren of alles in orde is en – als je kat dat fijn vindt – extra aandacht en spelmomenten geven.',
        },
      },
      {
        '@type': 'Question',
        name: 'Hoe vaak komt een kattenoppas langs?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Dat stemmen we samen af. Vaak gaat het om één of twee bezoeken per dag tijdens jouw vakantie of afwezigheid, maar dit kan aangepast worden aan de noden van jouw kat en jouw planning.',
        },
      },
      {
        '@type': 'Question',
        name: 'Kan een kattenoppas meerdere katten verzorgen?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Ja. Je kan meerdere katten per huishouden laten verzorgen. Tijdens de intake geef je door hoeveel katten je hebt en welke specifieke zorg of aandacht ze nodig hebben, zodat we daar rekening mee kunnen houden.',
        },
      },
      {
        '@type': 'Question',
        name: 'Is kattenoppas beter dan een pension?',
        acceptedAnswer: {
          '@type': 'Answer',
          text: 'Voor veel katten is kattenoppas aan huis rustiger dan een pension. Ze blijven in hun vertrouwde omgeving met eigen geuren, verstopplekjes en routine. Zo vermijd je onnodige stress door transport, vreemde ruimtes en andere dieren.',
        },
      },
    ],
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />

      <main className="container mx-auto px-4 py-12 sm:py-14">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />

        <div className="max-w-5xl mx-auto">
          <nav className="flex items-center space-x-2 text-xs sm:text-sm text-gray-500 mb-5 sm:mb-6">
            <Link href="/" className="hover:text-gray-700">
              Home
            </Link>
            <span>›</span>
            <Link href="/diensten" className="hover:text-gray-700">
              Diensten
            </Link>
            <span>›</span>
            <span className="text-gray-900">Kattenoppas aan huis</span>
          </nav>

          <header className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 sm:p-8 md:p-10 mb-10">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-4">
              Kattenoppas aan huis
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-gray-700 leading-relaxed max-w-3xl">
              Via TailTribe regel je eenvoudig een betrouwbare kattenoppas aan huis. Een ervaren dierenoppas komt bij
              jou thuis langs om je kat(ten) te verzorgen terwijl jij op vakantie bent, een weekend weg bent of op
              werkreis vertrekt. Je kat blijft in de vertrouwde omgeving, jij vertrekt met een rustiger gevoel.
            </p>
            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                href="/boeken?service=PET_SITTING"
                className="btn-brand-compact"
              >
                Vraag een kattenoppas aan
              </Link>
              <Link
                href="/diensten/dierenoppas"
                className="btn-secondary-compact"
              >
                Meer over dierenoppas
              </Link>
            </div>
          </header>

          <section className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 mb-10">
            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Waarom een kattenoppas aan huis?</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Katten zijn gewoontedieren. Ze voelen zich het veiligst in hun eigen huis, met hun vertrouwde geuren,
                looproutes en verstopplekjes. Een kattenoppas aan huis sluit daar perfect bij aan: je kat blijft in haar
                eigen territorium, terwijl de oppas langskomt voor voeding, verzorging en controle.
              </p>
              <p className="text-gray-700 leading-relaxed mb-3">
                In plaats van je kat naar een pension te brengen – met transport, vreemde ruimtes en andere dieren – kies
                je voor minder stress en meer voorspelbaarheid. Zeker voor stressgevoelige katten, kittens, senioren of
                katten met een medische voorgeschiedenis is kattenoppas aan huis vaak een rustiger alternatief.
              </p>
              <ul className="list-disc pl-5 space-y-2 text-gray-700 mt-3">
                <li>Katten blijven in hun vertrouwde omgeving met eigen geuren en routines.</li>
                <li>Minder stress dan een pension of logeeradres met andere dieren.</li>
                <li>Persoonlijke aandacht op het tempo van jouw kat.</li>
                <li>Dagelijkse controle van voeding, kattenbak en algemeen welzijn.</li>
              </ul>
            </div>

            <div className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8">
              <h2 className="text-2xl font-semibold text-gray-900 mb-3">Situaties: vakantie, weekend weg, werkreizen</h2>
              <p className="text-gray-700 leading-relaxed mb-3">
                Of je nu een korte trip plant of langer weg bent, kattenoppas aan huis is ideaal tijdens{' '}
                <strong>vakantie</strong>, een <strong>weekend weg</strong> of langere <strong>werkreizen</strong>.
                Voor elke situatie stemmen we het aantal bezoeken en de inhoud van de zorg af.
              </p>
              <p className="text-gray-700 leading-relaxed mb-2">
                Denk aan één bezoek per dag bij een korte afwezigheid, of twee bezoeken per dag bij langere vakanties of
                katten die meer aandacht of medicatie nodig hebben. Jij beslist wat nodig is; wij zorgen voor een
                passende oppas.
              </p>
              <p className="text-gray-700 leading-relaxed">
                Tijdens ieder bezoek kijken we niet alleen naar voeding en kattenbak, maar ook naar gedrag en
                lichaamstaal. Bij twijfel of veranderingen in eetlust, activiteit of gezondheid nemen we eerst contact
                met je op.
              </p>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8 mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">Hoe werkt kattenoppas via TailTribe?</h2>
            <p className="text-gray-700 leading-relaxed mb-5">
              Kattenoppas verloopt via onze dierenoppasdienst. In je aanvraag geef je gewoon aan dat het om een kat of
              meerdere katten gaat, samen met je data, locatie en eventuele aandachtspunten. Zo blijft aanvragen
              eenvoudig, terwijl de zorg wel afgestemd wordt op kattenoppas aan huis.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {[
                {
                  step: '1',
                  title: 'Dien een aanvraag in',
                  desc: 'Je kiest dierenoppas, geeft aan dat het om kattenoppas gaat en vult je gegevens, data en locatie in.',
                },
                {
                  step: '2',
                  title: 'Wij matchen je',
                  desc: 'We zoeken een betrouwbare dierenoppas met ervaring met katten in jouw regio en stemmen verwachtingen af.',
                },
                {
                  step: '3',
                  title: 'De oppas komt langs',
                  desc: 'De kattenoppas bezoekt je kat(ten) thuis volgens afgesproken frequentie voor voeding, kattenbak, controle en aandacht.',
                },
                {
                  step: '4',
                  title: 'Updates & opvolging',
                  desc: 'Je kan afspreken hoe vaak je een update wil (bericht of foto), zodat je tijdens vakantie of werkreis gerust bent.',
                },
              ].map((i) => (
                <div key={i.step} className="text-center bg-gradient-to-b from-emerald-50 to-blue-50 rounded-2xl border border-emerald-100 p-5">
                  <div className="w-12 h-12 bg-gradient-to-br from-green-600 to-blue-600 text-white rounded-full flex items-center justify-center text-lg font-bold mx-auto mb-4">
                    {i.step}
                  </div>
                  <h3 className="text-base font-semibold text-gray-900 mb-2">{i.title}</h3>
                  <p className="text-sm text-gray-700 leading-relaxed">{i.desc}</p>
                </div>
              ))}
            </div>
            <div className="mt-6 text-center">
              <Link
                href="/boeken?service=PET_SITTING"
                className="btn-brand-compact"
              >
                Vraag een kattenoppas aan
              </Link>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8 mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">Kattenoppas in jouw regio</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              TailTribe biedt kattenoppas aan huis in Antwerpen en omliggende gemeenten. Vooral in en rond Groot
              Antwerpen is er een sterke focus op huisbezoeken bij katten tijdens vakantie, weekends weg en werkreizen.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Enkele voorbeelden waar kattenoppas via TailTribe mogelijk is:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-gray-700 mb-4">
              <li>Kattenoppas Antwerpen</li>
              <li>Kattenoppas Berchem</li>
              <li>Kattenoppas Wilrijk</li>
              <li>Kattenoppas Deurne</li>
              <li>Kattenoppas Borgerhout</li>
              <li>Kattenoppas Merksem</li>
              <li>Kattenoppas Brasschaat</li>
              <li>Kattenoppas Kapellen</li>
              <li>Kattenoppas Kalmthout</li>
              <li>Kattenoppas Schoten</li>
              <li>Kattenoppas Brecht</li>
            </ul>
            <p className="text-gray-700 leading-relaxed mb-4">
              Op onze regionale pagina&apos;s lees je meer over hoe diensten zoals hondenuitlaat en dierenoppas (incl.
              kattenoppas aan huis) in die steden en gemeenten worden aangeboden.
            </p>
            <div className="flex flex-wrap gap-2">
              <Link
                href="/be/antwerpen/antwerpen"
                className="inline-flex items-center px-3 py-1.5 rounded-full border border-emerald-100 bg-emerald-50 text-sm font-medium text-emerald-900 hover:bg-emerald-100 transition"
              >
                Antwerpen
              </Link>
              <Link
                href="/be/antwerpen/brasschaat"
                className="inline-flex items-center px-3 py-1.5 rounded-full border border-emerald-100 bg-emerald-50 text-sm font-medium text-emerald-900 hover:bg-emerald-100 transition"
              >
                Brasschaat
              </Link>
              <Link
                href="/be/antwerpen/kapellen"
                className="inline-flex items-center px-3 py-1.5 rounded-full border border-emerald-100 bg-emerald-50 text-sm font-medium text-emerald-900 hover:bg-emerald-100 transition"
              >
                Kapellen
              </Link>
              <Link
                href="/be/antwerpen/kalmthout"
                className="inline-flex items-center px-3 py-1.5 rounded-full border border-emerald-100 bg-emerald-50 text-sm font-medium text-emerald-900 hover:bg-emerald-100 transition"
              >
                Kalmthout
              </Link>
              <Link
                href="/be/antwerpen"
                className="inline-flex items-center px-3 py-1.5 rounded-full border border-emerald-100 bg-white text-sm font-medium text-emerald-900 hover:bg-emerald-50 transition"
              >
                Overzicht Antwerpen (provincie)
              </Link>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8 mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">Wat kost een kattenoppas?</h2>
            <p className="text-gray-700 leading-relaxed mb-3">
              De prijs van een kattenoppas aan huis hangt af van het aantal bezoeken per dag, de duur van ieder bezoek
              en je locatie. Een kort dagelijks bezoek in het centrum van Antwerpen zal anders geprijsd zijn dan meerdere
              bezoeken per dag in een gemeente verder buiten de stad.
            </p>
            <p className="text-gray-700 leading-relaxed mb-3">
              Omdat elke situatie anders is – aantal katten, medicatie of extra zorg, afstand, parkeersituatie – werken we
              met een voorstel op maat. Zo weet je vooraf waar je aan toe bent en kun je vergelijken wat voor jullie
              situatie het best past.
            </p>
            <p className="text-gray-700 leading-relaxed mb-4">
              Wil je een concreet idee van het tarief voor jouw kat(ten) en jouw regio? Dien dan een korte aanvraag in;
              we nemen contact op met een voorstel voor kattenoppas tijdens je vakantie, weekend weg of werkreis.
            </p>
            <div className="mt-2">
              <Link
                href="/boeken?service=PET_SITTING"
                className="btn-brand-compact"
              >
                Vraag een offerte voor kattenoppas
              </Link>
            </div>
          </section>

          <section className="bg-white rounded-2xl shadow-sm border border-black/5 p-6 md:p-8 mb-10">
            <h2 className="text-2xl md:text-3xl font-semibold text-gray-900 mb-4">
              Veelgestelde vragen over kattenoppas
            </h2>
            <div className="space-y-4 text-gray-700">
              <div className="rounded-xl border border-black/5 p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Wat doet een kattenoppas?</h3>
                <p>
                  Een kattenoppas komt bij jou thuis langs om je kat dagelijks te verzorgen: voeding en vers water geven,
                  de kattenbak schoonhouden, controleren of alles in orde is en – als je kat dat fijn vindt – extra
                  aandacht, spel en knuffels geven. Zo blijft de routine zoveel mogelijk gelijk aan wanneer jij thuis
                  bent.
                </p>
              </div>
              <div className="rounded-xl border border-black/5 p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Hoe vaak komt een kattenoppas langs?</h3>
                <p>
                  Meestal spreken we één of twee bezoeken per dag af, afhankelijk van leeftijd, gezondheid en
                  karakter van je kat. Bij langere vakanties of katten die medicatie nodig hebben, kan het aantal
                  bezoeken worden verhoogd. Dit stemmen we steeds vooraf met je af.
                </p>
              </div>
              <div className="rounded-xl border border-black/5 p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Kan een kattenoppas meerdere katten verzorgen?</h3>
                <p>
                  Ja. Je kan meerdere katten in hetzelfde huishouden laten verzorgen. Tijdens de aanvraag geef je door
                  hoeveel katten je hebt, welke routine ze gewend zijn en of er speciale aandachtspunten zijn (bv.
                  medicatie, schuwe katten, aparte ruimtes).
                </p>
              </div>
              <div className="rounded-xl border border-black/5 p-5">
                <h3 className="font-semibold text-gray-900 mb-2">Is kattenoppas beter dan een pension?</h3>
                <p>
                  Voor veel katten wel. In een pension zijn er vaak andere dieren, vreemde geuren en een andere routine.
                  Kattenoppas aan huis laat je kat in de eigen, vertrouwde omgeving met eigen geuren en verstopplekjes.
                  Dat vermindert stress en maakt de overgang naar en van vakantie of werkreis veel zachter.
                </p>
              </div>
            </div>
          </section>

          <section className="bg-gradient-to-br from-emerald-900 to-slate-900 rounded-2xl shadow-sm border border-black/5 p-6 md:p-8 mb-12 text-white">
            <h2 className="text-2xl md:text-3xl font-semibold mb-4">Wat zeggen huisdiereigenaars over TailTribe?</h2>
            <p className="text-emerald-50/90 leading-relaxed mb-4">
              TailTribe werkt met zorgvuldig geselecteerde dierenoppassers en begeleidt aanvragen van begin tot einde. In
              reviews geven baasjes aan dat ze vooral de duidelijke communicatie, betrouwbaarheid en zorg voor hun
              huisdieren waarderen.
            </p>
            <p className="text-emerald-50/90 leading-relaxed mb-4">
              Ook voor kattenoppas aan huis geldt: we kijken niet alleen naar planning, maar ook naar match, ervaring en
              duidelijke afspraken. Zo kun jij met een geruster gevoel vertrekken, terwijl je kat in goede handen is.
            </p>
            <div className="mt-4">
              <Link
                href="/boeken?service=PET_SITTING"
                className="inline-flex items-center justify-center px-6 py-2.5 rounded-full bg-white text-emerald-900 font-semibold text-sm shadow-sm hover:bg-emerald-50 transition"
              >
                Start je aanvraag voor kattenoppas
              </Link>
            </div>
          </section>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}

