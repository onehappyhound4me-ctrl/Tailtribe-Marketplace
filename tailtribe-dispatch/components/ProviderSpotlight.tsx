import { ExternalLink } from '@/components/ExternalLink'

type ProviderSpotlightProps = {
  name: string
  href: string
  label?: string
  areas: string[]
  availabilityText?: string
  ctaLabel?: string
  note?: string
  showCta?: boolean
}

export function ProviderSpotlight({
  name,
  href,
  label,
  areas,
  availabilityText,
  ctaLabel,
  note,
  showCta = true,
}: ProviderSpotlightProps) {
  return (
    <aside className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl border border-black/5 p-6 md:p-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-x-2 gap-y-2">
            <span className="inline-flex items-center rounded-full bg-white/80 border border-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-900">
              Uitgevoerd door
            </span>
            <ExternalLink
              href={href}
              className="text-lg md:text-xl font-bold text-gray-900 hover:text-emerald-800 hover:underline underline-offset-4"
              data-nav="external"
              data-component="ProviderSpotlight.NameLink"
              aria-label={`${name} (open website)`}
            >
              {name}
            </ExternalLink>
          </div>
          {availabilityText ? (
            <p className="mt-2 text-sm md:text-base text-gray-700 leading-relaxed">{availabilityText}</p>
          ) : (
            <p className="mt-2 text-sm md:text-base text-gray-700 leading-relaxed">
              Momenteel beschikbaar in: <span className="font-semibold text-gray-900">{areas.join(' • ')}</span>
            </p>
          )}
          {note ? <p className="mt-3 text-sm font-semibold text-emerald-900">{note}</p> : null}
        </div>

        {showCta ? (
          <div className="flex-shrink-0">
            <ExternalLink
              href={href}
              className="btn-brand min-h-[44px] w-full sm:w-auto"
              data-nav="external"
              data-component="ProviderSpotlight"
            >
              {ctaLabel ?? `Bezoek ${label ?? 'website'}`}
            </ExternalLink>
          </div>
        ) : null}
      </div>
    </aside>
  )
}

