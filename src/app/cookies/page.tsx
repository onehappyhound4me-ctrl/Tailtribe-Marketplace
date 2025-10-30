export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-10 max-w-3xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cookiebeleid TailTribe</h1>
        <p className="text-gray-600 mb-6">Laatste update: september 2025</p>
        <div className="bg-white rounded-2xl shadow p-6 md:p-8 space-y-6 text-gray-800 leading-relaxed">
          <p>
            Dit cookiebeleid beschrijft het gebruik van cookies en vergelijkbare technologieën op de website van TailTribe (www.tailtribe.be).
            TailTribe is een Belgisch online platform dat huisdiereigenaars en dierenverzorgers met elkaar verbindt. Wij hechten veel belang aan jouw
            privacy en informeren je transparant over hoe en waarom wij cookies gebruiken.
          </p>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Wat zijn cookies?</h2>
            <p>
              Cookies zijn kleine tekstbestanden die door websites op je computer, smartphone of tablet worden geplaatst. Ze bevatten informatie die bij
              een volgend bezoek kan worden uitgelezen om de website goed te laten functioneren of je gebruikerservaring te verbeteren. Er bestaan
              verschillende soorten cookies, afhankelijk van hun oorsprong, functie en bewaartermijn.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Waarom gebruikt TailTribe cookies?</h2>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>de technische werking van de website te garanderen;</li>
              <li>jouw voorkeuren (zoals taalkeuze of regio) te onthouden;</li>
              <li>het gebruik van de website te analyseren en verbeteren;</li>
              <li>marketingactiviteiten te meten en personaliseren (indien van toepassing).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Soorten cookies die worden gebruikt</h2>
            <h3 className="font-medium mt-2">a) Essentiële cookies</h3>
            <p>Deze cookies zijn noodzakelijk voor de basiswerking van de website. Voorbeelden: sessiecookies, authenticatiecookies, beveiligingscookies. Toestemming: niet vereist.</p>
            <h3 className="font-medium mt-2">b) Functionele cookies</h3>
            <p>Verbeteren de gebruikservaring door jouw instellingen of keuzes te onthouden (bv. taal). Toestemming: vereist.</p>
            <h3 className="font-medium mt-2">c) Analytische cookies</h3>
            <p>Verzamelen info over gebruik (bezochte pagina’s, klikgedrag) om de site te verbeteren; waar mogelijk geanonimiseerd. Toestemming: vereist.</p>
            <h3 className="font-medium mt-2">d) Marketingcookies</h3>
            <p>Volgen surfgedrag voor advertenties of campagnemeting (bv. Google/Meta). Toestemming: vereist.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Cookies van derden</h2>
            <p>Bepaalde cookies op onze website kunnen afkomstig zijn van derden, zoals:</p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Google Analytics (statistische analyse)</li>
              <li>Stripe (betalingsverwerking)</li>
              <li>Meta / Facebook Pixel (advertentiemeting, indien actief)</li>
            </ul>
            <p className="mt-2">Deze partijen kunnen hun cookies gebruiken om informatie te verzamelen buiten TailTribe om. Raadpleeg hun privacy- en cookiebeleid voor meer info.</p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Bewaartermijn van cookies</h2>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Sessiecookies: worden automatisch verwijderd zodra je de browser sluit.</li>
              <li>Permanente cookies: blijven op je toestel staan tot ze verlopen of handmatig worden verwijderd (max. 13 maanden).</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">6. Toestemming en beheer</h2>
            <p>
              Bij je eerste bezoek verschijnt een cookiebanner waarin je je voorkeuren kan instellen. Je kan je keuze op elk moment wijzigen of intrekken
              via de knop “Cookievoorkeuren aanpassen” onderaan de website. Daarnaast kan je cookies beheren of verwijderen via je browserinstellingen:
            </p>
            <ul className="list-disc pl-5 space-y-1 mt-2">
              <li>Google Chrome: Instellingen → Privacy en beveiliging → Cookies en andere sitegegevens</li>
              <li>Safari: Voorkeuren → Privacy</li>
              <li>Microsoft Edge / Firefox: Instellingen → Privacy & beveiliging → Cookies wissen</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">7. Wijzigingen in dit beleid</h2>
            <p>
              TailTribe behoudt zich het recht voor om dit cookiebeleid aan te passen. Wijzigingen worden steeds op deze pagina gepubliceerd met vermelding
              van de datum van de laatste update. Raadpleeg dit beleid regelmatig.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold text-gray-900 mb-2">8. Contact</h2>
            <div className="space-y-1">
              <p>TailTribe</p>
              <p>E‑mail: <a href="mailto:steven@tailtribe.be" className="text-emerald-700 hover:underline">steven@tailtribe.be</a></p>
              <p>Website: <a href="https://www.tailtribe.be" target="_blank" className="text-emerald-700 hover:underline">www.tailtribe.be</a></p>
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}


