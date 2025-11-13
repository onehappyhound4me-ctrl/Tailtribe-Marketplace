import { Resend } from 'resend'
import { db } from './db'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM_EMAIL = 'TailTribe <noreply@tailtribe.be>'

export async function sendBookingRequestEmail(data: {
  caregiverEmail: string
  caregiverName: string
  ownerName: string
  serviceName: string
  date: string
  bookingId: string
}) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.caregiverEmail,
      subject: `Nieuwe boekingsaanvraag van ${data.ownerName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Nieuwe Boekingsaanvraag!</h2>
          <p>Hoi ${data.caregiverName},</p>
          <p>Je hebt een nieuwe boekingsaanvraag ontvangen van <strong>${data.ownerName}</strong>.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Service:</strong> ${data.serviceName}</p>
            <p><strong>Datum:</strong> ${data.date}</p>
          </div>
          
          <p>Log in op je dashboard om deze boeking te accepteren of te weigeren.</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            Bekijk Boekingen
          </a>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Met vriendelijke groet,<br>
            Het TailTribe Team
          </p>
        </div>
      `
    })
  } catch (error) {
    console.error('Error sending booking request email:', error)
  }
}

export async function sendBookingConfirmationEmail(data: {
  ownerEmail: string
  ownerName: string
  caregiverName: string
  serviceName: string
  date: string
  status: 'ACCEPTED' | 'DECLINED'
}) {
  const isAccepted = data.status === 'ACCEPTED'
  
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.ownerEmail,
      subject: isAccepted 
        ? `Je boeking is bevestigd!` 
        : `Update over je boeking`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${isAccepted ? '#10b981' : '#ef4444'};">
            ${isAccepted ? '✓ Boeking Bevestigd!' : 'Boeking Update'}
          </h2>
          <p>Hoi ${data.ownerName},</p>
          <p>${isAccepted 
            ? `<strong>${data.caregiverName}</strong> heeft je boekingsaanvraag geaccepteerd!`
            : `Helaas kon <strong>${data.caregiverName}</strong> je boekingsaanvraag niet accepteren.`
          }</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Verzorger:</strong> ${data.caregiverName}</p>
            <p><strong>Service:</strong> ${data.serviceName}</p>
            <p><strong>Datum:</strong> ${data.date}</p>
            <p><strong>Status:</strong> <span style="color: ${isAccepted ? '#10b981' : '#ef4444'}; font-weight: bold;">
              ${isAccepted ? 'GEACCEPTEERD' : 'GEWEIGERD'}
            </span></p>
          </div>
          
          ${isAccepted 
            ? `<p>Je kunt nu berichten sturen naar ${data.caregiverName} om details te bespreken.</p>`
            : `<p>Geen zorgen! Er zijn nog veel andere verzorgers beschikbaar.</p>`
          }
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/${isAccepted ? 'bookings' : 'search'}" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            ${isAccepted ? 'Bekijk Boeking' : 'Zoek Andere Verzorgers'}
          </a>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Met vriendelijke groet,<br>
            Het TailTribe Team
          </p>
        </div>
      `
    })
  } catch (error) {
    console.error('Error sending booking confirmation email:', error)
  }
}

export async function sendPaymentConfirmationEmail(data: {
  ownerEmail: string
  ownerName: string
  caregiverName: string
  amount: number
  serviceName: string
  date: string
}) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.ownerEmail,
      subject: `Betaling bevestigd - €${data.amount.toFixed(2)}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">✓ Betaling Gelukt!</h2>
          <p>Hoi ${data.ownerName},</p>
          <p>Je betaling is succesvol verwerkt.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Verzorger:</strong> ${data.caregiverName}</p>
            <p><strong>Service:</strong> ${data.serviceName}</p>
            <p><strong>Datum:</strong> ${data.date}</p>
            <p><strong>Bedrag:</strong> <span style="color: #10b981; font-size: 24px; font-weight: bold;">€${data.amount.toFixed(2)}</span></p>
          </div>
          
          <p>Je ontvangt binnen enkele dagen een factuur per email.</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/bookings" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            Bekijk Boeking
          </a>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Met vriendelijke groet,<br>
            Het TailTribe Team
          </p>
        </div>
      `
    })
  } catch (error) {
    console.error('Error sending payment confirmation email:', error)
  }
}

export async function sendReviewRequestEmail(data: {
  ownerEmail: string
  ownerName: string
  caregiverName: string
  bookingId: string
}) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.ownerEmail,
      subject: `Deel je ervaring met ${data.caregiverName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Hoe was je ervaring?</h2>
          <p>Hoi ${data.ownerName},</p>
          <p>Je recente boeking met <strong>${data.caregiverName}</strong> is afgerond.</p>
          <p>We horen graag hoe het is gegaan! Je review helpt andere huisdiereigenaren bij het kiezen van een verzorger.</p>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/reviews/write?booking=${data.bookingId}" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            Schrijf een Review
          </a>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Met vriendelijke groet,<br>
            Het TailTribe Team
          </p>
        </div>
      `
    })
  } catch (error) {
    console.error('Error sending review request email:', error)
  }
}

export async function sendCaregiverApprovalEmail(data: {
  caregiverEmail: string
  caregiverName: string
  approved: boolean
}) {
  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to: data.caregiverEmail,
      subject: data.approved 
        ? `Je profiel is goedgekeurd! 🎉` 
        : `Update over je profiel`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: ${data.approved ? '#10b981' : '#ef4444'};">
            ${data.approved ? '✓ Profiel Goedgekeurd!' : 'Profiel Update'}
          </h2>
          <p>Hoi ${data.caregiverName},</p>
          <p>${data.approved 
            ? `Geweldig nieuws! Je profiel is goedgekeurd door onze admin. Je bent nu zichtbaar voor klanten en kunt boekingen ontvangen.`
            : `Je profiel voldoet helaas nog niet aan onze kwaliteitseisen. Neem contact op met support voor meer informatie.`
          }</p>
          
          ${data.approved ? `
            <p><strong>Volgende stappen:</strong></p>
            <ul>
              <li>Stel je beschikbaarheid in</li>
              <li>Voeg foto's toe aan je profiel</li>
              <li>Verbind je Stripe account voor betalingen</li>
            </ul>
          ` : ''}
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/caregiver" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            Naar Dashboard
          </a>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Met vriendelijke groet,<br>
            Het TailTribe Team
          </p>
        </div>
      `
    })
  } catch (error) {
    console.error('Error sending caregiver approval email:', error)
  }
}

