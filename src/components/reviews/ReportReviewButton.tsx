'use client'

import { useState } from 'react'

export default function ReportReviewButton({ reviewId }: { reviewId: string }) {
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const onReport = async () => {
    if (submitting || done) return
    setSubmitting(true)
    setError(null)
    try {
      const res = await fetch('/api/reviews/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reviewId, reason: 'reported_by_caregiver' })
      })
      if (!res.ok) throw new Error('Rapporteren mislukt')
      setDone(true)
    } catch (e: any) {
      setError(e?.message || 'Er ging iets mis')
    } finally {
      setSubmitting(false)
    }
  }

  if (done) {
    return <span className="text-xs text-green-700">Melding ontvangen. Dank je!</span>
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onReport}
        disabled={submitting}
        className="text-sm text-red-600 hover:underline disabled:opacity-60"
      >
        Review rapporteren
      </button>
      {error && <span className="text-xs text-red-600">{error}</span>}
    </div>
  )
}


