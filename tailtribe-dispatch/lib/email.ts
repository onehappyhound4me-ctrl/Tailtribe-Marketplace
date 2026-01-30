import { sendTransactionalEmail } from './mailer'

export async function sendVerificationEmail(email: string, token: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://tailtribe.be'
  const verificationUrl = `${baseUrl}/api/auth/verify?token=${token}`

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #10b981;">Welkom bij TailTribe!</h1>
      <p>Bedankt voor je registratie. Klik op de knop hieronder om je e-mailadres te verifiëren:</p>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${verificationUrl}" 
           style="background: linear-gradient(to right, #10b981, #3b82f6); 
                  color: white; 
                  padding: 15px 30px; 
                  text-decoration: none; 
                  border-radius: 25px; 
                  font-weight: bold;
                  display: inline-block;">
          Verifieer E-mail
        </a>
      </div>
      <p style="color: #666; font-size: 12px; margin-top: 30px;">
        Deze link is 24 uur geldig. Als je dit niet hebt aangevraagd, negeer deze email dan.
      </p>
    </div>
  `

  await sendTransactionalEmail({
    to: email,
    subject: 'Verifieer je TailTribe account',
    html,
    required: true,
  })
}

export async function sendWelcomeEmail(email: string, firstName: string) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ?? process.env.AUTH_URL ?? process.env.NEXTAUTH_URL ?? 'https://tailtribe.be'

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h1 style="color: #10b981;">Welkom ${firstName}! 🎉</h1>
      <p>Je account is succesvol geverifieerd. Je kan nu inloggen en:</p>
      <ul>
        <li>✅ Aanvragen doen voor dierenverzorging</li>
        <li>✅ Je aanvragen volgen</li>
        <li>✅ Profiel beheren</li>
      </ul>
      <div style="text-align: center; margin: 30px 0;">
        <a href="${baseUrl}/login" 
           style="background: linear-gradient(to right, #10b981, #3b82f6); 
                  color: white; 
                  padding: 15px 30px; 
                  text-decoration: none; 
                  border-radius: 25px; 
                  font-weight: bold;
                  display: inline-block;">
          Nu Inloggen
        </a>
      </div>
    </div>
  `

  await sendTransactionalEmail({
    to: email,
    subject: 'Welkom bij TailTribe!',
    html,
  })
}

type AssignmentEmailInput = {
  caregiverEmail: string
  service: string
  date: string | Date
  timeWindow?: string | null
  time?: string | null
  ownerName: string
  ownerContact: string
  location: string
  petNotes?: string | null
  link?: string
  recurringInfo?: string | null
}

type OwnerAssignmentEmailInput = {
  ownerEmail: string
  service: string
  date: string | Date
  timeWindow?: string | null
  time?: string | null
  caregiverName: string
  caregiverContact?: string | null
  location: string
  link?: string
}

type CancellationEmailInput = {
  recipientEmail: string
  service: string
  date: string | Date
  timeWindow?: string | null
  time?: string | null
  location: string
  link?: string
  recipientRole: 'OWNER' | 'CAREGIVER'
}

const TIME_WINDOW_LABELS: Record<string, string> = {
  MORNING: 'Ochtend',
  AFTERNOON: 'Middag',
  EVENING: 'Avond',
  NIGHT: 'Nacht',
}

const formatTimeLabel = (time?: string | null, timeWindow?: string | null) => {
  if (time && time.trim()) return time
  if (!timeWindow) return ''
  return TIME_WINDOW_LABELS[timeWindow] ?? timeWindow
}

