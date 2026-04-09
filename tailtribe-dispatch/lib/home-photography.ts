import type { DispatchService } from '@/lib/services'

/** Curated Unsplash photography — één unieke foto per gebruik, natuurlijke huisdier+mens sfeer. */

export const HOME_HERO = {
  src: 'https://images.unsplash.com/photo-1568393698741-0bb5bdd68896?auto=format&fit=crop&w=3840&q=92',
  alt: 'Baasje wandelt samen met husky in bosrijke omgeving — mens en dier in interactie',
} as const

/** Full-width rustpauze tussen diensten en “Hoe werkt het”. */
export const HOME_MID_BANNER = {
  src: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=2200&q=82',
  alt: 'Hond en baasje samen, blije interactie op de voorgrond',
} as const

/** Visueel anker naast de stappen. */
export const HOME_HOW_IMAGE = {
  src: 'https://images.unsplash.com/photo-1494947665470-86eb4bee36ce?auto=format&fit=crop&w=1400&q=82',
  alt: 'Baasje wandelt met hond in groene omgeving',
} as const

export type HomeSectionPhoto = { src: string; alt: string; title: string; caption: string }

export const HOME_FEATURED_CARE: HomeSectionPhoto[] = [
  {
    src: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?auto=format&fit=crop&w=1100&q=82',
    alt: 'Kinderen en hond spelen buiten — vertrouwen en routine',
    title: 'Warme match',
    caption: 'We koppelen aan verzorgers die aansluiten bij jouw routine en dier.',
  },
  {
    src: 'https://images.unsplash.com/photo-1544005313-94dff0284df2?auto=format&fit=crop&w=1100&q=82',
    alt: 'Twee honden tijdens een buitenwandeling',
    title: 'Beweging & rust',
    caption: 'Van korte uitstappen tot oppas aan huis — alles in één aanvraag.',
  },
  {
    src: 'https://images.unsplash.com/photo-1450778861180-e6fc058ea692?auto=format&fit=crop&w=1100&q=82',
    alt: 'Hond bij het water in natuurlijke omgeving',
    title: 'Zorg op maat',
    caption: 'Geen standaardpakket: we stemmen af op wat jouw huisdier nodig heeft.',
  },
]

const HOME_SERVICE_COVER: Record<
  DispatchService['id'],
  { src: string; alt: string }
> = {
  DOG_WALKING: {
    src: 'https://images.unsplash.com/photo-1587300003388-59208cc962cb?auto=format&fit=crop&w=1200&q=82',
    alt: 'Vrolijke hond kijkt naar baasje tijdens wandeling',
  },
  GROUP_DOG_WALKING: {
    src: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?auto=format&fit=crop&w=1200&q=82',
    alt: 'Meerdere honden samen tijdens een wandeling buiten',
  },
  DOG_TRAINING: {
    src: 'https://images.unsplash.com/photo-1502673530725-c80107a6cbd2?auto=format&fit=crop&w=1200&q=82',
    alt: 'Honden rennend over gras — energie en trainingssfeer',
  },
  PET_SITTING: {
    src: 'https://images.unsplash.com/photo-1514888286974-fcdeb328849c?auto=format&fit=crop&w=1200&q=82',
    alt: 'Kat die rustig naar de camera kijkt',
  },
  PET_BOARDING: {
    src: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?auto=format&fit=crop&w=1200&q=82',
    alt: 'Teddybeer-achtige hond in zacht licht',
  },
  HOME_CARE: {
    src: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=1200&q=82',
    alt: 'Hond ontspannen op een zachte deken binnen',
  },
  PET_TRANSPORT: {
    src: 'https://images.unsplash.com/photo-1544196492-774b29352568?auto=format&fit=crop&w=1200&q=82',
    alt: 'Hond kijkt veilig uit het raam van een voertuig',
  },
  SMALL_ANIMAL_CARE: {
    src: 'https://images.unsplash.com/photo-1444226458093-87d6c0de85fc?auto=format&fit=crop&w=1200&q=82',
    alt: 'Kleine huisdieren en verzorging in rustige sfeer',
  },
  EVENT_COMPANION: {
    src: 'https://images.unsplash.com/photo-1525253086316-d0c936c814f0?auto=format&fit=crop&w=1200&q=82',
    alt: 'Hond in gezelschap tijdens een buitenmoment',
  },
}

export function getHomeServiceCover(serviceId: DispatchService['id']) {
  return HOME_SERVICE_COVER[serviceId]
}
