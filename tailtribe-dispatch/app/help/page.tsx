import type { Metadata } from 'next'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
const canonicalUrl = `${baseUrl}/help`

export const metadata: Metadata = {
  title: 'FAQ',
  description: 'Veelgestelde vragen over TailTribe, dierenverzorging en aanvragen.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'FAQ',
    description: 'Veelgestelde vragen over TailTribe, dierenverzorging en aanvragen.',
    url: canonicalUrl,
    siteName: 'TailTribe',
    locale: 'nl_BE',
    type: 'website',
  },
}

const faqs = [
  {
    q: 'Hoe snel nemen jullie contact op?',
    a: 'We mikken op een reactie binnen 2 uur tijdens kantooruren om je aanvraag te bevestigen en af te stemmen.',
  },
  {
    q: 'Hoe werkt betaling?',
    a: 'Geen online betaling op de site. Na bevestiging bezorgen we de prijs en (indien van toepassing) een factuur. Vooraf betalen kan gevraagd worden (bijv. overschrijving) vóór de dienst start.',
  },
  {
    q: 'Zijn jullie verzorgers freelancers?',
    a: 'Ja. We werken uitsluitend met zelfstandige dierenverzorgers. Ze kunnen factureren en wij vragen dat ze een BA-verzekering hebben.',
  },
  {
    q: 'Doen jullie ook spoed of last-minute?',
    a: 'Ja, indien capaciteit. Vermeld dit in je aanvraag; spoed kan een toeslag hebben.',
  },
  {
    q: 'Kunnen meerdere dieren of boerderijdieren in één aanvraag?',
    a: 'Ja. Voeg per dier de basisinfo toe (soort, aantal, aandachtspunten). Voor boerderijdieren graag ook routine/voer en toegang (hok/stal).',
  },
  {
    q: 'Hoe regelen jullie sleutel/toegang bij verzorging aan huis?',
    a: 'We stemmen vooraf af: sleuteloverdracht, code, buur of sleutelkluisje. Een sleutelcontract is mogelijk. We labelen nooit met adres.',
  },
  {
    q: 'Wat bij annulatie of wijziging?',
    a: 'Contacteer ons zo snel mogelijk. Annuleren kan tot 12:00 uur, 7 dagen vóór de start met 100% terugbetaling. Daarna (maar vóór de start) is er 50% terugbetaling. Tijdens de reservatie is er geen terugbetaling.',
  },
  {
    q: 'Wat als een verzorger toch niet kan?',
    a: 'We zoeken zo snel mogelijk een vervanger. Lukt dat niet, dan laten we het direct weten en betaal je uiteraard niets voor de niet-uitgevoerde dienst.',
  },
  {
    q: 'Doen jullie transport van huisdieren?',
    a: 'Ja. We gebruiken een bench of passend harnas/veiligheidssysteem. Meld medische of stress-gerelateerde aandachtspunten vooraf.',
  },
  {
    q: 'Kunnen jullie begeleiden tijdens events (bv. bruiloft)?',
    a: 'Ja. We volgen een draaiboek (foto’s, ceremonie, ontvangst) en voorzien rustpauzes en een veilige plek. Check altijd of de locatie huisdieren toelaat.',
  },
  {
    q: 'Hebben jullie een verslag of update na de dienst?',
    a: 'Op verzoek geven we een korte update: bericht, foto of video.',
  },
  {
    q: 'Welke regio’s dekken jullie?',
    a: 'We werken in België. Beschrijf je locatie en timing; we zoeken de dichtstbijzijnde beschikbare verzorger.',
  },
  {
    q: 'Hoe werkt groepsuitlaat en veiligheid?',
    a: 'We doen een geschiktheidsscreening (sociaal, basisgehoorzaamheid) en volgen de lokale regels. Loslopen alleen waar het mag en als het veilig is.',
  },
  {
    q: 'Wat bij extreem weer (hitte/kou/onweer)?',
    a: 'We passen duur/tijdstip aan of schakelen over naar een kortere wandeling/check-in. Veiligheid en welzijn eerst; bij zwaar weer kan uitstel nodig zijn.',
  },
  {
    q: 'Boerderijdieren: wat doen jullie wel/niet?',
    a: 'Wel: voeding/water volgens schema, basiscontrole, korte check, eventueel basis schoonmaak/uitmesten op afspraak. Niet: medische handelingen. Geef per diersoort routines en aandachtspunten door (bv. kippen, geiten, schapen).',
  },
  {
    q: 'Transport: hoe zit het met bench/harnas en wachttijden?',
    a: 'We vervoeren veilig met bench of passend harnas. Meld medische of stress-gerelateerde aandachtspunten vooraf. Wachttijden (bv. bij dierenarts) gebeuren in overleg; bij lange wachttijden kan een toeslag gelden.',
  },
  {
    q: 'Events: wat hebben jullie nodig van de locatie?',
    a: 'De locatie moet huisdieren toelaten en een rustige plek voorzien. We volgen een draaiboek (momenten, foto’s, pauzes) en plannen rustplaatsen. Meld prikkelgevoeligheid of lawaaigeregelde situaties vooraf.',
  },
  {
    q: 'Reistijd en afstand: kan er een toeslag zijn?',
    a: 'Ja, bij langere afstanden of piekmomenten kan een verplaatsingstoeslag gelden. We geven dit vooraf mee bij de prijsbevestiging.',
  },
]

export default function HelpPage() {
  const faqJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: {
        '@type': 'Answer',
        text: f.a,
      },
    })),
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-tt p-5 sm:p-8">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-5 sm:mb-6">FAQ</h1>
          <div className="space-y-6">
            {faqs.map((f) => (
              <div key={f.q} className="border border-black/5 rounded-xl p-5">
                <h2 className="font-semibold text-gray-900 mb-2 text-sm sm:text-base">{f.q}</h2>
                <p className="text-gray-700 text-sm sm:text-base leading-relaxed">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}