function buildAssignmentHtml(input: AssignmentEmailInput, formattedDate: string, formattedTime: string) {
  const {
    service,
    ownerName,
    ownerContact,
    location,
    petNotes,
    link,
    recurringInfo,
  } = input

  const notesBlock = petNotes
    ? `<p style="margin: 8px 0;"><strong>Huisdier info:</strong><br>${petNotes}</p>`
    : ''
  const recurringBlock = recurringInfo
    ? `<p style="margin: 8px 0;"><strong>Herhaling:</strong> ${recurringInfo}</p>`
    : ''
  const linkBlock = link
    ? `<div style="text-align: center; margin: 24px 0;">
         <a href="${link}" style="background:#10b981;color:#fff;padding:12px 24px;border-radius:20px;text-decoration:none;font-weight:bold;">
           Open opdracht
         </a>
       </div>`
    : ''

  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #0f172a;">
      <h2 style="color:#0f172a;">Nieuwe opdracht toegewezen</h2>
      <p style="margin: 8px 0;">Service: <strong>${service}</strong></p>
      <p style="margin: 8px 0;">Datum/tijd: <strong>${formattedDate}${formattedTime ? ' • ' + formattedTime : ''}</strong></p>
      ${recurringBlock}
      <p style="margin: 8px 0;">Locatie: <strong>${location}</strong></p>
      <p style="margin: 8px 0;">Eigenaar: <strong>${ownerName}</strong> (${ownerContact})</p>
      ${notesBlock}
      ${linkBlock}
      <p style="margin-top: 24px; font-size: 12px; color: #475569;">TailTribe Dispatch</p>
    </div>
  `
}

export async function sendAssignmentEmail(input: AssignmentEmailInput) {
  const {
    caregiverEmail,
    service,
    date,
    timeWindow,
    time,
    ownerName,
    ownerContact,
    location,
  } = input

  const dateObj = typeof date === 'string' ? new Date(date) : date
  const formattedDate = dateObj.toLocaleDateString('nl-BE')
  const formattedTime = formatTimeLabel(time, timeWindow)
  const subject = `Nieuwe opdracht toegewezen: ${service} op ${formattedDate}`

  const html = buildAssignmentHtml(input, formattedDate, formattedTime)

  await sendTransactionalEmail({
    to: caregiverEmail,
    subject,
    html,
  })
}

function buildOwnerAssignmentHtml(input: OwnerAssignmentEmailInput, formattedDate: string, formattedTime: string) {
  const { service, caregiverName, caregiverContact, location, link } = input
  const contactLine = caregiverContact ? ` (${caregiverContact})` : ''
  const linkBlock = link
    ? `<div style="text-align: center; margin: 24px 0;">
         <a href="${link}" style="background:#10b981;color:#fff;padding:12px 24px;border-radius:20px;text-decoration:none;font-weight:bold;">
           Bekijk je aanvraag
         </a>
       </div>`
    : ''

  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #0f172a;">
      <h2 style="color:#0f172a;">Je aanvraag is toegewezen</h2>
      <p style="margin: 8px 0;">Dienst: <strong>${service}</strong></p>
      <p style="margin: 8px 0;">Datum/tijd: <strong>${formattedDate}${formattedTime ? ' • ' + formattedTime : ''}</strong></p>
      <p style="margin: 8px 0;">Locatie: <strong>${location}</strong></p>
      <p style="margin: 8px 0;">Verzorger: <strong>${caregiverName}</strong>${contactLine}</p>
      ${linkBlock}
      <p style="margin-top: 24px; font-size: 12px; color: #475569;">TailTribe Dispatch</p>
    </div>
  `
}

export async function sendOwnerAssignmentEmail(input: OwnerAssignmentEmailInput) {
  const { ownerEmail, service, date, timeWindow, time } = input
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const formattedDate = dateObj.toLocaleDateString('nl-BE')
  const formattedTime = formatTimeLabel(time, timeWindow)
  const subject = `Je aanvraag is toegewezen – ${service}`

  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) {
    console.log('📧 Owner assignment email (SMTP not configured):', {
      to: ownerEmail,
      subject,
      service,
      date: formattedDate,
      time: formattedTime,
      caregiver: input.caregiverName,
    })
    return
  }

  const html = buildOwnerAssignmentHtml(input, formattedDate, formattedTime)

  await sendTransactionalEmail({
    to: ownerEmail,
    subject,
    html,
  })
}

type AdminOwnerConfirmedEmailInput = {
  service: string
  date: string | Date
  timeWindow?: string | null
  time?: string | null
  ownerName: string
  caregiverName: string
  location: string
  link?: string
}

const ADMIN_NOTIFICATION_EMAIL = 'steven@tailtribe.be'

