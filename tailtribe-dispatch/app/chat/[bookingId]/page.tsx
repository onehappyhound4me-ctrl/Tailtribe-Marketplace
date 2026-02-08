'use client'

import { useEffect, useRef, useState, useCallback, useMemo } from 'react'
import { useParams } from 'next/navigation'
import { DISPATCH_SERVICES } from '@/lib/services'

type Conversation = {
  id: string
  status: string
  context?: {
    type?: 'BOOKING' | 'REQUEST'
    service?: string | null
    date?: string | null
    timeWindow?: string | null
    time?: string | null
  }
}
type Message = {
  id: string
  senderUserId: string
  senderRole: string
  body: string
  sanitizedBody?: string | null
  blockedReason?: string | null
  createdAt: string
}

const MAX_MESSAGES = 300

const TIME_WINDOW_LABELS: Record<string, string> = {
  MORNING: 'Ochtend',
  AFTERNOON: 'Middag',
  EVENING: 'Avond',
  NIGHT: 'Nacht',
}

export default function ChatPage() {
  const params = useParams<{ bookingId: string }>()
  const bookingId = params.bookingId

  const [conversation, setConversation] = useState<Conversation | null>(null)
  const [messages, setMessages] = useState<Message[]>([])
  const [lastMessageAt, setLastMessageAt] = useState<string | null>(null)
  const [input, setInput] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [isVisible, setIsVisible] = useState(true)
  const [sending, setSending] = useState(false)
  const [inputFocused, setInputFocused] = useState(false)

  const inputValueRef = useRef('')
  const inputFocusedRef = useRef(false)

  const loadConversation = useCallback(async () => {
    setError(null)
    try {
      const res = await fetch(`/api/conversations?bookingId=${bookingId}`, { cache: 'no-store' })
      if (!res.ok) {
        const data = await res.json().catch(() => null)
        setError(data?.error || 'Chat niet beschikbaar.')
        setLoading(false)
        return
      }
      const convo = await res.json()
      setConversation(convo)
      setLoading(false)
    } catch (e) {
      setError('Fout bij laden van chat.')
      setLoading(false)
    }
  }, [bookingId])

  const contextLine = useMemo(() => {
    const ctx = conversation?.context
    if (!ctx) return ''
    const serviceId = ctx.service ?? ''
    const serviceName = serviceId
      ? DISPATCH_SERVICES.find((s) => s.id === serviceId)?.name ?? serviceId
      : ''
    const dateStr = ctx.date ? new Date(ctx.date).toLocaleDateString('nl-BE') : ''
    const tw = ctx.timeWindow ? (TIME_WINDOW_LABELS[ctx.timeWindow] ?? ctx.timeWindow) : ''
    const parts = [serviceName, dateStr, tw].filter(Boolean)
    return parts.join(' • ')
  }, [conversation?.context])

  const loadMessages = useCallback(async (force = false) => {
    if (!conversation) return
    // Mobile Safari: updating messages while typing can cause the input caret/text to "jump/flip".
    // Pause polling updates while the user is actively typing.
    if (!force && inputValueRef.current.trim().length > 0) {
      // Some mobile browsers can briefly lose focus while typing/scrolling.
      // If there's unsent text, avoid UI updates that can disturb the caret.
      return
    }
    try {
      const sinceParam = !force && lastMessageAt ? `&since=${encodeURIComponent(lastMessageAt)}` : ''
      const res = await fetch(
        `/api/conversations/${conversation.id}/messages?limit=100&offset=0${sinceParam}`,
        { cache: 'no-store' }
      )
      if (res.ok) {
        const data = await res.json()
        const items = data.items ?? []
        if (!force && lastMessageAt) {
          setMessages((prev) => {
            const seen = new Set(prev.map((msg) => msg.id))
            const merged = [...prev]
            items.forEach((msg: Message) => {
              if (!seen.has(msg.id)) merged.push(msg)
            })
            return merged.slice(-MAX_MESSAGES)
          })
        } else {
          setMessages(items.slice(-MAX_MESSAGES))
        }
        const latest = items[items.length - 1]?.createdAt ?? lastMessageAt
        if (latest) {
          setLastMessageAt(latest)
        }
      }
    } catch {
      // ignore
    }
  }, [conversation, lastMessageAt])

  useEffect(() => {
    const handleVisibility = () => {
      setIsVisible(document.visibilityState === 'visible')
    }
    handleVisibility()
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  useEffect(() => {
    loadConversation()
  }, [loadConversation])

  useEffect(() => {
    if (!conversation) return
    setMessages([])
    setLastMessageAt(null)
    loadMessages(true)
    if (!isVisible) return undefined
    const id = setInterval(loadMessages, 4500)
    return () => clearInterval(id)
  }, [conversation, loadMessages, isVisible])

  const handleSend = async () => {
    if (!conversation) return
    const body = input.trim()
    if (!body || sending) return
    setError(null)
    setSending(true)
    try {
      const res = await fetch(`/api/conversations/${conversation.id}/messages`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ body }),
      })
      const data = await res.json().catch(() => null)
      if (!res.ok) {
        // Keep the user's input so they can edit it (common when moderation blocks phone/email/links).
        setError(data?.error || 'Bericht kon niet worden verzonden.')
        // Still refresh so the sender sees the blocked message entry (if created).
        loadMessages(true)
        return
      }
      // Clear only after successful send.
      inputValueRef.current = ''
      setInput('')
      loadMessages(true)
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 via-white to-blue-50">
        <div className="text-gray-700">Laden...</div>
      </div>
    )
  }

  if (error && !conversation) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-green-50 via-white to-blue-50">
        <div className="bg-white rounded-xl shadow-md p-6 text-center text-gray-700">{error}</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 via-white to-blue-50">
      <main className="max-w-3xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">
          <div className="bg-emerald-50 px-4 py-3 border-b">
            <div className="text-sm text-gray-700 font-semibold">Chatregels</div>
            {contextLine ? (
              <div className="mt-0.5 text-xs text-gray-700 font-medium">{contextLine}</div>
            ) : null}
            <div className="text-xs text-gray-600">
              Je mag enkel je adres delen. Deel geen telefoonnummer, e-mail, links of social media.
            </div>
          </div>

          {error && <div className="px-4 py-2 text-sm text-red-600 border-b bg-red-50">{error}</div>}

          <div className="h-96 overflow-y-auto px-4 py-3 space-y-3">
            {messages.length === 0 && <div className="text-sm text-gray-500">Nog geen berichten.</div>}
            {messages.map((msg) => (
              <div key={msg.id} className="flex flex-col">
                <div className="text-xs text-gray-500">
                  {new Date(msg.createdAt).toLocaleString('nl-BE')} • {msg.senderRole}
                </div>
                <div
                  className="text-sm text-gray-900 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2"
                  dir="auto"
                >
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
                onChange={(e) => {
                  const v = e.target.value
                  inputValueRef.current = v
                  setInput(v)
                }}
                onFocus={() => {
                  inputFocusedRef.current = true
                  setInputFocused(true)
                }}
                onBlur={() => {
                  inputFocusedRef.current = false
                  setInputFocused(false)
                }}
                // iOS Safari zoom/jump happens when input font-size < 16px.
                // Use 16px on mobile to keep typing stable.
                className="flex-1 border rounded-lg px-3 py-2 text-[16px] sm:text-sm"
                placeholder="Typ je bericht..."
                disabled={sending}
                dir="auto"
              />
              <button
                onClick={handleSend}
                className="px-4 py-2 bg-emerald-600 text-white rounded-lg text-sm disabled:opacity-50"
                disabled={!input.trim() || !conversation || sending}
              >
                {sending ? 'Bezig...' : 'Verstuur'}
              </button>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
