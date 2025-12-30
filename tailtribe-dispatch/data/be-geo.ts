export type BEPlace = {
  name: string
  slug: string
  lat: number
  lng: number
}

export type BEProvince = {
  name: string
  slug: string
  region: 'vlaanderen' | 'wallonie' | 'brussel'
  topPlaces: BEPlace[]
  allPlaces?: BEPlace[]
}

// Flanders - comprehensive coverage
const antwerpenPlaces: BEPlace[] = [
  { name: 'Antwerpen', slug: 'antwerpen', lat: 51.2194, lng: 4.4025 },
  { name: 'Mechelen', slug: 'mechelen', lat: 51.0259, lng: 4.4775 },
  { name: 'Turnhout', slug: 'turnhout', lat: 51.3227, lng: 4.9447 },
  { name: 'Mol', slug: 'mol', lat: 51.1925, lng: 5.1167 },
  { name: 'Heist-op-den-Berg', slug: 'heist-op-den-berg', lat: 51.0708, lng: 4.7281 },
  { name: 'Lier', slug: 'lier', lat: 51.1314, lng: 4.5697 },
  { name: 'Hoogstraten', slug: 'hoogstraten', lat: 51.4, lng: 4.7597 },
  { name: 'Geel', slug: 'geel', lat: 51.1667, lng: 4.9906 },
  { name: 'Westerlo', slug: 'westerlo', lat: 51.0906, lng: 4.9181 },
  { name: 'Herentals', slug: 'herentals', lat: 51.1775, lng: 4.8342 },
  { name: 'Duffel', slug: 'duffel', lat: 51.0958, lng: 4.5075 },
  { name: 'Brasschaat', slug: 'brasschaat', lat: 51.2908, lng: 4.4881 },
]

const oostVlaanderenPlaces: BEPlace[] = [
  { name: 'Gent', slug: 'gent', lat: 51.0543, lng: 3.7174 },
  { name: 'Aalst', slug: 'aalst', lat: 50.937, lng: 4.0435 },
  { name: 'Sint-Niklaas', slug: 'sint-niklaas', lat: 51.1667, lng: 4.1436 },
  { name: 'Dendermonde', slug: 'dendermonde', lat: 51.0281, lng: 4.1019 },
  { name: 'Eeklo', slug: 'eeklo', lat: 51.1856, lng: 3.5608 },
  { name: 'Lokeren', slug: 'lokeren', lat: 51.1036, lng: 3.9928 },
  { name: 'Ronse', slug: 'ronse', lat: 50.7456, lng: 3.5997 },
  { name: 'Oudenaarde', slug: 'oudenaarde', lat: 50.8456, lng: 3.6089 },
  { name: 'Geraardsbergen', slug: 'geraardsbergen', lat: 50.7739, lng: 3.8814 },
  { name: 'Wetteren', slug: 'wetteren', lat: 51.0092, lng: 3.8828 },
  { name: 'Ninove', slug: 'ninove', lat: 50.8275, lng: 4.0267 },
  { name: 'Zottegem', slug: 'zottegem', lat: 50.8697, lng: 3.8106 },
]

const vlaamsBrabantPlaces: BEPlace[] = [
  { name: 'Leuven', slug: 'leuven', lat: 50.8798, lng: 4.7005 },
  { name: 'Vilvoorde', slug: 'vilvoorde', lat: 50.9269, lng: 4.4281 },
  { name: 'Halle', slug: 'halle', lat: 50.7344, lng: 4.2356 },
  { name: 'Tienen', slug: 'tienen', lat: 50.8075, lng: 4.9381 },
  { name: 'Aarschot', slug: 'aarschot', lat: 50.9858, lng: 4.8381 },
  { name: 'Diest', slug: 'diest', lat: 50.9892, lng: 5.0508 },
  { name: 'Zaventem', slug: 'zaventem', lat: 50.8844, lng: 4.4731 },
  { name: 'Dilbeek', slug: 'dilbeek', lat: 50.8481, lng: 4.2597 },
  { name: 'Grimbergen', slug: 'grimbergen', lat: 50.9336, lng: 4.3719 },
  { name: 'Machelen', slug: 'machelen', lat: 50.9081, lng: 4.4425 },
  { name: 'Overijse', slug: 'overijse', lat: 50.7742, lng: 4.5356 },
  { name: 'Tervuren', slug: 'tervuren', lat: 50.8239, lng: 4.5156 },
]

