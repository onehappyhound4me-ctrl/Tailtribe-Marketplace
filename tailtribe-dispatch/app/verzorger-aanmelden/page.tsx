'use client'

import Link from 'next/link'
import { useSession, signOut } from 'next-auth/react'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'
import { CaregiverApplicationForm } from '@/components/CaregiverApplicationForm'

export default function CaregiverApplyPage() {
  const { data: session, status } = useSession()

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
        <SiteHeader primaryCtaHref="/" primaryCtaLabel="Terug" />
        <main className="container mx-auto px-4 py-12 pb-28">
          <div className="max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl shadow-tt p-8 text-center text-gray-600">
              Laden...
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (status === 'authenticated' && session?.user?.role === 'OWNER') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
        <SiteHeader primaryCtaHref="/" primaryCtaLabel="Terug" />
        <main className="container mx-auto px-4 py-12 pb-28">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-tt p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Je bent ingelogd als eigenaar
              </h1>
              <p className="text-gray-600 mb-6">
                Om je als dierenverzorger aan te melden, moet je eerst uitloggen of een ander account gebruiken.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/verzorger-aanmelden' })}
                  className="btn-brand"
                >
                  Uitloggen
                </button>
                <Link
                  href="/dashboard/owner"
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Terug naar eigenaar dashboard
                </Link>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  if (status === 'authenticated' && session?.user?.role === 'CAREGIVER') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
        <SiteHeader primaryCtaHref="/" primaryCtaLabel="Terug" />
        <main className="container mx-auto px-4 py-12 pb-28">
          <div className="max-w-2xl mx-auto">
            <div className="bg-white rounded-2xl shadow-tt p-8 text-center">
              <h1 className="text-2xl font-bold text-gray-900 mb-3">
                Je hebt al een verzorgersaccount
              </h1>
              <p className="text-gray-600 mb-6">
                Je gegevens worden beheerd via je verzorgerdashboard. Ga naar je profiel om alles te bekijken of aan te passen.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link
                  href="/dashboard/caregiver/profile"
                  className="btn-brand"
                >
                  Ga naar verzorgerprofiel
                </Link>
                <button
                  type="button"
                  onClick={() => signOut({ callbackUrl: '/verzorger-aanmelden' })}
                  className="inline-flex items-center justify-center px-6 py-2.5 rounded-full border border-gray-200 text-gray-700 hover:bg-gray-50"
                >
                  Uitloggen
                </button>
              </div>
            </div>
          </div>
        </main>
        <SiteFooter />
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <SiteHeader primaryCtaHref="/" primaryCtaLabel="Terug" />

      <main className="container mx-auto px-4 py-12 pb-28">
        <div className="max-w-3xl mx-auto">
          <div className="mb-8 text-center">
            <h1 className="text-4xl font-bold text-gray-900 mb-3">Aanmelden als dierenverzorger</h1>
            <p className="text-gray-600">
              TailTribe werkt uitsluitend met zelfstandige dierenverzorgers (freelancers). Vul je gegevens in en selecteer
              de services die je aanbiedt. We nemen contact op voor de volgende stappen.
              <span className="block mt-2 text-gray-700">
                Extra voordeel: je werkt samen met ervaren dierenverzorgers, zodat je sneller en sterker kan starten.
              </span>
            </p>
          </div>

          <div className="bg-white rounded-2xl shadow-tt p-8">
            <CaregiverApplicationForm />
          </div>
        </div>
      </main>

      <SiteFooter />
    </div>
  )
}


