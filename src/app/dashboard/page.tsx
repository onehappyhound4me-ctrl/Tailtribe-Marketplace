import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function DashboardRedirect() {
  const session = await auth()
  
  // CRITICAL: Check for valid session with user.id
  if (!session?.user?.id) {
    console.log('[DASHBOARD] No session found, redirecting to signin')
    console.log('[DASHBOARD] Session object:', session)
    redirect('/auth/signin?callbackUrl=/dashboard')
  }
  
  console.log('[DASHBOARD] Session found:', { id: session.user.id, role: session.user.role, email: session.user.email })
  
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
