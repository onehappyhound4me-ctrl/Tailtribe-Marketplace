'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { SiteHeader } from '@/components/SiteHeader'
import { SiteFooter } from '@/components/SiteFooter'

type CommunityMessage = {
  id: string
  senderUserId: string
  senderRole: string
  senderName?: string
  body: string
  sanitizedBody?: string | null
  blockedReason?: string | null
  createdAt: string
}

type CommunityRoom = {
  id: string
  slug: string
  name: string
  description?: string | null
}

const MAX_MESSAGES = 300

export default function CommunityPage() {
  const { data: session, status } = useSession()
  const [rooms, setRooms] = useState<CommunityRoom[]>([])
  const [activeRoom, setActiveRoom] = useState<CommunityRoom | null>(null)
  const [messages, setMessages] = useState<CommunityMessage[]>([])
  const [lastMessageAt, setLastMessageAt] = useState<string | null>(null)
  const [members, setMembers] = useState<{ caregivers: any[]; admins: any[] }>({ caregivers: [], admins: [] })
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [messagesLoading, setMessagesLoading] = useState(false)
  const [view, setView] = useState<'overview' | 'chat'>('overview')
  const [isVisible, setIsVisible] = useState(true)

  const canAccess = session?.user?.role === 'ADMIN' || session?.user?.role === 'CAREGIVER'

  const loadRooms = useCallback(async () => {
    try {
      const res = await fetch('/api/community/rooms', { cache: 'no-store' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || 'Topics konden niet geladen worden.')
        setLoading(false)
        return
      }
      const data = await res.json()
      setRooms(data)
      if (!activeRoom && data.length > 0) {
        setActiveRoom(data[0])
      }
      if (data.length > 0) {
        setLoading(false)
      }
      if (data.length === 0) {
        setError('Er zijn nog geen topics beschikbaar.')
        setLoading(false)
      }
    } catch {
      setError('Fout bij laden van topics.')
      setLoading(false)
    }
  }, [activeRoom])

  const loadMembers = useCallback(async () => {
    try {
      const res = await fetch('/api/community/members', { cache: 'no-store' })
      if (!res.ok) return
      const data = await res.json()
      setMembers(data)
    } catch {
      // ignore
    }
  }, [])

  const loadMessages = useCallback(async (force = false) => {
    if (!activeRoom) {
      return
    }
    setError(null)
    setMessagesLoading(true)
    try {
      const sinceParam = !force && lastMessageAt ? `?since=${encodeURIComponent(lastMessageAt)}` : ''
      const res = await fetch(`/api/community/rooms/${activeRoom.slug}/messages${sinceParam}`, { cache: 'no-store' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || 'Community is momenteel niet beschikbaar.')
        return
      }
      const data = (await res.json()) as CommunityMessage[]
      if (sinceParam) {
        setMessages((prev) => {
          const seen = new Set(prev.map((msg) => msg.id))
          const merged = [...prev]
          data.forEach((msg) => {
            if (!seen.has(msg.id)) merged.push(msg)
          })
          return merged.slice(-MAX_MESSAGES)
        })
      } else {
        setMessages(data.slice(-MAX_MESSAGES))
      }
      const latest = data[data.length - 1]?.createdAt ?? lastMessageAt
      if (latest) {
        setLastMessageAt(latest)
      }
    } catch (e) {
      setError('Fout bij laden van berichten.')
    } finally {
      setMessagesLoading(false)
    }
  }, [activeRoom, lastMessageAt, messages.length])

  useEffect(() => {
    const handleVisibility = () => {
      setIsVisible(document.visibilityState === 'visible')
    }
    handleVisibility()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  useEffect(() => {
    if (status === 'authenticated' && canAccess) {
      loadRooms()
      loadMembers()
      return
    }
    if (status === 'authenticated' && !canAccess) {
      setLoading(false)
    }
    return undefined
  }, [status, canAccess, loadRooms, loadMembers])

  useEffect(() => {
    if (status === 'authenticated' && canAccess && view === 'chat' && isVisible) {
      loadMessages()
      const id = setInterval(loadMessages, 4500)
      return () => clearInterval(id)
    }
    return undefined
  }, [status, canAccess, activeRoom, loadMessages, view, isVisible])

  const handleSend = async () => {
    if (!input.trim()) return
    setError(null)
    const body = input
    setInput('')
    if (!activeRoom) return
    const res = await fetch(`/api/community/rooms/${activeRoom.slug}/messages`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ body }),
    })
    if (!res.ok) {
      const data = await res.json().catch(() => null)
      setError(data?.error || 'Bericht kon niet worden verzonden.')
      return
    }
    loadMessages(true)
  }

  if (status === 'loading' || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 via-white to-blue-50">
        <div className="text-gray-700">Laden...</div>
      </div>
    )
  }

  if (status === 'authenticated' && !canAccess) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 via-white to-blue-50">
        <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-700">
          Deze community is enkel voor verzorgers en beheerders.
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50 flex flex-col">
      <SiteHeader primaryCtaHref="/dashboard" primaryCtaLabel="Dashboard" />

      <main className="max-w-6xl mx-auto w-full px-4 py-10 flex-1">
        <header className="mb-6 text-center">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">Community voor verzorgers</h1>
          <p className="text-gray-600">
            Deel tips, ervaringen en vragen. We houden alles netjes en veilig binnen het platform.
          </p>
          <div className="mt-5 inline-flex rounded-full border border-emerald-200 bg-white shadow-sm overflow-hidden">
            <button
              onClick={() => setView('overview')}
              className={`px-5 py-2 text-sm font-semibold transition ${
                view === 'overview' ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-emerald-50'
              }`}
            >
              Overzicht
            </button>
            <button
              onClick={() => setView('chat')}
              className={`px-5 py-2 text-sm font-semibold transition ${
                view === 'chat' ? 'bg-emerald-600 text-white' : 'text-gray-700 hover:bg-emerald-50'
              }`}
            >
              Chat
            </button>
          </div>
        </header>

        {view === 'overview' ? (
          <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_0.9fr] gap-6">
            <section className="bg-white rounded-2xl shadow-md border border-gray-100 p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <h2 className="text-xl font-bold text-gray-900">Topics</h2>
                <button
                  onClick={() => setView('chat')}
                  className="px-4 py-2 rounded-full bg-emerald-600 text-white text-sm font-semibold hover:bg-emerald-700 transition"
                >
                  Naar chat
                </button>
              </div>
              <div className="grid sm:grid-cols-2 gap-4">
                {rooms.map((room) => (
                  <button
                    key={room.slug}
                    onClick={() => {
                      setActiveRoom(room)
                      setView('chat')
                    }}
                    className="text-left rounded-xl border border-emerald-100 bg-emerald-50/40 px-4 py-3 hover:bg-emerald-50 transition"
                  >
                    <div className="font-semibold text-gray-900">{room.name}</div>
                    <div className="text-sm text-gray-600 mt-1">{room.description}</div>
                  </button>
                ))}
                {rooms.length === 0 && (
                  <div className="text-sm text-gray-500">
                    Geen topics gevonden. Controleer of de community-tabellen actief zijn.
                  </div>
                )}
              </div>
            </section>

            <section className="space-y-6">
              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Leden</h2>
                <div className="text-sm text-gray-600 mb-4">
                  Beheerders: {members.admins.length} · Verzorgers: {members.caregivers.length}
                </div>
                <div className="space-y-3">
                  {members.admins.length > 0 && (
                    <div>
                      <div className="text-xs font-semibold text-gray-500 mb-1">Beheerders</div>
                      <div className="space-y-1">
                        {members.admins.map((admin) => (
                          <div key={admin.id} className="text-sm text-gray-700">
                            {admin.name}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                  <div>
                    <div className="text-xs font-semibold text-gray-500 mb-1">Verzorgers</div>
                    <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
                      {members.caregivers.length === 0 && (
                        <div className="text-sm text-gray-500">Nog geen verzorgers zichtbaar.</div>
                      )}
                      {members.caregivers.map((caregiver) => (
                        <div key={caregiver.id} className="text-sm text-gray-700">
                          {caregiver.name}
                          {caregiver.region ? ` · ${caregiver.region}` : ''}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Communityregels</h2>
                <ul className="text-sm text-gray-600 space-y-2">
                  <li>Deel geen telefoonnummers, e-mail, links of social media.</li>
                  <li>Respectvolle communicatie, focus op leren en delen.</li>
                  <li>Vragen of issues? Tag een beheerder in de chat.</li>
                </ul>
              </div>

              <div className="bg-white rounded-2xl shadow-md border border-gray-100 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-3">Hoe werkt het?</h2>
                <ol className="text-sm text-gray-600 space-y-2 list-decimal list-inside">
                  <li>Kies een topic of start in de vrije chat.</li>
                  <li>Stel je vraag of deel je ervaring.</li>
                  <li>Leer van andere verzorgers en updates van admins.</li>
                </ol>
              </div>
            </section>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-[260px_1fr] gap-6">
            <aside className="bg-white rounded-2xl shadow-md border border-gray-100 p-4 h-fit space-y-6">
              <div>
                <div className="text-sm font-semibold text-gray-900 mb-3">Topics</div>
                <div className="space-y-2">
                  {rooms.length === 0 && (
                    <div className="text-sm text-gray-500">
                      Geen topics gevonden. Controleer of de community-tabellen actief zijn.
                    </div>
                  )}
                  {rooms.map((room) => {
                    const isActive = activeRoom?.slug === room.slug
                    return (
                      <button
                        key={room.slug}
                        onClick={() => setActiveRoom(room)}
                        className={`w-full text-left px-3 py-2 rounded-xl border text-sm transition ${
                          isActive
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-900'
                            : 'border-gray-200 bg-white hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className="font-semibold">{room.name}</div>
                        {room.description && <div className="text-xs text-gray-500 mt-1">{room.description}</div>}
                      </button>
                    )
                  })}
                </div>
              </div>
            </aside>

            <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
              <div className="bg-emerald-50 px-4 py-3 border-b">
                <div className="text-sm text-gray-700 font-semibold">
                  {activeRoom ? activeRoom.name : 'Community'}
                </div>
                <div className="text-xs text-gray-600">
                  {activeRoom?.description ?? 'Deel geen telefoonnummers, e-mail, links of social media.'}
                </div>
              </div>

              {error && <div className="px-4 py-2 text-sm text-red-600 border-b bg-red-50">{error}</div>}
              {messagesLoading && (
                <div className="px-4 py-2 text-xs text-gray-500 border-b bg-white">
                  Laden...
                </div>
              )}

              <div className="h-[26rem] overflow-y-auto px-4 py-3 space-y-4">
                {messages.length === 0 && <div className="text-sm text-gray-500">Nog geen berichten.</div>}
                {messages.map((msg) => (
                  <div key={msg.id} className="flex flex-col">
                    <div className="text-xs text-gray-500">
                      {new Date(msg.createdAt).toLocaleString('nl-BE')} • {msg.senderName ?? msg.senderRole}
                    </div>
                    <div className="text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2">
                      {msg.blockedReason ? (
                        <span className="text-red-600">Geblokkeerd: {msg.blockedReason}</span>
                      ) : (
                        msg.sanitizedBody || msg.body
                      )}
                    </div>
                  </div>
                ))}
              </div>

              <div className="border-t px-4 py-3 bg-gray-50">
                <div className="flex gap-2">
                  <input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    className="flex-1 border rounded-lg px-3 py-2 text-sm"
                    placeholder={activeRoom ? 'Typ je bericht...' : 'Kies eerst een topic'}
                    disabled={!activeRoom}
                  />
                  <button
                    onClick={handleSend}
                    className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm disabled:opacity-50"
                    disabled={!input.trim() || !activeRoom}
                  >
                    Verstuur
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </main>

      <SiteFooter />
    </div>
  )
}
