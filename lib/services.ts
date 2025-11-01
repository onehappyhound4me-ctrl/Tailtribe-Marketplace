export interface Service {
  slug: string
  code: string // API service code (e.g., DOG_WALKING)
  title: string
  shortDescription: string
  icon: string
  imageSrc?: string
  imageAlt?: string
  relatedSlugs: string[]
  metaTitle: string
  metaDescription: string
}

// Mapping from slug to API service code
export const slugToServiceCode: Record<string, string> = {
  'hondenuitlaat': 'DOG_WALKING',
  'groepsuitlaat': 'GROUP_DOG_WALKING',
  'hondentraining': 'DOG_TRAINING',
  'dierenoppas': 'PET_SITTING',
  'dierenopvang': 'PET_BOARDING',
  'verzorging-aan-huis': 'HOME_CARE',
  'transport-huisdieren': 'PET_TRANSPORT',
  'verzorging-kleinvee': 'SMALL_ANIMAL_CARE',
  'begeleiding-events': 'EVENT_COMPANION'
}

export const services: Service[] = [
  {
    slug: 'hondenuitlaat',
    code: 'DOG_WALKING',
    title: 'Hondenuitlaat',
    shortDescription: 'Dagelijkse wandelingen voor jouw viervoeter in de buurt',
    icon: '🐕',
    imageSrc: '/assets/Hondenuitlaat.png',
    imageAlt: 'Hondenuitlaat illustratie',
    relatedSlugs: ['groepsuitlaat', 'hondentraining'],
    metaTitle: 'Hondenuitlaat in België | TailTribe',
    metaDescription: 'Professionele hondenuitlaatservice door geverifieerde verzorgers. Dagelijkse wandelingen voor jouw viervoeter. Ontdek verzorgers in jouw buurt.'
  },
  {
    slug: 'groepsuitlaat',
    code: 'GROUP_DOG_WALKING',
    title: 'Groepsuitlaat voor honden',
    shortDescription: 'Sociale wandelingen met andere honden voor extra plezier',
    icon: '🐕‍🦺',
    imageSrc: '/assets/groepsuitlaat.png',
    imageAlt: 'Groepsuitlaat illustratie',
    relatedSlugs: ['hondenuitlaat', 'hondentraining'],
    metaTitle: 'Groepsuitlaat voor honden in België | TailTribe',
    metaDescription: 'Sociale wandelingen voor honden met andere viervoeters. Professionele groepsuitlaat door ervaren verzorgers. Ontdek verzorgers in jouw buurt.'
  },
  {
    slug: 'hondentraining',
    code: 'DOG_TRAINING',
    title: 'Hondentraining',
    shortDescription: 'Professionele gedragstraining en gehoorzaamheid',
    icon: '🎓',
    imageSrc: '/assets/hondentraining.png',
    imageAlt: 'Hondentraining illustratie',
    relatedSlugs: ['hondenuitlaat', 'groepsuitlaat'],
    metaTitle: 'Hondentraining in België | TailTribe',
    metaDescription: 'Professionele hondentraining en gedragsbegeleiding door ervaren trainers. Gehoorzaamheid en gedragstraining. Ontdek trainers in jouw buurt.'
  },
  {
    slug: 'dierenoppas',
    code: 'PET_SITTING',
    title: 'Dierenoppas',
    shortDescription: 'Optimale zorg in de vertrouwde thuisomgeving',
    icon: '🏠',
    imageSrc: '/assets/hondenoppas.png',
    imageAlt: 'Dierenoppas illustratie',
    relatedSlugs: ['dierenopvang', 'verzorging-aan-huis'],
    metaTitle: 'Dierenoppas in België | TailTribe',
    metaDescription: 'Professionele dierenoppas in de vertrouwde thuisomgeving. Optimale zorg voor jouw huisdier. Ontdek verzorgers in jouw buurt.'
  },
  {
    slug: 'dierenopvang',
    code: 'PET_BOARDING',
    title: 'Dierenopvang',
    shortDescription: 'Professionele opvang in een veilige, huiselijke omgeving',
    icon: '🏡',
    imageSrc: '/assets/hondenopvang.png',
    imageAlt: 'Dierenopvang illustratie',
    relatedSlugs: ['dierenoppas', 'verzorging-aan-huis'],
    metaTitle: 'Dierenopvang in België | TailTribe',
    metaDescription: 'Professionele dierenopvang in een veilige, huiselijke omgeving. Betrouwbare verzorging voor jouw huisdier. Ontdek opvang in jouw buurt.'
  },
  {
    slug: 'verzorging-aan-huis',
    code: 'HOME_CARE',
    title: 'Verzorging aan huis',
    shortDescription: 'Zorg voor kortere periodes bij je thuis als je weg bent',
    icon: '🏠',
    imageSrc: '/assets/hondenoppas.png',
    imageAlt: 'Verzorging aan huis illustratie',
    relatedSlugs: ['dierenoppas', 'dierenopvang'],
    metaTitle: 'Verzorging aan huis in België | TailTribe',
    metaDescription: 'Professionele verzorging aan huis voor kortere periodes. Betrouwbare zorg in jouw eigen omgeving. Ontdek verzorgers in jouw buurt.'
  },
  {
    slug: 'begeleiding-events',
    code: 'EVENT_COMPANION',
    title: 'Begeleiding events',
    shortDescription: 'Speciale zorg tijdens bruiloften en belangrijke momenten',
    icon: '🎉',
    imageSrc: '/assets/Begleider Bruiloft.png',
    imageAlt: 'Begeleiding events illustratie',
    relatedSlugs: ['dierenoppas', 'transport-huisdieren'],
    metaTitle: 'Begeleiding events met huisdieren in België | TailTribe',
    metaDescription: 'Speciale verzorging tijdens bruiloften en belangrijke momenten. Professionele begeleiding voor jouw huisdier. Ontdek verzorgers in jouw buurt.'
  },
  {
    slug: 'transport-huisdieren',
    code: 'PET_TRANSPORT',
    title: 'Transport huisdieren',
    shortDescription: 'Veilig en comfortabel transport naar elke bestemming',
    icon: '🚗',
    imageSrc: '/assets/transport van huisdieren.png',
    imageAlt: 'Transport huisdieren illustratie',
    relatedSlugs: ['begeleiding-events', 'dierenoppas'],
    metaTitle: 'Transport huisdieren in België | TailTribe',
    metaDescription: 'Veilig en comfortabel transport voor jouw huisdier naar elke bestemming. Professionele transportservice. Ontdek verzorgers in jouw buurt.'
  },
  {
    slug: 'verzorging-kleinvee',
    code: 'SMALL_ANIMAL_CARE',
    title: 'Verzorging kleinvee',
    shortDescription: 'Verzorging van boerderijdieren',
    icon: '🐄',
    imageSrc: '/assets/verzorging kleinvee.png',
    imageAlt: 'Verzorging kleinvee illustratie',
    relatedSlugs: ['dierenoppas', 'dierenopvang'],
    metaTitle: 'Verzorging kleinvee in België | TailTribe',
    metaDescription: 'Professionele verzorging van boerderijdieren en kleinvee. Ervaren verzorgers voor jouw dieren. Ontdek verzorgers in jouw buurt.'
  }
]

export function getServiceBySlug(slug: string): Service | undefined {
  return services.find(service => service.slug === slug)
}

export function getRelatedServices(service: Service): Service[] {
  return service.relatedSlugs
    .map(slug => getServiceBySlug(slug))
    .filter((service): service is Service => service !== undefined)
}
