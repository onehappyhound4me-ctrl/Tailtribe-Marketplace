'use client'

import { SmartSearchLink } from '@/components/common/SmartSearchLink'

interface CaregiverHeaderProps {
  name: string
  city: string
}

export function CaregiverHeader({ name, city }: CaregiverHeaderProps) {
  return (
    <header className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">{name}</h1>
            <p className="text-gray-600">Dierenoppasser in {city}</p>
          </div>
          <SmartSearchLink className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all duration-200 rounded-lg font-semibold shadow-md hover:shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Terug naar Zoeken
          </SmartSearchLink>
        </div>
      </div>
    </header>
  )
}





































