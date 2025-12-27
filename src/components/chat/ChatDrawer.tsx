'use client'

import { useState, useRef, useEffect } from 'react'
import { X, MessageSquare, Loader2 } from 'lucide-react'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

interface ChatDrawerProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export default function ChatDrawer({ isOpen, onClose, userId }: ChatDrawerProps) {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationId, setConversationId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    }

    setMessages(prev => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: input,
          conversationId,
          userId,
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to send message')
      }

      const reader = response.body?.getReader()
      const decoder = new TextDecoder()
      let assistantMessage = ''
      let newConversationId = conversationId

      const assistantMessageObj: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
        timestamp: new Date(),
      }

      setMessages(prev => [...prev, assistantMessageObj])

      while (true) {
        const { done, value } = await reader!.read()
        if (done) break

        const chunk = decoder.decode(value)
        const lines = chunk.split('\n')

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6)
            if (data === '[DONE]') continue

            try {
              const parsed = JSON.parse(data)
              if (parsed.text) {
                assistantMessage += parsed.text
                setMessages(prev => {
                  const updated = [...prev]
                  updated[updated.length - 1].content = assistantMessage
                  return updated
                })
              }
              if (parsed.conversationId && !newConversationId) {
                newConversationId = parsed.conversationId
                setConversationId(parsed.conversationId)
              }
            } catch (e) {
              // Ignore parse errors for incomplete chunks
            }
          }
        }
      }
    } catch (error) {
      console.error('Error sending message:', error)
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, there was an error processing your request.',
          timestamp: new Date(),
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage()
    }
  }

  const startNewConversation = () => {
    setMessages([])
    setConversationId(null)
    setInput('')
  }

  if (!isOpen) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className="fixed inset-0 bg-black/20 z-40 transition-opacity"
        onClick={onClose}
      />

      {/* Drawer */}
      <div className="fixed top-0 right-0 h-full w-full md:w-[500px] bg-white shadow-2xl z-50 flex flex-col border-l border-border">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <MessageSquare className="w-5 h-5 text-radar-primary" />
            <div>
              <h2 className="font-nav font-semibold text-lg">Research Assistant</h2>
              <p className="text-xs text-muted-foreground">Ask about your research library</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {conversationId && (
              <button
                onClick={startNewConversation}
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground bg-muted hover:bg-muted/80 rounded-lg transition-colors"
              >
                New Chat
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 hover:bg-muted rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
          {messages.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center px-4">
              <div className="max-w-sm">
                <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
                  <MessageSquare className="w-8 h-8 text-muted-foreground" />
                </div>
                <h3 className="font-nav font-semibold text-lg mb-2">
                  Welcome to Research Assistant
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  I can help you explore futures research from your library using the Making Futures methodology.
                </p>
                <div className="text-left space-y-3 text-sm">
                  <p className="font-medium text-foreground">Try asking:</p>
                  <div className="space-y-2">
                    <button
                      onClick={() => setInput("What trends are emerging in sustainable technology?")}
                      className="w-full text-left px-4 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                    >
                      <p className="text-foreground">What trends are emerging in sustainable technology?</p>
                    </button>
                    <button
                      onClick={() => setInput("Show me signals related to AI and healthcare")}
                      className="w-full text-left px-4 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                    >
                      <p className="text-foreground">Show me signals related to AI and healthcare</p>
                    </button>
                    <button
                      onClick={() => setInput("What are the key drivers affecting social equity?")}
                      className="w-full text-left px-4 py-3 bg-muted hover:bg-muted/80 rounded-lg transition-colors"
                    >
                      <p className="text-foreground">What are the key drivers affecting social equity?</p>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[85%] rounded-xl px-4 py-3 ${
                    message.role === 'user'
                      ? 'bg-radar-primary text-white'
                      : 'bg-muted text-foreground'
                  }`}
                >
                  <div className="text-xs font-medium mb-1 opacity-80">
                    {message.role === 'user' ? 'You' : 'Assistant'}
                  </div>
                  <div className="text-sm whitespace-pre-wrap leading-relaxed">
                    {message.content}
                  </div>
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-muted rounded-xl px-4 py-3">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">Thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input */}
        <div className="border-t border-border px-6 py-4">
          <div className="flex gap-3">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder="Ask a question about your research..."
              className="flex-1 resize-none border border-border rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-radar-primary focus:border-transparent"
              rows={3}
              disabled={isLoading}
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-radar-primary text-white rounded-lg font-medium hover:bg-radar-primary/90 disabled:bg-muted disabled:text-muted-foreground disabled:cursor-not-allowed transition-colors self-end"
            >
              Send
            </button>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Press Enter to send • Shift+Enter for new line • Esc to close
          </p>
        </div>
      </div>
    </>
  )
}
