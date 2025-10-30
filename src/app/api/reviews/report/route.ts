import { NextRequest, NextResponse } from 'next/server'

// Minimal placeholder endpoint to accept review reports
export async function POST(req: NextRequest) {
  try {
    const { reviewId, reason } = await req.json()
    if (!reviewId) {
      return NextResponse.json({ error: 'reviewId vereist' }, { status: 400 })
    }
    // TODO: store report in DB or send to moderation inbox
    console.log('Review reported', { reviewId, reason })
    return NextResponse.json({ ok: true })
  } catch (e) {
    return NextResponse.json({ error: 'Ongeldig verzoek' }, { status: 400 })
  }
}