export async function sendAdminOwnerConfirmedEmail(input: AdminOwnerConfirmedEmailInput) {
  const { service, date, timeWindow, time, ownerName, caregiverName, location, link } = input
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const formattedDate = dateObj.toLocaleDateString('nl-BE')
  const formattedTime = formatTimeLabel(time, timeWindow)
  const subject = `Owner bevestigde opdracht – ${service}`
  const linkBlock = link
    ? `<div style="text-align: center; margin: 24px 0;">
         <a href="${link}" style="background:#10b981;color:#fff;padding:12px 24px;border-radius:20px;text-decoration:none;font-weight:bold;">
           Open admin dashboard
         </a>
       </div>`
    : ''

  const html = `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #0f172a;">
      <h2 style="color:#0f172a;">Owner bevestigde opdracht</h2>
      <p style="margin: 8px 0;">Dienst: <strong>${service}</strong></p>
      <p style="margin: 8px 0;">Datum/tijd: <strong>${formattedDate}${formattedTime ? ' • ' + formattedTime : ''}</strong></p>
      <p style="margin: 8px 0;">Locatie: <strong>${location}</strong></p>
      <p style="margin: 8px 0;">Owner: <strong>${ownerName}</strong></p>
      <p style="margin: 8px 0;">Verzorger: <strong>${caregiverName}</strong></p>
      ${linkBlock}
      <p style="margin-top: 24px; font-size: 12px; color: #475569;">TailTribe Dispatch</p>
    </div>
  `

  await sendTransactionalEmail({
    to: ADMIN_NOTIFICATION_EMAIL,
    subject,
    html,
  })
}

function buildCancellationHtml(input: CancellationEmailInput, formattedDate: string, formattedTime: string) {
  const { service, location, link, recipientRole } = input
  const title = recipientRole === 'OWNER' ? 'Je aanvraag werd verwijderd' : 'De opdracht werd verwijderd'
  const intro =
    recipientRole === 'OWNER'
      ? 'De beheerder heeft je aanvraag verwijderd.'
      : 'De beheerder heeft deze opdracht verwijderd.'
  const linkBlock = link
    ? `<div style="text-align: center; margin: 24px 0;">
         <a href="${link}" style="background:#0ea5e9;color:#fff;padding:12px 24px;border-radius:20px;text-decoration:none;font-weight:bold;">
           Open dashboard
         </a>
       </div>`
    : ''

  return `
    <div style="font-family: Arial, sans-serif; max-width: 640px; margin: 0 auto; color: #0f172a;">
      <h2 style="color:#0f172a;">${title}</h2>
      <p style="margin: 8px 0;">${intro}</p>
      <p style="margin: 8px 0;">Dienst: <strong>${service}</strong></p>
      <p style="margin: 8px 0;">Datum/tijd: <strong>${formattedDate}${formattedTime ? ' • ' + formattedTime : ''}</strong></p>
      <p style="margin: 8px 0;">Locatie: <strong>${location}</strong></p>
      ${linkBlock}
      <p style="margin-top: 24px; font-size: 12px; color: #475569;">TailTribe Dispatch</p>
    </div>
  `
}

export async function sendCancellationEmail(input: CancellationEmailInput) {
  const { recipientEmail, service, date, timeWindow, time, recipientRole } = input
  const dateObj = typeof date === 'string' ? new Date(date) : date
  const formattedDate = dateObj.toLocaleDateString('nl-BE')
  const formattedTime = formatTimeLabel(time, timeWindow)
  const subject =
    recipientRole === 'OWNER'
      ? `Aanvraag verwijderd – ${service}`
      : `Opdracht verwijderd – ${service}`

  const html = buildCancellationHtml(input, formattedDate, formattedTime)

  await sendTransactionalEmail({
    to: recipientEmail,
    subject,
    html,
  })
}

const escapeHtml = (value: string) =>
  value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')

type BookingAdminEmailInput = {
  firstName: string
  lastName: string
  serviceLabel: string
  // New flow: multiple requested slots (one per line)
  slotsText?: string
  // Backward-compatible fields
  date?: string
  time?: string
  timeWindowLabel?: string
  city: string
  postalCode: string
  email: string
  phone?: string
  contactPreferenceLabel: string
  petName: string
  petType: string
  message?: string | null
  appUrl: string
}

type BookingOwnerEmailInput = {
  firstName: string
  serviceLabel: string
  slotsText?: string
  date?: string
  time?: string
  timeWindowLabel?: string
  city: string
  postalCode: string
  contactPreferenceLabel: string
}

