'use client'

import Link from 'next/link'

export default function CaregiverDashboardPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 relative overflow-hidden">
      {/* Professional Gradient Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
        <div className="absolute top-40 right-40 w-80 h-80 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-40 left-60 w-72 h-72 bg-gradient-to-r from-teal-200 to-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-35"></div>
      </div>

      {/* Premium Pro Header */}
      <header className="relative border-b border-white/20">
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 via-teal-600 to-blue-600"></div>
        <div className="absolute inset-0 opacity-20" style={{backgroundImage:'radial-gradient(circle at 20% 20%, rgba(255,255,255,0.25) 0, transparent 35%), radial-gradient(circle at 80% 30%, rgba(255,255,255,0.2) 0, transparent 40%), radial-gradient(circle at 30% 80%, rgba(255,255,255,0.15) 0, transparent 35%)'}}></div>
        <nav className="relative container mx-auto px-8 py-8 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div>
                <div className="text-xs uppercase tracking-wider text-white/80">TailTribe</div>
                <h1 className="text-2xl md:text-3xl font-extrabold leading-tight">Verzorger Dashboard</h1>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden sm:inline text-white/85 text-sm">Welkom terug!</span>
              <Link href="/" className="px-4 py-2 rounded-lg bg-white/10 hover:bg-white/15 ring-1 ring-white/20 transition text-white text-sm">Home</Link>
            </div>
          </div>

          {/* Inline ZEKPIs */}
          <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 ring-1 ring-white/20">
              <div className="text-xs text-white/80">Klanten bediend</div>
              <div className="text-2xl font-bold">23</div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 ring-1 ring-white/20">
              <div className="text-xs text-white/80">Gemiddelde rating</div>
              <div className="text-2xl font-bold">4.9</div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 ring-1 ring-white/20">
              <div className="text-xs text-white/80">Totale inkomsten</div>
              <div className="text-2xl font-bold">€2,340</div>
            </div>
            <div className="rounded-xl bg-white/10 backdrop-blur-sm px-4 py-3 ring-1 ring-white/20">
              <div className="text-xs text-white/80">Tevredenheid</div>
              <div className="text-2xl font-bold">8</div>
            </div>
          </div>
        </nav>
      </header>

      <div className="relative container mx-auto px-8 py-10 pb-24">
        {/* Signup/Profile CTA */}
        <div className="mb-6">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-900 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <div className="text-sm">
              <span className="font-semibold">Nieuw op TailTribe?</span> Schrijf je in en maak je verzorgersprofiel aan om zichtbaar te worden in de zoekresultaten.
            </div>
            <div className="flex items-center gap-2">
              <Link href="/auth/register" className="px-3 py-2 rounded-lg bg-emerald-600 text-white hover:bg-emerald-700 text-sm">Inschrijven</Link>
              <Link href="/profile/edit?role=caregiver" className="px-3 py-2 rounded-lg bg-white text-emerald-700 ring-1 ring-emerald-200 hover:bg-emerald-100 text-sm">Profiel aanmaken</Link>
            </div>
          </div>
        </div>
        {/* Removed legacy summary card under header */}

        {/* Caregiver Dashboard Content */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Profiel beheren */}
          <div className="group backdrop-blur-xl bg-gradient-to-br from-white/25 via-emerald-50/25 to-teal-50/25 border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
              </div>
              <span className="bg-emerald-100/80 text-emerald-700 text-xs px-2 py-1 rounded-full">Actief</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Profiel beheren</h3>
            <p className="text-gray-600 text-sm mb-4">Werk je profielinformatie en services bij</p>
            <Link href="/profile/edit?role=caregiver" className="w-full mt-auto bg-gradient-to-r from-emerald-500 to-emerald-700 text-white hover:from-emerald-600 hover:to-emerald-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
              Bewerk profiel
            </Link>
          </div>

          {/* Beschikbaarheid */}
          <div className="group backdrop-blur-xl bg-gradient-to-br from-white/25 via-blue-50/25 to-purple-50/25 border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
              </div>
              <span className="bg-blue-100/80 text-blue-700 text-xs px-2 py-1 rounded-full">Up-to-date</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Beschikbaarheid</h3>
            <p className="text-gray-600 text-sm mb-4">Beheer je agenda en stel je beschikbare tijden in</p>
            <Link href="/schedule/availability" className="w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
              Beschikbaarheid
            </Link>
          </div>

          {/* Inkomsten */}
          <div className="group backdrop-blur-xl bg-gradient-to-br from-white/25 via-yellow-50/25 to-orange-50/25 border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-yellow-500 to-orange-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              </div>
              <span className="bg-yellow-100/80 text-yellow-700 text-xs px-2 py-1 rounded-full">Actueel</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Inkomsten</h3>
            <p className="text-gray-600 text-sm mb-4">Bekijk je verdiensten en betalingsgeschiedenis</p>
            <Link href="/settings/payment?role=caregiver" className="w-full mt-auto bg-gradient-to-r from-yellow-500 to-orange-700 text-white hover:from-yellow-600 hover:to-orange-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
              Bekijk inkomsten
            </Link>
          </div>

          {/* Berichten */}
          <div className="group backdrop-blur-xl bg-gradient-to-br from-white/25 via-purple-50/25 to-pink-50/25 border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <span className="bg-purple-100/80 text-purple-700 text-xs px-2 py-1 rounded-full">2 Nieuw</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Berichten</h3>
            <p className="text-gray-600 text-sm mb-4">Communiceer met huisdiereigenaren</p>
            <Link href="/messages?role=caregiver" className="w-full mt-auto bg-gradient-to-r from-purple-500 to-pink-700 text-white hover:from-purple-600 hover:to-pink-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
              Bekijk berichten
            </Link>
          </div>

          {/* Reviews */}
          <div className="group backdrop-blur-xl bg-gradient-to-br from-white/25 via-red-50/25 to-orange-50/25 border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-red-500 to-orange-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
                </svg>
              </div>
              <span className="bg-red-100/80 text-red-700 text-xs px-2 py-1 rounded-full">5 Nieuw</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Reviews</h3>
            <p className="text-gray-600 text-sm mb-4">Bekijk feedback van huisdiereigenaren</p>
            <Link href="/reviews?role=caregiver" className="w-full mt-auto bg-gradient-to-r from-red-500 to-orange-700 text-white hover:from-red-600 hover:to-orange-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
              Bekijk reviews
            </Link>
          </div>

          {/* Video Highlights */}
          <div className="group backdrop-blur-xl bg-gradient-to-br from-white/25 via-indigo-50/25 to-blue-50/25 border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-indigo-500 to-blue-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M3 5a2 2 0 012-2h9a2 2 0 012 2v2l3.553-2.132A1 1 0 0121 5.736v12.528a1 1 0 01-1.447.868L16 17v2a2 2 0 01-2 2H5a2 2 0 01-2-2V5z"/>
                </svg>
              </div>
              <span className="bg-indigo-100/80 text-indigo-700 text-xs px-2 py-1 rounded-full">SEO boost</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Video Highlights</h3>
            <p className="text-gray-600 text-sm mb-4">Voeg YouTube/Vimeo links toe (verlopen automatisch)</p>
            <Link href="/dashboard/caregiver/videos" className="w-full mt-auto bg-gradient-to-r from-indigo-500 to-blue-700 text-white hover:from-indigo-600 hover:to-blue-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
              Beheer video's
            </Link>
          </div>

          {/* Instellingen */}
          <div className="group backdrop-blur-xl bg-gradient-to-br from-white/25 via-gray-50/25 to-slate-50/25 border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
            <div className="flex items-center justify-between mb-4">
              <div className="w-10 h-10 bg-gradient-to-br from-gray-500 to-slate-600 rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </div>
              <span className="bg-gray-100/80 text-gray-700 text-xs px-2 py-1 rounded-full">Beheer</span>
            </div>
            <h3 className="text-lg font-semibold text-gray-800 mb-2">Instellingen</h3>
            <p className="text-gray-600 text-sm mb-4">Beheer je account en voorkeuren</p>
            <Link href="/settings?role=caregiver" className="w-full mt-auto bg-gradient-to-r from-gray-500 to-slate-700 text-white hover:from-gray-600 hover:to-slate-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
              Bewerk instellingen
            </Link>
          </div>
        </div>

        {/* Footer simplified: removed redundant back button */}
      </div>
    </div>
  )
}
