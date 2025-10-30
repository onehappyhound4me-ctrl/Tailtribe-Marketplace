'use client'

import Link from 'next/link'
import { Suspense, useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { useSearchParams } from 'next/navigation'
import { useSession } from 'next-auth/react'

function PetsPageContent() {
  const searchParams = useSearchParams()
  const role = searchParams.get('role') || 'owner'
  const { data: session } = useSession()
  const [pets, setPets] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadPets()
  }, [])

  const loadPets = async () => {
    try {
      const res = await fetch('/api/pets/list')
      if (res.ok) {
        const data = await res.json()
        setPets(data.pets || [])
      }
    } catch (error) {
      console.error('Error loading pets:', error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Huisdieren</h1>
              <p className="text-gray-600">Beheer huisdierenprofielen en medische gegevens</p>
            </div>
            <Link href={session?.user?.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner'} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all duration-200 rounded-lg font-semibold shadow-md hover:shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>
      </header>
      
      <div className="container mx-auto px-8 py-8">

        {loading ? (
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
            <p className="text-gray-600 font-semibold">Huisdieren laden...</p>
          </div>
        ) : pets.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">Je hebt nog geen huisdieren toegevoegd.</p>
            <Link href="/pets/add" className="inline-block bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold">
              Voeg je eerste huisdier toe
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {pets.map(pet => (
              <div key={pet.id} className="backdrop-blur-xl bg-gradient-to-br from-white/25 via-blue-50/25 to-purple-50/25 border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-full">
                {/* Header */}
                <div className="flex items-center gap-3 mb-4">
                  {pet.photo ? (
                    <div className="w-12 h-12 rounded-lg overflow-hidden shadow-md flex-shrink-0">
                      <img 
                        src={pet.photo} 
                        alt={pet.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          // Fallback to icon if image fails to load
                          e.currentTarget.style.display = 'none'
                          const fallback = e.currentTarget.nextElementSibling as HTMLElement
                          if (fallback) fallback.style.display = 'flex'
                        }}
                      />
                      <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center" style={{display: 'none'}}>
                        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                        </svg>
                      </div>
                    </div>
                  ) : (
                    <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
                      <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-lg font-semibold text-gray-800 truncate">{pet.name}</h3>
                    <p className="text-gray-600 text-sm truncate">{pet.character || pet.breed || 'Geen beschrijving'}</p>
                  </div>
                </div>
                
                {/* Content */}
                <div className="flex-1 mb-4">
                  <div className="text-sm text-gray-600 space-y-3">
                    <div className="flex justify-between items-center min-h-[20px]">
                      <span className="font-medium text-gray-700">Ras:</span>
                      <span className="text-gray-600 text-right">{pet.breed || 'Niet opgegeven'}</span>
                    </div>
                    <div className="flex justify-between items-center min-h-[20px]">
                      <span className="font-medium text-gray-700">Leeftijd:</span>
                      <span className="text-gray-600 text-right">{pet.age ? `${pet.age} jaar` : 'Niet opgegeven'}</span>
                    </div>
                    <div className="flex justify-between items-center min-h-[20px]">
                      <span className="font-medium text-gray-700">Gewicht:</span>
                      <span className="text-gray-600 text-right">{pet.weight ? `${pet.weight} kg` : 'Niet opgegeven'}</span>
                    </div>
                    <div className="flex justify-between items-center min-h-[20px]">
                      <span className="font-medium text-gray-700">Geslacht:</span>
                      <span className="text-gray-600 text-right">{pet.gender === 'MALE' ? '♂️ Mannelijk' : pet.gender === 'FEMALE' ? '♀️ Vrouwelijk' : 'Niet opgegeven'}</span>
                    </div>
                    <div className="flex justify-between items-center min-h-[20px]">
                      <span className="font-medium text-gray-700">Medische info:</span>
                      <span className="text-gray-600 text-right text-xs">
                        {pet.medicalInfo ? 'Zie details' : 'Geen'}
                      </span>
                    </div>
                    {pet.medicalInfo && (
                      <div className="mt-2 p-2 bg-yellow-50 rounded border border-yellow-200">
                        <p className="text-xs text-yellow-700">{pet.medicalInfo}</p>
                      </div>
                    )}
                    <div className="space-y-2 mt-3">
                      <div className="flex items-center justify-between min-h-[24px]">
                        <span className="text-xs font-medium text-gray-600">Sociaal met dieren:</span>
                        <Badge variant={pet.socialWithPets ? "default" : "secondary"} className="text-xs min-w-[60px] h-[20px] flex items-center justify-center">
                          {pet.socialWithPets ? '✅ Ja' : '❌ Nee'}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between min-h-[24px]">
                        <span className="text-xs font-medium text-gray-600">Sociaal met mensen:</span>
                        <Badge variant={pet.socialWithPeople ? "default" : "secondary"} className="text-xs min-w-[60px] h-[20px] flex items-center justify-center">
                          {pet.socialWithPeople ? '✅ Ja' : '❌ Nee'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Button */}
                <Link href={`/pets/edit/${pet.id}`} className="block w-full bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 transition-all duration-300 rounded-lg py-2.5 text-sm font-semibold text-center shadow-md mt-auto">
                  Bewerken
                </Link>
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
              <Link href="/pets/add" className="bg-gradient-to-r from-blue-500 to-blue-700 text-white hover:from-blue-600 hover:to-blue-800 transition-all duration-300 rounded-lg py-2 px-4 text-sm font-medium">
                Toevoegen
              </Link>
            </div>
          </div>
          </div>
        )}

        {/* System Overview */}
        <div className="mt-16 mb-16">
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
export default function PetsPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Laden...</div>}>
      <PetsPageContent />
    </Suspense>
  )
}


