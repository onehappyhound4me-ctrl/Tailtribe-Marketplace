import { cookies } from 'next/headers'

export type ImpersonationContext = {
  role: 'OWNER' | 'CAREGIVER'
  userId: string
}

export const getImpersonationContext = (session: any): ImpersonationContext | null => {
  if (!session || session.user?.role !== 'ADMIN') return null
  const store = cookies()
  const role = store.get('impersonateRole')?.value
  const userId = store.get('impersonateUserId')?.value
  if (!role || !userId) return null
  if (role !== 'OWNER' && role !== 'CAREGIVER') return null
  return { role, userId }
}
