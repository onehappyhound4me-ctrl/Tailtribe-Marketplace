'use client'

interface SafetyBannerProps {
  variant?: 'messaging' | 'booking' | 'profile' | 'payment'
  compact?: boolean
}

export function SafetyBanner({ variant = 'messaging', compact = false }: SafetyBannerProps) {
  const content = {
    messaging: {
      title: '🛡️ Veilig Communiceren',
      items: [
        'Deel geen telefoonnummers, e-mailadressen of andere contactgegevens',
        'Houd alle communicatie binnen TailTribe voor je eigen bescherming',
        'Betaal alleen via het platform - nooit contant of rechtstreeks',
        'Meld verdacht gedrag direct aan ons team'
      ]
    },
    booking: {
      title: '🛡️ Veilig Boeken via TailTribe',
      items: [
        'Alle geverifieerde verzorgers - achtergrondcheck voltooid',
        'Betaal veilig via ons platform - volledig beschermd',
        'Foto- & GPS-rapporten na elke dienst',
        'Annuleringsbeleid & refund garantie'
      ]
    },
    profile: {
      title: '🛡️ Contactgegevens Bescherming',
      items: [
        'Contact informatie alleen zichtbaar na bevestigde boeking',
        'Alle communicatie via platform = veilig & gedocumenteerd',
        'TailTribe support beschikbaar bij problemen'
      ]
    },
    payment: {
      title: '🛡️ Veilige Betaling',
      items: [
        'Betaal alleen via TailTribe = volledig beschermd',
        'Geld wordt 48-72u vastgehouden tot dienst voltooid',
        'Automatische refund bij annulering (volgens beleid)',
        'Bij problemen: volledige support & claims procedure'
      ]
    }
  }

  const selected = content[variant]

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-emerald-500 to-teal-600 rounded-lg p-4 text-white shadow-md">
        <div className="flex items-center gap-3">
          <span className="text-2xl">🛡️</span>
          <div>
            <p className="font-bold">{selected.title}</p>
            <p className="text-sm text-emerald-100">
              {selected.items[0]}
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-gradient-to-br from-emerald-50 to-teal-50 border-2 border-emerald-200 rounded-xl p-6 shadow-sm">
      <h3 className="font-bold text-emerald-900 mb-4 flex items-center gap-2 text-lg">
        <span className="text-2xl">🛡️</span>
        {selected.title}
      </h3>
      <ul className="space-y-2">
        {selected.items.map((item, idx) => (
          <li key={idx} className="flex items-start gap-2 text-sm text-emerald-800">
            <span className="text-emerald-600 font-bold flex-shrink-0">•</span>
            <span>{item}</span>
          </li>
        ))}
      </ul>
      <div className="mt-4 pt-4 border-t border-emerald-200">
        <p className="text-xs text-emerald-700 font-medium">
          ⚠️ Overtredingen kunnen leiden tot waarschuwingen of account schorsing.
        </p>
      </div>
    </div>
  )
}