const westVlaanderenPlaces: BEPlace[] = [
  { name: 'Brugge', slug: 'brugge', lat: 51.2093, lng: 3.2247 },
  { name: 'Oostende', slug: 'oostende', lat: 51.2289, lng: 2.9181 },
  { name: 'Kortrijk', slug: 'kortrijk', lat: 50.8281, lng: 3.265 },
  { name: 'Roeselare', slug: 'roeselare', lat: 50.9481, lng: 3.1269 },
  { name: 'Ieper', slug: 'ieper', lat: 50.8519, lng: 2.885 },
  { name: 'Waregem', slug: 'waregem', lat: 50.8889, lng: 3.4269 },
  { name: 'Menen', slug: 'menen', lat: 50.7975, lng: 3.1219 },
  { name: 'Tielt', slug: 'tielt', lat: 51.0019, lng: 3.3289 },
  { name: 'Veurne', slug: 'veurne', lat: 51.0639, lng: 2.6581 },
  { name: 'Diksmuide', slug: 'diksmuide', lat: 51.0331, lng: 2.8636 },
  { name: 'Harelbeke', slug: 'harelbeke', lat: 50.8564, lng: 3.3119 },
  { name: 'Wervik', slug: 'wervik', lat: 50.7781, lng: 3.0364 },
]

const limburgPlaces: BEPlace[] = [
  { name: 'Hasselt', slug: 'hasselt', lat: 50.9306, lng: 5.3378 },
  { name: 'Genk', slug: 'genk', lat: 50.9658, lng: 5.5036 },
  { name: 'Sint-Truiden', slug: 'sint-truiden', lat: 50.8167, lng: 5.1869 },
  { name: 'Tongeren', slug: 'tongeren', lat: 50.7806, lng: 5.4639 },
  { name: 'Beringen', slug: 'beringen', lat: 51.0492, lng: 5.2264 },
  { name: 'Lommel', slug: 'lommel', lat: 51.2306, lng: 5.3131 },
  { name: 'Maaseik', slug: 'maaseik', lat: 51.0975, lng: 5.7836 },
  { name: 'Bilzen', slug: 'bilzen', lat: 50.8736, lng: 5.5186 },
  { name: 'Maasmechelen', slug: 'maasmechelen', lat: 50.9625, lng: 5.6928 },
  { name: 'Bree', slug: 'bree', lat: 51.1358, lng: 5.5969 },
  { name: 'Pelt', slug: 'pelt', lat: 51.2139, lng: 5.4219 },
  { name: 'Houthalen-Helchteren', slug: 'houthalen-helchteren', lat: 51.0336, lng: 5.3714 },
]

// Brussels - key communes
const brusselPlaces: BEPlace[] = [
  { name: 'Brussel-Stad', slug: 'brussel-stad', lat: 50.8503, lng: 4.3517 },
  { name: 'Elsene', slug: 'elsene', lat: 50.8269, lng: 4.3658 },
  { name: 'Ukkel', slug: 'ukkel', lat: 50.7997, lng: 4.3397 },
  { name: 'Schaarbeek', slug: 'schaarbeek', lat: 50.8675, lng: 4.3731 },
  { name: 'Etterbeek', slug: 'etterbeek', lat: 50.8364, lng: 4.3881 },
  { name: 'Sint-Jans-Molenbeek', slug: 'sint-jans-molenbeek', lat: 50.8569, lng: 4.3297 },
  { name: 'Anderlecht', slug: 'anderlecht', lat: 50.8364, lng: 4.3081 },
  { name: 'Woluwe-Saint-Lambert', slug: 'woluwe-saint-lambert', lat: 50.8447, lng: 4.4267 },
  { name: 'Forest', slug: 'forest', lat: 50.8097, lng: 4.3147 },
  { name: 'Sint-Gillis', slug: 'sint-gillis', lat: 50.8297, lng: 4.3447 },
]

// Wallonia - key cities only
const henegouwenPlaces: BEPlace[] = [
  { name: 'Charleroi', slug: 'charleroi', lat: 50.4108, lng: 4.4439 },
  { name: 'Mons', slug: 'mons', lat: 50.4542, lng: 3.9561 },
  { name: 'Doornik', slug: 'doornik', lat: 50.6056, lng: 3.3889 },
  { name: 'La Louvière', slug: 'la-louviere', lat: 50.4797, lng: 4.1878 },
  { name: 'Mouscron', slug: 'mouscron', lat: 50.7453, lng: 3.2064 },
]

const luikPlaces: BEPlace[] = [
  { name: 'Liège', slug: 'liege', lat: 50.6326, lng: 5.5797 },
  { name: 'Verviers', slug: 'verviers', lat: 50.5892, lng: 5.8631 },
  { name: 'Seraing', slug: 'seraing', lat: 50.6108, lng: 5.4989 },
  { name: 'Herstal', slug: 'herstal', lat: 50.6631, lng: 5.6306 },
  { name: 'Huy', slug: 'huy', lat: 50.5189, lng: 5.2331 },
]

