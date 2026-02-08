const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
// IMPORTANT:
// We allow sharing an address (street + number + postal code) in chat,
// so phone detection must be stricter than "any digits" (otherwise it blocks normal addresses).
// Strategy:
// - Find phone-like sequences with separators (spaces/dots/dashes/parentheses)
// - Block when the sequence contains enough digits to be a phone number
const phoneLikeRegex = /(?:\+|00)?\d[\d\s().\-]{7,}\d/
const urlRegex = /\b((https?:\/\/)|(www\.))[\w\-]+\.[\w\.\-]+/i
const socialRegex = /\b(instagram|facebook|whatsapp|telegram|signal|tiktok|snapchat|linkedin|@[\w\.]+)\b/i
const paymentRegex = /\b(iban|iban:|bic|credit card|visa|mastercard|amex|bancontact|paypal|revolut|wise)\b/i
const contactPhrasesRegex = /\b(contact\s?me|bel\s?me|call\s?me|text\s?me|mail\s?me|stuur\s?me|buiten\s?het\s?platform|meet\s?at)\b/i

export type ModerationResult =
  | { ok: true; sanitizedBody: string }
  | { ok: false; reason: string }

function looksLikePhoneNumber(textLower: string) {
  const m = textLower.match(phoneLikeRegex)
  if (!m) return false
  const candidate = m[0]
  const digits = candidate.replace(/\D/g, '')
  const digitCount = digits.length

  // Typical BE phones are 9-10 digits (including leading 0). We block 9+ digits.
  if (digitCount >= 9) return true

  // International style often includes +/00; allow slightly shorter threshold then.
  if (digitCount >= 8 && (candidate.includes('+') || candidate.startsWith('00'))) return true

  return false
}

export function filterMessage(body: string): ModerationResult {
  const normalized = body.trim()
  if (!normalized) {
    return { ok: false, reason: 'Leeg bericht is niet toegestaan.' }
  }

  const lower = normalized.toLowerCase()

  const checks: { regex: RegExp; reason: string }[] = [
    { regex: emailRegex, reason: 'E-mailadressen delen is niet toegestaan.' },
    { regex: urlRegex, reason: 'Links delen is niet toegestaan.' },
    { regex: socialRegex, reason: 'Sociale media/contact buiten het platform is niet toegestaan.' },
    { regex: paymentRegex, reason: 'Betaalgegevens delen is niet toegestaan.' },
    { regex: contactPhrasesRegex, reason: 'Contact buiten het platform is niet toegestaan.' },
  ]

  for (const check of checks) {
    if (check.regex.test(lower)) {
      return { ok: false, reason: check.reason }
    }
  }

  if (looksLikePhoneNumber(lower)) {
    return { ok: false, reason: 'Telefoonnummers delen is niet toegestaan.' }
  }

  const sanitized = normalized.replace(/\s+/g, ' ')
  return { ok: true, sanitizedBody: sanitized }
}
