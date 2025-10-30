import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { db } from '@/lib/db'
import { nanoid } from 'nanoid'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    // Check if user already has a referral code
    const existing = await db.referral.findFirst({
      where: { referrerId: user.id }
    })

    if (existing) {
      return NextResponse.json({
        success: true,
        referralCode: existing.code,
        referralLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/register?ref=${existing.code}`
      })
    }

    // Generate unique referral code
    const code = nanoid(8).toUpperCase()

    // Create referral record
    const referral = await db.referral.create({
      data: {
        referrerId: user.id,
        code,
        rewardAmount: 10.00, // €10 credit
        status: 'ACTIVE'
      }
    })

    return NextResponse.json({
      success: true,
      referralCode: referral.code,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/register?ref=${referral.code}`,
      reward: referral.rewardAmount
    })

  } catch (error: any) {
    console.error('Error generating referral code:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to generate referral code' },
      { status: 500 }
    )
  }
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Niet ingelogd' }, { status: 401 })
    }

    const user = await db.user.findUnique({
      where: { email: session.user.email }
    })

    if (!user) {
      return NextResponse.json({ error: 'Gebruiker niet gevonden' }, { status: 404 })
    }

    // Get referral stats
    const referral = await db.referral.findFirst({
      where: { referrerId: user.id }
    })

    if (!referral) {
      return NextResponse.json({
        success: true,
        hasReferralCode: false,
        totalReferrals: 0,
        totalEarned: 0
      })
    }

    // Count total referrals manually
    const totalReferrals = await db.user.count({
      where: { referredBy: referral.code }
    })

    // Get successful referrals (where referred user completed their first booking)
    const successfulReferrals = await db.user.count({
      where: {
        referredBy: referral.code,
        // Has at least one completed booking
        bookingsOwned: {
          some: {
            status: 'COMPLETED'
          }
        }
      }
    })

    return NextResponse.json({
      success: true,
      hasReferralCode: true,
      referralCode: referral.code,
      referralLink: `${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/auth/register?ref=${referral.code}`,
      totalReferrals: totalReferrals,
      successfulReferrals,
      totalEarned: successfulReferrals * referral.rewardAmount,
      rewardPerReferral: referral.rewardAmount
    })

  } catch (error: any) {
    console.error('Error fetching referral stats:', error)
    return NextResponse.json(
      { error: error.message || 'Failed to fetch referral stats' },
      { status: 500 }
    )
  }
}





