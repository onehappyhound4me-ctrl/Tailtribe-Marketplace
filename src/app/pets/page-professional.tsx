import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DASHBOARD_ROOT } from '@/lib/routes'

export default function PetsPage() {
  const pets = [
    {
      id: 1,
      name: 'Max',
      type: 'Hond',
      breed: 'Golden Retriever',
      age: '3 jaar',
      status: 'Actief',
      nextAppointment: '25 Jan 2025, 14:00',
      lastCheckup: '15 Dec 2024'
    },
    {
      id: 2,
      name: 'Luna',
      type: 'Kat',
      breed: 'Ragdoll',
      age: '2 jaar',
      status: 'Actief',
      nextAppointment: '28 Jan 2025, 10:00',
      lastCheckup: '20 Dec 2024'
    }
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50 relative overflow-hidden">
      {/* Professional Background */}
      <div className="absolute inset-0">
        <div className="absolute top-20 left-20 w-96 h-96 bg-gradient-to-r from-emerald-200 to-teal-200 rounded-full mix-blend-multiply filter blur-3xl opacity-40"></div>
        <div className="absolute top-40 right-40 w-80 h-80 bg-gradient-to-r from-blue-200 to-purple-200 rounded-full mix-blend-multiply filter blur-3xl opacity-30"></div>
      </div>
      
      <div className="relative container mx-auto px-8 py-10">
        <div className="mb-12">
          <div className="backdrop-blur-xl bg-gradient-to-r from-white/30 via-emerald-50/30 to-teal-50/30 border border-white/40 rounded-xl p-8 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-gray-800 mb-2">Pet Management System</h1>
                <p className="text-gray-600">Centraal beheer van huisdierenprofielen en medische gegevens</p>
              </div>
              <a href={DASHBOARD_ROOT}>
                <Button variant="outline" className="bg-white/70 backdrop-blur-sm border-gray-300 hover:bg-white/90">
                  ← Dashboard
                </Button>
              </a>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pets.map(pet => (
            <div key={pet.id} className="backdrop-blur-xl bg-gradient-to-br from-white/25 via-blue-50/25 to-purple-50/25 border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <Badge className="bg-gradient-to-r from-emerald-100 to-teal-100 text-emerald-700 text-xs border-emerald-300/50">
                  {pet.status}
                </Badge>
              </div>
              
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-1">{pet.name}</h3>
                <p className="text-gray-600 text-sm">{pet.breed} • {pet.age}</p>
              </div>
              
              <div className="space-y-3 mb-6">
                <div className="backdrop-blur-sm bg-emerald-100/30 border border-emerald-200/50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-emerald-800">Volgende Afspraak</p>
                  <p className="text-emerald-700 font-semibold text-sm">{pet.nextAppointment}</p>
                </div>
                <div className="backdrop-blur-sm bg-blue-100/30 border border-blue-200/50 p-3 rounded-lg">
                  <p className="text-xs font-medium text-blue-800">Laatste Controle</p>
                  <p className="text-blue-700 font-semibold text-sm">{pet.lastCheckup}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <Link href="#" className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium text-center">
                  Bewerken
                </Link>
                <Link href="#" className="bg-white/70 text-gray-700 hover:bg-white/90 transition-all duration-300 rounded-lg py-2 text-sm font-medium text-center border border-gray-300">
                  Geschiedenis
                </Link>
              </div>
            </div>
          ))}
          
          {/* Add New Pet Card */}
          <div className="backdrop-blur-xl bg-gradient-to-br from-white/25 via-blue-50/25 to-purple-50/25 border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 border-dashed border-emerald-400/50">
            <div className="flex flex-col items-center justify-center h-full py-8">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-800 mb-2">Nieuw Huisdier</h3>
              <p className="text-gray-600 text-center mb-4 text-sm">Voeg een nieuw huisdier toe</p>
              <Link href="#" className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 transition-all duration-300 rounded-lg py-2 px-4 text-sm font-medium">
                Toevoegen
              </Link>
            </div>
          </div>
        </div>

        {/* System Overview */}
        <div className="mt-12">
          <div className="backdrop-blur-xl bg-gradient-to-r from-white/30 via-emerald-50/30 to-teal-50/30 border border-white/40 rounded-xl p-6 shadow-xl">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">System Overview</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-lg font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent mb-1">2</div>
                <div className="text-xs text-gray-600 font-medium">Registered Pets</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-1">3</div>
                <div className="text-xs text-gray-600 font-medium">Upcoming Appointments</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent mb-1">100%</div>
                <div className="text-xs text-gray-600 font-medium">Health Status</div>
              </div>
              <div className="text-center">
                <div className="text-lg font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-1">5</div>
                <div className="text-xs text-gray-600 font-medium">Care Providers</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
