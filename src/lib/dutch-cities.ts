// Nederlandse provincies en grote steden
export const DUTCH_PROVINCES = [
  { code: 'NH', name: 'Noord-Holland' },
  { code: 'ZH', name: 'Zuid-Holland' },
  { code: 'UT', name: 'Utrecht' },
  { code: 'NB', name: 'Noord-Brabant' },
  { code: 'GE', name: 'Gelderland' },
  { code: 'OV', name: 'Overijssel' },
  { code: 'LI', name: 'Limburg' },
  { code: 'GR', name: 'Groningen' },
  { code: 'FR', name: 'Friesland' },
  { code: 'DR', name: 'Drenthe' },
  { code: 'FL', name: 'Flevoland' },
  { code: 'ZE', name: 'Zeeland' }
]

export const DUTCH_CITIES = [
  // Noord-Holland
  'Amsterdam', 'Haarlem', 'Zaanstad', 'Haarlemmermeer', 'Amstelveen',
  'Alkmaar', 'Hilversum', 'Purmerend', 'Hoorn', 'Velsen',
  
  // Zuid-Holland
  'Rotterdam', 'Den Haag', 'Leiden', 'Dordrecht', 'Zoetermeer',
  'Delft', 'Alphen aan den Rijn', 'Westland', 'Katwijk', 'Gouda',
  
  // Utrecht
  'Utrecht', 'Amersfoort', 'Veenendaal', 'Nieuwegein', 'Zeist',
  
  // Noord-Brabant
  'Eindhoven', 'Tilburg', 'Breda', 's-Hertogenbosch', 'Helmond',
  'Oss', 'Bergen op Zoom', 'Roosendaal',
  
  // Gelderland
  'Nijmegen', 'Arnhem', 'Apeldoorn', 'Ede', 'Doetinchem',
  
  // Overijssel
  'Enschede', 'Zwolle', 'Almelo', 'Deventer', 'Hengelo',
  
  // Limburg
  'Maastricht', 'Venlo', 'Sittard-Geleen', 'Heerlen',
  
  // Groningen
  'Groningen',
  
  // Friesland
  'Leeuwarden',
  
  // Flevoland
  'Almere', 'Lelystad'
]

export const BELGIUM_PROVINCES = [
  { code: 'VAN', name: 'Antwerpen' },
  { code: 'VLI', name: 'Limburg' },
  { code: 'VOV', name: 'Oost-Vlaanderen' },
  { code: 'VWV', name: 'West-Vlaanderen' },
  { code: 'VBR', name: 'Vlaams-Brabant' },
  { code: 'BRU', name: 'Brussels Hoofdstedelijk Gewest' },
  { code: 'WHT', name: 'Henegouwen' },
  { code: 'WLG', name: 'Luik' },
  { code: 'WLX', name: 'Luxemburg' },
  { code: 'WNA', name: 'Namen' },
  { code: 'WBR', name: 'Waals-Brabant' }
]

export const BELGIUM_CITIES = [
  // Vlaanderen
  'Antwerpen', 'Gent', 'Brugge', 'Leuven', 'Mechelen',
  'Aalst', 'Kortrijk', 'Hasselt', 'Sint-Niklaas', 'Oostende',
  'Genk', 'Roeselare', 'Turnhout', 'Dilbeek', 'Vilvoorde',
  
  // Brussel
  'Brussel', 'Schaarbeek', 'Anderlecht', 'Molenbeek', 'Ixelles',
  
  // Wallonië
  'Charleroi', 'Liège', 'Namur', 'Mons', 'La Louvière',
  'Tournai', 'Verviers', 'Seraing'
]

export function getCitiesByCountry(country: 'BE' | 'NL'): string[] {
  return country === 'NL' ? DUTCH_CITIES : BELGIUM_CITIES
}

export function getProvincesByCountry(country: 'BE' | 'NL') {
  return country === 'NL' ? DUTCH_PROVINCES : BELGIUM_PROVINCES
}




