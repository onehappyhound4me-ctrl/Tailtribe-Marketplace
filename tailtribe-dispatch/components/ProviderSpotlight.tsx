import { ExternalLink } from '@/components/ExternalLink'

type ProviderSpotlightProps = {
  name: string
  href: string
  label?: string
  areas: string[]
  availabilityText?: string
  ctaLabel?: string
  note?: string
}

export function ProviderSpotlight({
  name,
  href,
  label,
  areas,
  availabilityText,
  ctaLabel,
  note,
}: ProviderSpotlightProps) {
  return (
    <aside className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl border border-black/5 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="inline-flex items-center gap-2 rounded-full bg-white/80 border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
            Uitgevoerd door
          </div>
          <h3 className="mt-3 text-xl md:text-2xl font-bold text-gray-900">{name}</h3>
          {availabilityText ? (
            <p className="mt-2 text-sm md:text-base text-gray-700 leading-relaxed">{availabilityText}</p>
          ) : (
            <p className="mt-2 text-sm md:text-base text-gray-700 leading-relaxed">
              Momenteel beschikbaar in: <span className="font-semibold text-gray-900">{areas.join(' • ')}</span>
            </p>
          )}
          {note ? <p className="mt-3 text-sm text-gray-600 leading-relaxed">{note}</p> : null}
        </div>

        <div className="flex-shrink-0">
          <ExternalLink
            href={href}
            className="btn-brand min-h-[44px]"
            data-nav="external"
            data-component="ProviderSpotlight"
          >
            {ctaLabel ?? `Bezoek ${label ?? 'website'}`}
          </ExternalLink>
        </div>
      </div>
    </aside>
  )
}

