/**
 * Test Email Notifications
 * 
 * Verifieert dat alle email notification functies bestaan in het bestand
 * (zonder daadwerkelijk emails te versturen in test mode)
 * 
 * Run met: npm run test:emails
 */

import * as fs from 'fs'
import * as path from 'path'

interface TestResult {
  name: string
  passed: boolean
  error?: string
}

const results: TestResult[] = []

function test(name: string, fn: () => void): void {
  try {
    fn()
    results.push({ name, passed: true })
    console.log(`✅ ${name}`)
  } catch (error: any) {
    results.push({ name, passed: false, error: error.message })
    console.error(`❌ ${name}: ${error.message}`)
  }
}

async function main() {
  console.log('📧 Testing email notification functions...\n')

  // Read the email-notifications.ts file
  const emailNotificationsPath = path.join(process.cwd(), 'src', 'lib', 'email-notifications.ts')
  const fileContent = fs.readFileSync(emailNotificationsPath, 'utf-8')

  // List of required functions
  const requiredFunctions = [
    'sendBookingRequestEmail',
    'sendBookingConfirmationEmail',
    'sendBookingCancellationEmail',
    'sendServiceCompletionEmail',
    'sendRefundEmail',
    'notifyAdminNewCaregiverProfile',
  ]

  // Test each function exists
  requiredFunctions.forEach((funcName) => {
    test(`${funcName} function exists`, () => {
      // Check if function is exported
      const exportPattern = new RegExp(`export\\s+(async\\s+)?function\\s+${funcName}`, 'g')
      if (!exportPattern.test(fileContent)) {
        throw new Error(`Function ${funcName} not found or not exported`)
      }
    })
  })

  // Test that Resend is imported
  test('Resend is imported', () => {
    if (!fileContent.includes('import') || !fileContent.includes('Resend')) {
      throw new Error('Resend not imported')
    }
  })

  // Test that FROM_EMAIL constant exists
  test('FROM_EMAIL constant exists', () => {
    if (!fileContent.includes('FROM_EMAIL')) {
      throw new Error('FROM_EMAIL constant not found')
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
