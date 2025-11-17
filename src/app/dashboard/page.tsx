import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function DashboardRedirect() {
  const session = await auth()
  
  // CRITICAL: Check for valid session with user.id
  if (!session?.user?.id) {
    redirect('/auth/signin?callbackUrl=/dashboard')
  }
  
  // Direct redirect based on role
  const role = session.user.role || 'OWNER'
  
  if (role === 'CAREGIVER') {
    redirect('/dashboard/caregiver')
  }
  
  if (role === 'OWNER') {
    redirect('/dashboard/owner')
  }
  
  if (role === 'ADMIN') {
    redirect('/admin')
  }
  
  // Fallback to owner
  redirect('/dashboard/owner')
  
  // This never renders - always redirects
  return null
}