/**
 * Notify caregivers about new owners in their area
 */
export async function notifyCaregiversAboutNewOwner(data: {
  ownerName: string
  ownerCity: string
  petNames: string[]
}) {
  try {
    // Get all caregivers in the same city
    const caregivers = await db.caregiverProfile.findMany({
      where: {
        city: data.ownerCity,
        isApproved: true
      },
      include: {
        user: {
          select: {
            email: true,
            name: true
          }
        }
      },
      take: 50 // Limit to prevent spam
    })

    // Send email to each caregiver
    const promises = caregivers.map(caregiver =>
      resend.emails.send({
        from: FROM_EMAIL,
        to: caregiver.user.email,
        subject: `Nieuwe eigenaar in ${data.ownerCity}!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Nieuwe klant in jouw buurt!</h2>
            <p>Hoi ${caregiver.user.name},</p>
            <p>Er is een nieuwe huisdiereigenaar geregistreerd in <strong>${data.ownerCity}</strong>.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Eigenaar:</strong> ${data.ownerName}</p>
              <p><strong>Locatie:</strong> ${data.ownerCity}</p>
              ${data.petNames.length > 0 ? `<p><strong>Huisdieren:</strong> ${data.petNames.join(', ')}</p>` : ''}
            </div>
            
            <p>Dit is een kans om nieuwe klanten te werven! Log in om contact op te nemen.</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/dashboard/caregiver" 
               style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
              Ga naar Dashboard
            </a>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              Met vriendelijke groet,<br>
              Het TailTribe Team
            </p>
          </div>
        `
      })
    )

    await Promise.allSettled(promises)
  } catch (error) {
    console.error('Error notifying caregivers:', error)
  }
}

