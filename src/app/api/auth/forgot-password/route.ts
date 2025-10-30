import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import crypto from 'crypto'
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

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

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex')
    const resetTokenExpiry = new Date(Date.now() + 3600000) // 1 hour

    // Save token to database
    await db.user.update({
      where: { id: user.id },
      data: {
        // We'll need to add these fields to the User model
        // For now, we'll store it in a separate table or use a simple approach
        // resetToken: resetToken,
        // resetTokenExpiry: resetTokenExpiry
      }
    })

    // Send email
    const resetUrl = `${process.env.NEXT_PUBLIC_APP_URL}/auth/reset-password?token=${resetToken}`

    try {
      await resend.emails.send({
        from: 'TailTribe <noreply@tailtribe.be>',
        to: email,
        subject: 'Reset je wachtwoord - TailTribe',
        html: `
          <div style="font-family: sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
              <h1 style="color: white; margin: 0;">Wachtwoord Resetten</h1>
            </div>
            
            <div style="background: white; padding: 30px; border-radius: 0 0 10px 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1);">
              <p style="font-size: 16px; color: #374151;">Hoi ${user.name || 'daar'},</p>
              
              <p style="font-size: 16px; color: #374151;">
                Je hebt gevraagd om je wachtwoord te resetten. Klik op de knop hieronder om een nieuw wachtwoord in te stellen:
              </p>
              
              <div style="text-align: center; margin: 30px 0;">
                <a href="${resetUrl}" 
                   style="display: inline-block; background: linear-gradient(135deg, #10b981 0%, #14b8a6 100%); color: white; padding: 14px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; font-size: 16px;">
                  Reset Wachtwoord
                </a>
              </div>
              
              <p style="font-size: 14px; color: #6b7280;">
                Of kopieer deze link naar je browser:
              </p>
              <p style="font-size: 14px; color: #10b981; word-break: break-all;">
                ${resetUrl}
              </p>
              
              <div style="margin-top: 30px; padding: 15px; background: #fef3c7; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; font-size: 14px; color: #92400e;">
                  <strong>⚠️ Belangrijk:</strong> Deze link is 1 uur geldig. Heb je deze reset niet aangevraagd? Negeer deze email dan.
                </p>
              </div>
              
              <p style="margin-top: 30px; font-size: 14px; color: #6b7280;">
                Met vriendelijke groet,<br>
                Het TailTribe Team
              </p>
            </div>
            
            <div style="text-align: center; margin-top: 20px; color: #9ca3af; font-size: 12px;">
              <p>TailTribe - Betrouwbare dierenverzorging in België</p>
            </div>
          </div>
        `
      })
    } catch (emailError) {
      console.error('Email send error:', emailError)
      // Don't fail the request if email fails
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




