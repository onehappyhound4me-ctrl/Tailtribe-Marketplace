import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { Resend } from 'resend'
import { createPasswordResetToken, getResetPasswordUrl } from '@/lib/passwordReset'

const resendApiKey = process.env.RESEND_API_KEY
const resend = resendApiKey ? new Resend(resendApiKey) : null

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is verplicht' }, { status: 400 })
    }

    // Check if user exists
    const user = await db.user.findUnique({
      where: { email }
    })

    // Always return success (security: don't reveal if email exists)
    if (!user) {
      return NextResponse.json({ 
        success: true, 
        message: 'Als dit email adres bestaat, is er een reset link verzonden.' 
      })
    }

    // Generate reset token and store hashed version
    const { token: resetToken, expires } = await createPasswordResetToken(user.id)

    const resetUrl = getResetPasswordUrl(resetToken)
    const friendlyName = user.firstName || user.name || 'daar'

    if (resend) {
      try {
        const friendlyExpiry = expires.toLocaleTimeString('nl-BE', {
          hour: '2-digit',
          minute: '2-digit',
        })

        const textBody = [
          `Hoi ${friendlyName},`,
          '',
          'Je hebt gevraagd om je wachtwoord te resetten. Gebruik onderstaande link (of kopieer hem in je browser):',
          `${resetUrl}`,
          '',
          `Deze link verloopt om ${friendlyExpiry} en werkt slechts één keer.`,
          'Heb je dit niet aangevraagd? Negeer deze email.',
          '',
          'Met vriendelijke groet,',
          'Het TailTribe team',
        ].join('\n')

        const htmlBody = `
<!DOCTYPE html>
<html lang="nl">
  <body style="margin:0;padding:0;background-color:#f5f7fa;">
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="padding:24px 0;">
      <tr>
        <td align="center">
          <table role="presentation" width="520" cellspacing="0" cellpadding="0" style="background:#ffffff;border-radius:8px;border:1px solid #e5e7eb;">
            <tr>
              <td style="padding:32px;">
                <table width="100%" cellspacing="0" cellpadding="0">
                  <tr>
                    <td align="center" style="padding-bottom:24px;">
                      <img src="https://www.tailtribe.be/assets/tailtribe-logo.png" width="56" height="56" alt="TailTribe" style="display:block;margin-bottom:12px;" />
                      <h1 style="font-size:22px;margin:0;color:#111827;font-family:Arial,Helvetica,sans-serif;">Wachtwoord resetten</h1>
                    </td>
                  </tr>
                  <tr>
                    <td style="font-size:15px;line-height:1.6;color:#374151;font-family:Arial,Helvetica,sans-serif;">
                      <p style="margin:0 0 16px;">Hoi ${friendlyName},</p>
                      <p style="margin:0 0 16px;">Je hebt gevraagd om je wachtwoord te resetten. Klik op de knop hieronder of kopieer de link:</p>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin:24px 0;">
                        <tr>
                          <td align="center">
                            <a href="${resetUrl}"
                              style="display:inline-block;background-color:#10b981;color:#ffffff;text-decoration:none;font-weight:600;font-size:15px;border-radius:4px;padding:12px 24px;font-family:Arial,Helvetica,sans-serif;"
                              target="_blank" rel="noopener noreferrer">
                              Reset wachtwoord
                            </a>
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0 0 12px;">Werkt de knop niet? Kopieer dan deze link:</p>
                      <p style="word-break:break-all;margin:0 0 24px;">
                        <a href="${resetUrl}" style="color:#047857;text-decoration:none;font-weight:600;">${resetUrl}</a>
                      </p>
                      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="border:1px solid #fcd34d;background-color:#fef3c7;border-radius:6px;margin-bottom:16px;">
                        <tr>
                          <td style="padding:12px;font-size:13px;color:#92400e;font-family:Arial,Helvetica,sans-serif;">
                            <strong>Let op:</strong> deze link verloopt om ${friendlyExpiry} en kan maar één keer gebruikt worden. Heb je dit niet aangevraagd? Negeer deze e-mail dan.
                          </td>
                        </tr>
                      </table>
                      <p style="margin:0;">Met vriendelijke groet,<br />Het TailTribe team</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          <p style="font-size:12px;color:#9ca3af;margin-top:16px;font-family:Arial,Helvetica,sans-serif;">© ${new Date().getFullYear()} TailTribe · Betrouwbare dierenverzorging</p>
        </td>
      </tr>
    </table>
  </body>
</html>
        `.trim()

        await resend.emails.send({
          from: 'TailTribe <noreply@tailtribe.be>',
          to: email,
          subject: 'Reset je wachtwoord - TailTribe',
          text: textBody,
          html: htmlBody,
        })
      } catch (emailError) {
        console.error('Email send error:', emailError)
        // Don't fail the request if email fails
      }
    } else {
      console.warn('RESEND_API_KEY ontbreekt - reset e-mail niet verzonden')
    }

    return NextResponse.json({ 
      success: true,
      message: 'Reset link verzonden naar je email'
    })

  } catch (error) {
    console.error('Forgot password error:', error)
    return NextResponse.json({ error: 'Er ging iets mis' }, { status: 500 })
  }
}




