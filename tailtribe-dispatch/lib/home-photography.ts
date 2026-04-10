import type { DispatchService } from '@/lib/services'

/**
 * Zelf-gehoste marketingfoto’s onder `/public/marketing/`.
 * Externe Unsplash-URL’s vielen weg (404, CSP, blocking); lokale bestanden laden altijd mee met de deploy.
 */

export const HOME_HERO = {
  src: '/marketing/hero.jpg',
  alt: 'Warm, innig moment tussen een mens en een hond — aandacht, vertrouwen en samen zijn',
} as const

/** Full-width rustpauze tussen diensten en “Hoe werkt het”. */
export const HOME_MID_BANNER = {
  src: '/marketing/service-hondenuitlaat.png',
  alt: 'Mens en hond als team in de natuur — vertrouwen en verbinding',
} as const

/** Visueel anker naast de stappen. */
export const HOME_HOW_IMAGE = {
  src: '/marketing/how-it-works.jpg',
  alt: 'Baasje wandelt met hond in groene omgeving',
} as const

export type HomeSectionPhoto = { src: string; alt: string; title: string; caption: string }

/** Homepage “Zo voelt goede zorg” alleen; geen hergebruik van service-*.jpg of hero/mid/how. */
export const HOME_FEATURED_CARE: HomeSectionPhoto[] = [
  {
    src: '/marketing/featured-1.jpg',
    alt: 'Intiem moment tussen mens en huisdier — vertrouwen en persoonlijke aandacht',
    title: 'Warme match',
    caption: 'We koppelen aan verzorgers die aansluiten bij jouw routine en dier.',
  },
  {
    src: '/marketing/featured-2.jpg',
    alt: 'Hond in beweging buiten — frisse lucht en gecontroleerde uitstappen',
    title: 'Beweging & rust',
    caption: 'Van korte uitstappen tot oppas aan huis — alles in één aanvraag.',
  },
  {
    src: '/marketing/featured-3.jpg',
    alt: 'Rustige zorg in een huiselijke omgeving — afgestemd op jouw huisdier',
    title: 'Zorg op maat',
    caption: 'Geen standaardpakket: we stemmen af op wat jouw huisdier nodig heeft.',
  },
]

const HOME_SERVICE_COVER: Record<
  DispatchService['id'],
  { src: string; alt: string }
> = {
  DOG_WALKING: {
    src: '/marketing/service-hondenuitlaat.png',
    alt: 'Hondenuitlaat: band tussen mens en hond in het groen — wandeling en welzijn',
  },
  GROUP_DOG_WALKING: {
    src: '/marketing/service-groep.jpg',
    alt: 'Hondenuitlaatservice: sociale groepswandeling met andere honden',
  },
  DOG_TRAINING: {
    src: '/marketing/service-training.png',
    alt: 'Hondentraining: trainer en hond oefenen samen buiten in het bos',
  },
  PET_SITTING: {
    src: '/marketing/service-oppas.png',
    alt: 'Dierenoppas: kat rustig thuis op een stoel — vertrouwde omgeving en routine',
  },
  PET_BOARDING: {
    src: '/marketing/service-opvang.png',
    alt: 'Dierenopvang: veel verschillende huisdieren — brede zorg en aandacht',
  },
  HOME_CARE: {
    src: '/marketing/service-thuis.png',
    alt: 'Verzorging aan huis: ook kleine huisdieren zoals een cavia — rust en routine',
  },
  PET_TRANSPORT: {
    src: '/marketing/service-transport.png',
    alt: 'Dierentransport: huisdieren comfortabel vervoeren (bijv. in een huisdierenbuggy)',
  },
  SMALL_ANIMAL_CARE: {
    src: '/marketing/service-kleinvee.png',
    alt: 'Verzorging boerderijdieren: paard en mens op stal of erf — rustige zorg',
  },
  EVENT_COMPANION: {
    src: '/marketing/service-event.png',
    alt: 'Begeleiding op events: hond netjes bij het bruidspaar op een trouwfeest',
  },
}

/** Per-dienst marketingfoto (lokaal onder `/public/marketing/`). */
export function getServiceMarketingCover(serviceId: DispatchService['id']) {
  return HOME_SERVICE_COVER[serviceId]
}

export const getHomeServiceCover = getServiceMarketingCover
