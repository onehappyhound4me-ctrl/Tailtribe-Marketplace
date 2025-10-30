'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import Link from 'next/link'

interface MatchingPreferences {
  petType: string
  petSize: 'small' | 'medium' | 'large'
  petAge: 'puppy' | 'adult' | 'senior'
  serviceType: string[]
  maxDistance: number
  priceRange: [number, number]
  specialNeeds: string[]
  preferredSchedule: string[]
}

interface CaregiverMatch {
  id: string
  name: string
  photo: string
  city: string
  distance: number
  hourlyRate: number
  averageRating: number
  totalReviews: number
  services: string[]
  specialties: string[]
  matchScore: number
  matchReasons: string[]
  availability: string[]
  verified: boolean
}

const mockPreferences: MatchingPreferences = {
  petType: 'dog',
  petSize: 'medium',
  petAge: 'adult',
  serviceType: ['DOG_WALKING', 'PET_SITTING'],
  maxDistance: 10,
  priceRange: [15, 25],
  specialNeeds: ['medication', 'anxiety'],
  preferredSchedule: ['morning', 'evening']
}

const mockMatches: CaregiverMatch[] = [
  {
    id: '1',
    name: 'Sarah Janssens',
    photo: '👩‍🦰',
    city: 'Antwerpen',
    distance: 2.3,
    hourlyRate: 18,
    averageRating: 4.9,
    totalReviews: 47,
    services: ['DOG_WALKING', 'PET_SITTING', 'TRAINING'],
    specialties: ['anxiety_support', 'medication_admin', 'senior_dogs'],
    matchScore: 98,
    matchReasons: [
      'Gespecialiseerd in angstige honden',
      'Ervaring met medicatie toediening',
      'Beschikbaar in jouw gewenste tijden',
      'Perfecte locatie (2.3km)'
    ],
    availability: ['morning', 'afternoon', 'evening'],
    verified: true
  },
  {
    id: '2',
    name: 'Tom Vermeulen',
    photo: '👨‍🦱',
    city: 'Gent',
    distance: 8.7,
    hourlyRate: 20,
    averageRating: 4.8,
    totalReviews: 32,
    services: ['DOG_WALKING', 'PET_SITTING'],
    specialties: ['large_dogs', 'behavioral_issues', 'medication_admin'],
    matchScore: 89,
    matchReasons: [
      'Uitstekende ervaring met medicatie',
      'Hoge beoordelingen van klanten',
      'Flexibele planning beschikbaar'
    ],
    availability: ['morning', 'evening'],
    verified: true
  },
  {
    id: '3',
    name: 'Lisa De Vries',
    photo: '👩‍🦳',
    city: 'Brussel-Stad',
    distance: 12.1,
    hourlyRate: 22,
    averageRating: 4.7,
    totalReviews: 28,
    services: ['PET_SITTING', 'TRAINING'],
    specialties: ['anxiety_support', 'puppy_training', 'senior_care'],
    matchScore: 85,
    matchReasons: [
      'Specialist in angst en gedragsproblemen',
      'Veel ervaring met oudere honden',
      'Professionele training certificaten'
    ],
    availability: ['afternoon', 'evening'],
    verified: true
  }
]

