import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function POST(req: NextRequest) {
  try {
    const { code } = await req.json()

    if (!code) {
      return NextResponse.json({ error: 'Referral code is required' }, { status: 400 })
    }

    // Find referral
    const referral = await db.referral.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        referrer: {
          select: {
            name: true,
            email: true
          }
        }
      }
    })

    if (!referral) {
      return NextResponse.json({ 
        valid: false,
        error: 'Ongeldige referral code'
      }, { status: 404 })
    }

    if (referral.status !== 'ACTIVE') {
      return NextResponse.json({ 
        valid: false,
        error: 'Deze referral code is niet meer actief'
      }, { status: 400 })
    }

    return NextResponse.json({
      valid: true,
      referralCode: referral.code,
      referrerName: referral.referrer.name || 'Een vriend',
      rewardAmount: 0, // New user gets no discount
      message: `Je bent uitgenodigd door ${referral.referrer.name || 'een vriend'}! Door jouw registratie helpt ${referral.referrer.name || 'je vriend'} om ons platform te laten groeien.`
    })

  } catch (error: any) {
    console.error('Error validating referral code:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to validate referral code' },
      { status: 500 }
    )
  }
}





