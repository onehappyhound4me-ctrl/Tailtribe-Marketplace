// Geocoding helper to get lat/lng from postcode + city

export interface GeoLocation {
  lat: number
  lng: number
  success: boolean
  error?: string
}

export async function geocodeAddress(postalCode: string, city: string, country: string): Promise<GeoLocation> {
  try {
    // Use Nominatim (OpenStreetMap) - free geocoding
    const query = `${postalCode} ${city}, ${country === 'NL' ? 'Netherlands' : 'Belgium'}`
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=1`
    
    const response = await fetch(url, {
      headers: {
        'User-Agent': 'TailTribe Platform'
      }
    })
    
    if (!response.ok) {
      return { lat: 0, lng: 0, success: false, error: 'Geocoding service niet beschikbaar' }
    }
    
    const data = await response.json()
    
    if (data && data.length > 0) {
      return {
        lat: parseFloat(data[0].lat),
        lng: parseFloat(data[0].lon),
        success: true
      }
    }
    
    return { lat: 0, lng: 0, success: false, error: 'Locatie niet gevonden' }
    
  } catch (error) {
    console.error('Geocoding error:', error)
    return { lat: 0, lng: 0, success: false, error: 'Fout bij ophalen locatie' }
  }
}

// Fallback: Use approximate coordinates for major cities
export function getFallbackCoordinates(city: string, country: string): GeoLocation | null {
  const coordinates: Record<string, { lat: number; lng: number }> = {
    // Netherlands
    'amsterdam': { lat: 52.3676, lng: 4.9041 },
    'rotterdam': { lat: 51.9244, lng: 4.4777 },
    'den haag': { lat: 52.0705, lng: 4.3007 },
    'utrecht': { lat: 52.0907, lng: 5.1214 },
    'eindhoven': { lat: 51.4416, lng: 5.4697 },
    'groningen': { lat: 53.2194, lng: 6.5665 },
    'tilburg': { lat: 51.5555, lng: 5.0913 },
    'almere': { lat: 52.3508, lng: 5.2647 },
    'breda': { lat: 51.5719, lng: 4.7683 },
    'nijmegen': { lat: 51.8126, lng: 5.8372 },
    
    // Belgium
    'brussel': { lat: 50.8503, lng: 4.3517 },
    'antwerpen': { lat: 51.2213, lng: 4.4051 },
    'gent': { lat: 51.0543, lng: 3.7174 },
    'charleroi': { lat: 50.4108, lng: 4.4446 },
    'luik': { lat: 50.6326, lng: 5.5797 },
    'brugge': { lat: 51.2093, lng: 3.2247 },
    'leuven': { lat: 50.8798, lng: 4.7005 },
    'mechelen': { lat: 51.0259, lng: 4.4777 },
    'aalst': { lat: 50.9370, lng: 4.0404 },
    'kortrijk': { lat: 50.8279, lng: 3.2646 },
    'oostende': { lat: 51.2211, lng: 2.9271 },
    'hasselt': { lat: 50.9307, lng: 5.3378 },
    'genk': { lat: 50.9657, lng: 5.5005 },
    'turnhout': { lat: 51.3227, lng: 4.9447 },
    'kalmthout': { lat: 51.3833, lng: 4.4667 },
    'kapellen': { lat: 51.3167, lng: 4.4333 },
    'brasschaat': { lat: 51.2917, lng: 4.4917 },
  }
  
  const cityLower = city.toLowerCase().trim()
  const coords = coordinates[cityLower]
  
  if (coords) {
    return { ...coords, success: true }
  }
  
  return null
}

// Combined: Try geocoding, fallback to coordinates
export async function getCoordinates(postalCode: string, city: string, country: string): Promise<GeoLocation> {
  // Try online geocoding first
  const geoResult = await geocodeAddress(postalCode, city, country)
  
  if (geoResult.success) {
    return geoResult
  }
  
  // Fallback to local coordinates for known cities
  const fallback = getFallbackCoordinates(city, country)
  
  if (fallback) {
    return fallback
  }
  
  // No coordinates found
  return { 
    lat: 0, 
    lng: 0, 
    success: false, 
    error: 'Kon geen coördinaten vinden voor deze locatie' 
  }
}




































