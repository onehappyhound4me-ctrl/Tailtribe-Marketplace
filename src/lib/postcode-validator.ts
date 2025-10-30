// Real postcode validation using external APIs

export interface PostcodeValidationResult {
  valid: boolean
  error?: string
  city?: string
  lat?: number
  lng?: number
}

// Validate Belgian postcode - check if it exists and get the city name
async function validateBelgianPostcode(postcode: string, city: string): Promise<PostcodeValidationResult> {
  try {
    // First, query JUST the postcode to see what city it belongs to
    const postcodeQuery = `${postcode}, Belgium`
    const url = `https://nominatim.openstreetmap.org/search?format=json&postalcode=${postcode}&countrycodes=be&limit=5`
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'TailTribe Platform' }
    })
    
    if (!response.ok) {
      return { valid: true } // API down, allow through
    }
    
    const data = await response.json()
    
    if (data && data.length > 0) {
      const result = data[0]
      const displayName = result.display_name || ''
      const userCity = city.toLowerCase().trim()
      
      // Parse display_name: "2920, Kalmthout, Antwerpen, België"
      // parts[0] = postcode
      // parts[1] = GEMEENTE (what we need!)
      // parts[2] = Provincie (NOT the city!)
      const parts = displayName.split(',').map((p: string) => p.trim().toLowerCase())
      const gemeente = parts[1] || ''
      
      // Check if user's city matches the GEMEENTE (not provincie!)
      if (gemeente && (gemeente === userCity || gemeente.includes(userCity) || userCity.includes(gemeente))) {
        return {
          valid: true,
          city: city,
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        }
      }
      
      // Mismatch - wrong city
      return {
        valid: false,
        error: `Postcode ${postcode} hoort bij ${parts[1] || 'een andere plaats'}, niet bij ${city}`
      }
    }
    
    // Postcode not found at all
    return {
      valid: false,
      error: `Postcode ${postcode} niet gevonden in België`
    }
    
  } catch (error) {
    console.error('Belgian postcode validation error:', error)
    return { valid: true } // Error, allow through
  }
}

// Validate Dutch postcode - check if it exists and get the city name
async function validateDutchPostcode(postcode: string, city: string): Promise<PostcodeValidationResult> {
  try {
    // Query JUST the postcode to see what city it belongs to
    const url = `https://nominatim.openstreetmap.org/search?format=json&postalcode=${postcode}&countrycodes=nl&limit=5`
    
    const response = await fetch(url, {
      headers: { 'User-Agent': 'TailTribe Platform' }
    })
    
    if (!response.ok) {
      return { valid: true } // API down, allow through
    }
    
    const data = await response.json()
    
    if (data && data.length > 0) {
      const result = data[0]
      const displayName = result.display_name || ''
      const userCity = city.toLowerCase().trim()
      
      // Parse display_name: "1012, Amsterdam, Noord-Holland, Nederland"
      // parts[0] = postcode
      // parts[1] = STAD/GEMEENTE
      // parts[2] = Provincie
      const parts = displayName.split(',').map((p: string) => p.trim().toLowerCase())
      const gemeente = parts[1] || ''
      
      // Check if user's city matches the GEMEENTE
      if (gemeente && (gemeente === userCity || gemeente.includes(userCity) || userCity.includes(gemeente))) {
        return {
          valid: true,
          city: city,
          lat: parseFloat(result.lat),
          lng: parseFloat(result.lon)
        }
      }
      
      // Mismatch - wrong city
      return {
        valid: false,
        error: `Postcode ${postcode} hoort bij ${parts[1] || 'een andere plaats'}, niet bij ${city}`
      }
    }
    
    // Postcode not found
    return {
      valid: false,
      error: `Postcode ${postcode} niet gevonden in Nederland`
    }
    
  } catch (error) {
    console.error('Dutch postcode validation error:', error)
    return { valid: true } // Error, allow through
  }
}

// Main validation function
export async function validatePostcodeWithCity(
  postcode: string, 
  city: string, 
  country: string
): Promise<PostcodeValidationResult> {
  
  if (!postcode || !city) {
    return { valid: false, error: 'Postcode en stad zijn verplicht' }
  }

  // Clean inputs
  const cleanPostcode = postcode.trim().toUpperCase().replace(/\s/g, '')
  const cleanCity = city.trim()

  if (country === 'BE') {
    return validateBelgianPostcode(cleanPostcode, cleanCity)
  } else {
    return validateDutchPostcode(cleanPostcode, cleanCity)
  }
}

