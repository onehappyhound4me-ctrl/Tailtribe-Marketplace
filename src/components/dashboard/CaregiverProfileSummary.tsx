'use client'

import Link from 'next/link'

interface ProfileData {
  id: string
  city: string
  postalCode?: string
  bio?: string
  profilePhoto?: string | null
  services: string | string[] | null
  animalTypes: string | string[] | null
  customAnimalTypes?: string | null
  hourlyRate: number
  firstAid: boolean
  vatNumber?: string | null
  actionRadius?: number | null
  isApproved: boolean
}

interface Props {
  profile: ProfileData | null
  onUpdate?: () => void
}

const serviceLabels: Record<string, string> = {
  'DOG_WALKING': 'Hondenuitlaat',
  'GROUP_DOG_WALKING': 'Groepsuitlaat',
  'DOG_TRAINING': 'Hondentraining',
  'PET_SITTING': 'Dierenoppas',
  'PET_BOARDING': 'Dierenopvang',
  'HOME_CARE': 'Verzorging aan huis',
  'PET_TRANSPORT': 'Transport huisdieren',
  'SMALL_ANIMAL_CARE': 'Verzorging kleinvee',
  'EVENT_COMPANION': 'Begeleiding events'
}

const animalTypeLabels: Record<string, string> = {
  'DOG': 'Honden',
  'CAT': 'Katten',
  'RABBIT': 'Konijnen',
  'SMALL_ANIMAL': 'Kleine dieren',
  'BIRD': 'Vogels',
  'OTHER': 'Andere'
}

export function CaregiverProfileSummary({ profile, onUpdate }: Props) {
  
  // Helper to safely parse arrays
  const parseArray = (value: string | string[] | null | undefined): string[] => {
    if (!value) return []
    if (Array.isArray(value)) return value
    try {
      const parsed = JSON.parse(value)
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  if (!profile) {
    return (
      <div className="backdrop-blur-xl bg-gradient-to-br from-white/25 via-emerald-50/25 to-teal-50/25 border border-white/40 rounded-xl p-6 shadow-lg h-[200px] flex items-center justify-center">
        <div className="text-center">
          <p className="text-gray-500 text-sm mb-3">Geen profiel gevonden</p>
          <Link 
            href="/settings/caregiver" 
            className="inline-block bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-emerald-700 transition-colors"
          >
            Profiel Aanmaken
          </Link>
        </div>
      </div>
    )
  }

  const services = parseArray(profile.services)
  const animalTypes = parseArray(profile.animalTypes)

  return (
    <div className="group backdrop-blur-xl bg-gradient-to-br from-white/25 via-emerald-50/25 to-teal-50/25 border border-white/40 rounded-xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col h-[200px]">
      {/* Header - Same as other modules */}
      <div className="flex items-center justify-between mb-4 min-h-[40px]">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
          {profile.profilePhoto ? (
            <img 
              src={profile.profilePhoto} 
              alt="Profiel" 
              className="w-full h-full object-cover rounded-lg"
            />
          ) : (
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          )}
        </div>
        <span className="bg-emerald-100/80 text-emerald-700 text-xs px-2 py-1 rounded-full">
          {profile.isApproved ? '✓ Geverifieerd' : '⏳ In behandeling'}
        </span>
      </div>

      {/* Title */}
      <h3 className="text-xl font-bold text-gray-900 mb-2">Profiel Instellingen</h3>
      
      {/* Description */}
      <p className="text-gray-600 text-sm mb-4">
        {profile.city}{profile.postalCode && `, ${profile.postalCode}`} • €{profile.hourlyRate}/uur
      </p>

      {/* Content - Compact info */}
      <div className="flex-1 overflow-hidden space-y-1.5">
        {/* Services */}
        {services.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {services.slice(0, 2).map((s) => (
              <span key={s} className="bg-emerald-100 text-emerald-700 text-xs px-2 py-0.5 rounded">
                {serviceLabels[s] || s}
              </span>
            ))}
            {services.length > 2 && (
              <span className="text-xs text-gray-500">+{services.length - 2}</span>
            )}
          </div>
        )}

        {/* Animal Types */}
        {animalTypes.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {animalTypes.slice(0, 1).map((t) => (
              <span key={t} className="bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded">
                {animalTypeLabels[t] || t}
              </span>
            ))}
            {animalTypes.length > 1 && (
              <span className="text-xs text-gray-500">+{animalTypes.length - 1}</span>
            )}
          </div>
        )}

        {/* Badges */}
        <div className="flex flex-wrap gap-1">
          {profile.firstAid && <span className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded">🩹 EHBO</span>}
          {profile.vatNumber && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">🏢</span>}
          {profile.actionRadius && <span className="text-xs bg-teal-100 text-teal-700 px-2 py-0.5 rounded">{profile.actionRadius}km</span>}
        </div>
      </div>

      {/* Footer - Single button */}
      <div className="mt-auto">
        <Link 
          href="/settings/caregiver" 
          className="w-full bg-gradient-to-r from-emerald-500 to-teal-700 text-white hover:from-emerald-600 hover:to-teal-800 transition-all duration-300 rounded-lg py-2 text-sm font-medium block text-center"
        >
          Bewerk Profiel
        </Link>
      </div>
    </div>
  )
}
