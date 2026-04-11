export type PublicReview = {
  name: string
  rating: 1 | 2 | 3 | 4 | 5
  quote: string
  sourceLabel: string
  serviceIds?: string[]
}

export const GOOGLE_MAPS_CID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_CID || '3943987553262873468'
export const GOOGLE_REVIEWS_URL = `https://maps.google.com/?cid=${GOOGLE_MAPS_CID}&hl=nl&gl=BE`

export const PUBLIC_REVIEWS: PublicReview[] = [
  {
    name: 'Sophie Legrève',
    rating: 5,
    quote:
      'Super professioneel en zorgzaam! Juno is dolgelukkig wanneer ze mee kan. Ik ben super blij en dankbaar voor deze oplossing.',
    sourceLabel: 'Google review',
    serviceIds: ['DOG_WALKING', 'GROUP_DOG_WALKING'],
  },
  {
    name: 'Annika Vershaeve',
    rating: 5,
    quote: 'Super dienst! Helpt enorm met mijn actieve Weimaraner en maakte hem echt sociaal.',
    sourceLabel: 'Google review',
    serviceIds: ['GROUP_DOG_WALKING', 'DOG_WALKING'],
  },
  {
    name: 'Ann Sourdeau',
    rating: 5,
    quote:
      'Steven belde vrijwel meteen terug en kon snel langskomen. Hij gaf heel goede tips; onze hond is veel stabieler. Ook nadien bereikbaar voor raad!',
    sourceLabel: 'Google review',
    serviceIds: ['DOG_TRAINING', 'PET_SITTING'],
  },
]

export function getServiceReviews(serviceId: string) {
  const matching = PUBLIC_REVIEWS.filter((review) => review.serviceIds?.includes(serviceId))
  return matching.length > 0 ? matching : PUBLIC_REVIEWS
}

function parseGoogleBusinessRating(): number {
  const raw = process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_RATING
  if (raw === undefined || raw.trim() === '') return 4.4
  const n = Number(String(raw).replace(',', '.'))
  if (!Number.isFinite(n)) return 4.4
  return Math.min(5, Math.max(1, Math.round(n * 10) / 10))
}

function parseGoogleBusinessReviewCount(): number | undefined {
  const raw = process.env.NEXT_PUBLIC_GOOGLE_BUSINESS_REVIEW_COUNT
  if (raw === undefined || raw.trim() === '') return undefined
  const n = parseInt(raw, 10)
  return Number.isFinite(n) && n > 0 ? n : undefined
}

/** Gemiddelde en optioneel aantal reviews (UI: homepage, sterren). */
export function getPublicReviewsDisplayRating(): { ratingValue: number; reviewCount: number | undefined } {
  return {
    ratingValue: parseGoogleBusinessRating(),
    reviewCount: parseGoogleBusinessReviewCount(),
  }
}

/**
 * AggregateRating voor JSON-LD — alleen als `reviewCount` bekend is (Google vereist reviewCount of ratingCount).
 * Zet NEXT_PUBLIC_GOOGLE_BUSINESS_REVIEW_COUNT in productie voor rich results.
 */
function getPublicReviewsAggregateRatingForSchema():
  | {
      '@type': 'AggregateRating'
      ratingValue: number
      reviewCount: number
      bestRating: number
      worstRating: number
    }
  | undefined {
  const reviewCount = parseGoogleBusinessReviewCount()
  if (reviewCount == null) return undefined
  return {
    '@type': 'AggregateRating',
    ratingValue: parseGoogleBusinessRating(),
    reviewCount,
    bestRating: 5,
    worstRating: 1,
  }
}

export function getOrganizationReviewSchema() {
  const aggregateRating = getPublicReviewsAggregateRatingForSchema()
  return {
    ...(aggregateRating ? { aggregateRating } : {}),
    review: PUBLIC_REVIEWS.map((review) => ({
      '@type': 'Review',
      reviewRating: {
        '@type': 'Rating',
        ratingValue: review.rating,
        bestRating: 5,
      },
      author: {
        '@type': 'Person',
        name: review.name,
      },
      reviewBody: review.quote,
      publisher: {
        '@type': 'Organization',
        name: 'Google',
      },
    })),
  }
}
