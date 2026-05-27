import assert from 'node:assert/strict'

// Documents expected resolvePublicBookingOwner behavior for anonymous vs existing email.
function resolveAnonymous(existing) {
  if (existing) {
    if (existing.role !== 'OWNER') {
      return { error: 'wrong-role' }
    }
    return { error: 'login-required' }
  }
  return { action: 'create' }
}

assert.deepEqual(resolveAnonymous(null), { action: 'create' })
assert.deepEqual(resolveAnonymous({ role: 'ADMIN' }), { error: 'wrong-role' })
assert.deepEqual(resolveAnonymous({ role: 'OWNER' }), { error: 'login-required' })

console.log('test-public-booking-owner: ok')
