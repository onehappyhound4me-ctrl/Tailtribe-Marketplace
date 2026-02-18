import type { Metadata } from 'next'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { getPublicAppUrl } from '@/lib/env'

const appUrl = getPublicAppUrl()
const canonicalUrl = new URL('/terms', appUrl).toString()

export const metadata: Metadata = {
  title: 'Algemene voorwaarden',
  description: 'Lees de algemene voorwaarden van TailTribe.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Algemene voorwaarden',
    description: 'Lees de algemene voorwaarden van TailTribe.',
    url: canonicalUrl,
    siteName: 'TailTribe',
    locale: 'nl_BE',
    type: 'website',
  },
}

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-tt p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Algemene Voorwaarden</h1>
          <p className="text-gray-600 mb-6">Laatste update: januari 2026</p>

          <div className="space-y-6 text-gray-800 leading-relaxed">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Algemeen</h2>
              <p className="mt-2">
                Deze voorwaarden zijn van toepassing op TailTribe, ondernemingsnummer BE 0695.940.752, gevestigd te Antwerpen
                (België). Contact: steven@tailtribe.be.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Identiteit en rol van TailTribe</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>TailTribe treedt op als platform, organisator en tussenpersoon voor professionele huisdierenzorg.</li>
                <li>TailTribe is geen eigenaar, houder of bezitter van de huisdieren van de opdrachtgever.</li>
                <li>
                  De feitelijke uitvoering van de diensten gebeurt door TailTribe zelf en/of door aangesloten zelfstandige
                  dienstverleners, freelancers of partners (hierna: “Dienstverleners”).
                </li>
                <li>
                  De overeenkomst tussen TailTribe en de opdrachtgever betreft de organisatie en bemiddeling van
                  huisdierenzorg, tenzij uitdrukkelijk anders schriftelijk overeengekomen.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Diensten</h2>
              <p>TailTribe faciliteert onder meer, maar niet beperkt tot, volgende diensten:</p>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>hondenuitlaatservice (individueel en in groep)</li>
                <li>huisdierenoppas aan huis</li>
                <li>verzorging van honden, katten en andere gezelschapsdieren</li>
                <li>toedienen van voeding</li>
                <li>basisverzorging en toezicht tijdens afwezigheid van de eigenaar</li>
              </ul>
              <p className="mt-2">De concrete invulling, duur en frequentie van de diensten worden vooraf afgesproken en bevestigd.</p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Rechten en plichten van TailTribe</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>zorgvuldige Dienstverleners te selecteren</li>
                <li>de dienstverlening correct te plannen en te communiceren</li>
                <li>te handelen in het belang van dierenwelzijn en veiligheid</li>
              </ul>
              <p className="mt-2">
                TailTribe kan een opdracht weigeren, stopzetten of aanpassen indien nodig om redenen van veiligheid, welzijn,
                overmacht of foutieve/onvolledige informatie van de opdrachtgever. Bij overmacht (extreme weersomstandigheden,
                ziekte, onvoorziene veiligheidsrisico’s of andere omstandigheden buiten redelijke controle) kan TailTribe
                annuleren of opschorten.
              </p>
              <p className="mt-2">
                Bij sleuteloverhandiging: geen adresgegevens, geen duplicatie, enkel gebruik voor de overeengekomen diensten;
                bij verlies/diefstal wordt de opdrachtgever zo snel mogelijk verwittigd, zonder aansprakelijkheid voor
                gevolgschade.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Verplichtingen van de opdrachtgever</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Volledige en juiste info over gezondheid, gedrag (incl. agressie), voeding, medicatie, aandachtspunten.</li>
                <li>Ziekte, loopsheid, gedragsproblemen of bijzondere medische noden vooraf melden.</li>
                <li>Correcte inentingen en preventieve behandelingen tegen vlooien, wormen en teken.</li>
                <li>Familiale verzekering waarin huisdieren zijn meeverzekerd.</li>
                <li>Alle noodzakelijke verzorgingsmiddelen beschikbaar en toegankelijk; ontbrekend materiaal mag worden aangekocht op kosten van de opdrachtgever.</li>
                <li>De opdrachtgever blijft te allen tijde eindverantwoordelijk voor zijn/haar huisdier(en).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Medische situaties</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>TailTribe of de Dienstverlener mag een dierenarts raadplegen bij ziekte/letsel of vermoeden hiervan.</li>
                <li>Alle medische, veterinaire en daaraan verbonden kosten zijn ten laste van de opdrachtgever.</li>
                <li>In dringende/levensbedreigende situaties mag onmiddellijk worden gehandeld zonder voorafgaand overleg.</li>
                <li>Indien de vaste dierenarts niet beschikbaar is, mag een andere erkende dierenarts worden geconsulteerd.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Tarieven en betaling</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>Alle diensten worden vooraf gefactureerd.</li>
                <li>Facturen dienen volledig betaald te zijn vóór aanvang van de dienstverlening; betaling via overschrijving, geen contant.</li>
                <li>Bij niet-tijdige betaling kan TailTribe de dienstverlening niet aanvatten of stopzetten.</li>
                <li>Bijkomende kosten (bv. dierenarts, medicatie, aankopen) worden afzonderlijk gefactureerd.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Annulering en wijzigingen (alle diensten)</h2>
              <p className="mb-2">Dit annuleringsbeleid geldt voor de opdrachtgever/aanvrager:</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>Tot 12:00 uur, 7 dagen vóór de start: 100% terugbetaling.</li>
                <li>Later (maar vóór de start): 50% terugbetaling.</li>
                <li>Tijdens de reservering: geen terugbetaling.</li>
              </ul>
              <div className="mt-4 mb-2 font-semibold text-gray-900">Annulering door de opdrachtnemer</div>
              <ul className="list-disc pl-5 space-y-1 text-gray-800">
                <li>
                  De opdrachtnemer (TailTribe of de Dienstverlener) kan annuleren/onderbreken bij overmacht,
                  veiligheids- of welzijnsredenen, onjuiste/onvolledige info, niet-naleving van contractuele
                  verplichtingen of andere omstandigheden die correcte uitvoering onmogelijk maken.
                </li>
                <li>De opdrachtgever wordt zo snel mogelijk verwittigd.</li>
                <li>
                  Recht op terugbetaling van het reeds betaalde voor het niet-uitgevoerde deel, of – indien mogelijk –
                  kosteloze herplanning.
                </li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">9. Aansprakelijkheidsstelling</h2>
              <ul className="list-disc pl-5 space-y-1">
                <li>TailTribe treedt op als platform, organisator en tussenpersoon. De feitelijke uitvoering gebeurt door TailTribe en/of aangesloten zelfstandige Dienstverleners.</li>
                <li>TailTribe is niet aansprakelijk voor handelingen/nalatigheden/fouten van Dienstverleners, behalve bij bewezen opzet of zware fout van TailTribe zelf.</li>
                <li>Geen aansprakelijkheid voor keuze, matching, beschikbaarheid, geschiktheid of vervanging van Dienstverleners; geen garantie op uitvoering door Dienstverleners.</li>
                <li>Inspanningsverbintenis, geen resultaatsverbintenis: geen garantie op gedrag/gezondheid/welzijn/evolutie van het huisdier.</li>
                <li>Geen aansprakelijkheid voor ziekte, ongeval, letsel of overlijden van het huisdier; weglopen/ontsnappen; besmetting (vlooien, wormen, andere ziektes); stress/gedragsverandering; schade door het huisdier aan dieren/personen/eigendommen; schade aan woning/inboedel veroorzaakt door het huisdier.</li>
                <li>Geen aansprakelijkheid voor inbraak/diefstal/schade aan de woning van de opdrachtgever, behalve bij aantoonbare directe schade door TailTribe zelf.</li>
                <li>Geen aansprakelijkheid bij overmacht (o.a. extreem weer, verkeersongeval/hinder, ziekte, staking, overheidsmaatregel, buiten redelijke controle).</li>
                <li>Geen aansprakelijkheid voor schade door onvolledige/foutieve/laattijdige/verzwegen info van de opdrachtgever over het huisdier, gezondheid, gedrag of omgeving.</li>
                <li>Alle kosten bij ziekte/verwonding/aandoening/overlijden van het huisdier, incl. dierenarts/verzorging, zijn volledig voor de opdrachtgever.</li>
                <li>Opdrachtgever blijft te allen tijde zelf aansprakelijk voor zijn/haar huisdier(en), ook naar derden toe.</li>
                <li>Indien aansprakelijkheid van TailTribe toch wordt weerhouden: beperkt tot directe schade en binnen de grenzen van het wettelijk toegelatene.</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">10. Wijzigingen en slotbepalingen</h2>
              <p>
                TailTribe kan voorwaarden en tarieven wijzigen; de meest recente versie staat op de website. Belgisch recht is
                van toepassing. Bevoegde rechtbanken: arrondissement Antwerpen.
              </p>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}



