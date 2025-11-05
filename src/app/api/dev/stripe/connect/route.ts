export const dynamic = 'force-dynamic'
export const revalidate = 0
import { NextRequest, NextResponse } from 'next/server'
import { auth } from '@/lib/auth'
import { db } from '@/lib/db'
import { createConnectedAccount, createAccountLink } from '@/lib/stripe'

export async function GET(req: NextRequest) {
  try {
    // If no real Stripe key is configured, simulate a successful onboarding in dev
    const hasRealStripeKey = !!process.env.STRIPE_SECRET_KEY && !process.env.STRIPE_SECRET_KEY?.includes('placeholder')
    if (!hasRealStripeKey && process.env.NODE_ENV !== 'production') {
      const url = new URL('/settings/payment?demoStripe=1', req.url)
      return NextResponse.redirect(url)
    }

    const session = await auth()
    let userId = session?.user?.id
    // Dev fallback: impersonate first caregiver
    if (!userId && process.env.NODE_ENV !== 'production') {
      const first = await db.caregiverProfile.findFirst({ select: { userId: true } })
      userId = first?.userId
    }
    if (!userId) {
      return NextResponse.redirect(new URL('/auth/signin', req.url))
    }

    const user = await db.user.findUnique({ where: { id: userId } })
    if (!user) {
      return NextResponse.redirect(new URL('/dashboard', req.url))
    }

    // Create or reuse connected account id stored on caregiver profile (extend schema if needed)
    const caregiver = await db.caregiverProfile.findUnique({ where: { userId }, select: { id: true } })
    if (!caregiver) {
      return NextResponse.redirect(new URL('/dashboard/caregiver', req.url))
    }

    // For demo we create a fresh account each time; in production, persist accountId on caregiver profile
    const account = await createConnectedAccount(user.email || 'demo@tailtribe.be', 'BE')
    const link = await createAccountLink(
      account.id,
      new URL('/settings/payment', req.url).toString(),
      new URL('/settings/payment', req.url).toString()
    )
    return NextResponse.redirect(link.url)
  } catch (e) {
    console.error('Stripe connect error', e)
    return NextResponse.redirect(new URL('/settings/payment', req.url))
  }
}


