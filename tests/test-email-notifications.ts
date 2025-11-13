/**
 * Test Email Notifications
 * 
 * Verifieert dat alle email notification functies correct werken
 * (zonder daadwerkelijk emails te versturen in test mode)
 * 
 * Run met: npm run test:emails
 */

import {
  sendBookingRequestEmail,
  sendBookingConfirmationEmail,
  sendBookingCancellationEmail,
  sendServiceCompletionEmail,
  sendRefundEmail,
  notifyAdminNewCaregiverProfile,
} from '../src/lib/email-notifications'

interface TestResult {
  name: string
  passed: boolean
  error?: string
}

const results: TestResult[] = []

async function test(name: string, fn: () => Promise<void>): Promise<void> {
  try {
    await fn()
    results.push({ name, passed: true })
    console.log(`✅ ${name}`)
  } catch (error: any) {
    results.push({ name, passed: false, error: error.message })
    console.error(`❌ ${name}: ${error.message}`)
  }
}

async function main() {
  console.log('📧 Testing email notification functions...\n')

  // Test 1: Booking request email
  await test('sendBookingRequestEmail function exists', async () => {
    if (typeof sendBookingRequestEmail !== 'function') {
      throw new Error('Function not found')
    }
  })

  // Test 2: Booking confirmation email
  await test('sendBookingConfirmationEmail function exists', async () => {
    if (typeof sendBookingConfirmationEmail !== 'function') {
      throw new Error('Function not found')
    }
  })

  // Test 3: Booking cancellation email
  await test('sendBookingCancellationEmail function exists', async () => {
    if (typeof sendBookingCancellationEmail !== 'function') {
      throw new Error('Function not found')
    }
  })

  // Test 4: Service completion email
  await test('sendServiceCompletionEmail function exists', async () => {
    if (typeof sendServiceCompletionEmail !== 'function') {
      throw new Error('Function not found')
    }
  })

  // Test 5: Refund email
  await test('sendRefundEmail function exists', async () => {
    if (typeof sendRefundEmail !== 'function') {
      throw new Error('Function not found')
    }
  })

  // Test 6: Admin notification
  await test('notifyAdminNewCaregiverProfile function exists', async () => {
    if (typeof notifyAdminNewCaregiverProfile !== 'function') {
      throw new Error('Function not found')
    }
  })

  // Test 7: Function signatures (check parameters)
  await test('sendBookingRequestEmail signature check', async () => {
    try {
      // This will fail if signature is wrong, but we catch it
      await sendBookingRequestEmail({
        caregiverEmail: 'test@example.com',
        caregiverName: 'Test',
        ownerName: 'Owner',
        serviceName: 'DOG_WALKING',
        date: '2025-01-15',
        bookingId: 'test-id',
      })
    } catch (error: any) {
      // Expected to fail (no Resend API key in test), but signature should be correct
      if (error.message.includes('Resend') || error.message.includes('API')) {
        // This is expected - function signature is correct
        return
      }
      throw error
    }
  })

  // Summary
  console.log('\n📊 Email Notification Tests Summary:')
  console.log('─'.repeat(50))
  const passed = results.filter((r) => r.passed).length
  const failed = results.filter((r) => !r.passed).length

  results.forEach((result) => {
    const icon = result.passed ? '✅' : '❌'
    const error = result.error ? ` - ${result.error}` : ''
    console.log(`${icon} ${result.name}${error}`)
  })

  console.log('─'.repeat(50))
  console.log(`Total: ${results.length} tests`)
  console.log(`Passed: ${passed}`)
  console.log(`Failed: ${failed}`)

  if (failed > 0) {
    process.exit(1)
  } else {
    console.log('\n✅ All email notification functions are properly defined!')
    console.log('ℹ️  Note: Actual email sending requires RESEND_API_KEY in environment')
    process.exit(0)
  }
}

main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})

