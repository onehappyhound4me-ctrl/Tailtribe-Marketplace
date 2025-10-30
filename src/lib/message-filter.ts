/**
 * Message Content Filtering
 * 
 * Prevents platform leakage by detecting and blocking:
 * - Phone numbers
 * - Email addresses
 * - IBAN numbers
 * - Other platforms (WhatsApp, Telegram, etc.)
 * - Suspicious phrases
 * 
 * Based on best practices from Airbnb, Uber, Rover
 */

interface FilterResult {
  allowed: boolean
  filtered: boolean
  maskedMessage?: string
  blockedReasons: string[]
  suspiciousPatterns: string[]
}

// Patterns to detect contact information
const PATTERNS = {
  // Phone numbers (Belgian + international)
  phone: [
    /\b(\+32|0032)?\s*[1-9]\d{1,2}[\s\-\.]?\d{2,3}[\s\-\.]?\d{2}[\s\-\.]?\d{2}\b/gi, // BE: +32 476 12 34 56
    /\b0\d{9}\b/g, // BE: 0476123456
    /\b(\+?\d{1,3}[\s\-\.]?)?\(?\d{3}\)?[\s\-\.]?\d{3}[\s\-\.]?\d{4}\b/g, // US/International
  ],
  
  // Email addresses
  email: [
    /\b[\w\.\-]+@[\w\.\-]+\.[a-z]{2,}\b/gi,
    /\b[\w\.\-]+\s*@\s*[\w\.\-]+\s*\.\s*[a-z]{2,}\b/gi, // With spaces
    /\b[\w\.\-]+\s*\[\s*at\s*\]\s*[\w\.\-]+/gi, // "john [at] gmail"
  ],
  
  // IBAN numbers
  iban: [
    /\b[A-Z]{2}\d{2}\s?[A-Z0-9]{4}\s?\d{4}\s?\d{4}\s?\d{4}\b/gi, // BE12 1234 1234 1234
    /\bBE\d{14}\b/gi, // BE12123412341234
  ],
  
  // Social media / other platforms
  platforms: [
    /whatsapp|wa\.me|wapp/gi,
    /telegram|t\.me/gi,
    /signal|snapchat/gi,
    /instagram|insta|ig:/gi,
    /facebook|fb\.com|messenger/gi,
    /viber|wechat|line/gi,
  ],
  
  // Suspicious phrases (off-platform deals)
  suspicious: [
    /betaal\s*(me\s*)?contant/gi,
    /buiten\s*(het\s*)?platform/gi,
    /rechtstreeks\s*betalen/gi,
    /zonder\s*commissie/gi,
    /off\s*platform/gi,
    /direct\s*(aan\s*mij)?\s*betalen/gi,
    /geef\s*(me\s*)?je\s*(nummer|mail|email)/gi,
    /stuur\s*(me\s*)?een\s*(sms|mail)/gi,
  ]
}

/**
 * Check if message contains blocked content
 */
export function filterMessage(message: string): FilterResult {
  const result: FilterResult = {
    allowed: true,
    filtered: false,
    blockedReasons: [],
    suspiciousPatterns: []
  }
  
  let maskedMessage = message
  
  // 1. Check for phone numbers
  for (const pattern of PATTERNS.phone) {
    if (pattern.test(message)) {
      result.blockedReasons.push('telefoonnummer')
      maskedMessage = maskedMessage.replace(pattern, '[TELEFOONNUMMER VERWIJDERD]')
      result.filtered = true
    }
  }
  
  // 2. Check for emails
  for (const pattern of PATTERNS.email) {
    if (pattern.test(message)) {
      result.blockedReasons.push('e-mailadres')
      maskedMessage = maskedMessage.replace(pattern, '[EMAIL VERWIJDERD]')
      result.filtered = true
    }
  }
  
  // 3. Check for IBAN
  for (const pattern of PATTERNS.iban) {
    if (pattern.test(message)) {
      result.blockedReasons.push('bankrekeningnummer')
      maskedMessage = maskedMessage.replace(pattern, '[REKENINGNUMMER VERWIJDERD]')
      result.filtered = true
    }
  }
  
  // 4. Check for other platforms
  for (const pattern of PATTERNS.platforms) {
    if (pattern.test(message)) {
      result.suspiciousPatterns.push('andere platform vermelding')
      maskedMessage = maskedMessage.replace(pattern, '[PLATFORM NAAM VERWIJDERD]')
      result.filtered = true
    }
  }
  
  // 5. Check for suspicious phrases
  for (const pattern of PATTERNS.suspicious) {
    if (pattern.test(message)) {
      result.suspiciousPatterns.push('verdachte zin')
      result.filtered = true
      // Don't mask - just flag for admin
    }
  }
  
  // Determine if message should be blocked completely
  if (result.blockedReasons.length > 0) {
    result.allowed = false
  }
  
  // If filtered but allowed (suspicious only), keep masked version
  if (result.filtered && result.allowed) {
    result.maskedMessage = maskedMessage
  }
  
  return result
}

