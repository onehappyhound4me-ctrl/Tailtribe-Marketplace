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

export const REVIEW_SUMMARY = {
  ratingValue: 5,
  reviewCount: PUBLIC_REVIEWS.length,
  bestRating: 5,
}

export function getServiceReviews(serviceId: string) {
  const matching = PUBLIC_REVIEWS.filter((review) => review.serviceIds?.includes(serviceId))
  return matching.length > 0 ? matching : PUBLIC_REVIEWS
}

export function getOrganizationReviewSchema(appUrl: string) {
  return {
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: REVIEW_SUMMARY.ratingValue,
      reviewCount: REVIEW_SUMMARY.reviewCount,
      bestRating: REVIEW_SUMMARY.bestRating,
    },
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
      itemReviewed: {
        '@type': 'Organization',
        '@id': `${appUrl}/#organization`,
        name: 'TailTribe',
      },
    })),
  }
}
