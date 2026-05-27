import { getImpersonationContext } from '@/lib/impersonation'

type SessionLike = {
  user?: { id?: string; role?: string } | null
} | null

/** Resolve the user id/role when an admin impersonates owner or caregiver. */
export function getEffectiveSession(session: SessionLike) {
  const impersonation = getImpersonationContext(session)
  const role = impersonation?.role ?? session?.user?.role
  const userId =
    impersonation?.role === 'OWNER' || impersonation?.role === 'CAREGIVER'
      ? impersonation.userId
      : session?.user?.id
  return { impersonation, role, userId }
}

export function requireRole(session: SessionLike, allowed: Array<'OWNER' | 'CAREGIVER' | 'ADMIN'>) {
  const { role, userId } = getEffectiveSession(session)
  if (!session || !userId || !role || !allowed.includes(role as any)) {
    return { ok: false as const, role, userId }
  }
  return { ok: true as const, role, userId }
}
