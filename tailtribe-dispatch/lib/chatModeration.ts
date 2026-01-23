const emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}\b/i
const phoneRegex = /\b(\+?\d{1,3}[\s\-\.]?)?(\(?\d{2,4}\)?[\s\-\.]?)?\d{3,4}[\s\-\.]?\d{3,4}\b/
const urlRegex = /\b((https?:\/\/)|(www\.))[\w\-]+\.[\w\.\-]+/i
const socialRegex = /\b(instagram|facebook|whatsapp|telegram|signal|tiktok|snapchat|linkedin|@[\w\.]+)\b/i
const paymentRegex = /\b(iban|iban:|bic|credit card|visa|mastercard|amex|bancontact|paypal|revolut|wise)\b/i
const contactPhrasesRegex = /\b(contact\s?me|bel\s?me|call\s?me|text\s?me|mail\s?me|stuur\s?me|buiten\s?het\s?platform|meet\s?at)\b/i

export type ModerationResult =
  | { ok: true; sanitizedBody: string }
  | { ok: false; reason: string }

export function filterMessage(body: string): ModerationResult {
  const normalized = body.trim()
  if (!normalized) {
    return { ok: false, reason: 'Leeg bericht is niet toegestaan.' }
  }

  const lower = normalized.toLowerCase()

  const checks: { regex: RegExp; reason: string }[] = [
    { regex: emailRegex, reason: 'E-mailadressen delen is niet toegestaan.' },
    { regex: phoneRegex, reason: 'Telefoonnummers delen is niet toegestaan.' },
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

  const sanitized = normalized.replace(/\s+/g, ' ')
  return { ok: true, sanitizedBody: sanitized }
}
