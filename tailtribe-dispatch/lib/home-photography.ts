import type { DispatchService } from '@/lib/services'

/**
 * Zelf-gehoste marketingfoto’s onder `/public/marketing/`.
 * Externe Unsplash-URL’s vielen weg (404, CSP, blocking); lokale bestanden laden altijd mee met de deploy.
 */

export const HOME_HERO = {
  src: '/marketing/hero.jpg',
  alt: 'Baasje wandelt samen met husky in bosrijke omgeving — mens en dier in interactie',
} as const

/** Full-width rustpauze tussen diensten en “Hoe werkt het”. */
export const HOME_MID_BANNER = {
  src: '/marketing/mid-banner.jpg',
  alt: 'Hond en baasje samen, blije interactie op de voorgrond',
} as const

/** Visueel anker naast de stappen. */
export const HOME_HOW_IMAGE = {
  src: '/marketing/how-it-works.jpg',
  alt: 'Baasje wandelt met hond in groene omgeving',
} as const

export type HomeSectionPhoto = { src: string; alt: string; title: string; caption: string }

export const HOME_FEATURED_CARE: HomeSectionPhoto[] = [
  {
    src: '/marketing/featured-1.jpg',
    alt: 'Kinderen en hond spelen buiten — vertrouwen en routine',
    title: 'Warme match',
    caption: 'We koppelen aan verzorgers die aansluiten bij jouw routine en dier.',
  },
  {
    src: '/marketing/featured-2.jpg',
    alt: 'Twee honden tijdens een buitenwandeling',
    title: 'Beweging & rust',
    caption: 'Van korte uitstappen tot oppas aan huis — alles in één aanvraag.',
  },
  {
    src: '/marketing/featured-3.jpg',
    alt: 'Persoon met hond in natuurlijke omgeving',
    title: 'Zorg op maat',
    caption: 'Geen standaardpakket: we stemmen af op wat jouw huisdier nodig heeft.',
  },
]

const HOME_SERVICE_COVER: Record<
  DispatchService['id'],
  { src: string; alt: string }
> = {
  DOG_WALKING: {
    src: '/marketing/service-hondenuitlaat.jpg',
    alt: 'Vrolijke hond kijkt naar baasje tijdens wandeling',
  },
  GROUP_DOG_WALKING: {
    src: '/marketing/service-groep.jpg',
    alt: 'Meerdere honden samen tijdens een wandeling buiten',
  },
  DOG_TRAINING: {
    src: '/marketing/service-training.jpg',
    alt: 'Mens en hond samen op het gras — trainingsmoment',
  },
  PET_SITTING: {
    src: '/marketing/service-oppas.jpg',
    alt: 'Zachte hond die rustig naar de camera kijkt',
  },
  PET_BOARDING: {
    src: '/marketing/service-opvang.jpg',
    alt: 'Hond ontspannen op een zachte deken binnen',
  },
  HOME_CARE: {
    src: '/marketing/service-thuis.jpg',
    alt: 'Hond ontspannen op een zachte deken binnen',
  },
  PET_TRANSPORT: {
    src: '/marketing/service-transport.jpg',
    alt: 'Hond kijkt veilig uit het raam van een voertuig',
  },
  SMALL_ANIMAL_CARE: {
    src: '/marketing/service-kleinvee.jpg',
    alt: 'Kinderen en hond buiten — zorg voor huisdieren',
  },
  EVENT_COMPANION: {
    src: '/marketing/service-event.jpg',
    alt: 'Mens met hond in de natuur',
  },
}

/** Per-dienst marketingfoto (lokaal onder `/public/marketing/`). */
export function getServiceMarketingCover(serviceId: DispatchService['id']) {
  return HOME_SERVICE_COVER[serviceId]
}

export const getHomeServiceCover = getServiceMarketingCover
