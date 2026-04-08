import type { BEPlace, BEProvince } from '@/data/be-geo'
import { getProvinceBySlug } from '@/data/be-geo'
import type { DispatchService } from '@/lib/services'

const PROVINCE_ORDER = [
  'antwerpen',
  'oost-vlaanderen',
  'vlaams-brabant',
  'west-vlaanderen',
  'limburg',
  'brussel',
  'luik',
  'henegouwen',
  'namen',
] as const

export type LocalPlaceLink = {
  province: string
  place: string
  placeName: string
  provinceName: string
}

/** Cities for internal links from national `/diensten/[slug]` → `/be/...` streekpagina's. */
export function topPlacesForLocalServiceLinks(max = 18): LocalPlaceLink[] {
  const out: LocalPlaceLink[] = []
  for (const provSlug of PROVINCE_ORDER) {
    const p = getProvinceBySlug(provSlug)
    if (!p) continue
    const places = (p.allPlaces ?? p.topPlaces).slice(0, 2)
    for (const pl of places) {
      out.push({
        province: p.slug,
        place: pl.slug,
        placeName: pl.name,
        provinceName: p.name,
      })
      if (out.length >= max) return out
    }
  }
  return out
}

/** Houdt provincievolgorde zoals in `topPlacesForLocalServiceLinks` ( eerste plaats = eerste groep ). */
export function groupLocalPlaceLinksByProvince(
  links: LocalPlaceLink[]
): { province: string; provinceName: string; places: LocalPlaceLink[] }[] {
  const groups: { province: string; provinceName: string; places: LocalPlaceLink[] }[] = []
  for (const l of links) {
    const last = groups[groups.length - 1]
    if (last?.province === l.province) {
      last.places.push(l)
    } else {
      groups.push({ province: l.province, provinceName: l.provinceName, places: [l] })
    }
  }
  return groups
}

export function localServiceLocationDescription(
  service: DispatchService,
  place: BEPlace,
  province: BEProvince
): string {
  const basis = service.metaDescription ?? service.desc
  return `${service.name} in ${place.name} (${province.name}): ${basis}`
}
