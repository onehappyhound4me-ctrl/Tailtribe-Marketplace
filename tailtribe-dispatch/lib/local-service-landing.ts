import type { BEPlace, BEProvince } from '@/data/be-geo'
import type { DispatchService } from '@/lib/services'

export function localServiceLocationDescription(
  service: DispatchService,
  place: BEPlace,
  province: BEProvince
): string {
  const basis = service.metaDescription ?? service.desc
  return `${service.name} in ${place.name} (${province.name}): ${basis}`
}
