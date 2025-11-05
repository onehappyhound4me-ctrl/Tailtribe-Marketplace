'use client'

interface Badge {
  type: string
  fileUrl: string
  verified: boolean
}

interface BadgeDisplayProps {
  certificates: Badge[]
  businessNumber?: string | null
  vatNumber?: string | null
}

const BADGE_LABELS: Record<string, string> = {
  'ANIMAL_CARE_DIPLOMA': 'Diergerelateerde diploma',
  'DOG_TRAINER': 'Gecertificeerd hondentrainer',
  'BEHAVIOR_SPECIALIST': 'Hondengedragsbegeleider',
  'ANIMAL_FIRST_AID': 'EHBO bij dieren',
  'HORSE_EXPERIENCE': 'Ervaring paarden/kleinvee',
  'HYGIENE_TRAINING': 'Hygiëne & verzorging',
  'SAFE_TRANSPORT': 'Veilig dierentransport',
  'GROOMING': 'Trimmen/Grooming',
  'PHYSIOTHERAPY': 'Hydro/Fysiotherapie',
  'NUTRITION': 'Voedingsconsulent',
  'NOSEWORK': 'Sniff/Nosework',
  'PUPPY_SOCIALIZATION': 'Puppy socialisatie',
  'SPORT_ENRICHMENT': 'Sport & verrijking',
  'EVENT_COMPANION': 'Event-begeleiding'
}

export function BadgeDisplay({ certificates, businessNumber, vatNumber }: BadgeDisplayProps) {
  if (certificates.length === 0 && !businessNumber && !vatNumber) {
    return null
  }

  return (
    <div className="mt-6">
      <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
        <span className="text-emerald-600">◆</span>
        Professionele Badges
      </h3>
      
      <div className="flex flex-wrap gap-2">
        {/* Certificates */}
        {certificates.map((cert, idx) => (
          <div
            key={idx}
            className="inline-flex items-center gap-2 bg-emerald-50 border-2 border-emerald-200 px-3 py-1.5 rounded-lg text-sm"
          >
            <span className="text-emerald-600 font-bold">◆</span>
            <span className="font-medium text-emerald-800">
              {BADGE_LABELS[cert.type] || cert.type}
            </span>
            {cert.verified && (
              <span className="text-emerald-600" title="Geverifieerd">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6.267 3.455a3.066 3.066 0 001.745-.723 3.066 3.066 0 013.976 0 3.066 3.066 0 001.745.723 3.066 3.066 0 012.812 2.812c.051.643.304 1.254.723 1.745a3.066 3.066 0 010 3.976 3.066 3.066 0 00-.723 1.745 3.066 3.066 0 01-2.812 2.812 3.066 3.066 0 00-1.745.723 3.066 3.066 0 01-3.976 0 3.066 3.066 0 00-1.745-.723 3.066 3.066 0 01-2.812-2.812 3.066 3.066 0 00-.723-1.745 3.066 3.066 0 010-3.976 3.066 3.066 0 00.723-1.745 3.066 3.066 0 012.812-2.812zm7.44 5.252a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </span>
            )}
          </div>
        ))}
        
        {/* Zelfstandige badge */}
        {(businessNumber || vatNumber) && (
          <div className="inline-flex items-center gap-2 bg-blue-50 border-2 border-blue-200 px-3 py-1.5 rounded-lg text-sm">
            <span className="text-blue-600 font-bold">◆</span>
            <span className="font-medium text-blue-800">Zelfstandige</span>
          </div>
        )}
      </div>
    </div>
  )
}






