export function buildAdminBookingReceivedEmail(input: BookingAdminEmailInput) {
  const messageBlock = input.message?.trim()
    ? `<p style="margin:12px 0 0 0;"><strong>Extra info:</strong><br/>${escapeHtml(input.message).replace(/\n/g, '<br/>')}</p>`
    : ''

  const slotsBlock = input.slotsText?.trim()
    ? `<p style="margin:0 0 6px 0;"><strong>Gekozen momenten:</strong></p>
       <pre style="margin:0 0 6px 0;white-space:pre-wrap;background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:10px;">${escapeHtml(
         input.slotsText
       )}</pre>`
    : `<p style="margin:0 0 6px 0;"><strong>Datum/Tijd:</strong> ${input.date ?? ''}${input.time ? ' om ' + input.time : ''}</p>
       <p style="margin:0 0 6px 0;"><strong>Tijdsblok:</strong> ${input.timeWindowLabel ?? ''}</p>`

  const phonePart = input.phone?.trim() ? ` • ${escapeHtml(input.phone.trim())}` : ''

  const subject = `Nieuwe aanvraag – ${input.serviceLabel} (${input.city})`
  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin: 0 0 12px 0;">Nieuwe aanvraag – TailTribe Dispatch</h2>
      <p style="margin: 0 0 12px 0;">
        <strong>${input.firstName} ${input.lastName}</strong> diende een aanvraag in.
      </p>
      <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;padding:14px;">
        <p style="margin:0 0 6px 0;"><strong>Dienst:</strong> ${input.serviceLabel}</p>
        ${slotsBlock}
        <p style="margin:0 0 6px 0;"><strong>Locatie:</strong> ${input.city}, ${input.postalCode}</p>
        <p style="margin:0 0 6px 0;"><strong>Contact:</strong> ${escapeHtml(input.email)}${phonePart}</p>
        <p style="margin:0;"><strong>Voorkeur kanaal:</strong> ${input.contactPreferenceLabel}</p>
        <p style="margin:0;"><strong>Huisdier:</strong> ${input.petName} (${input.petType})</p>
      </div>
      ${messageBlock}
      <p style="margin:16px 0 0 0;">
        <a href="${input.appUrl}/admin" style="display:inline-block;background:#10B981;color:white;text-decoration:none;padding:10px 14px;border-radius:10px;font-weight:600;">
          Open admin dashboard
        </a>
      </p>
    </div>
  `

  return { subject, html }
}

export function buildOwnerBookingReceivedEmail(input: BookingOwnerEmailInput) {
  const subject = 'Aanvraag ontvangen – TailTribe'

  const slotsBlock = input.slotsText?.trim()
    ? `<p style="margin:0 0 6px 0;"><strong>Gekozen momenten:</strong></p>
       <pre style="margin:0;white-space:pre-wrap;background:#fff;border:1px solid #E5E7EB;border-radius:10px;padding:10px;">${escapeHtml(
         input.slotsText
       )}</pre>`
    : `<p style="margin:0 0 6px 0;"><strong>Datum/Tijd:</strong> ${input.date ?? ''}${input.time ? ' om ' + input.time : ''}</p>
       <p style="margin:0 0 6px 0;"><strong>Tijdsblok:</strong> ${input.timeWindowLabel ?? ''}</p>`

  const html = `
    <div style="font-family: system-ui, -apple-system, Segoe UI, Roboto, Arial, sans-serif; line-height: 1.5; color: #111827;">
      <h2 style="margin: 0 0 12px 0;">We hebben je aanvraag ontvangen</h2>
      <p style="margin: 0 0 12px 0;">Hoi ${input.firstName},</p>
      <p style="margin: 0 0 12px 0;">
        Bedankt voor je aanvraag bij TailTribe. We nemen binnen <strong>2 uur</strong> contact met je op om alles te bevestigen.
      </p>
      <div style="background:#F9FAFB;border:1px solid #E5E7EB;border-radius:12px;padding:14px;">
        <p style="margin:0 0 6px 0;"><strong>Dienst:</strong> ${input.serviceLabel}</p>
        ${slotsBlock}
        <p style="margin:0;"><strong>Locatie:</strong> ${input.city}, ${input.postalCode}</p>
      </div>
      <p style="margin:12px 0 0 0;">We nemen contact op via <strong>${input.contactPreferenceLabel}</strong> binnen het gekozen tijdsblok.</p>
      <p style="margin:16px 0 0 0;">
        Met vriendelijke groet,<br/>TailTribe
      </p>
    </div>
  `

  return { subject, html }
}
