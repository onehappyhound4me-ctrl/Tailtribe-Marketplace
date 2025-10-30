/**
 * Load Testing Script for TailTribe
 * 
 * Tests the platform under load to ensure it can handle 1000+ users
 * 
 * Usage:
 * npm install -D autocannon
 * npx tsx scripts/load-test.ts
 */

import { exec } from 'child_process'
import { promisify } from 'util'

const execAsync = promisify(exec)

const BASE_URL = process.env.TEST_URL || 'http://localhost:3000'

interface LoadTestResult {
  endpoint: string
  duration: number
  connections: number
  requests: number
  throughput: number
  latency: {
    avg: number
    p50: number
    p95: number
    p99: number
  }
  errors: number
  success: boolean
}

async function runLoadTest(
  endpoint: string,
  duration: number = 30,
  connections: number = 10,
  headers?: Record<string, string>
): Promise<LoadTestResult> {
  console.log(`\n🧪 Testing: ${endpoint}`)
  console.log(`Duration: ${duration}s, Connections: ${connections}`)

  const headersArg = headers 
    ? Object.entries(headers).map(([k, v]) => `-H "${k}: ${v}"`).join(' ')
    : ''

  const command = `npx autocannon -c ${connections} -d ${duration} ${headersArg} ${BASE_URL}${endpoint} --json`

  try {
    const { stdout } = await execAsync(command)
    const result = JSON.parse(stdout)

    return {
      endpoint,
      duration,
      connections,
      requests: result.requests.total,
      throughput: result.throughput.mean,
      latency: {
        avg: result.latency.mean,
        p50: result.latency.p50,
        p95: result.latency.p95,
        p99: result.latency.p99
      },
      errors: result.errors || 0,
      success: result.errors === 0 && result.latency.p95 < 1000 // <1s at p95
    }
  } catch (error: any) {
    console.error(`❌ Test failed:`, error.message)
    return {
      endpoint,
      duration,
      connections,
      requests: 0,
      throughput: 0,
      latency: { avg: 0, p50: 0, p95: 0, p99: 0 },
      errors: 1,
      success: false
    }
  }
}

async function runAllTests() {
  console.log('🚀 TailTribe Load Testing Suite')
  console.log('================================\n')

  const tests: Array<{ endpoint: string; connections: number; duration: number }> = [
    // Light load
    { endpoint: '/', connections: 10, duration: 30 },
    { endpoint: '/search', connections: 10, duration: 30 },
    { endpoint: '/api/health', connections: 10, duration: 30 },
    
    // Medium load
    { endpoint: '/search', connections: 50, duration: 30 },
    { endpoint: '/api/caregivers/search', connections: 50, duration: 30 },
    
    // Heavy load (simulating 100 concurrent users)
    { endpoint: '/', connections: 100, duration: 30 },
    { endpoint: '/search', connections: 100, duration: 30 },
  ]

  const results: LoadTestResult[] = []

  for (const test of tests) {
    const result = await runLoadTest(test.endpoint, test.duration, test.connections)
    results.push(result)
    
    // Cooldown between tests
    await new Promise(resolve => setTimeout(resolve, 5000))
  }

  // Print Summary
  console.log('\n\n📊 LOAD TEST SUMMARY')
  console.log('===================\n')

  let allPassed = true

  results.forEach(result => {
    const status = result.success ? '✅ PASS' : '❌ FAIL'
    console.log(`${status} ${result.endpoint}`)
    console.log(`  Connections: ${result.connections}`)
    console.log(`  Requests: ${result.requests}`)
    console.log(`  Throughput: ${result.throughput.toFixed(2)} req/s`)
    console.log(`  Latency (p95): ${result.latency.p95.toFixed(2)}ms`)
    console.log(`  Errors: ${result.errors}`)
    console.log('')

    if (!result.success) allPassed = false
  })

  // Performance Benchmarks
  console.log('\n🎯 PERFORMANCE BENCHMARKS:')
  console.log('Target: <500ms avg, <1000ms p95, 0 errors')
  console.log('')

  if (allPassed) {
    console.log('✅ ALL TESTS PASSED - Site is ready for 1000+ users!')
  } else {
    console.log('❌ SOME TESTS FAILED - Optimization needed before launch')
  }

  // Recommendations
  console.log('\n💡 RECOMMENDATIONS:')
  const avgP95 = results.reduce((sum, r) => sum + r.latency.p95, 0) / results.length
  
  if (avgP95 > 1000) {
    console.log('⚠️  High latency detected - Consider:')
    console.log('  - Upgrading database plan')
    console.log('  - Adding Redis caching')
    console.log('  - Optimizing queries')
    console.log('  - CDN for static assets')
  } else if (avgP95 > 500) {
    console.log('⚠️  Moderate latency - Consider caching for heavy endpoints')
  } else {
    console.log('✅ Excellent performance - Ready to scale!')
  }

  const totalErrors = results.reduce((sum, r) => sum + r.errors, 0)
  if (totalErrors > 0) {
    console.log(`⚠️  ${totalErrors} errors detected - Check logs and fix before launch`)
  }
}

// Run tests
runAllTests().catch(console.error)





