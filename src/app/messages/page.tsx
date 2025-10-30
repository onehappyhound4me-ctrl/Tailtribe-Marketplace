'use client'

import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import Link from 'next/link'
import { toast } from 'sonner'

interface Conversation {
  bookingId: string
  otherUser: {
    id: string
    name: string
    image: string | null
  }
  lastMessage: {
    content: string
    createdAt: string
  }
  unreadCount: number
}

export default function MessagesPage() {
  const { data: session } = useSession()
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchConversations()
  }, [])

  const fetchConversations = async () => {
    try {
      const res = await fetch('/api/messages/conversations')
      if (res.ok) {
        const data = await res.json()
        setConversations(data.conversations || [])
      }
    } catch (error) {
      console.error('Error fetching conversations:', error)
      toast.error('Kon berichten niet laden')
    } finally {
      setLoading(false)
    }
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(hours / 24)

    if (hours < 1) return 'Zojuist'
    if (hours < 24) return `${hours} uur geleden`
    if (days === 1) return 'Gisteren'
    if (days < 7) return `${days} dagen geleden`
    return date.toLocaleDateString('nl-NL')
  }
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-teal-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-8 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-800">Mijn Berichten</h1>
              <p className="text-gray-600">Overzicht van al je gesprekken</p>
            </div>
            <div className="flex items-center gap-3">
              <Link href={session?.user?.role === 'CAREGIVER' ? '/dashboard/caregiver' : '/dashboard/owner'} className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:from-emerald-600 hover:to-teal-700 active:scale-95 transition-all duration-200 rounded-lg font-semibold shadow-md hover:shadow-lg self-start">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" />
              </svg>
              Dashboard
            </Link>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container mx-auto px-8 py-8">
        {/* Messages List */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div className="p-6 border-b">
            <h2 className="text-lg font-semibold text-gray-800">Mijn Berichten</h2>
          </div>
          
          {loading ? (
            <div className="p-12 text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4"></div>
              <p className="text-gray-600">Berichten laden...</p>
            </div>
          ) : conversations.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Nog geen berichten</h3>
              <p className="text-gray-600">Je hebt nog geen berichten ontvangen.</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-200">
              {conversations.map((conv) => (
                <div key={conv.bookingId} className={`p-6 hover:bg-gray-50 transition-colors ${conv.unreadCount > 0 ? 'bg-blue-50' : ''}`}>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 flex-1">
                      {/* Avatar with profile link - stop click propagation */}
                      <Link href={`/profile/${conv.otherUser.id}`} onClick={(e) => e.stopPropagation()}>
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold cursor-pointer hover:shadow-lg transition-shadow">
                          {conv.otherUser.image ? (
                            <img src={conv.otherUser.image} alt={conv.otherUser.name} className="w-full h-full rounded-full object-cover" />
                          ) : (
                            conv.otherUser.name.charAt(0).toUpperCase()
                          )}
                        </div>
                      </Link>
                      {/* Clickable message area */}
                      <Link href={`/messages/${conv.bookingId}`} className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-sm font-semibold text-gray-900 truncate">{conv.otherUser.name}</h3>
                          {conv.unreadCount > 0 && (
                            <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full">{conv.unreadCount}</span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 truncate mt-1">{conv.lastMessage.content}</p>
                      </Link>
                    </div>
                    <Link href={`/messages/${conv.bookingId}`} className="text-right ml-4">
                      <p className="text-xs text-gray-500">{formatTime(conv.lastMessage.createdAt)}</p>
                      <svg className="w-5 h-5 text-gray-400 mt-2 ml-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}


