import { redirect } from 'next/navigation'
import { auth } from '@/lib/auth'

export default async function DashboardRedirect() {
  const session = await auth()
  
  if (!session?.user) {
    redirect('/auth/signin')
  }
  
  // Direct redirect based on role
  const role = session.user.role
  
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
