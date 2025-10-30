// Validation helper functions

export const validatePostcode = (postcode: string, country: string): { valid: boolean; error?: string } => {
  if (!postcode) {
    return { valid: false, error: 'Postcode is verplicht' }
  }

  if (country === 'NL') {
    // NL: 1234AB format
    if (!/^[1-9][0-9]{3}\s?[A-Z]{2}$/i.test(postcode)) {
      return { valid: false, error: 'Ongeldige Nederlandse postcode (bijv. 1012AB)' }
    }
  } else {
    // BE: 1000-9999 format
    if (!/^[1-9][0-9]{3}$/.test(postcode)) {
      return { valid: false, error: 'Ongeldige Belgische postcode (bijv. 1000)' }
    }
  }

  return { valid: true }
}

export const validatePhone = (phone: string): { valid: boolean; error?: string } => {
  if (!phone) {
    return { valid: true } // Phone is optional
  }

  // Remove spaces and dashes
  const cleaned = phone.replace(/[\s-]/g, '')
  
  // Should start with + and have 10-15 digits
  if (!/^\+[0-9]{10,15}$/.test(cleaned)) {
    return { valid: false, error: 'Ongeldig telefoonnummer (bijv. +32 123 45 67 89)' }
  }

  return { valid: true }
}

export const validateEmail = (email: string): { valid: boolean; error?: string } => {
  if (!email) {
    return { valid: false, error: 'Email is verplicht' }
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { valid: false, error: 'Ongeldig email adres' }
  }

  return { valid: true }
}

export const validateIBAN = (iban: string): { valid: boolean; error?: string } => {
  if (!iban) {
    return { valid: false, error: 'IBAN is verplicht' }
  }

  // Remove spaces
  const cleaned = iban.replace(/\s/g, '').toUpperCase()

  // Basic IBAN format: 2 letters + 2 digits + up to 30 alphanumeric
  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]{1,30}$/.test(cleaned)) {
    return { valid: false, error: 'Ongeldig IBAN formaat (bijv. BE71 0961 2345 6769)' }
  }

  // Check common country lengths
  const countryLengths: { [key: string]: number } = {
    BE: 16, NL: 18, DE: 22, FR: 27, ES: 24, IT: 27, PT: 25
  }

  const country = cleaned.substring(0, 2)
  if (countryLengths[country] && cleaned.length !== countryLengths[country]) {
    return { valid: false, error: `IBAN voor ${country} moet ${countryLengths[country]} tekens zijn` }
  }

  return { valid: true }
}

export const validatePrice = (price: string | number): { valid: boolean; error?: string } => {
  const numPrice = typeof price === 'string' ? parseFloat(price) : price

  if (isNaN(numPrice)) {
    return { valid: false, error: 'Prijs moet een getal zijn' }
  }

  if (numPrice < 5) {
    return { valid: false, error: 'Prijs moet minimaal €5 zijn' }
  }

  if (numPrice > 800) {
    return { valid: false, error: 'Prijs mag maximaal €800 zijn' }
  }

  return { valid: true }
}

export const validateBio = (bio: string, minLength: number = 80): { valid: boolean; error?: string } => {
  if (!bio || bio.trim().length === 0) {
    return { valid: false, error: 'Bio is verplicht' }
  }

  if (bio.trim().length < minLength) {
    return { valid: false, error: `Bio moet minimaal ${minLength} tekens zijn (nu: ${bio.trim().length})` }
  }

  return { valid: true }
}

export const validateActionRadius = (radius: string | number): { valid: boolean; error?: string } => {
  const numRadius = typeof radius === 'string' ? parseInt(radius) : radius

  if (isNaN(numRadius)) {
    return { valid: false, error: 'Actieradius moet een getal zijn' }
  }

  if (numRadius < 1) {
    return { valid: false, error: 'Actieradius moet minimaal 1 km zijn' }
  }

  if (numRadius > 100) {
    return { valid: false, error: 'Actieradius mag maximaal 100 km zijn' }
  }

  return { valid: true }
}

export const validateCity = (city: string): { valid: boolean; error?: string } => {
  if (!city || city.trim().length === 0) {
    return { valid: false, error: 'Stad is verplicht' }
  }

  if (city.trim().length < 2) {
    return { valid: false, error: 'Stad moet minimaal 2 tekens zijn' }
  }

  return { valid: true }
}

