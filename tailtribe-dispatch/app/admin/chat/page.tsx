'use client'

import { useEffect, useState, useCallback } from 'react'
import { getStatusLabel } from '@/lib/status-labels'

type Conversation = {
  id: string
  bookingId: string
  ownerId: string
  caregiverId: string
  status: string
  createdAt: string
}

type Message = {
  id: string
  senderRole: string
  body: string
  sanitizedBody?: string | null
  blockedReason?: string | null
  createdAt: string
}

export default function AdminChatAuditPage() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [offset, setOffset] = useState(0)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [messagesOffset, setMessagesOffset] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [showBlockedOnly, setShowBlockedOnly] = useState(false)
  const [loadingConversations, setLoadingConversations] = useState(false)
  const [loadingMessages, setLoadingMessages] = useState(false)

  const loadConversations = useCallback(async (nextOffset = 0, reset = true) => {
    setLoadingConversations(true)
    setError(null)
    try {
      const res = await fetch(`/api/conversations?limit=50&offset=${nextOffset}`, { cache: 'no-store' })
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      setConversations((prev) => (reset ? data.items : [...prev, ...data.items]))
      setOffset(data.offset ?? nextOffset)
    } catch {
      setError('Kon conversaties niet laden')
    } finally {
      setLoadingConversations(false)
    }
  }, [])

  const loadMessages = useCallback(async (nextOffset = 0, reset = true) => {
    if (!selectedId) return
    setLoadingMessages(true)
    setError(null)
    try {
      const res = await fetch(`/api/conversations/${selectedId}/messages?limit=100&offset=${nextOffset}`, {
        cache: 'no-store',
      })
      if (!res.ok) throw new Error('fetch failed')
      const data = await res.json()
      setMessages((prev) => (reset ? data.items : [...prev, ...data.items]))
      setMessagesOffset(data.offset ?? nextOffset)
    } catch {
      setError('Kon berichten niet laden')
    } finally {
      setLoadingMessages(false)
    }
  }, [selectedId])

  useEffect(() => {
    loadConversations(0, true)
  }, [loadConversations])

  useEffect(() => {
    setMessages([])
    setMessagesOffset(0)
    loadMessages(0, true)
  }, [loadMessages])

  const updateStatus = async (status: 'ACTIVE' | 'LOCKED') => {
    if (!selectedId) return
    await fetch(`/api/conversations/${selectedId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    })
    setConversations((prev) => prev.map((c) => (c.id === selectedId ? { ...c, status } : c)))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-4">Chat-audit</h1>
        {error && <div className="mb-3 text-sm text-red-600">{error}</div>}
        <div className="grid md:grid-cols-3 gap-4">
          <div className="bg-white rounded-xl border p-3 max-h-[70vh] overflow-auto">
            <div className="flex items-center justify-between mb-2">
              <h2 className="font-semibold text-gray-800">Conversaties</h2>
              <button
                onClick={() => loadConversations(0, true)}
                disabled={loadingConversations}
                className="text-xs text-emerald-700 hover:underline disabled:opacity-60"
              >
                {loadingConversations ? 'Laden...' : 'Vernieuwen'}
              </button>
            </div>
            {conversations.map((c) => (
              <button
                key={c.id}
                onClick={() => setSelectedId(c.id)}
                className={`w-full text-left px-3 py-2 rounded-lg border mb-2 ${
                  selectedId === c.id ? 'border-emerald-400 bg-emerald-50' : 'border-gray-200'
                }`}
              >
                <div className="text-sm font-semibold text-gray-800">Aanvraag: {c.bookingId}</div>
                <div className="text-xs text-gray-600">
                  Status: {getStatusLabel(c.status)}
                </div>
              </button>
            ))}
            <div className="pt-2">
              <button
                onClick={() => loadConversations(offset + 50, false)}
                disabled={loadingConversations}
                className="text-xs text-gray-600 hover:underline disabled:opacity-60"
              >
                {loadingConversations ? 'Laden...' : 'Meer laden'}
              </button>
            </div>
          </div>
          <div className="md:col-span-2 bg-white rounded-xl border p-4 min-h-[60vh]">
            {!selectedId && <div className="text-sm text-gray-500">Selecteer een conversatie</div>}
            {selectedId && (
              <>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className="text-sm text-gray-700">Berichten</div>
                    <label className="flex items-center gap-2 text-xs text-gray-600">
                      <input
                        type="checkbox"
                        checked={showBlockedOnly}
                        onChange={(e) => setShowBlockedOnly(e.target.checked)}
                        className="h-3 w-3"
                      />
                      Enkel geblokkeerde berichten
                    </label>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => loadMessages(0, true)}
                      disabled={loadingMessages}
                      className="px-3 py-1 rounded-lg border text-sm"
                    >
                      {loadingMessages ? 'Laden...' : 'Vernieuwen'}
                    </button>
                    <button
                      onClick={() => updateStatus('ACTIVE')}
                      className="px-3 py-1 rounded-lg border text-sm"
                    >
                      Activeer
                    </button>
                    <button
                      onClick={() => updateStatus('LOCKED')}
                      className="px-3 py-1 rounded-lg border text-sm text-red-600"
                    >
                      Vergrendel
                    </button>
                  </div>
                </div>
                <div className="space-y-3 max-h-[55vh] overflow-auto">
                  {messages
                    .filter((m) => (showBlockedOnly ? !!m.blockedReason : true))
                    .map((m) => (
                      <div key={m.id} className="border rounded-lg px-3 py-2">
                      <div className="text-xs text-gray-500">
                        {new Date(m.createdAt).toLocaleString('nl-BE')} • {m.senderRole}
                      </div>
                      <div className="text-sm text-gray-800">
                        {m.blockedReason ? `Geblokkeerd: ${m.blockedReason}` : m.sanitizedBody || m.body}
                      </div>
                      </div>
                    ))}
                  {messages.length === 0 && <div className="text-sm text-gray-500">Geen berichten</div>}
                  {showBlockedOnly && messages.filter((m) => m.blockedReason).length === 0 && (
                    <div className="text-sm text-gray-500">Geen geblokkeerde berichten</div>
                  )}
                  <div>
                    <button
                      onClick={() => loadMessages(messagesOffset + 100, false)}
                      disabled={loadingMessages}
                      className="text-xs text-gray-600 hover:underline disabled:opacity-60"
                    >
                      {loadingMessages ? 'Laden...' : 'Meer berichten'}
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
