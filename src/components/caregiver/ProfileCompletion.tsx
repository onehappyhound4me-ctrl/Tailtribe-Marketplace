'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface ProfileData {
  bio: string | null
  city: string | null
  phone: string | null
  services: string | string[] | null  // Can be string (JSON) or array
  hourlyRate: number | null
  photos: string | string[] | null    // Can be string (JSON) or array
  certificates: string | string[] | null
  stripeAccountId: string | null
  stripeOnboarded: boolean
  isApproved: boolean
  profilePhoto?: string | null
  postalCode?: string | null
  actionRadius?: number | null
  maxAnimalsAtOnce?: number | null
  animalTypes?: string | string[] | null
  customAnimalTypes?: string | null
}

export function ProfileCompletion({ profile }: { profile: ProfileData }) {
  const [completion, setCompletion] = useState(0)
  const [missingItems, setMissingItems] = useState<string[]>([])

  useEffect(() => {
    // Helper function to safely parse JSON strings
    const safeParse = (value: string | string[] | null): any[] => {
      if (!value) return []
      if (Array.isArray(value)) return value
      try {
        return JSON.parse(value)
      } catch {
        return []
      }
    }

    const items: { key: string; label: string; completed: boolean }[] = [
      { 
        key: 'bio', 
        label: 'Bio', 
        completed: !!profile.bio && profile.bio.length >= 50 
      },
      { 
        key: 'city', 
        label: 'Stad', 
        completed: !!profile.city 
      },
      { 
        key: 'phone', 
        label: 'Telefoonnummer', 
        completed: !!profile.phone 
      },
      { 
        key: 'services', 
        label: 'Services', 
        completed: safeParse(profile.services).length > 0 
      },
      { 
        key: 'hourlyRate', 
        label: 'Uurtarief', 
        completed: !!profile.hourlyRate && profile.hourlyRate > 0 
      },
      { 
        key: 'profilePhoto', 
        label: 'Profielfoto', 
        completed: !!profile.profilePhoto 
      },
      { 
        key: 'photos', 
        label: 'Extra foto\'s', 
        completed: safeParse(profile.photos).length > 0 
      },
      { 
        key: 'stripe', 
        label: 'Stripe Connect', 
        completed: profile.stripeOnboarded 
      },
    ]

    const completed = items.filter(item => item.completed).length
    const total = items.length
    const percentage = Math.round((completed / total) * 100)

    setCompletion(percentage)
    setMissingItems(items.filter(item => !item.completed).map(item => item.label))
  }, [profile])

  // If not approved, show special warning
  if (!profile.isApproved) {
    return (
      <div className="bg-yellow-50 border-2 border-yellow-400 rounded-xl p-6 mb-6">
        <div className="flex items-start gap-4">
          <div className="text-4xl">⏳</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-yellow-900 mb-2">
              Profiel In Review
            </h3>
            <p className="text-yellow-800 mb-4">
              Je profiel wordt momenteel beoordeeld door onze admin. Je ontvangt een email zodra je profiel is goedgekeurd en zichtbaar wordt voor klanten.
            </p>
            <p className="text-sm text-yellow-700">
              Dit kan 1-2 werkdagen duren. We laten het je weten!
            </p>
          </div>
        </div>
      </div>
    )
  }

  // If profile is 100% complete
  if (completion === 100) {
    return (
      <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border-2 border-emerald-400 rounded-xl p-6 mb-6">
        <div className="flex items-center gap-4">
          <div className="text-4xl">✅</div>
          <div className="flex-1">
            <h3 className="text-xl font-bold text-emerald-900 mb-1">
              Profiel Compleet!
            </h3>
            <p className="text-emerald-700">
              Je profiel is volledig ingevuld en zichtbaar voor klanten. Goed gedaan!
            </p>
          </div>
        </div>
      </div>
    )
  }

  // If profile is incomplete
  return (
    <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-400 rounded-xl p-6 mb-6">
      <div className="flex items-start gap-4">
        <div className="text-4xl">📝</div>
        <div className="flex-1">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-xl font-bold text-blue-900">
              Profiel {completion}% Compleet
            </h3>
            <span className="text-2xl font-bold text-blue-600">{completion}%</span>
          </div>

          {/* Progress Bar */}
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden mb-4">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-purple-600 transition-all duration-500"
              style={{ width: `${completion}%` }}
            />
          </div>

          <p className="text-blue-800 mb-3">
            Maak je profiel compleet om meer klanten aan te trekken!
          </p>

          {/* Missing Items */}
          {missingItems.length > 0 && (
            <div className="bg-white/60 rounded-lg p-4 mb-4">
              <p className="font-semibold text-blue-900 mb-2">Nog toe te voegen:</p>
              <ul className="space-y-1">
                {missingItems.map((item, index) => (
                  <li key={index} className="text-sm text-blue-700 flex items-center gap-2">
                    <span className="text-blue-400">•</span> {item}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <Button asChild className="bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700">
              <Link href="/dashboard/caregiver/profile">
                Profiel Completeren
              </Link>
            </Button>
            {!profile.stripeOnboarded && (
              <Button asChild variant="outline" className="border-2">
                <Link href="/settings/payment">
                  Stripe Instellen
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}