// Validate if postcode and city are from same country (using postcode ranges)
export const validatePostcodeCity = (postcode: string, city: string): { valid: boolean; error?: string } => {
  if (!postcode || !city) {
    return { valid: true } // Skip if either is empty
  }

  // Detect country from postcode format
  const hasLetters = /[a-zA-Z]/.test(postcode)
  const postcodeCountry = hasLetters ? 'NL' : 'BE'

  // Belgian postcode ranges (1000-9999 are ALL Belgian)
  // Simplified: if it's 4 digits, it MUST be Belgian
  if (!hasLetters) {
    const postcodeNum = parseInt(postcode)
    if (postcodeNum >= 1000 && postcodeNum <= 9999) {
      // This is definitely a Belgian postcode
      // Now check if city sounds Dutch
      const dutchIndicators = [
        'straat', 'gracht', 'plein', 'laan', 'weg', 'dam', 'dijk', 'kade',
        'aan de', 'aan het', 'op de', 'van de'
      ]
      
      // Check for obviously Dutch city names (very common NL cities)
      const obviousNlCities = [
        'amsterdam', 'rotterdam', 'den haag', 'utrecht', 'eindhoven', 'groningen',
        'tilburg', 'almere', 'breda', 'nijmegen', 'apeldoorn', 'haarlem', 'arnhem',
        'enschede', 'amersfoort', 'maastricht', 'leiden', 'dordrecht', 'zoetermeer',
        'zwolle', 'deventer', 'delft', 'alkmaar', 'leeuwarden', 'venlo', 'helmond',
        'heerlen', 'oss', 'vlaardingen', 'purmerend', 'amstelveen', 'hilversum',
        'schiedam', 'emmen', 'roermond', 'bergen op zoom', 'den bosch', 's-hertogenbosch'
      ]
      
      const cityLower = city.toLowerCase().trim()
      
      if (obviousNlCities.some(nlCity => cityLower === nlCity || cityLower.includes(nlCity))) {
        return {
          valid: false,
          error: `${city} is een Nederlandse stad. Gebruik een Nederlandse postcode (bijv. 1012AB)`
        }
      }
    }
  }

  // Dutch postcode (with letters) - check if it's not a Belgian city
  if (hasLetters) {
    // This is definitely a Dutch postcode
    // Check for obviously Belgian city names
    const obviousBeCities = [
      'brussel', 'antwerpen', 'gent', 'charleroi', 'luik', 'brugge', 'leuven',
      'mechelen', 'aalst', 'kortrijk', 'oostende', 'hasselt', 'genk', 'sint-niklaas',
      'turnhout', 'roeselare', 'beveren', 'dendermonde', 'vilvoorde', 'brasschaat',
      'mol', 'lommel', 'menen', 'waregem', 'deinze', 'oudenaarde', 'halle', 'ninove',
      'kalmthout', 'kapellen', 'stabroek', 'schoten', 'edegem', 'kontich', 'mortsel',
      'boom', 'temse', 'hamme', 'lokeren', 'eeklo', 'zelzate', 'assenede',
      'geel', 'herentals', 'westerlo', 'olen', 'vorselaar', 'laakdal', 'balen',
      'tongeren', 'bilzen', 'riemst', 'hoeselt', 'borgloon', 'heers', 'gingelom',
      'waremme', 'berloz', 'crisnée', 'donceel', 'faimes', 'fexhe-le-haut-clocher',
      'aarschot', 'diest', 'scherpenheuvel', 'tielt-winge', 'tremelo', 'glabbeek'
    ]
    
    const cityLower = city.toLowerCase().trim()
    
    if (obviousBeCities.some(beCity => cityLower === beCity || cityLower.includes(beCity))) {
      return {
        valid: false,
        error: `${city} is een Belgische stad. Gebruik een Belgische postcode (bijv. 2000)`
      }
    }
  }

  return { valid: true }
}

export const validateName = (name: string, fieldName: string = 'Naam'): { valid: boolean; error?: string } => {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: `${fieldName} is verplicht` }
  }

  if (name.trim().length < 2) {
    return { valid: false, error: `${fieldName} moet minimaal 2 tekens zijn` }
  }

  return { valid: true }
}

export const validateMaxAnimals = (max: string | number): { valid: boolean; error?: string } => {
  const numMax = typeof max === 'string' ? parseInt(max) : max

  if (isNaN(numMax)) {
    return { valid: false, error: 'Moet een getal zijn' }
  }

  if (numMax < 1) {
    return { valid: false, error: 'Minimaal 1 dier tegelijk' }
  }

  if (numMax > 20) {
    return { valid: false, error: 'Maximaal 20 dieren tegelijk' }
  }

  return { valid: true }
}
