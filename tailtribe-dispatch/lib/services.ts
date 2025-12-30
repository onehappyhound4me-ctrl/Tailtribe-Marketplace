export type DispatchService = {
  id:
    | 'DOG_WALKING'
    | 'GROUP_DOG_WALKING'
    | 'DOG_TRAINING'
    | 'PET_SITTING'
    | 'PET_BOARDING'
    | 'HOME_CARE'
    | 'PET_TRANSPORT'
    | 'SMALL_ANIMAL_CARE'
    | 'EVENT_COMPANION'
  name: string
  desc: string
  image: string
}

// Canonical services list (match SaaS labels + use original assets)
export const DISPATCH_SERVICES: DispatchService[] = [
  {
    id: 'DOG_WALKING',
    name: 'Hondenuitlaat',
    desc: 'Dagelijkse wandelingen voor jouw hond',
    image: '/assets/Hondenuitlaat.png',
  },
  {
    id: 'GROUP_DOG_WALKING',
    name: 'Groepsuitlaat',
    desc: 'Sociale uitstapjes met andere honden',
    image: '/assets/groepsuitlaat.png',
  },
  {
    id: 'DOG_TRAINING',
    name: 'Hondentraining',
    desc: 'Professionele training en begeleiding',
    image: '/assets/hondentraining.png',
  },
  {
    id: 'PET_SITTING',
    name: 'Dierenoppas',
    desc: 'Betrouwbare oppas bij de verzorger',
    image: '/assets/hondenoppas.png',
  },
  {
    id: 'PET_BOARDING',
    name: 'Dierenopvang',
    desc: 'Verzorging in een veilige omgeving',
    image: '/assets/hondenopvang.png',
  },
  {
    id: 'HOME_CARE',
    name: 'Verzorging aan huis',
    desc: 'Zorg in het comfort van je eigen huis',
    image: '/assets/home-visit.png',
  },
  {
    id: 'PET_TRANSPORT',
    name: 'Transport huisdieren',
    desc: 'Veilig transport voor jouw huisdier',
    image: '/assets/transport van huisdieren.png',
  },
  {
    id: 'SMALL_ANIMAL_CARE',
    name: 'Verzorging kleinvee',
    desc: 'Zorg voor kleine dieren (konijn, cavia, vogel, …)',
    image: '/assets/verzorging kleinvee.png',
  },
  {
    id: 'EVENT_COMPANION',
    name: 'Begeleiding events',
    desc: 'Begeleiding tijdens events (bv. bruiloft)',
    image: '/assets/Begleider Bruiloft.png',
  },
]

export const SERVICE_LABELS: Record<DispatchService['id'], string> = DISPATCH_SERVICES.reduce(
  (acc, s) => {
    acc[s.id] = s.name
    return acc
  },
  {} as Record<DispatchService['id'], string>
)



