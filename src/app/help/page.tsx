'use client'

import Link from 'next/link'

export default function HelpCenterPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h1 className="text-3xl font-bold text-gray-900">FAQ</h1>
            <Link href="/" className="text-emerald-700 hover:underline">Home</Link>
          </div>

          <div className="bg-white rounded-2xl shadow p-6 md:p-8">
            <p className="text-gray-700 mb-6">
              Vind snel antwoord op veelgestelde vragen. Hulp nodig? Neem contact op via de contactpagina.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Voor baasjes (owners)</h2>
                <div className="space-y-3">
                  <details id="owner-what" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Wat is TailTribe?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      TailTribe is een Belgisch platform dat huisdiereigenaren verbindt met betrouwbare verzorgers en dierenprofessionals. 
                      Je vindt er mensen in je buurt die kunnen helpen met hondenuitlaten, huisbezoeken, kattenverzorging, kleinvee, enz.
                    </div>
                  </details>

                  <details id="owner-how-it-works" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Hoe werkt het?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm space-y-1">
                      <p className="font-medium">In 4 stappen:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Maak een gratis profiel aan.</li>
                        <li>Zoek een verzorger in je buurt via locatie of dienst.</li>
                        <li>Bekijk hun profiel, ervaring en recensies.</li>
                        <li>Neem rechtstreeks contact op en spreek verder af.</li>
                      </ul>
                    </div>
                  </details>

                  


                  <details id="owner-reviews" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Kan ik mijn verzorgers beoordelen?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Ja. Na elke samenwerking kan je een beoordeling achterlaten. Zo help je anderen betrouwbare verzorgers te kiezen.
                    </div>
                  </details>

                  <details id="owner-issues" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Wat als er iets misgaat?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      TailTribe is een verbindingsplatform; de overeenkomst is tussen eigenaar en verzorger. 
                      Bespreek problemen eerst onderling. Indien nodig helpen we bemiddelen via de contactpagina.
                    </div>
                  </details>

                  <details id="owner-animals" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Welke soorten dieren kan ik laten verzorgen?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm space-y-1">
                      <p>Naast honden vind je ook verzorgers voor onder meer:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Katten</li>
                        <li>Konijnen</li>
                        <li>Reptielen</li>
                        <li>Paarden</li>
                        <li>Kleinvee (boerderijdieren)</li>
                      </ul>
                    </div>
                  </details>

                  <details id="owner-meet-greet" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Moet ik eerst een kennismaking doen?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Aan te raden: plan een korte meet &amp; greet om verwachtingen af te stemmen, je huisdier voor te stellen en praktische afspraken te maken.
                    </div>
                  </details>

                  <details id="owner-recurring-walks" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Kan ik terugkerende wandelingen plannen?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Ja. Spreek een vast schema af (dagen/uren) met de verzorger en bevestig dit in de chat.
                    </div>
                  </details>

                  <details id="owner-cancellation-policy" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Wat is jullie annuleringsbeleid?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Volledige terugbetaling wanneer het baasje tot 1 dag vóór aanvang annuleert én vóór 12:00 uur ’s middags.</li>
                        <li>Indien later (maar vóór aanvang): 50% terugbetaling.</li>
                        <li>Annuleren tijdens de reservatieperiode: geen terugbetaling.</li>
                      </ul>
                    </div>
                  </details>

                  <details id="owner-offleash" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Mag mijn hond loslopen?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Alleen waar het wettelijk mag en als de verzorger het veilig acht. Volg lokale regels strikt.
                    </div>
                  </details>

                  <details id="owner-weather" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Wat bij hitte/kou/extreem weer?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Activiteit inkorten, tijdstip aanpassen of annuleren in overleg; dierenwelzijn eerst.
                    </div>
                  </details>

                  <details id="owner-emergency" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Noodgevallen / dierenarts?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Spreek vooraf een noodprocedure af (toestemming en voorkeurspraktijk).
                    </div>
                  </details>

                  <details id="owner-keys" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Hoe regel je sleuteloverdracht?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Bij voorkeur persoonlijk of via sleutelkluis; deel nooit je adres in platte tekst in de chat. Op aanvraag kan een sleutelcontract tussen beide partijen worden getekend.
                    </div>
                  </details>

                  <details id="owner-privacy" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Wat doet TailTribe met mijn gegevens?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Enkel voor matching en platformfunctionaliteit. Je kunt je account laten verwijderen via de privacy-instellingen of support.
                    </div>
                  </details>

                  <details id="owner-report" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Hoe meld ik een probleem of gebruiker?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Via het meldformulier of support op de contactpagina.
                    </div>
                  </details>

                  <details id="owner-agreement" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Sluit ik een overeenkomst met TailTribe of met de verzorger?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      TailTribe is een verbindingsplatform. De overeenkomst komt rechtstreeks tot stand tussen de huisdiereigenaar en de verzorger. TailTribe faciliteert het contact en biedt een veilige omgeving om afspraken te maken.
                    </div>
                  </details>

                  <details id="owner-complaints" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Hoe kan ik een klacht of probleem melden?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm space-y-1">
                      <p>Je kan een probleem of klacht melden via het contactformulier of via <a href="mailto:steven@tailtribe.be" className="text-emerald-700 hover:underline">steven@tailtribe.be</a>.</p>
                      <p>We behandelen elke melding binnen 5 werkdagen en proberen steeds een oplossing of bemiddeling aan te bieden.</p>
                    </div>
                  </details>


                  <details id="owner-payment-safety" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Zijn mijn betalingen via TailTribe veilig?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm space-y-1">
                      <p>Ja. Alle betalingen gebeuren via een beveiligde SSL-verbinding en worden verwerkt door Stripe, een internationaal erkende betaalprovider.</p>
                      <p>TailTribe slaat geen betaalgegevens op. Het volledige proces voldoet aan de strengste veiligheidsnormen (PCI DSS).</p>
                    </div>
                  </details>

                  <details id="owner-caregiver-cancels" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Wat gebeurt er als mijn verzorger annuleert?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm space-y-1">
                      <p>Je ontvangt onmiddellijk een melding via e-mail of in je TailTribe-profiel.</p>
                      <p>Het volledige bedrag van je boeking wordt automatisch terugbetaald. Zodra de annulering bevestigd is, wordt de terugbetaling verwerkt via Stripe.</p>
                      <p>Afhankelijk van je bank kan het 3–5 werkdagen duren voordat het bedrag zichtbaar is op je rekening.</p>
                    </div>
                  </details>

                  <details id="owner-caregiver-frequent-cancellations" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Wat als een verzorger vaak annuleert?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      TailTribe houdt annuleringen per verzorger bij. Wanneer iemand herhaaldelijk (laattijdig) annuleert, kan het account tijdelijk worden beperkt of verwijderd. Zo blijven afspraken betrouwbaar voor alle partijen.
                    </div>
                  </details>

                  <details id="owner-book" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Hoe boek ik een verzorger?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Ga naar Zoek verzorgers, filter op stad en service, open het profiel en klik Boek nu.
                    </div>
                  </details>
                  <details id="owner-cancel" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Hoe kan ik mijn boeking annuleren of wijzigen?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Ga naar Dashboard → Boekingen. Kies de boeking en gebruik Annuleren of Wijzigen.
                    </div>
                  </details>
                  <details id="owner-payments" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Hoe werken betalingen en facturen?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Alle betalingen verlopen via Stripe. Facturen staan in Inkomsten & Uitbetalingen.
                    </div>
                  </details>
                  <details id="owner-services" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Hoe kies ik de juiste service (oppas, uitlaat, training)?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Gebruik de servicefilters op de zoekpagina. Bekijk beschrijvingen en tarieven per profiel.
                    </div>
                  </details>
                  <details id="owner-availability" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Hoe werkt beschikbaarheid en kalenders?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Je ziet aangeboden tijdsloten per verzorger. Beschikbaarheid wordt door hen beheerd.
                    </div>
                  </details>
                  <details id="owner-messages" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Waar vind ik mijn berichten en afspraken?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Dashboard → Berichten voor chat, Dashboard → Boekingen voor afspraken.
                    </div>
                  </details>
                </div>
              </div>
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Voor verzorgers (caregivers)</h2>
                <div className="space-y-3">

                  <details id="caregiver-how-to-start" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Hoe begin ik?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm space-y-1">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Maak een gratis profiel aan.</li>
                        <li>Voeg een profielfoto, beschrijving en je diensten toe.</li>
                        <li>Bepaal zelf je tarieven.</li>
                        <li>Word zichtbaar in zoekresultaten voor eigenaars in je buurt.</li>
                      </ul>
                    </div>
                  </details>

                  <details id="caregiver-earnings" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Verdien ik geld via TailTribe?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Ja. Jij bepaalt je eigen prijzen en ontvangt betalingen via het platform. TailTribe neemt enkel een commissie via de transactie.
                    </div>
                  </details>

                  <details id="caregiver-platform-fee" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Moet ik betalen om TailTribe te gebruiken?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Nee, je betaalt niets op voorhand. TailTribe neemt enkel een commissie op transacties die via het platform doorgaan.
                    </div>
                  </details>

                  <details id="caregiver-legal" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Moet ik een zelfstandige zijn?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Nee, je moet geen zelfstandige zijn in hoofd of bijberoep, dit kan wel. Je kan dit dus ook als bijverdienste doen, maar je bent zelf verantwoordelijk voor het aangeven van je inkomsten. Raadpleeg bij twijfel een belastingadviseur.
                    </div>
                  </details>

                  <details id="caregiver-trust" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Hoe bouw ik vertrouwen op?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm space-y-1">
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Gebruik je echte naam en een duidelijke profielfoto.</li>
                        <li>Vul je profiel volledig aan (ervaring, diensten, foto’s).</li>
                        <li>Reageer snel en professioneel op berichten.</li>
                        <li>Verzamel beoordelingen van eigenaars na elke opdracht.</li>
                      </ul>
                    </div>
                  </details>

                  <details id="caregiver-multiple-pets" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Kan ik meerdere dieren tegelijk verzorgen?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Ja, zolang je het overzicht behoudt en veiligheid vooropstelt. Bij hondenuitlaten is het belangrijk om enkel honden te combineren die sociaal zijn en goed samenlopen.
                    </div>
                  </details>

                  <details id="caregiver-earn-extra" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Hou je van dieren en wil je daar iets extra mee verdienen?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      TailTribe biedt je de kans om van je passie je bijverdienste te maken. Bepaal zelf je tarief en je beschikbaarheid, en kies de opdrachten die jou aanspreken. Meld je vandaag nog aan als verzorger. Je krijgt ondersteuning door dierenprofessionals die je helpen met je vragen.
                    </div>
                  </details>

                  <details id="caregiver-flex-hours" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Zou jij graag je eigen uren bepalen terwijl je met dieren werkt?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Bij TailTribe beslis jij zelf wanneer je werkt en welke dieren je verzorgt. Ideaal als flexibele bijverdienste naast studie, werk of pensioen — werk buiten en ga actief aan de slag met dieren in je omgeving.
                    </div>
                  </details>

                  <details id="caregiver-how-much" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Benieuwd hoeveel je kan bijverdienen in jouw buurt?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Maak een gratis profiel aan, stel je prijs in en zie meteen welke opdrachten in jouw omgeving beschikbaar zijn. Krijg ondersteuning en verdien bij met je passie voor dieren.
                    </div>
                  </details>

                  <details id="caregiver-owner-cancellation" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Wat is het annuleringsbeleid van de baasjes?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      <p className="mb-2">Wanneer een huisdiereigenaar een boeking annuleert, gelden de volgende regels:</p>
                      <ul className="list-disc pl-5 space-y-1">
                        <li>Tot 1 dag vóór aanvang en vóór 12:00 uur: volledige terugbetaling aan het baasje.</li>
                        <li>Later (maar vóór aanvang): 50% terugbetaling.</li>
                        <li>Tijdens de reservatieperiode: geen terugbetaling.</li>
                      </ul>
                    </div>
                  </details>

                  <details id="caregiver-payout-cancellation" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Hoe en wanneer ontvang ik mijn betaling bij een annulering?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm space-y-1">
                      <p>Wanneer een annulering recht geeft op een vergoeding (50% of 100%), wordt deze automatisch uitbetaald via Stripe. Je hoeft hiervoor niets te doen.</p>
                      <p>De uitbetaling volgt het normale uitbetalingsschema van TailTribe.</p>
                    </div>
                  </details>

                  <details id="caregiver-owner-frequent-cancellations" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Wat als een huisdiereigenaar vaak annuleert?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      TailTribe houdt alle annuleringen bij. Wanneer een eigenaar regelmatig laattijdig annuleert, kan het account van die gebruiker worden beperkt of tijdelijk geblokkeerd. Zo blijven afspraken betrouwbaar voor alle partijen.
                    </div>
                  </details>

                  <details id="caregiver-cancel-yourself" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Kan ik als verzorger zelf een boeking annuleren?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Als verzorger wordt verwacht dat je enkel boekingen aanvaardt die je effectief kunt uitvoeren. Een annulering kan enkel gebeuren via TailTribe Support.
                    </div>
                  </details>

                  <details id="caregiver-what-to-do-cancel" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Wat moet ik doen als ik een boeking moet annuleren?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm space-y-2">
                      <div>
                        <p className="font-medium">1) Verwittig het baasje onmiddellijk</p>
                        <ul className="list-disc pl-5">
                          <li>Geef eerlijk de reden van de annulering.</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium">2) Contacteer TailTribe Support</p>
                        <ul className="list-disc pl-5">
                          <li>Meld de annulering via het contactformulier of via <a href="mailto:steven@tailtribe.be" className="text-emerald-700 hover:underline">steven@tailtribe.be</a> met vermelding van de reden.</li>
                        </ul>
                      </div>
                      <div>
                        <p className="font-medium">3) Help eventueel met een oplossing</p>
                        <ul className="list-disc pl-5">
                          <li>Ken je iemand die kan overnemen? Stel dit gerust voor. TailTribe helpt mee om een vervanger te vinden.</li>
                        </ul>
                      </div>
                    </div>
                  </details>

                  <details id="caregiver-multiple-cancellations" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Meerdere annuleringen: wat zijn de gevolgen?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      We volgen annuleringen op per verzorger. Wanneer iemand herhaaldelijk annuleert, kan het account tijdelijk worden beperkt of verwijderd. Zo blijven enkel de meest betrouwbare verzorgers actief op het platform.
                    </div>
                  </details>

                  <details id="caregiver-profile" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Hoe maak ik mijn profiel en services aan?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Ga na registratie naar Profiel bewerken. Kies je services en voeg foto’s toe.
                    </div>
                  </details>
                  <details id="caregiver-availability" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Hoe stel ik mijn beschikbaarheid en bloktijden in?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Ga naar Beschikbaarheid. Voeg weekschema’s en uitzonderingen toe.
                    </div>
                  </details>
                  <details id="caregiver-payments" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Hoe ontvang ik betalingen (Stripe) en bekijk ik inkomsten?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Koppel Stripe via Inkomsten & Uitbetalingen. Bekijk betaalgeschiedenis en facturen daar.
                    </div>
                  </details>
                  <details id="caregiver-messages" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Hoe werk ik met berichten en boekingsverzoeken?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Reageer snel via Berichten. Bevestig of weiger aanvragen vanuit de chat of boekingen.
                    </div>
                  </details>
                  <details id="caregiver-masking" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Mag ik contactgegevens delen in chat of bio?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Nee, contactgegevens worden gemaskeerd. Communiceer en boek altijd via het platform.
                    </div>
                  </details>
                  <details id="caregiver-report" className="group border rounded-lg p-4">
                    <summary className="cursor-pointer font-medium text-gray-900 flex items-center justify-between">
                      Hoe rapporteer ik een review of gebruiker?
                      <span className="text-gray-400 group-open:rotate-180 transition-transform">⌄</span>
                    </summary>
                    <div className="mt-3 text-gray-700 text-sm">
                      Gebruik de knop Review rapporteren op het profiel of meld misbruik via Contact.
                    </div>
                  </details>
                </div>
              </div>
            </div>

            <div className="mt-8">
              <Link href="/contact" className="inline-flex items-center text-emerald-700 font-semibold hover:underline">
                Contact opnemen →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}


