import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function POST(request: NextRequest) {
  try {
    const { name, email, subject, message } = await request.json()

    if (!name || !email || !message) {
      return NextResponse.json({ error: 'Vul alle verplichte velden in' }, { status: 400 })
    }

    // Send email to support
    await resend.emails.send({
      from: 'TailTribe Contact <noreply@tailtribe.be>',
      to: 'steven@tailtribe.be',
      replyTo: email,
      subject: `Contact formulier: ${subject || 'Geen onderwerp'}`,
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 20px; text-align: center; border-radius: 10px 10px 0 0;">
            <h2 style="color: white; margin: 0;">Nieuw Contact Bericht</h2>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <div style="margin-bottom: 20px; padding: 15px; background: #f3f4f6; border-radius: 8px;">
              <p style="margin: 0 0 10px 0; color: #374151;"><strong>Van:</strong> ${name}</p>
              <p style="margin: 0 0 10px 0; color: #374151;"><strong>Email:</strong> ${email}</p>
              ${subject ? `<p style="margin: 0; color: #374151;"><strong>Onderwerp:</strong> ${subject}</p>` : ''}
            </div>
            
            <div style="margin-top: 20px;">
              <h3 style="color: #374151; margin-bottom: 10px;">Bericht:</h3>
              <p style="color: #374151; white-space: pre-wrap; line-height: 1.6;">${message}</p>
            </div>
            
            <div style="margin-top: 30px; padding: 15px; background: #dbeafe; border-left: 4px solid #3b82f6; border-radius: 4px;">
              <p style="margin: 0; font-size: 14px; color: #1e40af;">
                <strong>💡 Tip:</strong> Antwoord op deze email om direct te reageren naar ${email}
              </p>
            </div>
          </div>
        </div>
      `
    })

    // Send confirmation email to user
    await resend.emails.send({
      from: 'TailTribe <noreply@tailtribe.be>',
      to: email,
      subject: 'We hebben je bericht ontvangen - TailTribe',
      html: `
        <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="color: white; margin: 0;">Bedankt voor je bericht!</h1>
          </div>
          
          <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
            <p style="font-size: 16px; color: #374151;">Hoi ${name},</p>
            
            <p style="font-size: 16px; color: #374151;">
              Bedankt voor het contacteren van TailTribe. We hebben je bericht goed ontvangen en nemen zo snel mogelijk contact met je op.
            </p>
            
            <div style="margin: 20px 0; padding: 15px; background: #f3f4f6; border-radius: 8px;">
              <p style="margin: 0 0 10px 0; color: #6b7280; font-size: 14px;"><strong>Je bericht:</strong></p>
              <p style="margin: 0; color: #374151; white-space: pre-wrap;">${message}</p>
            </div>
            
            <p style="font-size: 14px; color: #6b7280;">
              Meestal reageren we binnen 24 uur op werkdagen.
            </p>
            
            <div style="margin-top: 30px; padding: 15px; background: #dbeafe; border-radius: 4px; text-align: center;">
              <p style="margin: 0 0 15px 0; color: #1e40af; font-size: 14px;">
                In de tussentijd kun je onze FAQ bekijken:
              </p>
              <a href="${process.env.NEXT_PUBLIC_APP_URL}/help" 
                 style="display: inline-block; background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold;">
                Bekijk FAQ
              </a>
            </div>
            
            <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
              Met vriendelijke groet,<br>
              Het TailTribe Team
            </p>
          </div>
        </div>
      `
    })

    return NextResponse.json({ 
      success: true,
      message: 'Bericht succesvol verzonden'
    })

  } catch (error) {
    console.error('Contact form error:', error)
    return NextResponse.json({ error: 'Er ging iets mis bij het verzenden van je bericht' }, { status: 500 })
  }
}




