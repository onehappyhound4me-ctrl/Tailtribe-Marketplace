import Link from 'next/link'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

export default function ThankYouPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/boeken" primaryCtaLabel="Nieuwe aanvraag" />
      <div className="px-4 py-10 sm:py-12">
        <div className="mx-auto max-w-2xl">
          <div className="bg-white rounded-2xl shadow-tt-lg p-6 sm:p-10 text-center">
            <div className="mx-auto h-14 w-14 rounded-full bg-emerald-600 text-white flex items-center justify-center shadow-sm">
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" className="h-7 w-7 fill-current">
                <path
                  fillRule="evenodd"
                  d="M16.704 5.29a1 1 0 0 1 .006 1.414l-7.5 7.56a1 1 0 0 1-1.425.002L3.29 9.77A1 1 0 1 1 4.704 8.35l3.08 3.08 6.79-6.84a1 1 0 0 1 1.414-.006Z"
                  clipRule="evenodd"
                />
              </svg>
            </div>

            <h1 className="mt-5 text-3xl sm:text-4xl font-bold text-gray-900 tracking-[-0.01em]">
              Aanvraag ontvangen
            </h1>
            <p className="mt-3 text-base sm:text-lg text-gray-600 leading-relaxed">
              Bedankt. We hebben je aanvraag goed ontvangen en nemen zo snel mogelijk contact op om alles te bevestigen.
            </p>

            <div className="mt-6 rounded-2xl border border-emerald-200 bg-gradient-to-br from-emerald-50 to-blue-50 p-5 sm:p-6 text-left">
              <h2 className="text-base font-bold text-emerald-950">Wat gebeurt er nu?</h2>
              <ul className="mt-3 space-y-2 text-sm sm:text-base text-emerald-950/85">
                <li className="flex gap-2">
                  <span className="mt-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-white border border-emerald-200 text-emerald-700 flex-shrink-0">1</span>
                  <span>We bekijken je aanvraag en je voorkeuren.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-white border border-emerald-200 text-emerald-700 flex-shrink-0">2</span>
                  <span>We zoeken een passende verzorger in jouw buurt.</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-white border border-emerald-200 text-emerald-700 flex-shrink-0">3</span>
                  <span>Je krijgt een update via e-mail en/of telefoon (volgens jouw voorkeur).</span>
                </li>
                <li className="flex gap-2">
                  <span className="mt-0.5 h-5 w-5 flex items-center justify-center rounded-full bg-white border border-emerald-200 text-emerald-700 flex-shrink-0">4</span>
                  <span>We stemmen de details af (prijs, timing, locatie, routine).</span>
                </li>
              </ul>
            </div>

            <div className="mt-6 rounded-2xl border border-gray-200 bg-gray-50 p-5 sm:p-6 text-left">
              <div className="text-sm font-bold text-gray-900">Tip</div>
              <p className="mt-2 text-sm sm:text-base text-gray-600 leading-relaxed">
                Kijk ook even in je spam/ongewenste e-mail. Geen bericht binnen een redelijke tijd? Neem gerust contact op via{' '}
                <Link href="/contact" className="text-emerald-700 hover:underline font-semibold">
                  contact
                </Link>
                .
              </p>
            </div>

            <div className="mt-7 flex flex-col sm:flex-row gap-3 justify-center">
              <Link href="/boeken" className="btn-brand">
                Nieuwe aanvraag
              </Link>
              <Link href="/diensten" className="inline-flex items-center justify-center px-5 py-3 rounded-xl border border-gray-300 bg-white font-semibold text-gray-900 hover:bg-gray-50">
                Bekijk diensten
              </Link>
            </div>
          </div>
        </div>
      </div>
      <SiteFooter />
    </div>
  )
}

