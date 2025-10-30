import { NextRequest, NextResponse } from 'next/server'
import { processPendingPayouts } from '@/lib/payout-delay'

/**
 * Cron Job: Process Delayed Payouts
 * 
 * Runs every 6 hours (configured in vercel.json)
 * 
 * Processes payouts for bookings completed 48-72h ago
 */

export async function GET(req: NextRequest) {
  try {
    // Verify cron secret to prevent unauthorized access
    const authHeader = req.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.log('🏦 Starting payout processing...')

    const results = await processPendingPayouts()

    console.log(`✅ Payout processing complete:`)
    console.log(`   - Processed: ${results.processed}`)
    console.log(`   - Failed: ${results.failed}`)

    if (results.errors.length > 0) {
      console.error(`   - Errors:`, results.errors)
    }

    return NextResponse.json({
      success: true,
      timestamp: new Date(),
      results
    })

  } catch (error: any) {
    console.error('Cron payout processing error:', error)
    return NextResponse.json(
      { error: error.message || 'Payout processing failed' },
      { status: 500 }
    )
  }
}





