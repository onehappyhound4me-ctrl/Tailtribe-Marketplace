import Link from 'next/link'
import { GOOGLE_REVIEWS_URL, getPublicReviewsDisplayRating } from '@/lib/reviews'

const STAR_PATH =
  'M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z'

function StarRow({ value, size = 'md' }: { value: number; size?: 'sm' | 'md' }) {
  const clamped = Math.min(5, Math.max(0, value))
  const dim = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4'
  return (
    <span className="inline-flex gap-0.5" role="img" aria-label={`${clamped} van 5 sterren`}>
      {[0, 1, 2, 3, 4].map((i) => {
        const fill = Math.min(1, Math.max(0, clamped - i))
        return (
          <span key={i} className={`relative inline-flex ${dim} shrink-0`}>
            <svg className={`${dim} text-slate-200`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
              <path d={STAR_PATH} />
            </svg>
            {fill > 0 ? (
              <span className="absolute left-0 top-0 h-full overflow-hidden" style={{ width: `${fill * 100}%` }}>
                <svg className={`${dim} text-amber-400`} viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                  <path d={STAR_PATH} />
                </svg>
              </span>
            ) : null}
          </span>
        )
      })}
    </span>
  )
}

type Props = {
  className?: string
  /** Center text on marketing pages; inline in compact bars */
  align?: 'center' | 'start'
}

export function PublicReviewsSummary({ className = '', align = 'center' }: Props) {
  const { ratingValue, reviewCount } = getPublicReviewsDisplayRating()
  const ratingLabel = ratingValue.toLocaleString('nl-BE', { minimumFractionDigits: 0, maximumFractionDigits: 1 })
  const line =
    reviewCount != null
      ? `${ratingLabel}/5 · ${reviewCount} reviews op Google`
      : `${ratingLabel}/5 gemiddeld op Google`

  return (
    <Link
      href={GOOGLE_REVIEWS_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={[
        'inline-flex flex-wrap items-center gap-2 rounded-2xl border border-emerald-200/80 bg-white/90 px-4 py-2.5 text-sm font-medium text-slate-700 shadow-sm transition hover:border-emerald-300 hover:bg-emerald-50/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2',
        align === 'center' ? 'justify-center' : 'justify-start',
        className,
      ].join(' ')}
    >
      <StarRow value={ratingValue} size="sm" />
      <span>{line}</span>
    </Link>
  )
}