const namenPlaces: BEPlace[] = [
  { name: 'Namur', slug: 'namur', lat: 50.4669, lng: 4.8719 },
  { name: 'Ciney', slug: 'ciney', lat: 50.2958, lng: 5.1006 },
  { name: 'Dinant', slug: 'dinant', lat: 50.2608, lng: 4.9131 },
  { name: 'Gembloux', slug: 'gembloux', lat: 50.5617, lng: 4.6981 },
]

const luxemburgPlaces: BEPlace[] = [
  { name: 'Arlon', slug: 'arlon', lat: 49.6833, lng: 5.8167 },
  { name: 'Bastogne', slug: 'bastogne', lat: 50.0031, lng: 5.7181 },
  { name: 'Durbuy', slug: 'durbuy', lat: 50.3531, lng: 5.4564 },
  { name: 'Marche-en-Famenne', slug: 'marche-en-famenne', lat: 50.2267, lng: 5.3444 },
]

const waalsBrabantPlaces: BEPlace[] = [
  { name: 'Wavre', slug: 'wavre', lat: 50.7156, lng: 4.6061 },
  { name: 'Waterloo', slug: 'waterloo', lat: 50.7144, lng: 4.3997 },
  { name: 'Nivelles', slug: 'nivelles', lat: 50.5981, lng: 4.3264 },
  { name: 'Ottignies-Louvain-la-Neuve', slug: 'ottignies-louvain-la-neuve', lat: 50.6689, lng: 4.6128 },
]

export const PROVINCES: BEProvince[] = [
  // Flanders
  {
    name: 'Antwerpen',
    slug: 'antwerpen',
    region: 'vlaanderen',
    topPlaces: antwerpenPlaces.slice(0, 4),
    allPlaces: antwerpenPlaces,
  },
  {
    name: 'Oost-Vlaanderen',
    slug: 'oost-vlaanderen',
    region: 'vlaanderen',
    topPlaces: oostVlaanderenPlaces.slice(0, 4),
    allPlaces: oostVlaanderenPlaces,
  },
  {
    name: 'Vlaams-Brabant',
    slug: 'vlaams-brabant',
    region: 'vlaanderen',
    topPlaces: vlaamsBrabantPlaces.slice(0, 4),
    allPlaces: vlaamsBrabantPlaces,
  },
  {
    name: 'West-Vlaanderen',
    slug: 'west-vlaanderen',
    region: 'vlaanderen',
    topPlaces: westVlaanderenPlaces.slice(0, 4),
    allPlaces: westVlaanderenPlaces,
  },
  {
    name: 'Limburg',
    slug: 'limburg',
    region: 'vlaanderen',
    topPlaces: limburgPlaces.slice(0, 4),
    allPlaces: limburgPlaces,
  },
  // Brussels
  {
    name: 'Brussels Hoofdstedelijk Gewest',
    slug: 'brussel',
    region: 'brussel',
    topPlaces: brusselPlaces.slice(0, 4),
    allPlaces: brusselPlaces,
  },
  // Wallonia - key cities only
  {
    name: 'Henegouwen',
    slug: 'henegouwen',
    region: 'wallonie',
    topPlaces: henegouwenPlaces,
  },
  {
    name: 'Luik',
    slug: 'luik',
    region: 'wallonie',
    topPlaces: luikPlaces,
  },
  {
    name: 'Namen',
    slug: 'namen',
    region: 'wallonie',
    topPlaces: namenPlaces,
  },
  {
    name: 'Luxemburg',
    slug: 'luxemburg',
    region: 'wallonie',
    topPlaces: luxemburgPlaces,
  },
  {
    name: 'Waals-Brabant',
    slug: 'waals-brabant',
    region: 'wallonie',
    topPlaces: waalsBrabantPlaces,
  },
]

// Helper functions
export const allProvinceSlugs = () => PROVINCES.map((p) => p.slug)

export const allPlaceTriples = () =>
  PROVINCES.flatMap((p) =>
    (p.allPlaces ?? p.topPlaces).map((pl) => ({
      province: p.slug,
      place: pl.slug,
    }))
  )

export function getProvinceBySlug(slug: string): BEProvince | undefined {
  return PROVINCES.find((p) => p.slug === slug)
}

export function getPlacesByProvince(provinceSlug: string): BEPlace[] {
  const province = getProvinceBySlug(provinceSlug)
  if (!province) return []
  return province.allPlaces ?? province.topPlaces
}

export function getPlaceBySlugs(provinceSlug: string, placeSlug: string): BEPlace | undefined {
  const province = getProvinceBySlug(provinceSlug)
  if (!province) return undefined
  const places = province.allPlaces ?? province.topPlaces
  return places.find((pl) => pl.slug === placeSlug)
}

// Popular provinces for footer links
export const getPopularProvinces = () => ['antwerpen', 'oost-vlaanderen', 'vlaams-brabant', 'brussel', 'luik']


