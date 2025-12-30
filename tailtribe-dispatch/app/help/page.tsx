import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

const faqs = [
  {
    q: 'Hoe snel nemen jullie contact op?',
    a: 'We nemen doorgaans binnen 2 uur contact op om je aanvraag te bevestigen en af te stemmen.',
  },
  {
    q: 'Moet ik online betalen?',
    a: 'Nee. Dit is een dispatch service: we spreken prijs en details af na contact.',
  },
  {
    q: 'Kan ik meerdere huisdieren aanmelden?',
    a: 'Ja. Zet extra info gerust in het veld “Extra info”.',
  },
]

export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Boek Nu" />

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-tt p-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">FAQ</h1>
          <div className="space-y-6">
            {faqs.map((f) => (
              <div key={f.q} className="border border-black/5 rounded-xl p-5">
                <h2 className="font-semibold text-gray-900 mb-2">{f.q}</h2>
                <p className="text-gray-700">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}



