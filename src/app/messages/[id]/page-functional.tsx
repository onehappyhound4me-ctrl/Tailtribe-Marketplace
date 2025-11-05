'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSession } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import { toast } from 'sonner'

interface Message {
  id: string
  body: string
  createdAt: string
  sender: {
    id: string
    name: string
    image?: string
  }
}

export default function MessagesPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const router = useRouter()
  const [messages, setMessages] = useState<Message[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages?bookingId=${params.id}`, { cache: 'no-store' })
      if (res.ok) {
        const data = await res.json()
        setMessages(data.messages || [])
      }
    } catch (error) {
      console.error('Failed to fetch messages')
    } finally {
      setLoading(false)
    }
  }, [params.id])

  useEffect(() => {
    if (!session) {
      router.push('/auth/signin')
      return
    }
    fetchMessages()
    // Poll for new messages every 5 seconds
    const interval = setInterval(fetchMessages, 5000)
    return () => clearInterval(interval)
  }, [session, router, fetchMessages])

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || sending) return

    setSending(true)
    try {
      const res = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId: params.id,
          body: newMessage
        })
      })

      if (!res.ok) throw new Error()

      setNewMessage('')
      fetchMessages()
    } catch (error) {
      toast.error('Bericht verzenden mislukt')
    } finally {
      setSending(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        <div className="bg-white rounded-xl shadow-md overflow-hidden h-[calc(100vh-200px)] flex flex-col">
          {/* Header */}
          <div className="p-4 border-b bg-gradient-to-r from-green-600 to-blue-600 text-white">
            <h2 className="font-bold text-lg">Berichten</h2>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center py-12 text-gray-500">
                Nog geen berichten. Start het gesprek!
              </div>
            ) : (
              messages.map((msg) => {
                const isOwn = msg.sender.id === session?.user?.id
                return (
                  <div
                    key={msg.id}
                    className={`flex ${isOwn ? 'justify-end' : 'justify-start'}`}
                  >
                    <div className={`max-w-[70%] ${isOwn ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-900'} rounded-2xl px-4 py-3`}>
                      <p className="text-sm font-medium mb-1">{msg.sender.name}</p>
                      <p>{msg.body}</p>
                      <p className="text-xs opacity-70 mt-1">
                        {new Date(msg.createdAt).toLocaleTimeString('nl-BE', {
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t bg-gray-50">
            <div className="flex gap-2">
              <input
                type="text"
                value={newMessage}
                onChange={(e) => setNewMessage(e.target.value)}
                placeholder="Type je bericht..."
                className="flex-1 px-4 py-3 border rounded-xl focus:ring-2 focus:ring-green-500"
              />
              <button
                type="submit"
                disabled={sending || !newMessage.trim()}
                className="px-6 py-3 bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-xl font-semibold hover:from-green-700 hover:to-blue-700 disabled:opacity-50"
              >
                Verzend
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}




