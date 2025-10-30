'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Message {
  id: string
  content?: string // Optional for legacy support
  body?: string    // API uses body
  createdAt: string
  readAt?: string | null
  sender: {
    id: string
    name: string | null
    image: string | null
  }
}

export default function ConversationPage({ params }: { params: { id: string } }) {
  const { data: session } = useSession()
  const [newMessage, setNewMessage] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [otherUser, setOtherUser] = useState<any>(null)
  const [otherUserRole, setOtherUserRole] = useState<'OWNER' | 'CAREGIVER' | null>(null)

  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesWrapRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  
  const bookingId = params.id

  useEffect(() => {
    fetchMessages()
    const interval = setInterval(fetchMessages, 5000) // Poll every 5 seconds
    return () => clearInterval(interval)
  }, [bookingId])

  const fetchMessages = async () => {
    try {
      const response = await fetch(`/api/messages?bookingId=${bookingId}`)
      if (!response.ok) {
        throw new Error('Kon berichten niet laden')
      }
      const data = await response.json()
      setMessages(data.messages || [])
      
      // Determine other user and role from booking data
      if (data.booking && session?.user) {
        const isOwner = data.booking.ownerId === session.user.id
        const otherUserData = isOwner 
          ? data.booking.caregiver 
          : data.booking.owner
        
        console.log('Setting other user:', otherUserData)
        setOtherUser(otherUserData)
        // If we're the owner, the other user is the caregiver, and vice versa
        setOtherUserRole(isOwner ? 'CAREGIVER' : 'OWNER')
      } else if (data.messages.length > 0 && session?.user) {
        // Fallback: determine from messages
        const firstOtherMessage = data.messages.find((m: Message) => m.sender.id !== session.user.id)
        if (firstOtherMessage) {
          console.log('Setting other user from message:', firstOtherMessage.sender)
          setOtherUser(firstOtherMessage.sender)
          // Default to OWNER role if we can't determine it
          setOtherUserRole('OWNER')
        }
      }
    } catch (error) {
      console.error('Error fetching messages:', error)
      if (loading) {
        toast.error('Kon berichten niet laden')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!newMessage.trim()) {
      return
    }

    setSending(true)

    try {
      const response = await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          bookingId,
          body: newMessage.trim()
        })
      })

      if (!response.ok) {
        throw new Error('Kon bericht niet versturen')
      }

      setNewMessage('')
      fetchMessages()
      scrollToBottom()
    } catch (error) {
      console.error('Error sending message:', error)
      toast.error('Kon bericht niet versturen')
    } finally {
      setSending(false)
    }
  }

  const isNearBottom = () => {
    const el = messagesWrapRef.current
    if (!el) return true
    const threshold = 120
    return el.scrollHeight - el.scrollTop - el.clientHeight < threshold
  }

  const scrollToBottom = (behavior: ScrollBehavior = 'smooth') => {
    const el = messagesWrapRef.current
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior })
      return
    }
    messagesEndRef.current?.scrollIntoView({ behavior })
  }

  useEffect(() => {
    if (isNearBottom()) {
      scrollToBottom('auto')
    }
  }, [messages])

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600 font-semibold">Berichten worden geladen...</p>
        </div>
      </div>
    )
  }

  const otherUserName = otherUser?.name || 'Onbekende gebruiker'

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-rose-50 flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {/* Clickable avatar for profile */}
              {otherUser?.id ? (
                <Link href={`/profile/${otherUser.id}`} onClick={() => console.log('Navigating to profile:', otherUser.id, otherUser)}>
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-md cursor-pointer hover:shadow-lg transition-shadow">
                    {otherUser?.image ? (
                      <img src={otherUser.image} alt={otherUserName} className="w-full h-full rounded-full object-cover" />
                    ) : (
                      otherUserName.charAt(0).toUpperCase()
                    )}
                  </div>
                </Link>
              ) : (
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold shadow-md">
                  {otherUserName.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <h1 className="text-xl font-bold text-gray-900">{otherUserName}</h1>
                <p className="text-sm text-gray-600">Actief</p>
              </div>
            </div>
            <Link
              href={session?.user?.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner'}
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 rounded-lg font-semibold shadow-md"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Messages Area */}
      <div className="flex-1 container mx-auto px-8 py-6 overflow-hidden flex flex-col">
        <div
          ref={messagesWrapRef}
          className="flex-1 overflow-y-auto space-y-4 pb-4"
        >
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 py-12">
              <p>Nog geen berichten. Stuur het eerste bericht!</p>
            </div>
          ) : (
            messages.map((msg) => {
              const isCurrentUser = msg.sender.id === session?.user?.id
              return (
                <div
                  key={msg.id}
                  className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} gap-2`}
                >
                  {/* Avatar for received messages */}
                  {!isCurrentUser && (
                    <Link href={`/profile/${msg.sender.id}`}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold cursor-pointer hover:shadow-lg transition-shadow flex-shrink-0">
                        {msg.sender.image ? (
                          <img src={msg.sender.image} alt={msg.sender.name || 'User'} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          (msg.sender.name || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                    </Link>
                  )}
                  
                  <div
                    className={`max-w-[70%] px-4 py-3 rounded-2xl shadow-md ${
                      isCurrentUser
                        ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                        : 'bg-white text-gray-900'
                    }`}
                  >
                    <p className="text-sm leading-relaxed">{msg.content || msg.body}</p>
                    <p
                      className={`text-xs mt-1 ${
                        isCurrentUser ? 'text-white/80' : 'text-gray-500'
                      }`}
                    >
                      {new Date(msg.createdAt).toLocaleTimeString('nl-NL', {
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  {/* Avatar for sent messages */}
                  {isCurrentUser && (
                    <Link href={`/profile/${msg.sender.id}`}>
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold cursor-pointer hover:shadow-lg transition-shadow flex-shrink-0">
                        {msg.sender.image ? (
                          <img src={msg.sender.image} alt={msg.sender.name || 'User'} className="w-full h-full rounded-full object-cover" />
                        ) : (
                          (msg.sender.name || 'U').charAt(0).toUpperCase()
                        )}
                      </div>
                    </Link>
                  )}
                </div>
              )
            })
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Message Input */}
        <form onSubmit={handleSendMessage} className="bg-white rounded-lg shadow-lg p-4 flex gap-3">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type een bericht..."
            className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
            disabled={sending}
          />
          <button
            type="submit"
            disabled={sending || !newMessage.trim()}
            className="px-6 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white rounded-lg font-semibold hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-md"
          >
            {sending ? 'Verzenden...' : 'Verzenden'}
          </button>
        </form>
      </div>
    </div>
  )
}
