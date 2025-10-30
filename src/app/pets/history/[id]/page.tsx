import Link from 'next/link'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
// Removed DASHBOARD_ROOT import - using dynamic navigation

interface Props {
  params: {
    id: string
  }
  searchParams: {
    role?: string
  }
}

export default function PetHistoryPage({ params, searchParams }: Props) {
  const role = searchParams.role || 'owner'
  
  // TODO: Fetch real pet data from API
  const pet = {
    id: params.id,
    name: params.id === '1' ? 'Max' : 'Luna',
    type: params.id === '1' ? 'Hond' : 'Kat',
  }

  // TODO: Fetch real booking/care history from API
  // This would query Booking table for all bookings with this pet
  const history = [
    {
      id: 1,
      date: '2025-01-15',
      type: 'Booking',
      service: 'Hondenuitlaat',
      caregiver: 'Emma Willems',
      caregiverId: 1,
      duration: '1 uur',
      status: 'Voltooid',
      notes: 'Max heeft genoten van de wandeling in het park. Zeer gehoorzaam.',
      rating: 5
    },
    {
      id: 2,
      date: '2025-01-10',
      type: 'Medical',
      service: 'Dierenarts Bezoek',
      caregiver: 'Dr. Van Der Berg',
      caregiverId: 2,
      duration: '30 min',
      status: 'Voltooid',
      notes: 'Jaarlijkse controle. Alles in orde. Vaccinaties bijgewerkt.',
      rating: null
    },
    {
      id: 3,
      date: '2025-01-05',
      type: 'Booking',
      service: 'Hondentraining',
      caregiver: 'Sarah De Vries',
      duration: '45 min',
      status: 'Voltooid',
      notes: 'Geweldige vooruitgang met basis commando\'s. Max leert snel!',
      rating: 5
    },
    {
      id: 4,
      date: '2024-12-28',
      type: 'Booking',
      service: 'Dierenoppas',
      caregiver: 'Tom Janssen',
      duration: '8 uur',
      status: 'Voltooid',
      notes: 'Max was rustig en goed verzorgd tijdens onze afwezigheid.',
      rating: 4
    },
    {
      id: 5,
      date: '2024-12-20',
      type: 'Medical',
      service: 'Tandverzorging',
      caregiver: 'Dr. Van Der Berg',
      duration: '45 min',
      status: 'Voltooid',
      notes: 'Tandreinigingsbehandeling uitgevoerd. Gebit ziet er goed uit.',
      rating: null
    }
  ]

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'Booking':
        return 'bg-emerald-100 text-emerald-800'
      case 'Medical':
        return 'bg-blue-100 text-blue-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Voltooid':
        return 'bg-green-100 text-green-800'
      case 'Gepland':
        return 'bg-yellow-100 text-yellow-800'
      case 'Geannuleerd':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-gray-100 text-gray-800'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 relative overflow-hidden">
      {/* Professional Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
        <div className="absolute top-40 right-40 w-80 h-80 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
        <div className="absolute bottom-40 left-60 w-72 h-72 bg-gradient-to-r from-teal-200 to-emerald-200 rounded-full mix-blend-multiply filter blur-3xl opacity-35"></div>
      </div>

      {/* Header */}
      <header className="relative backdrop-blur-xl bg-gradient-to-r from-emerald-500/20 via-teal-500/20 to-blue-500/20 border-b border-white/30 shadow-lg">
        <nav className="container mx-auto px-8 py-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm">
                <a href={role === 'caregiver' ? '/dashboard/caregiver' : '/dashboard/owner'} className="flex items-center space-x-1 text-gray-600 hover:text-gray-800 transition-colors">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 7v10a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2H5a2 2 0 00-2-2z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5a2 2 0 012-2h4a2 2 0 012 2v3H8V5z" />
                  </svg>
                  <span>Homepage</span>
                </a>
                <span className="text-gray-400">/</span>
                <Link href={`/pets?role=${role}`} className="text-gray-600 hover:text-gray-800 transition-colors">
                  Huisdieren
                </Link>
                <span className="text-gray-400">/</span>
                <span className="text-gray-800 font-medium">📜 Geschiedenis</span>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <Button className="bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg text-sm px-4 py-2" asChild>
                <a href="/dashboard/owner">Dashboard</a>
              </Button>
              <span className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-800 border border-emerald-300/50 backdrop-blur-sm px-3 py-1 text-xs font-medium rounded-full">
                Geschiedenis
              </span>
            </div>
          </div>
        </nav>
      </header>

      <div className="relative container mx-auto px-8 py-10 pb-24">
        {/* Page Header */}
        <div className="mb-12">
          <div className="backdrop-blur-xl bg-gradient-to-r from-white/30 via-emerald-50/30 to-teal-50/30 border border-white/40 rounded-xl p-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-2">
                  {pet.name} - Geschiedenis
                </h1>
                <p className="text-gray-600">Alle activiteiten en verzorging van jouw {pet.type.toLowerCase()}</p>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                  {history.length}
                </div>
                <div className="text-sm text-gray-600">Activiteiten</div>
              </div>
            </div>
          </div>
        </div>

        {/* History Timeline */}
        <div className="space-y-6">
          {history.map((item, index) => (
            <div key={item.id} className="backdrop-blur-xl bg-gradient-to-br from-white/25 via-blue-50/25 to-purple-50/25 border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 relative">
              {/* Timeline Line */}
              {index < history.length - 1 && (
                <div className="absolute left-8 top-16 w-0.5 h-20 bg-gradient-to-b from-emerald-300 to-teal-300"></div>
              )}
              
              {/* Timeline Dot */}
              <div className="absolute left-6 top-6 w-4 h-4 bg-gradient-to-r from-emerald-500 to-teal-600 rounded-full border-2 border-white shadow-md"></div>
              
              <div className="ml-12">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Badge className={getTypeColor(item.type)}>
                      {item.type === 'Booking' ? '📅' : '🏥'} {item.type}
                    </Badge>
                    <Badge className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                    {item.rating && (
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <span key={i} className={`text-sm ${i < item.rating! ? 'text-yellow-500' : 'text-gray-300'}`}>
                            ⭐
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="text-right">
                    <div className="text-sm font-semibold text-gray-800">
                      {new Date(item.date).toLocaleDateString('nl-BE', {
                        day: 'numeric',
                        month: 'long',
                        year: 'numeric'
                      })}
                    </div>
                    <div className="text-xs text-gray-600">{item.duration}</div>
                  </div>
                </div>

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-800 mb-2">{item.service}</h3>
                  <p className="text-gray-600 mb-2">
                    <span className="font-medium">Verzorger:</span> {item.caregiver}
                  </p>
                  <p className="text-gray-700 text-sm leading-relaxed bg-white/30 rounded-lg p-3 border border-white/50">
                    {item.notes}
                  </p>
                </div>

                {item.type === 'Booking' && (
                  <div className="flex gap-3">
                    <Link 
                      href={`/booking/${item.id}`}
                      className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 transition-all duration-300 rounded-lg py-2 px-4 text-sm font-medium"
                    >
                      📋 Details bekijken
                    </Link>
                    <Link 
                      href={`/messages/new?caregiver=${item.caregiverId}`}
                      className="bg-white/70 text-gray-700 hover:bg-white/90 transition-all duration-300 rounded-lg py-2 px-4 text-sm font-medium border border-gray-300"
                    >
                      💬 Contact verzorger
                    </Link>
                    {item.status === 'Voltooid' && !item.rating && (
                      <Link 
                        href={`/reviews/write?booking=${item.id}`}
                        className="bg-gradient-to-r from-yellow-500 to-orange-500 text-white hover:from-yellow-600 hover:to-orange-600 transition-all duration-300 rounded-lg py-2 px-4 text-sm font-medium"
                      >
                        ⭐ Review schrijven
                      </Link>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Statistics */}
        <div className="mt-16">
          <div className="backdrop-blur-xl bg-gradient-to-r from-white/30 via-emerald-50/30 to-teal-50/30 border border-white/40 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">Statistieken</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">
                  {history.filter(h => h.type === 'Booking').length}
                </div>
                <div className="text-sm text-gray-600 font-medium">Boekingen</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">
                  {history.filter(h => h.type === 'Medical').length}
                </div>
                <div className="text-sm text-gray-600 font-medium">Medische Bezoeken</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-yellow-600 to-orange-600 bg-clip-text text-transparent mb-1">
                  {history.filter(h => h.rating).length > 0 ? 
                    (history.filter(h => h.rating).reduce((sum, h) => sum + h.rating!, 0) / history.filter(h => h.rating).length).toFixed(1) : 
                    'N/A'
                  }
                </div>
                <div className="text-sm text-gray-600 font-medium">Gem. Beoordeling</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">
                  {history.filter(h => h.status === 'Voltooid').length}
                </div>
                <div className="text-sm text-gray-600 font-medium">Voltooid</div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-12">
          <div className="backdrop-blur-xl bg-gradient-to-r from-white/25 via-emerald-50/25 to-teal-50/25 border border-white/40 rounded-xl p-6 shadow-lg">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Snelle Acties</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                href={`/pets/edit/${pet.id}`}
                className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 transition-all duration-300 rounded-lg py-3 px-4 text-center font-medium shadow-md hover:scale-105"
              >
                ✏️ Huisdier Bewerken
              </Link>
              <Link
                href="/search"
                className="bg-gradient-to-r from-blue-500 to-purple-600 text-white hover:from-blue-600 hover:to-purple-700 transition-all duration-300 rounded-lg py-3 px-4 text-center font-medium shadow-md hover:scale-105"
              >
                🔍 Nieuwe Verzorger
              </Link>
              <Link 
                href="/bookings"
                className="bg-gradient-to-r from-purple-500 to-pink-600 text-white hover:from-purple-600 hover:to-pink-700 transition-all duration-300 rounded-lg py-3 px-4 text-center font-medium shadow-md hover:scale-105"
              >
                📅 Alle Boekingen
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
