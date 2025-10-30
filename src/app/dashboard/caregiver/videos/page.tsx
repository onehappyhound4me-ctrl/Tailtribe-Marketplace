'use client'

import Link from 'next/link'
import { useState } from 'react'

export default function CaregiverVideosPage() {
  const [url, setUrl] = useState('')
  const [title, setTitle] = useState('')
  const [transcript, setTranscript] = useState('')
  // Auto-expiry: 14 dagen na toevoegen
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    try {
      // TODO: POST to /api/highlights (implement backend persistence)
      const defaultExpiry = new Date()
      defaultExpiry.setDate(defaultExpiry.getDate() + 14)
      // Example payload (when backend is added): { url, title, transcript, expiresAt: defaultExpiry.toISOString() }
      await new Promise((r) => setTimeout(r, 600))
      setSaved(true)
      setUrl('')
      setTitle('')
      setTranscript('')
      setTimeout(() => setSaved(false), 2500)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Professional Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Video Highlights Beheren</h1>
              <p className="text-sm text-gray-600">Voeg video's toe aan je profiel</p>
            </div>
            <Link href="/dashboard/caregiver" className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all duration-200 rounded-lg font-semibold shadow-md hover:shadow-lg">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      <div className="container mx-auto px-6 py-10 max-w-3xl">

        <div className="rounded-xl border border-white/40 bg-white/70 backdrop-blur p-6 shadow-xl">
          <p className="text-sm text-gray-600 mb-4">
            Voeg YouTube of Vimeo links toe. Video’s verlopen automatisch 14 dagen na toevoegen en verschijnen op je profiel. Tip: vul de transcript in voor betere SEO.
          </p>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Video URL (YouTube/Vimeo)</label>
              <input value={url} onChange={(e)=>setUrl(e.target.value)} type="url" required placeholder="https://www.youtube.com/watch?v=..." className="w-full p-3 border border-gray-300 rounded-lg bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Titel</label>
              <input value={title} onChange={(e)=>setTitle(e.target.value)} type="text" placeholder="Titel (optioneel)" className="w-full p-3 border border-gray-300 rounded-lg bg-white" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Transcript / Beschrijving</label>
              <textarea value={transcript} onChange={(e)=>setTranscript(e.target.value)} rows={4} placeholder="Korte beschrijving voor SEO (optioneel)" className="w-full p-3 border border-gray-300 rounded-lg bg-white" />
            </div>
            {/* Auto-expiry is 14 dagen; geen datumveld nodig */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Link href="/dashboard/caregiver" className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm">Annuleren</Link>
              <button disabled={saving} type="submit" className="px-5 py-2 rounded-lg bg-indigo-600 text-white hover:bg-indigo-700 text-sm shadow disabled:opacity-60">
                {saving ? 'Opslaan...' : 'Video toevoegen'}
              </button>
            </div>
            {saved && <div className="text-sm text-green-700">Voorbeeld opgeslagen (backend volgt).</div>}
          </form>
        </div>
      </div>
    </div>
  )
}


