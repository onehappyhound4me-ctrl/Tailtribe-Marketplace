import Link from 'next/link'
import { Button } from '@/components/ui/button'

interface EmptyStateProps {
  icon: string
  title: string
  description: string
  actionLabel?: string
  actionHref?: string
  onAction?: () => void
}

export function EmptyState({ 
  icon, 
  title, 
  description, 
  actionLabel, 
  actionHref,
  onAction 
}: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <div className="text-7xl mb-6">{icon}</div>
      <h3 className="text-2xl font-bold text-gray-900 mb-3 text-center">
        {title}
      </h3>
      <p className="text-gray-600 text-center max-w-md mb-8">
        {description}
      </p>
      {(actionLabel && (actionHref || onAction)) && (
        actionHref ? (
          <Button asChild className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700">
            <Link href={actionHref}>{actionLabel}</Link>
          </Button>
        ) : (
          <Button 
            onClick={onAction}
            className="bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700"
          >
            {actionLabel}
          </Button>
        )
      )}
    </div>
  )
}

// Pre-configured empty states
export const EmptyStates = {
  NoBookings: () => (
    <EmptyState
      icon="📅"
      title="Geen boekingen"
      description="Je hebt nog geen boekingen. Zoek een verzorger en maak je eerste afspraak!"
      actionLabel="Zoek Verzorgers"
      actionHref="/search"
    />
  ),
  
  NoPets: () => (
    <EmptyState
      icon="🐾"
      title="Geen huisdieren"
      description="Voeg je eerste huisdier toe om verzorgers te kunnen boeken."
      actionLabel="Huisdier Toevoegen"
      actionHref="/pets/add"
    />
  ),
  
  NoMessages: () => (
    <EmptyState
      icon="💬"
      title="Geen berichten"
      description="Je hebt nog geen berichten. Start een gesprek met een verzorger!"
      actionLabel="Zoek Verzorgers"
      actionHref="/search"
    />
  ),
  
  NoReviews: () => (
    <EmptyState
      icon="⭐"
      title="Geen reviews"
      description="Je hebt nog geen reviews ontvangen of geschreven."
    />
  ),
  
  NoResults: () => (
    <EmptyState
      icon="🔍"
      title="Geen resultaten"
      description="Geen verzorgers gevonden met deze filters. Probeer andere zoekopties."
      actionLabel="Reset Filters"
      actionHref="/search"
    />
  ),
  
  ProfileNotApproved: () => (
    <EmptyState
      icon="⏳"
      title="Profiel in review"
      description="Je profiel wordt momenteel beoordeeld door onze admin. Je ontvangt een email zodra je profiel is goedgekeurd."
    />
  ),
  
  IncompleteProfile: () => (
    <EmptyState
      icon="📝"
      title="Profiel incompleet"
      description="Maak je profiel compleet om zichtbaar te worden voor klanten."
      actionLabel="Profiel Completeren"
      actionHref="/profile/edit"
    />
  )
}