export function AIMatchingEngine() {
  const [preferences] = useState<MatchingPreferences>(mockPreferences)
  const [matches, setMatches] = useState<CaregiverMatch[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedMatch, setSelectedMatch] = useState<string | null>(null)

  useEffect(() => {
    // Simulate AI matching process
    setIsLoading(true)
    setTimeout(() => {
      setMatches(mockMatches)
      setIsLoading(false)
    }, 2000)
  }, [])

  const getMatchScoreColor = (score: number) => {
    if (score >= 95) return 'text-green-600 bg-green-50 border-green-200'
    if (score >= 85) return 'text-blue-600 bg-blue-50 border-blue-200'
    if (score >= 75) return 'text-yellow-600 bg-yellow-50 border-yellow-200'
    return 'text-gray-600 bg-gray-50 border-gray-200'
  }

  const formatSpecialty = (specialty: string) => {
    const specialtyMap: Record<string, string> = {
      'anxiety_support': 'Angst ondersteuning',
      'medication_admin': 'Medicatie toediening',
      'senior_dogs': 'Oudere honden',
      'large_dogs': 'Grote honden',
      'behavioral_issues': 'Gedragsproblemen',
      'puppy_training': 'Puppy training',
      'senior_care': 'Ouderenzorg'
    }
    return specialtyMap[specialty] || specialty
  }

  if (isLoading) {
    return (
      <Card className="gradient-card professional-shadow">
        <CardContent className="p-12 text-center">
          <div className="space-y-6">
            <div className="relative">
              <div className="w-16 h-16 mx-auto">
                <div className="absolute inset-0 bg-gradient-to-r from-green-400 to-green-600 rounded-full animate-spin">
                  <div className="absolute inset-2 bg-white rounded-full"></div>
                </div>
                <div className="absolute inset-0 flex items-center justify-center text-2xl">
                  🤖
                </div>
              </div>
            </div>
            <div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                AI Matching Engine aan het werk...
              </h3>
              <p className="text-gray-600">
                We analyseren duizenden verzorgers om de perfecte match voor je huisdier te vinden
              </p>
            </div>
            <div className="space-y-2 max-w-md mx-auto">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Analyseren van voorkeuren...</span>
                <span>✓</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Vergelijken van profielen...</span>
                <span>⏳</span>
              </div>
              <div className="flex justify-between text-sm text-gray-500">
                <span>Berekenen van match scores...</span>
                <span>⏳</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* AI Matching Header */}
      <Card className="gradient-card professional-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-3">
            <span className="text-3xl">🤖</span>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">AI-Powered Matching</h2>
              <p className="text-gray-600 font-normal">Perfecte verzorgers gevonden op basis van jouw behoeften</p>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-green-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-green-600">{matches.length}</div>
              <div className="text-sm text-green-700">Perfecte matches</div>
            </div>
            <div className="bg-blue-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-blue-600">
                {Math.round(matches.reduce((sum, match) => sum + match.matchScore, 0) / matches.length)}%
              </div>
              <div className="text-sm text-blue-700">Gemiddelde match score</div>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg text-center">
              <div className="text-2xl font-bold text-purple-600">
                {matches.filter(m => m.verified).length}
              </div>
              <div className="text-sm text-purple-700">Geverifieerde verzorgers</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Your Preferences */}
      <Card className="gradient-card professional-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🎯 Jouw Voorkeuren
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Huisdier type:</span>
                <span className="font-medium">🐕 Hond</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Grootte:</span>
                <span className="font-medium">Middelgroot</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Leeftijd:</span>
                <span className="font-medium">Volwassen</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Max afstand:</span>
                <span className="font-medium">{preferences.maxDistance} km</span>
              </div>
            </div>
            <div className="space-y-3">
              <div>
                <span className="text-gray-600 block mb-2">Services:</span>
                <div className="flex gap-2">
                  <Badge>🚶 Hondenuitlaat</Badge>
                  <Badge>🏠 Dierenoppas</Badge>
                </div>
              </div>
              <div>
                <span className="text-gray-600 block mb-2">Speciale behoeften:</span>
                <div className="flex gap-2">
                  <Badge variant="secondary">💊 Medicatie</Badge>
                  <Badge variant="secondary">😰 Angst</Badge>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Budget:</span>
                <span className="font-medium">€{preferences.priceRange[0]} - €{preferences.priceRange[1]}/uur</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* AI Matches */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
          ⭐ Jouw Top Matches
        </h3>
        
        {matches.map((match, index) => (
          <Card 
            key={match.id} 
            className={`gradient-card professional-shadow hover:scale-102 transition-all duration-300 ${
              selectedMatch === match.id ? 'ring-2 ring-green-500' : ''
            }`}
          >
            <CardContent className="p-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Caregiver Info */}
                <div className="lg:col-span-1">
                  <div className="flex items-start gap-4">
                    <div className="relative">
                      <div className="w-16 h-16 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white text-2xl">
                        {match.photo}
                      </div>
                      {match.verified && (
                        <div className="absolute -bottom-1 -right-1 bg-green-500 rounded-full p-1">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                      {index === 0 && (
                        <div className="absolute -top-2 -left-2 bg-yellow-500 text-white text-xs px-2 py-1 rounded-full font-bold">
                          #1 MATCH
                        </div>
                      )}
                    </div>
                    <div className="flex-1">
                      <h4 className="text-xl font-semibold text-gray-900">{match.name}</h4>
                      <p className="text-gray-600">📍 {match.city} ({match.distance} km)</p>
                      <div className="flex items-center gap-2 mt-2">
                        <div className="flex items-center gap-1">
                          <span className="text-yellow-500">⭐</span>
                          <span className="font-medium">{match.averageRating}</span>
                          <span className="text-gray-500 text-sm">({match.totalReviews})</span>
                        </div>
                        <span className="text-gray-300">•</span>
                        <span className="font-semibold text-green-600">€{match.hourlyRate}/uur</span>
                      </div>
                    </div>
                    <div className={`px-4 py-2 rounded-full border-2 ${getMatchScoreColor(match.matchScore)}`}>
                      <div className="text-center">
                        <div className="font-bold text-lg">{match.matchScore}%</div>
                        <div className="text-xs">Match</div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Match Reasons & Specialties */}
                <div className="lg:col-span-1 space-y-4">
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">🎯 Waarom een perfecte match:</h5>
                    <ul className="space-y-1 text-sm">
                      {match.matchReasons.map((reason, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-green-500 mt-1">•</span>
                          <span className="text-gray-700">{reason}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h5 className="font-semibold text-gray-900 mb-2">🏆 Specialiteiten:</h5>
                    <div className="flex flex-wrap gap-2">
                      {match.specialties.map((specialty, idx) => (
                        <Badge key={idx} variant="secondary" className="text-xs">
                          {formatSpecialty(specialty)}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="lg:col-span-1 space-y-3">
                  <div className="space-y-2">
                    <h5 className="font-semibold text-gray-900">📅 Beschikbaarheid:</h5>
                    <div className="flex flex-wrap gap-1">
                      {match.availability.map((time, idx) => (
                        <Badge key={idx} className="text-xs bg-blue-100 text-blue-800">
                          {time === 'morning' ? '🌅 Ochtend' :
                           time === 'afternoon' ? '☀️ Middag' : '🌙 Avond'}
                        </Badge>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      className="w-full gradient-button"
                      asChild
                    >
                      <Link href={`/caregivers/${match.id}`}>
                        👤 Bekijk Profiel
                      </Link>
                    </Button>
                    <Button 
                      variant="outline" 
                      className="w-full border-green-200 text-green-700 hover:bg-green-50"
                      asChild
                    >
                      <Link href={`/booking/new?caregiver=${match.id}`}>
                        📅 Boek Direct
                      </Link>
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="sm"
                      className="w-full text-gray-600 hover:text-gray-800"
                      onClick={() => setSelectedMatch(selectedMatch === match.id ? null : match.id)}
                    >
                      💬 Stuur Bericht
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* AI Insights */}
      <Card className="gradient-card professional-shadow">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            🧠 AI Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
              <h4 className="font-semibold text-blue-900 mb-2">💡 Aanbeveling</h4>
              <p className="text-blue-800 text-sm">
                Sarah Janssens is jouw #1 match vanwege haar specialisatie in angstige honden en medicatie toediening. 
                Haar nabijheid en flexibele planning maken haar ideaal voor jouw behoeften.
              </p>
            </div>
            
            <div className="bg-green-50 p-4 rounded-lg border border-green-200">
              <h4 className="font-semibold text-green-900 mb-2">📊 Match Analyse</h4>
              <p className="text-green-800 text-sm">
                Alle gevonden verzorgers hebben ervaring met jouw specifieke behoeften. 
                De gemiddelde match score van 91% betekent uitstekende compatibiliteit.
              </p>
            </div>
            
            <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
              <h4 className="font-semibold text-yellow-900 mb-2">⚡ Tip</h4>
              <p className="text-yellow-800 text-sm">
                Boek snel! Verzorgers met hoge match scores worden vaak snel geboekt, 
                vooral in populaire tijdslots zoals ochtend en avond.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
