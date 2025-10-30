'use client'

import { redirect } from 'next/navigation'

// Redirect to new availability page
export default function AvailabilityPage() {
  redirect('/schedule/availability-new')
}