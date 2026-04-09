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
  src: '/marketing/mid-banner.jpg',
  alt: 'Hond en baasje samen, blije interactie op de voorgrond',
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
    src: '/marketing/service-hondenuitlaat.jpg',
    alt: 'Hondenuitlaat: hond wandelt met begeleider, focus op welzijn en tempo',
  },
  GROUP_DOG_WALKING: {
    src: '/marketing/service-groep.jpg',
    alt: 'Hondenuitlaatservice: sociale groepswandeling met andere honden',
  },
  DOG_TRAINING: {
    src: '/marketing/service-training.jpg',
    alt: 'Hondentraining aan huis: trainer en hond oefenen samen op het gras',
  },
  PET_SITTING: {
    src: '/marketing/service-oppas.png',
    alt: 'Dierenoppas: kat rustig thuis op een stoel — vertrouwde omgeving en routine',
  },
  PET_BOARDING: {
    src: '/marketing/service-opvang.jpg',
    alt: 'Dierenopvang: veilig verblijf en routine buiten de eigen woning',
  },
  HOME_CARE: {
    src: '/marketing/service-thuis.jpg',
    alt: 'Verzorging aan huis: korte bezoeken voor voeding, check-in en basiszorg',
  },
  PET_TRANSPORT: {
    src: '/marketing/service-transport.jpg',
    alt: 'Dierentransport: veilig vervoer van huisdier in een voertuig',
  },
  SMALL_ANIMAL_CARE: {
    src: '/marketing/service-kleinvee.jpg',
    alt: 'Zorg voor paarden en kleinvee op stal of erf — voeding, water en controle',
  },
  EVENT_COMPANION: {
    src: '/marketing/service-event.jpg',
    alt: 'Hond netjes begeleid bij een trouwfeest of drukke gelegenheid',
  },
}

/** Per-dienst marketingfoto (lokaal onder `/public/marketing/`). */
export function getServiceMarketingCover(serviceId: DispatchService['id']) {
  return HOME_SERVICE_COVER[serviceId]
}

export const getHomeServiceCover = getServiceMarketingCover
