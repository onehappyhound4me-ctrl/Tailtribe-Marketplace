/**
 * Service slug mapping - Nederlandse slugs voor URLs
 * Maps Nederlandse URL slugs to English service codes
 */

export const serviceSlugToCode: Record<string, string> = {
  'hondenuitlaat': 'DOG_WALKING',
  'groepsuitlaat': 'GROUP_DOG_WALKING',
  'hondentraining': 'DOG_TRAINING',
  'dierenoppas': 'PET_SITTING',
  'dierenopvang': 'PET_BOARDING',
  'verzorging-aan-huis': 'HOME_CARE',
  'transport-huisdieren': 'PET_TRANSPORT',
  'verzorging-kleinvee': 'SMALL_ANIMAL_CARE',
  'begeleiding-events': 'EVENT_COMPANION',
}

export const serviceCodeToSlug: Record<string, string> = {
  'DOG_WALKING': 'hondenuitlaat',
  'GROUP_DOG_WALKING': 'groepsuitlaat',
  'DOG_TRAINING': 'hondentraining',
  'PET_SITTING': 'dierenoppas',
  'PET_BOARDING': 'dierenopvang',
  'HOME_CARE': 'verzorging-aan-huis',
  'PET_TRANSPORT': 'transport-huisdieren',
  'SMALL_ANIMAL_CARE': 'verzorging-kleinvee',
  'EVENT_COMPANION': 'begeleiding-events',
}

/**
 * Convert service code to Dutch slug for URL
 */
export function serviceCodeToSlugFn(code: string): string {
  return serviceCodeToSlug[code] || code.toLowerCase()
}

/**
 * Convert Dutch slug to service code
 */
export function serviceSlugToCodeFn(slug: string): string {
  return serviceSlugToCode[slug] || slug.toUpperCase().replace(/-/g, '_')
}


