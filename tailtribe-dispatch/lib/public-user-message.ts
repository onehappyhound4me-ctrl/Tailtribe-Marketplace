/**
 * Short, user-facing Dutch messages. Never expose stack traces, env names, or Prisma codes to browsers.
 */
export const PUBLIC_MESSAGES = {
  genericTryLater: 'Er ging iets mis. Probeer het later opnieuw of neem contact met ons op.',
  bookingFailed: 'Je aanvraag kon niet worden verstuurd. Probeer het later opnieuw of neem contact met ons op.',
  emailUnavailable: 'We kunnen je verzoek nu niet verwerken. Probeer het later opnieuw of neem contact met ons op.',
  verificationEmailFailed: 'We konden geen e-mail sturen. Probeer het later opnieuw of neem contact met ons op.',
  caregiverSubmitFailed: 'Je aanmelding kon niet worden verstuurd. Probeer het later opnieuw of neem contact met ons op.',
  registrationUnavailable: 'Registratie is tijdelijk niet beschikbaar. Probeer het later opnieuw of neem contact met ons op.',
} as const
