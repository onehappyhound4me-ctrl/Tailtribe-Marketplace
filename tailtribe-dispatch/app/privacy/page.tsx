import type { Metadata } from 'next'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
const canonicalUrl = `${baseUrl}/privacy`

export const metadata: Metadata = {
  title: 'Privacybeleid',
  description: 'Lees hoe TailTribe omgaat met persoonsgegevens en privacy.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Privacybeleid',
    description: 'Lees hoe TailTribe omgaat met persoonsgegevens en privacy.',
    url: canonicalUrl,
    siteName: 'TailTribe',
    locale: 'nl_BE',
    type: 'website',
  },
}

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-tt p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Privacybeleid</h1>
          <p className="text-gray-600 mb-6">Laatste update: september 2025</p>

          <div className="space-y-6 text-gray-800 leading-relaxed">
            <p>
              TailTribe respecteert jouw privacy en verwerkt persoonsgegevens zorgvuldig, in overeenstemming met de
              Algemene Verordening Gegevensbescherming (AVG/GDPR) en de Belgische wetgeving.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Wie verwerkt jouw persoonsgegevens?</h2>
              <div className="space-y-1">
                <p className="font-medium">Verwerkingsverantwoordelijke:</p>
                <p>Uitgebaat door: Steven Van Gucht</p>
                <p>Ondernemingsnummer: BE 0695.940.752</p>
                <p>
                  E-mailadres:{' '}
                  <a href="mailto:steven@tailtribe.be" className="text-emerald-700 hover:underline">
                    steven@tailtribe.be
                  </a>
                </p>
              </div>
              <p className="mt-3">
                TailTribe is een dispatch-website: je dient een aanvraag in, waarna wij contact opnemen om details te
                bevestigen en (indien mogelijk) een passende dierenverzorger te vinden. TailTribe is niet noodzakelijk
                de uitvoerder van de dienstverlening.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Welke gegevens verzamelen we?</h2>
              <p>Wij verzamelen enkel gegevens die nodig zijn om jouw aanvraag te behandelen, zoals:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Voornaam en achternaam</li>
                <li>E-mailadres en telefoonnummer</li>
                <li>Stad en postcode</li>
                <li>Gevraagde service, datum en tijd</li>
                <li>Informatie over je huisdier (naam, type, extra info)</li>
              </ul>
              <p className="mt-2">
                Daarnaast kunnen we technische gegevens verwerken (bv. IP-adres, toesteltype) om de site veilig te laten
                werken en misbruik te voorkomen.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Doeleinden</h2>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>
                  <span className="font-medium">Aanvraag verwerken</span> – contact opnemen, details afstemmen en de
                  dienst organiseren.
                </li>
                <li>
                  <span className="font-medium">Klantenservice</span> – vragen, klachten en verzoeken behandelen.
                </li>
                <li>
                  <span className="font-medium">Veiligheid</span> – fraude- en misbruikpreventie.
                </li>
                <li>
                  <span className="font-medium">Verbetering</span> – analyse van gebruik om de website te verbeteren.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Rechtsgrond</h2>
              <p>
                We verwerken jouw gegevens op basis van (i) uitvoering van een overeenkomst of precontractuele stappen
                (je aanvraag), (ii) gerechtvaardigd belang (bv. beveiliging), en (iii) toestemming waar dit wettelijk
                vereist is (bv. niet-essentiële cookies).
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Delen van gegevens</h2>
              <p>
                We delen gegevens enkel wanneer dit nodig is om je aanvraag uit te voeren, bijvoorbeeld met een
                dierenverzorger die de dienst kan uitvoeren. We verkopen of verhuren je gegevens nooit.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Bewaartermijnen</h2>
              <p>
                We bewaren persoonsgegevens niet langer dan nodig. Aanvragen en communicatie bewaren we zolang dit nodig
                is voor opvolging en administratie, en verwijderen of anonimiseren ze daarna.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Jouw rechten</h2>
              <p>
                Je hebt recht op inzage, verbetering, verwijdering, beperking, bezwaar en overdraagbaarheid van je
                gegevens. Je kan je rechten uitoefenen via{' '}
                <a href="mailto:steven@tailtribe.be" className="text-emerald-700 hover:underline">
                  steven@tailtribe.be
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Klachten</h2>
              <p>
                Bij klachten kan je terecht bij de Belgische Gegevensbeschermingsautoriteit (GBA): Drukpersstraat 35,
                1000 Brussel, <span className="whitespace-nowrap">+32 (0)2 274 48 00</span>.
              </p>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}



