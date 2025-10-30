import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendBookingConfirmation({
  to,
  bookingId,
  caregiverName,
  startAt,
  endAt,
}: {
  to: string
  bookingId: string
  caregiverName: string
  startAt: Date
  endAt: Date
}) {
  try {
    await resend.emails.send({
      from: 'TailTribe <noreply@tailtribe.be>',
      to,
      subject: 'Boeking bevestigd - TailTribe',
      html: `
        <h2>Je boeking is bevestigd!</h2>
        <p>Hoi,</p>
        <p><strong>${caregiverName}</strong> heeft je boeking geaccepteerd.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Start: ${startAt.toLocaleString('nl-BE')}</li>
          <li>Einde: ${endAt.toLocaleString('nl-BE')}</li>
        </ul>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/booking/${bookingId}">Bekijk boeking</a></p>
        <p>Groeten,<br>TailTribe Team</p>
      `
    })
  } catch (error) {
    console.error('Email error:', error)
  }
}

export async function sendNewBookingNotification({
  to,
  bookingId,
  ownerName,
  startAt,
  endAt,
}: {
  to: string
  bookingId: string
  ownerName: string
  startAt: Date
  endAt: Date
}) {
  try {
    await resend.emails.send({
      from: 'TailTribe <noreply@tailtribe.be>',
      to,
      subject: 'Nieuwe boeking ontvangen - TailTribe',
      html: `
        <h2>Nieuwe boekingsaanvraag!</h2>
        <p>Hoi,</p>
        <p><strong>${ownerName}</strong> wil je inhuren.</p>
        <p><strong>Details:</strong></p>
        <ul>
          <li>Start: ${startAt.toLocaleString('nl-BE')}</li>
          <li>Einde: ${endAt.toLocaleString('nl-BE')}</li>
        </ul>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/booking/${bookingId}">Bekijk en accepteer</a></p>
        <p>Groeten,<br>TailTribe Team</p>
      `
    })
  } catch (error) {
    console.error('Email error:', error)
  }
}

export async function sendNewMessageNotification({
  to,
  senderName,
  bookingId,
  messagePreview,
}: {
  to: string
  senderName: string
  bookingId: string
  messagePreview: string
}) {
  try {
    await resend.emails.send({
      from: 'TailTribe <noreply@tailtribe.be>',
      to,
      subject: `Nieuw bericht van ${senderName} - TailTribe`,
      html: `
        <h2>Je hebt een nieuw bericht!</h2>
        <p><strong>${senderName}</strong> heeft je een bericht gestuurd:</p>
        <blockquote style="border-left: 3px solid #10b981; padding-left: 15px; color: #666;">
          ${messagePreview.slice(0, 100)}${messagePreview.length > 100 ? '...' : ''}
        </blockquote>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/messages/${bookingId}">Lees het volledige bericht</a></p>
        <p>Groeten,<br>TailTribe Team</p>
      `
    })
  } catch (error) {
    console.error('Email error:', error)
  }
}

export async function sendPaymentConfirmation({
  to,
  amount,
  bookingId,
}: {
  to: string
  amount: number
  bookingId: string
}) {
  try {
    await resend.emails.send({
      from: 'TailTribe <noreply@tailtribe.be>',
      to,
      subject: 'Betaling ontvangen - TailTribe',
      html: `
        <h2>Betaling succesvol!</h2>
        <p>We hebben je betaling van €${amount.toFixed(2)} ontvangen.</p>
        <p><a href="${process.env.NEXT_PUBLIC_APP_URL}/booking/${bookingId}">Bekijk boeking</a></p>
        <p>Groeten,<br>TailTribe Team</p>
      `
    })
  } catch (error) {
    console.error('Email error:', error)
  }
}




