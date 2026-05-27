import assert from 'node:assert/strict'

// Minimal mirror of lib/effective-session.ts for unit testing without TS loader.
function getImpersonationContext(session) {
  if (!session || session.user?.role !== 'ADMIN') return null
  const role = session._impersonateRole
  const userId = session._impersonateUserId
  if (!role || !userId) return null
  if (role !== 'OWNER' && role !== 'CAREGIVER') return null
  return { role, userId }
}

function getEffectiveSession(session) {
  const impersonation = getImpersonationContext(session)
  const role = impersonation?.role ?? session?.user?.role
  const userId =
    impersonation?.role === 'OWNER' || impersonation?.role === 'CAREGIVER'
      ? impersonation.userId
      : session?.user?.id
  return { impersonation, role, userId }
}

function requireRole(session, allowed) {
  const { role, userId } = getEffectiveSession(session)
  if (!session || !userId || !role || !allowed.includes(role)) {
    return { ok: false, role, userId }
  }
  return { ok: true, role, userId }
}

const ownerSession = { user: { id: 'owner-1', role: 'OWNER' } }
assert.deepEqual(requireRole(ownerSession, ['OWNER']), { ok: true, role: 'OWNER', userId: 'owner-1' })

const adminImpersonatingOwner = {
  user: { id: 'admin-1', role: 'ADMIN' },
  _impersonateRole: 'OWNER',
  _impersonateUserId: 'owner-2',
}
assert.deepEqual(requireRole(adminImpersonatingOwner, ['OWNER']), {
  ok: true,
  role: 'OWNER',
  userId: 'owner-2',
})

const adminImpersonatingCaregiver = {
  user: { id: 'admin-1', role: 'ADMIN' },
  _impersonateRole: 'CAREGIVER',
  _impersonateUserId: 'cg-1',
}
assert.deepEqual(requireRole(adminImpersonatingCaregiver, ['CAREGIVER']), {
  ok: true,
  role: 'CAREGIVER',
  userId: 'cg-1',
})

// Admin without impersonation must not pass owner/caregiver gates
assert.equal(requireRole(adminImpersonatingOwner, ['OWNER']).ok, true)
assert.equal(requireRole({ user: { id: 'admin-1', role: 'ADMIN' } }, ['OWNER']).ok, false)

console.log('test-effective-session: ok')
