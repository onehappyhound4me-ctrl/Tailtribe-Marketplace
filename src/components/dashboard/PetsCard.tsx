'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { getAnimalTypeLabel } from '@/lib/animal-types'

interface Pet {
  id: string
  name: string
  type: string
  breed: string | null
  gender: string | null
  age: number | null
  weight: number | null
  spayedNeutered: boolean
  medicalInfo: string | null
  socialWithPets: boolean
  socialWithPeople: boolean
  character: string | null
}

export function PetsCard() {
  const { data: session } = useSession()
  const [pets, setPets] = useState<Pet[]>([])
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

  if (loading) {
    return (
      <div className="backdrop-blur-xl bg-gradient-to-br from-white/25 via-green-50/25 to-emerald-50/25 border border-white/40 rounded-lg p-5 shadow-lg flex flex-col h-[160px]">
        <div className="animate-pulse space-y-2 flex-1">
          <div className="w-9 h-9 bg-gray-300 rounded-lg"></div>
          <div className="h-4 bg-gray-300 rounded w-2/3"></div>
        </div>
        <div className="h-8 bg-gray-200 rounded"></div>
      </div>
    )
  }

  const genderLabels: Record<string, string> = {
    'MALE': '♂️ Mannelijk',
    'FEMALE': '♀️ Vrouwelijk'
  }

  return (
    <div className="backdrop-blur-xl bg-gradient-to-br from-white/25 via-green-50/25 to-emerald-50/25 border border-white/40 rounded-lg p-5 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-[160px]">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="w-9 h-9 bg-gradient-to-br from-green-500 to-emerald-600 rounded-lg flex items-center justify-center shadow-md flex-shrink-0">
          <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
        </div>
        <h3 className="text-base font-bold text-gray-900">Huisdieren</h3>
      </div>
      
      {pets.length === 0 ? (
        <div className="text-xs text-gray-600 mb-3 max-h-[50px]">
          <p>Geen huisdieren</p>
        </div>
      ) : (
        <div className="space-y-1 mb-3 max-h-[50px] overflow-hidden">
          {pets.slice(0, 2).map((pet) => (
            <div key={pet.id} className="bg-white/70 rounded p-1.5 border border-green-200/50">
              <p className="font-semibold text-gray-900 text-xs truncate">{pet.name} • {getAnimalTypeLabel(pet.type)}</p>
              <p className="text-xs text-gray-600 truncate">{pet.character || pet.breed || 'Geen beschrijving'}</p>
            </div>
          ))}
          {pets.length > 2 && (
            <p className="text-xs text-gray-500 pl-1.5">+{pets.length - 2} meer</p>
          )}
        </div>
      )}
      
      <Link 
        href="/pets" 
        className="w-full mt-auto bg-emerald-600 hover:bg-emerald-700 text-white transition-all duration-200 rounded-lg py-2 text-sm font-semibold block text-center"
      >
        {pets.length === 0 ? 'Voeg toe' : 'Beheer'}
      </Link>
    </div>
  )
}

