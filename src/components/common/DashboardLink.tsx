'use client'

import Link from 'next/link'
import { useSession } from 'next-auth/react'
import { useEffect, useState } from 'react'

interface Props {
  children: React.ReactNode
  className?: string
}

export function DashboardLink({ children, className }: Props) {
  const { data: session, status } = useSession()
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  // Don't render anything until mounted and session loaded
  if (!mounted || status === 'loading') {
    return null
  }
  
  const href = session?.user?.role === 'CAREGIVER' 
    ? '/dashboard/caregiver' 
    : session?.user?.role === 'ADMIN'
    ? '/admin'
    : '/dashboard/owner'
  
  return (
    <Link href={href} className={className}>
      {children}
    </Link>
  )
}


