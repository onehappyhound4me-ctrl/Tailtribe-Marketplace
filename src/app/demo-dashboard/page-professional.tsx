import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

interface Props {
  searchParams: {
    role?: string
  }
}

export default function ProfessionalDashboardPage({ searchParams }: Props) {
  const role = searchParams.role || 'owner'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-gray-50 to-stone-100 relative overflow-hidden">
      {/* Subtle Professional Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-emerald-100/30 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute top-40 right-40 w-80 h-80 bg-slate-200/20 rounded-full mix-blend-multiply filter blur-3xl"></div>
        <div className="absolute bottom-40 left-60 w-72 h-72 bg-teal-100/25 rounded-full mix-blend-multiply filter blur-3xl"></div>
      </div>

      {/* Corporate Header */}
      <header className="relative backdrop-blur-xl bg-white/40 border-b border-slate-200/50 shadow-lg">
        <nav className="container mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-8 h-8 bg-gradient-to-br from-emerald-600 to-teal-700 rounded-md flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-800">Management Portal</h1>
                <p className="text-xs text-slate-600">{role === 'owner' ? 'Client Dashboard' : 'Provider Dashboard'}</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Badge className="bg-slate-100/80 text-slate-700 border border-slate-300/50 backdrop-blur-sm px-3 py-1 text-xs font-medium">
                {role === 'owner' ? 'Huisdier Eigenaar' : 'Professionele Verzorger'}
              </Badge>
              <Link 
                href="/auth/signin" 
                className="text-slate-600 hover:text-slate-800 font-medium transition-all duration-300 bg-white/60 px-3 py-1.5 rounded-md backdrop-blur-sm text-sm"
              >
                Uitloggen
              </Link>
            </div>
          </div>
        </nav>
      </header>

      <div className="relative container mx-auto px-8 py-10">
        {/* Executive Summary */}
        <div className="mb-12">
          <div className="backdrop-blur-xl bg-white/30 border border-slate-200/40 rounded-xl p-8 shadow-xl">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-slate-800 mb-1">
                  {role === 'owner' ? '12' : '23'}
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  {role === 'owner' ? 'Actieve Boekingen' : 'Klanten Bediend'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-emerald-600 mb-1">4.9</div>
                <div className="text-sm text-slate-600 font-medium">Gemiddelde Rating</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600 mb-1">
                  {role === 'owner' ? '€1,234' : '€245'}
                </div>
                <div className="text-sm text-slate-600 font-medium">
                  {role === 'owner' ? 'Totaal Uitgegeven' : 'Maandelijkse Inkomsten'}
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600 mb-1">98%</div>
                <div className="text-sm text-slate-600 font-medium">Tevredenheidscore</div>
              </div>
            </div>
          </div>
        </div>

        {role === 'owner' ? (
          // Professional Client Dashboard
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group backdrop-blur-xl bg-white/25 border border-slate-200/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-slate-100/80 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <Badge className="bg-emerald-100/80 text-emerald-700 text-xs">2 Actief</Badge>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Pet Management</h3>
              <p className="text-slate-600 text-sm mb-4">Centraal beheer van huisdierenprofielen</p>
              <Link href="/pets" className="w-full bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
                Open Module
              </Link>
            </div>

            <div className="group backdrop-blur-xl bg-white/25 border border-slate-200/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-slate-100/80 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <Badge className="bg-blue-100/80 text-blue-700 text-xs">3 Komend</Badge>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Booking System</h3>
              <p className="text-slate-600 text-sm mb-4">Reserveringen en afspraken beheer</p>
              <Link href="/bookings" className="w-full bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
                Open Module
              </Link>
            </div>

            <div className="group backdrop-blur-xl bg-white/25 border border-slate-200/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-slate-100/80 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <Badge className="bg-purple-100/80 text-purple-700 text-xs">6 Beschikbaar</Badge>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Provider Search</h3>
              <p className="text-slate-600 text-sm mb-4">Zoek en vergelijk verzorgers</p>
              <Link href="/search" className="w-full bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
                Open Module
              </Link>
            </div>

            <div className="group backdrop-blur-xl bg-white/25 border border-slate-200/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-slate-100/80 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <Badge className="bg-teal-100/80 text-teal-700 text-xs">2 Nieuw</Badge>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Communication</h3>
              <p className="text-slate-600 text-sm mb-4">Berichten en notificaties</p>
              <Link href="/messages" className="w-full bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
                Open Module
              </Link>
            </div>

            <div className="group backdrop-blur-xl bg-white/25 border border-slate-200/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-slate-100/80 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                  </svg>
                </div>
                <Badge className="bg-yellow-100/80 text-yellow-700 text-xs">4.9 ★</Badge>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Review System</h3>
              <p className="text-slate-600 text-sm mb-4">Beoordelingen en feedback</p>
              <Link href="/reviews" className="w-full bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
                Open Module
              </Link>
            </div>

            <div className="group backdrop-blur-xl bg-white/25 border border-slate-200/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-slate-100/80 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <Badge className="bg-gray-100/80 text-gray-700 text-xs">Beveiligd</Badge>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Account Settings</h3>
              <p className="text-slate-600 text-sm mb-4">Privacy en configuratie</p>
              <Link href="/settings" className="w-full bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
                Open Module
              </Link>
            </div>
          </div>
        ) : (
          // Professional Provider Dashboard
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="group backdrop-blur-xl bg-white/25 border border-slate-200/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-slate-100/80 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <Badge className="bg-emerald-100/80 text-emerald-700 text-xs">Geverifieerd</Badge>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Profile Management</h3>
              <p className="text-slate-600 text-sm mb-4">Professioneel profiel en diensten</p>
              <Link href="/profile/edit" className="w-full bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
                Open Module
              </Link>
            </div>

            <div className="group backdrop-blur-xl bg-white/25 border border-slate-200/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-slate-100/80 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                </div>
                <Badge className="bg-blue-100/80 text-blue-700 text-xs">3 Vandaag</Badge>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Schedule Manager</h3>
              <p className="text-slate-600 text-sm mb-4">Planning en afspraken overzicht</p>
              <Link href="/schedule" className="w-full bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
                Open Module
              </Link>
            </div>

            <div className="group backdrop-blur-xl bg-white/25 border border-slate-200/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-slate-100/80 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                </div>
                <Badge className="bg-green-100/80 text-green-700 text-xs">€245</Badge>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Revenue Analytics</h3>
              <p className="text-slate-600 text-sm mb-4">Inkomsten en uitbetalingen</p>
              <div className="w-full bg-slate-100/50 text-slate-700 rounded-lg py-2 text-sm font-medium text-center">
                +12% deze maand
              </div>
            </div>

            <div className="group backdrop-blur-xl bg-white/25 border border-slate-200/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-slate-100/80 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                </div>
                <Badge className="bg-teal-100/80 text-teal-700 text-xs">5 Nieuw</Badge>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Client Communication</h3>
              <p className="text-slate-600 text-sm mb-4">Berichten en ondersteuning</p>
              <Link href="/messages" className="w-full bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
                Open Module
              </Link>
            </div>

            <div className="group backdrop-blur-xl bg-white/25 border border-slate-200/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-slate-100/80 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <Badge className="bg-yellow-100/80 text-yellow-700 text-xs">4.8 ★</Badge>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">Performance Metrics</h3>
              <p className="text-slate-600 text-sm mb-4">KPI's en beoordelingen</p>
              <div className="w-full bg-slate-100/50 text-slate-700 rounded-lg py-2 text-sm font-medium text-center">
                23 reviews
              </div>
            </div>

            <div className="group backdrop-blur-xl bg-white/25 border border-slate-200/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 bg-slate-100/80 rounded-lg flex items-center justify-center">
                  <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                </div>
                <Badge className="bg-gray-100/80 text-gray-700 text-xs">Beveiligd</Badge>
              </div>
              <h3 className="text-lg font-semibold text-slate-800 mb-2">System Settings</h3>
              <p className="text-slate-600 text-sm mb-4">Configuratie en beveiliging</p>
              <Link href="/settings" className="w-full bg-slate-700 text-white hover:bg-slate-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center">
                Open Module
              </Link>
            </div>
          </div>
        )}

        {/* Professional Analytics Section */}
        <div className="mt-16">
          <h2 className="text-xl font-semibold text-slate-800 mb-6">Analytics Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="backdrop-blur-xl bg-white/25 border border-slate-200/40 rounded-lg p-4 text-center shadow-lg">
              <div className="text-lg font-bold text-slate-800 mb-1">12</div>
              <div className="text-xs text-slate-600 font-medium">Active Sessions</div>
            </div>
            <div className="backdrop-blur-xl bg-white/25 border border-slate-200/40 rounded-lg p-4 text-center shadow-lg">
              <div className="text-lg font-bold text-emerald-600 mb-1">4.9</div>
              <div className="text-xs text-slate-600 font-medium">Satisfaction Score</div>
            </div>
            <div className="backdrop-blur-xl bg-white/25 border border-slate-200/40 rounded-lg p-4 text-center shadow-lg">
              <div className="text-lg font-bold text-blue-600 mb-1">€1,234</div>
              <div className="text-xs text-slate-600 font-medium">Monthly Revenue</div>
            </div>
            <div className="backdrop-blur-xl bg-white/25 border border-slate-200/40 rounded-lg p-4 text-center shadow-lg">
              <div className="text-lg font-bold text-purple-600 mb-1">98%</div>
              <div className="text-xs text-slate-600 font-medium">Success Rate</div>
            </div>
          </div>
        </div>

        {/* System Status */}
        <div className="mt-12">
          <div className="backdrop-blur-xl bg-white/20 border border-slate-200/30 rounded-xl p-6 shadow-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                <span className="text-slate-700 font-medium">System Status: Operational</span>
              </div>
              <div className="text-sm text-slate-600">
                Last updated: {new Date().toLocaleTimeString('nl-NL')}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
