import type { Metadata } from 'next'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { CookiePreferencesButton } from '@/components/CookiePreferencesButton'

const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'https://tailtribe.be'
const canonicalUrl = `${baseUrl}/cookies`

export const metadata: Metadata = {
  title: 'Cookiebeleid',
  description: 'Informatie over cookies en vergelijkbare technologieën op TailTribe.',
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: 'Cookiebeleid',
    description: 'Informatie over cookies en vergelijkbare technologieën op TailTribe.',
    url: canonicalUrl,
    siteName: 'TailTribe',
    locale: 'nl_BE',
    type: 'website',
  },
}

export default function CookiesPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-tt p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Cookiebeleid</h1>
          <p className="text-gray-600 mb-6">Laatste update: september 2025</p>

          <div className="space-y-6 text-gray-800 leading-relaxed">
            <p>
              Dit cookiebeleid beschrijft het gebruik van cookies en vergelijkbare technologieën op TailTribe
              (tailtribe.be). We informeren je transparant over hoe en waarom we cookies gebruiken.
            </p>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">1. Wat zijn cookies?</h2>
              <p>
                Cookies zijn kleine tekstbestanden die door websites op je toestel worden geplaatst. Ze helpen om de
                website correct te laten functioneren en kunnen je gebruikerservaring verbeteren.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">2. Waarom gebruiken we cookies?</h2>
              <ul className="list-disc pl-5 space-y-1 mt-2">
                <li>de technische werking van de website te garanderen;</li>
                <li>veiligheid te verbeteren en misbruik te voorkomen;</li>
                <li>het gebruik van de website te analyseren om te verbeteren (waar van toepassing).</li>
              </ul>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">3. Soorten cookies</h2>
              <h3 className="font-medium mt-2">a) Essentiële cookies</h3>
              <p>Nodig voor basisfunctionaliteit en beveiliging. Hiervoor is geen toestemming vereist.</p>
              <h3 className="font-medium mt-2">b) Functionele cookies</h3>
              <p>Onthouden voorkeuren (bv. taal) indien aanwezig. Toestemming kan vereist zijn.</p>
              <h3 className="font-medium mt-2">c) Analytische cookies</h3>
              <p>
                Helpen ons begrijpen hoe de website gebruikt wordt. We schakelen deze cookies pas in nadat je akkoord
                gaf.
              </p>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">4. Beheer van cookies</h2>
              <p>
                Je kan cookies beheren of verwijderen via je browserinstellingen (Chrome, Safari, Edge, Firefox). Indien
                we niet-essentiële cookies gebruiken, zullen we dit vooraf melden en (waar nodig) om toestemming vragen.
              </p>
              <p className="mt-2">
                Je keuze wordt lokaal in je browser bewaard. Wil je je voorkeur wijzigen, dan kan je dit doen door je
                lokale opslag of cookies te verwijderen en de pagina opnieuw te laden.
              </p>
              <CookiePreferencesButton />
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 mb-2">5. Contact</h2>
              <div className="space-y-1">
                <p>Steven Van Gucht</p>
                <p>
                  E-mail:{' '}
                  <a href="mailto:steven@tailtribe.be" className="text-emerald-700 hover:underline">
                    steven@tailtribe.be
                  </a>
                </p>
                <p>Ondernemingsnummer: BE 0695.940.752</p>
              </div>
            </section>
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}



