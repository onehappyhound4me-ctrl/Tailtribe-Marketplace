export type PublicReview = {
  name: string
  rating: 1 | 2 | 3 | 4 | 5
  quote: string
  sourceLabel: string
  serviceIds?: string[]
}

/** Partner voor groepsuitlaat — Google-reviews horen bij dit merk, niet bij TailTribe. */
export const ONE_HAPPY_HOUND = {
  name: 'One Happy Hound',
  url: 'https://onehappyhound.be',
  orgId: 'https://onehappyhound.be/#organization',
} as const

export const GOOGLE_MAPS_CID = process.env.NEXT_PUBLIC_GOOGLE_MAPS_CID || '3943987553262873468'
export const GOOGLE_REVIEWS_URL = `https://maps.google.com/?cid=${GOOGLE_MAPS_CID}&hl=nl&gl=BE`

export const PUBLIC_REVIEWS: PublicReview[] = [
  {
    name: 'Sophie Legrève',
    rating: 5,
    quote:
      'Super professioneel en zorgzaam! Juno is dolgelukkig wanneer ze mee kan. Ik ben super blij en dankbaar voor deze oplossing.',
    sourceLabel: 'Google · One Happy Hound',
    serviceIds: ['DOG_WALKING', 'GROUP_DOG_WALKING'],
  },
  {
    name: 'Annika Vershaeve',
    rating: 5,
    quote: 'Super dienst! Helpt enorm met mijn actieve Weimaraner en maakte hem echt sociaal.',
    sourceLabel: 'Google · One Happy Hound',
    serviceIds: ['GROUP_DOG_WALKING', 'DOG_WALKING'],
  },
  {
    name: 'Ann Sourdeau',
    rating: 5,
    quote:
      'Steven belde vrijwel meteen terug en kon snel langskomen. Hij gaf heel goede tips; onze hond is veel stabieler. Ook nadien bereikbaar voor raad!',
    sourceLabel: 'Google · One Happy Hound',
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

/** Gemiddelde en optioneel aantal Google-reviews van One Happy Hound (UI). */
export function getPublicReviewsDisplayRating(): { ratingValue: number; reviewCount: number | undefined } {
  return {
    ratingValue: parseGoogleBusinessRating(),
    reviewCount: parseGoogleBusinessReviewCount(),
  }
}

function formatNlRating(rating: number): string {
  return rating.toLocaleString('nl-BE', { minimumFractionDigits: 0, maximumFractionDigits: 1 })
}

/** Eerlijke UI-tekst: reviews zijn van OHH, niet van TailTribe. */
export function formatOneHappyHoundGoogleReviewsLine(options?: { compact?: boolean }): string {
  const { ratingValue, reviewCount } = getPublicReviewsDisplayRating()
  const ratingLabel = formatNlRating(ratingValue)

  if (options?.compact) {
    return `${ratingLabel}/5 · ${ONE_HAPPY_HOUND.name} op Google`
  }

  if (reviewCount != null) {
    return `${ratingLabel}/5 · ${reviewCount} Google-reviews · ${ONE_HAPPY_HOUND.name}`
  }

  return `${ratingLabel}/5 op Google · ${ONE_HAPPY_HOUND.name}`
}

function getOneHappyHoundAggregateRatingForSchema(): {
  '@type': 'AggregateRating'
  ratingValue: number
  reviewCount: number
  bestRating: number
  worstRating: number
} {
  const envCount = parseGoogleBusinessReviewCount()
  const envRating = parseGoogleBusinessRating()

  if (envCount != null) {
    return {
      '@type': 'AggregateRating',
      ratingValue: envRating,
      reviewCount: envCount,
      bestRating: 5,
      worstRating: 1,
    }
  }

  const reviewCount = PUBLIC_REVIEWS.length
  const ratingValue =
    reviewCount > 0
      ? Math.round(
          (PUBLIC_REVIEWS.reduce((sum, review) => sum + review.rating, 0) / reviewCount) * 10
        ) / 10
      : envRating

  return {
    '@type': 'AggregateRating',
    ratingValue,
    reviewCount,
    bestRating: 5,
    worstRating: 1,
  }
}

/** Reviews + aggregateRating voor JSON-LD — altijd gekoppeld aan One Happy Hound. */
export function getOneHappyHoundReviewSchema() {
  const aggregateRating = getOneHappyHoundAggregateRatingForSchema()
  return {
    aggregateRating,
    review: PUBLIC_REVIEWS.map((review) => ({
      '@type': 'Review',
      itemReviewed: {
        '@type': 'LocalBusiness',
        '@id': ONE_HAPPY_HOUND.orgId,
        name: ONE_HAPPY_HOUND.name,
        url: ONE_HAPPY_HOUND.url,
      },
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

/** Aparte LocalBusiness-node voor @graph — partner van TailTribe. */
export function getOneHappyHoundOrganizationSchema() {
  return {
    '@type': 'LocalBusiness',
    '@id': ONE_HAPPY_HOUND.orgId,
    name: ONE_HAPPY_HOUND.name,
    url: ONE_HAPPY_HOUND.url,
    description:
      'Groepshondenuitlaat en avontuurlijke daguitstappen voor honden in Vlaanderen. Partner van TailTribe.',
    serviceType: 'Hondenuitlaatservice',
    areaServed: { '@type': 'State', name: 'Vlaanderen', addressCountry: 'BE' },
    sameAs: [GOOGLE_REVIEWS_URL],
    ...getOneHappyHoundReviewSchema(),
  }
}

/** @deprecated Gebruik getOneHappyHoundReviewSchema — reviews horen niet op TailTribe Organization. */
export function getOrganizationReviewSchema() {
  return getOneHappyHoundReviewSchema()
}
