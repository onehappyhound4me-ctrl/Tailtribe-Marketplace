/**
 * Uniforme diersoorten voor de gehele site
 * Gebruikt voor:
 * - Huisdier toevoegen/bewerken (owners)
 * - Verzorger profiel (caregivers)
 * - Filters en zoekopdrachten
 */

export const ANIMAL_TYPES = [
  { id: 'DOG', label: 'Hond', icon: '◉' },
  { id: 'CAT', label: 'Kat', icon: '◉' },
  { id: 'SMALL_ANIMAL', label: 'Kleine huisdieren', icon: '◉' },
  { id: 'FISH', label: 'Vissen', icon: '◉' },
  { id: 'BIRD', label: 'Vogels', icon: '◉' },
  { id: 'REPTILE', label: 'Reptielen', icon: '◉' },
  { id: 'SMALL_LIVESTOCK', label: 'Kleinvee', icon: '◉' },
  { id: 'OTHER', label: 'Anders', icon: '◉' }
] as const

export type AnimalType = typeof ANIMAL_TYPES[number]['id']

/**
 * Mapping voor backwards compatibility met oude data
 */
export const ANIMAL_TYPE_ALIASES: Record<string, string> = {
  'RABBIT': 'SMALL_ANIMAL',    // Old pet data
  'RODENT': 'SMALL_ANIMAL',    // Old pet data
  'HORSE': 'SMALL_LIVESTOCK',  // Old pet data
}

/**
 * Helper functie om oude type codes te converteren naar nieuwe
 */
export function normalizeAnimalType(typeId: string): string {
  return ANIMAL_TYPE_ALIASES[typeId] || typeId
}

/**
 * Helper functie om het label van een diersoort op te halen
 */
export function getAnimalTypeLabel(typeId: string): string {
  // Normalize old type codes first
  const normalizedId = normalizeAnimalType(typeId)
  const type = ANIMAL_TYPES.find(t => t.id === normalizedId)
  return type?.label || typeId
}

/**
 * Helper functie om het icoon van een diersoort op te halen
 */
export function getAnimalTypeIcon(typeId: string): string {
  // Normalize old type codes first
  const normalizedId = normalizeAnimalType(typeId)
  const type = ANIMAL_TYPES.find(t => t.id === normalizedId)
  return type?.icon || '🐾'
}

/**
 * Helper functie om diertype te formatteren (met custom type indien van toepassing)
 */
export function formatAnimalType(typeId: string, customType?: string | null): string {
  if (typeId === 'OTHER' && customType) {
    return customType
  }
  return getAnimalTypeLabel(typeId)
}
