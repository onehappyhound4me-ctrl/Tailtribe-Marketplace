export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Privacybeleid</h1>
        <p className="text-gray-600 mb-6">Laatste update: september 2025</p>
        <div className="bg-white rounded-2xl shadow p-6 md:p-8 space-y-6 text-gray-800 leading-relaxed">
          <p>
            Welkom bij ons Belgisch online platform dat huisdiereigenaars verbindt met betrouwbare
            dierenverzorgers in België. We respecteren jouw privacy en behandelen je persoonsgegevens zorgvuldig
            in overeenstemming met de Europese Algemene Verordening Gegevensbescherming (AVG/GDPR) en de Belgische
            Wet van 30 juli 2018 betreffende de bescherming van natuurlijke personen met betrekking tot de verwerking
            van persoonsgegevens.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Wie verwerkt jouw persoonsgegevens?</h2>
            <div className="space-y-1">
              <p className="font-medium">Verwerkingsverantwoordelijke:</p>
              <p>Uitgebaat door: Steven Van Gucht</p>
              <p>Ondernemingsnummer: BE 0695.940.752</p>
              <p>E-mailadres: <a href="mailto:steven@tailtribe.be" className="text-emerald-700 hover:underline">steven@tailtribe.be</a></p>
            </div>
            <p className="mt-3">
              De verwerkingsverantwoordelijke is verantwoordelijk voor de verwerking van persoonsgegevens die via het platform worden verzameld of verwerkt.
              Indien derden (zoals dierenverzorgers of betaalpartners) bijkomende gegevens verwerken, doen zij dit onder hun eigen
              verantwoordelijkheid en volgens hun eigen privacybeleid.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Welke persoonsgegevens verzamelen wij?</h2>
            <p>Wij verzamelen enkel gegevens die noodzakelijk zijn om onze diensten te kunnen leveren en onze wettelijke verplichtingen na te leven.</p>
            <h3 className="font-medium mt-3">a) Gegevens die je zelf verstrekt</h3>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Voornaam en naam</li>
              <li>E-mailadres</li>
              <li>Telefoonnummer (optioneel)</li>
              <li>Adres of woonplaats</li>
              <li>Gebruikersnaam en wachtwoord</li>
              <li>Profielfoto en beschrijving</li>
              <li>Informatie over jouw huisdieren of diensten (indien verzorger)</li>
              <li>Betalings- en facturatiegegevens (indien van toepassing)</li>
              <li>Communicatie via het platform (chat, berichten, reviews)</li>
            </ul>
            <h3 className="font-medium mt-3">b) Automatisch verzamelde gegevens</h3>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>IP-adres</li>
              <li>Browser en toesteltype</li>
              <li>Datum en tijd van bezoek</li>
              <li>Pagina’s die je bezoekt</li>
              <li>Sessie-informatie en cookievoorkeuren</li>
            </ul>
            <h3 className="font-medium mt-3">c) Gegevens via derden</h3>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Betaalpartners (zoals Stripe) bezorgen ons informatie over betalingen of transacties.</li>
              <li>Social media (bijv. Google inloggen) kunnen beperkte profielinfo doorgeven, enkel met jouw toestemming.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Voor welke doeleinden gebruiken we jouw gegevens?</h2>
            <p>We verwerken jouw gegevens uitsluitend voor legitieme doeleinden, waaronder:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li><span className="font-medium">Gebruikersregistratie en accountbeheer</span> – profiel aanmaken, onderhouden en beveiligen.</li>
              <li><span className="font-medium">Dienstverlening via het platform</span> – baasjes en verzorgers verbinden, boekingen en communicatie.</li>
              <li><span className="font-medium">Klantenservice en ondersteuning</span> – vragen, klachten of verzoeken behandelen.</li>
              <li><span className="font-medium">Betalingen en facturatie</span> – transacties verwerken en boekhoudverplichtingen naleven.</li>
              <li><span className="font-medium">Veiligheid en fraude-preventie</span> – misbruik voorkomen en gebruikers beschermen.</li>
              <li><span className="font-medium">Statistische en analytische doeleinden</span> – diensten verbeteren en gebruik analyseren.</li>
              <li><span className="font-medium">Marketing en communicatie</span> – nieuwsbrieven of updates enkel met jouw toestemming (opt-out mogelijk).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Op welke rechtsgrond verwerken wij jouw gegevens?</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-900">
                    <th className="py-2 pr-4">Doel</th>
                    <th className="py-2">Rechtsgrond</th>
                  </tr>
                </thead>
                <tbody className="align-top text-gray-700">
                  <tr><td className="py-2 pr-4">Accountbeheer</td><td className="py-2">Uitvoering van een overeenkomst</td></tr>
                  <tr><td className="py-2 pr-4">Gebruik van het platform</td><td className="py-2">Uitvoering van een overeenkomst</td></tr>
                  <tr><td className="py-2 pr-4">Betalingen</td><td className="py-2">Wettelijke verplichting / uitvoering overeenkomst</td></tr>
                  <tr><td className="py-2 pr-4">Klantenservice</td><td className="py-2">Gerechtvaardigd belang</td></tr>
                  <tr><td className="py-2 pr-4">Marketing (nieuwsbrief)</td><td className="py-2">Toestemming</td></tr>
                  <tr><td className="py-2 pr-4">Statistische analyses</td><td className="py-2">Gerechtvaardigd belang</td></tr>
                  <tr><td className="py-2 pr-4">Fraude- en veiligheidscontrole</td><td className="py-2">Gerechtvaardigd belang</td></tr>
                  <tr><td className="py-2 pr-4">Wettelijke administratie</td><td className="py-2">Wettelijke verplichting</td></tr>
                </tbody>
              </table>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Met wie delen wij jouw gegevens?</h2>
            <p>We delen persoonsgegevens enkel met dienstverleners die strikt noodzakelijk zijn, zoals:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Hostingprovider / IT-beveiliging</li>
              <li>Betaalproviders (zoals Stripe of Mollie)</li>
              <li>E-mailproviders / marketingtools</li>
              <li>Klantenservice-tools</li>
              <li>Boekhoudsoftware</li>
            </ul>
            <p className="mt-2">Deze partijen handelen als verwerkers onder een verwerkersovereenkomst conform de GDPR. Gegevens worden niet verkocht of verhuurd.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Overdracht buiten de EU</h2>
            <p>
              We bewaren gegevens in principe binnen de EER. Indien verwerking buiten de EER plaatsvindt, zorgen we voor een adequaat beschermingsniveau of
              gepaste contractuele waarborgen (zoals EU Standard Contractual Clauses).
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Bewaartermijnen</h2>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-900">
                    <th className="py-2 pr-4">Type gegevens</th>
                    <th className="py-2">Bewaartermijn</th>
                  </tr>
                </thead>
                <tbody className="align-top text-gray-700">
                  <tr><td className="py-2 pr-4">Gebruikersaccount</td><td className="py-2">Zolang het account actief is</td></tr>
                  <tr><td className="py-2 pr-4">Communicatie / berichten</td><td className="py-2">Tot 2 jaar na laatste activiteit</td></tr>
                  <tr><td className="py-2 pr-4">Facturatie / boekhouding</td><td className="py-2">7 jaar (wettelijke verplichting)</td></tr>
                  <tr><td className="py-2 pr-4">Nieuwsbrief-inschrijving</td><td className="py-2">Tot uitschrijving</td></tr>
                  <tr><td className="py-2 pr-4">Logbestanden / technische data</td><td className="py-2">Max. 12 maanden</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-2">Na afloop van deze termijnen worden gegevens geanonimiseerd of veilig verwijderd.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Beveiliging</h2>
            <p>We nemen passende technische en organisatorische maatregelen om persoonsgegevens te beschermen tegen verlies, misbruik en ongeoorloofde toegang.</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>SSL-versleuteling (https)</li>
              <li>Firewall en beveiligde servers</li>
              <li>Beperkte toegang voor medewerkers</li>
              <li>Regelmatige beveiligingsupdates</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">9. Jouw rechten als betrokkene</h2>
            <p>Je hebt steeds het recht om:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>inzage te vragen in jouw persoonsgegevens,</li>
              <li>fouten te laten verbeteren,</li>
              <li>je gegevens te laten verwijderen (“recht op vergetelheid”),</li>
              <li>verwerking te beperken of er bezwaar tegen te maken,</li>
              <li>jouw gegevens over te dragen.</li>
            </ul>
            <p className="mt-2">Deze rechten kan je uitoefenen via <a href="mailto:steven@tailtribe.be" className="text-emerald-700 hover:underline">steven@tailtribe.be</a>. Je ontvangt binnen 30 dagen een antwoord.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">10. Klachten</h2>
            <p>Bij klachten kan je terecht bij de Belgische Gegevensbeschermingsautoriteit (GBA):</p>
            <div className="text-gray-700 mt-2">
              <p>Gegevensbeschermingsautoriteit</p>
              <p>Drukpersstraat 35, 1000 Brussel</p>
              <p>+32 (0)2 274 48 00</p>
              <p><a className="text-emerald-700 hover:underline" href="https://www.gegevensbeschermingsautoriteit.be" target="_blank">www.gegevensbeschermingsautoriteit.be</a></p>
              <p><a className="text-emerald-700 hover:underline" href="mailto:contact@apd-gba.be">contact@apd-gba.be</a></p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">11. Wijzigingen</h2>
            <p>
              We behouden ons het recht voor om dit privacybeleid aan te passen. De meest recente versie is steeds beschikbaar op
              <span> </span><a className="text-emerald-700 hover:underline" href="/privacy">deze pagina</a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}