/**
 * Notify owners about new caregivers in their area
 */
export async function notifyOwnersAboutNewCaregiver(data: {
  caregiverName: string
  caregiverCity: string
  services: string[]
  hourlyRate: number
}) {
  try {
    // Get all owners in the same city
    const owners = await db.user.findMany({
      where: {
        role: 'OWNER',
        city: data.caregiverCity
      },
      select: {
        email: true,
        name: true
      },
      take: 50 // Limit to prevent spam
    })

    // Send email to each owner
    const promises = owners.map(owner =>
      resend.emails.send({
        from: FROM_EMAIL,
        to: owner.email,
        subject: `Nieuwe dierenoppasser in ${data.caregiverCity}!`,
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #10b981;">Nieuwe dierenoppasser beschikbaar!</h2>
            <p>Hoi ${owner.name},</p>
            <p>Er is een nieuwe dierenoppasser goedgekeurd in <strong>${data.caregiverCity}</strong>.</p>
            
            <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <p><strong>Verzorger:</strong> ${data.caregiverName}</p>
              <p><strong>Locatie:</strong> ${data.caregiverCity}</p>
              <p><strong>Tarief:</strong> vanaf €${data.hourlyRate}/uur</p>
              ${data.services.length > 0 ? `<p><strong>Diensten:</strong> ${data.services.join(', ')}</p>` : ''}
            </div>
            
            <p>Bekijk het profiel en boek direct!</p>
            
            <a href="${process.env.NEXT_PUBLIC_APP_URL}/search?city=${encodeURIComponent(data.caregiverCity)}" 
               style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
              Bekijk Profiel
            </a>
            
            <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
              Met vriendelijke groet,<br>
              Het TailTribe Team
            </p>
          </div>
        `
      })
    )

    await Promise.allSettled(promises)
  } catch (error) {
    console.error('Error notifying owners:', error)
  }
}

/**
 * Notify admin about new caregiver profile submission
 */
export async function notifyAdminNewCaregiverProfile(data: {
  caregiverName: string
  caregiverEmail: string
  city: string
  services: string[]
  profileId: string
}) {
  try {
    // Get admin email from environment or use default
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@tailtribe.be'
    
    await resend.emails.send({
      from: FROM_EMAIL,
      to: adminEmail,
      subject: `Nieuw verzorger profiel ter goedkeuring: ${data.caregiverName}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #10b981;">Nieuw Verzorger Profiel</h2>
          <p>Er is een nieuw verzorger profiel aangemaakt dat goedkeuring nodig heeft.</p>
          
          <div style="background: #f3f4f6; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <p><strong>Naam:</strong> ${data.caregiverName}</p>
            <p><strong>Email:</strong> ${data.caregiverEmail}</p>
            <p><strong>Stad:</strong> ${data.city}</p>
            <p><strong>Diensten:</strong> ${data.services.join(', ')}</p>
            <p><strong>Profiel ID:</strong> ${data.profileId}</p>
          </div>
          
          <a href="${process.env.NEXT_PUBLIC_APP_URL}/admin" 
             style="display: inline-block; background: #10b981; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin-top: 10px;">
            Bekijk in Admin Dashboard
          </a>
          
          <p style="margin-top: 30px; color: #6b7280; font-size: 14px;">
            Met vriendelijke groet,<br>
            Het TailTribe Team
          </p>
        </div>
      `
    })
  } catch (error) {
    console.error('Error sending admin notification:', error)
  }
}

