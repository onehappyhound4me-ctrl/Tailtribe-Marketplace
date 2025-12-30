import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-tt p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Algemene Voorwaarden</h1>
          <p className="text-gray-600 mb-6">Laatste update: september 2025</p>

          <div className="space-y-6 text-gray-800 leading-relaxed">
            <p>
              Deze algemene voorwaarden zijn van toepassing op het gebruik van de TailTribe dispatch-website en op het
              indienen van aanvragen voor dierenverzorging.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Identificatie</h2>
              <p>
                TailTribe wordt uitgebaat door Steven Van Gucht – One Happy Hound, ondernemingsnummer BE 0695.940.752,
                gevestigd te Antwerpen (België). Contact:{' '}
                <a className="text-emerald-700 hover:underline" href="mailto:steven@tailtribe.be">
                  steven@tailtribe.be
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Dienst en rol van TailTribe</h2>
              <p>
                TailTribe biedt een digitaal kanaal om een aanvraag voor dierenverzorging in te dienen. Na je aanvraag
                nemen we contact op om details af te stemmen en, indien mogelijk, een geschikte dierenverzorger te
                vinden. TailTribe is niet noodzakelijk de uitvoerder van de dienst en is geen partij bij eventuele
                afspraken tussen aanvrager en verzorger.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Aanvragen</h2>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>Je verstrekt correcte en volledige informatie.</li>
                <li>Je aanvraag is pas “bevestigd” nadat TailTribe dit expliciet bevestigt.</li>
                <li>
                  Indien er geen passende beschikbaarheid is, kan TailTribe de aanvraag weigeren of een alternatief
                  voorstellen.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Betaling</h2>
              <p>
                Op deze dispatch-website worden geen online betalingen verwerkt. Eventuele prijsafspraken en betalingen
                gebeuren buiten de website en zijn afhankelijk van de afspraken met de uitvoerende partij.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Annulatie en wijziging</h2>
              <p>
                Wil je een aanvraag wijzigen of annuleren? Contacteer ons zo snel mogelijk via{' '}
                <a className="text-emerald-700 hover:underline" href="mailto:steven@tailtribe.be">
                  steven@tailtribe.be
                </a>
                . We doen ons best om aanpassingen door te voeren, maar dit hangt af van planning en beschikbaarheid.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Aansprakelijkheid</h2>
              <p>
                TailTribe streeft naar een correcte werking van de website en een vlotte opvolging van aanvragen, maar
                kan geen garantie geven op beschikbaarheid, timing of uitvoering door derden. Voor zover wettelijk
                toegestaan is TailTribe niet aansprakelijk voor indirecte schade, gevolgschade of schade die voortvloeit
                uit de uitvoering van diensten door derden.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Privacy</h2>
              <p>
                Persoonsgegevens worden verwerkt volgens ons{' '}
                <a className="text-emerald-700 hover:underline" href="/privacy">
                  privacybeleid
                </a>{' '}
                en{' '}
                <a className="text-emerald-700 hover:underline" href="/cookies">
                  cookiebeleid
                </a>
                .
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Toepasselijk recht</h2>
              <p>Op deze voorwaarden is Belgisch recht van toepassing. Bevoegde rechtbanken: Antwerpen.</p>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}