/**
 * Get user-friendly error message
 */
export function getFilterErrorMessage(reasons: string[]): string {
  if (reasons.includes('telefoonnummer')) {
    return '🛡️ Voor je veiligheid en bescherming mag je geen telefoonnummers delen. Communiceer via het platform om gedekt te blijven door onze service garantie.'
  }
  
  if (reasons.includes('e-mailadres')) {
    return '🛡️ Voor je veiligheid mag je geen e-mailadressen delen. Houd alle communicatie binnen TailTribe om beschermd te blijven.'
  }
  
  if (reasons.includes('bankrekeningnummer')) {
    return '🛡️ Deel nooit bankrekeningnummers via berichten. Alle betalingen verlopen veilig via ons platform.'
  }
  
  return '🛡️ Je bericht bevat informatie die niet gedeeld mag worden. Houd alle communicatie binnen het platform voor je eigen bescherming.'
}

/**
 * Check if user should receive warning (repeated violations)
 */
export async function checkViolationCount(userId: string): Promise<{
  count: number
  shouldWarn: boolean
  shouldSuspend: boolean
}> {
  const { db } = await import('./db')
  
  // Count flagged messages in last 30 days
  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
  
  const count = await db.flaggedMessage.count({
    where: {
      userId,
      createdAt: { gte: thirtyDaysAgo }
    }
  })
  
  return {
    count,
    shouldWarn: count >= 2, // 2nd violation = warning
    shouldSuspend: count >= 3 // 3rd violation = suspend
  }
}

/**
 * Log filtered message for admin review
 */
export async function logFilteredMessage(
  userId: string,
  message: string,
  blockedReasons: string[],
  suspiciousPatterns: string[]
): Promise<void> {
  const { db } = await import('./db')
  
  try {
    await db.flaggedMessage.create({
      data: {
        userId,
        originalMessage: message,
        blockedReasons: blockedReasons.join(', '),
        suspiciousPatterns: suspiciousPatterns.join(', '),
        severity: blockedReasons.length > 0 ? 'HIGH' : 'MEDIUM'
      }
    })
  } catch (error) {
    console.error('Error logging filtered message:', error)
  }
}

/**
 * Common false positives to allow
 */
const WHITELIST_PATTERNS = [
  // Common times that look like phone numbers
  /\b[0-2]\d:[0-5]\d\b/g, // 14:30, 09:15
  /\b\d{1,2}\s?(uur|minuten|min)\b/gi, // 2 uur, 30 minuten
]

/**
 * Check if it's a false positive
 */
function isFalsePositive(message: string): boolean {
  for (const pattern of WHITELIST_PATTERNS) {
    if (pattern.test(message)) {
      return true
    }
  }
  return false
}

/**
 * Format masked message for display
 */
export function formatMaskedMessage(original: string, filtered: FilterResult): string {
  if (!filtered.filtered) return original
  
  return filtered.maskedMessage || original
}

/**
 * Quick test function (for development)
 */
export function testFilter(message: string): void {
  const result = filterMessage(message)
  console.log('Message:', message)
  console.log('Allowed:', result.allowed)
  console.log('Blocked reasons:', result.blockedReasons)
  console.log('Suspicious:', result.suspiciousPatterns)
  console.log('Masked:', result.maskedMessage)
  console.log('---')
}

// Test examples (uncomment to test)
// testFilter("Bel me op 0476123456")
// testFilter("Mijn email is john@gmail.com")
// testFilter("WhatsApp me op +32 476 12 34 56")
// testFilter("Betaal me contant aub")
// testFilter("We spreken af om 14:30") // Should be allowed (false positive)





