'use client'

import { useState, useRef, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

interface Message {
  id: string
  senderId: string
  senderName: string
  body: string
  createdAt: Date
  isRead: boolean
  attachments?: string[]
}

interface MessageThreadProps {
  bookingId: string
  currentUserId: string
  otherParty: {
    id: string
    name: string
    avatar?: string
    role: 'caregiver' | 'owner'
  }
}

export function MessageThread({ bookingId, currentUserId, otherParty }: MessageThreadProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      senderId: otherParty.id,
      senderName: otherParty.name,
      body: 'Hallo! Ik heb je boekingsaanvraag ontvangen. Ik kijk er naar uit om voor je huisdier te zorgen!',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
      isRead: true
    },
    {
      id: '2',
      senderId: currentUserId,
      senderName: 'Jij',
      body: 'Geweldig! Kun je me wat meer vertellen over je ervaring met honden?',
      createdAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
      isRead: true
    },
    {
      id: '3',
      senderId: otherParty.id,
      senderName: otherParty.name,
      body: 'Natuurlijk! Ik heb al meer dan 5 jaar ervaring met honden van alle groottes. Ik ben gecertificeerd in eerste hulp voor huisdieren en heb uitstekende referenties.',
      createdAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
      isRead: true
    },
    {
      id: '4',
      senderId: otherParty.id,
      senderName: otherParty.name,
      body: 'Heeft je hond speciale behoeften waar ik rekening mee moet houden?',
      createdAt: new Date(Date.now() - 5 * 60 * 1000), // 5 minutes ago
      isRead: false
    }
  ])

  const [newMessage, setNewMessage] = useState('')
  const [isTyping, setIsTyping] = useState(false)
  const [isOnline, setIsOnline] = useState(true)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLTextAreaElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim()) return

    const message: Message = {
      id: Date.now().toString(),
      senderId: currentUserId,
      senderName: 'Jij',
      body: newMessage.trim(),
      createdAt: new Date(),
      isRead: false
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')

    // Simulate typing indicator and response
    setTimeout(() => {
      setIsTyping(true)
      setTimeout(() => {
        setIsTyping(false)
        const response: Message = {
          id: (Date.now() + 1).toString(),
          senderId: otherParty.id,
          senderName: otherParty.name,
          body: 'Bedankt voor je bericht! Ik zal zo snel mogelijk antwoorden.',
          createdAt: new Date(),
          isRead: false
        }
        setMessages(prev => [...prev, response])
      }, 2000)
    }, 500)
  }

  const formatTime = (date: Date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 1) return 'Nu'
    if (minutes < 60) return `${minutes}m geleden`
    if (hours < 24) return `${hours}u geleden`
    if (days < 7) return `${days}d geleden`
    return date.toLocaleDateString('nl-NL')
  }

  return (
    <div className="max-w-4xl mx-auto">
      {/* Chat Header */}
      <Card className="gradient-card professional-shadow mb-4">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-green-600 rounded-full flex items-center justify-center text-white font-bold text-lg">
                  {otherParty.name.charAt(0)}
                </div>
                {isOnline && (
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-white"></div>
                )}
              </div>
              <div>
                <CardTitle className="text-xl">{otherParty.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant={otherParty.role === 'caregiver' ? 'default' : 'secondary'}>
                    {otherParty.role === 'caregiver' ? '🐾 Verzorger' : '👨‍👩‍👧‍👦 Eigenaar'}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    {isOnline ? '🟢 Online' : '⚫ Offline'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" className="text-green-600 border-green-200 hover:bg-green-50">
                📞 Bellen
              </Button>
              <Button variant="outline" size="sm" className="text-blue-600 border-blue-200 hover:bg-blue-50">
                📹 Video
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Messages Container */}
      <Card className="gradient-card professional-shadow">
        <CardContent className="p-0">
          {/* Messages List */}
          <div className="h-96 overflow-y-auto p-6 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === currentUserId ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-xs lg:max-w-md px-4 py-3 rounded-2xl ${
                    message.senderId === currentUserId
                      ? 'bg-green-600 text-white rounded-br-md'
                      : 'bg-gray-100 text-gray-900 rounded-bl-md'
                  }`}
                >
                  <p className="text-sm leading-relaxed">{message.body}</p>
                  <div className={`flex items-center justify-between mt-2 text-xs ${
                    message.senderId === currentUserId ? 'text-green-100' : 'text-gray-500'
                  }`}>
                    <span>{formatTime(message.createdAt)}</span>
                    {message.senderId === currentUserId && (
                      <span className="ml-2">
                        {message.isRead ? '✓✓' : '✓'}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Typing Indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-gray-100 px-4 py-3 rounded-2xl rounded-bl-md">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <div className="border-t border-gray-200 p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <div className="flex-1 relative">
                <textarea
                  ref={inputRef}
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Typ je bericht..."
                  className="w-full p-3 pr-12 border border-gray-300 rounded-xl focus:ring-2 focus:ring-green-500 focus:border-green-500 resize-none"
                  rows={1}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault()
                      handleSendMessage(e)
                    }
                  }}
                />
                <button
                  type="button"
                  className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
                  title="Bestand toevoegen"
                >
                  📎
                </button>
              </div>
              <Button
                type="submit"
                disabled={!newMessage.trim()}
                className="gradient-button px-6 py-3 h-auto"
              >
                <span className="text-lg">📤</span>
              </Button>
            </form>
            
            {/* Quick Replies */}
            <div className="flex gap-2 mt-3">
              {[
                '👍 Akkoord',
                '📅 Wanneer?',
                '📍 Locatie?',
                '💰 Prijs?'
              ].map((quickReply) => (
                <button
                  key={quickReply}
                  onClick={() => setNewMessage(quickReply.split(' ').slice(1).join(' '))}
                  className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-sm hover:bg-gray-200 transition-colors"
                >
                  {quickReply}
                </button>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Info */}
      <div className="mt-4 text-center text-sm text-gray-500">
        <p>💬 Berichten zijn versleuteld en privé</p>
        <p>🔒 Je privacy wordt beschermd</p>
      </div>
    </div>
  )
}
