import { useCallback, useEffect, useRef, useState } from 'react'
import ChatArea from './components/ChatArea'
import ChatInput from './components/ChatInput'
import Sidebar from './components/Sidebar'
import { createChatSession } from './lib/gemini'
import {
  createConversation,
  createMessage,
  generateTitleFromMessage,
  loadConversations,
  messagesToGeminiHistory,
  saveConversations,
} from './lib/utils'
import './index.css'

export default function App() {
  const [conversations, setConversations] = useState(() => loadConversations())
  const [activeConversationId, setActiveConversationId] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)

  const chatSessionRef = useRef(null)
  const abortRef = useRef(false)

  // Persist conversations on change
  useEffect(() => {
    saveConversations(conversations)
  }, [conversations])

  // Get active conversation
  const activeConversation = conversations.find((c) => c.id === activeConversationId) || null

  // Create a new chat session based on current conversation history
  const initChatSession = useCallback((messages = []) => {
    const history = messagesToGeminiHistory(messages)
    chatSessionRef.current = createChatSession(history)
  }, [])

  // Handle conversation selection
  const handleSelectConversation = useCallback((id) => {
    const conv = conversations.find((c) => c.id === id)
    if (conv) {
      setActiveConversationId(id)
      initChatSession(conv.messages)
      setError(null)
    }
  }, [conversations, initChatSession])

  // Start a new chat
  const handleNewChat = useCallback(() => {
    setActiveConversationId(null)
    chatSessionRef.current = null
    setError(null)
  }, [])

  // Send a message
  const handleSend = useCallback(async (text) => {
    if (isLoading) return
    setError(null)
    setIsLoading(true)
    abortRef.current = false

    let conversationId = activeConversationId
    let isNewConversation = false

    // Create conversation if none active
    if (!conversationId) {
      const newConv = createConversation(text)
      setConversations((prev) => [newConv, ...prev])
      conversationId = newConv.id
      setActiveConversationId(conversationId)
      isNewConversation = true
    }

    // Add user message
    const userMsg = createMessage('user', text)
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, userMsg], updatedAt: Date.now() }
          : c
      )
    )

    // Init chat session for new conversations
    if (isNewConversation || !chatSessionRef.current) {
      const existingMessages = isNewConversation
        ? []
        : (conversations.find((c) => c.id === conversationId)?.messages || [])
      initChatSession(existingMessages)
    }

    // Add placeholder AI message
    const aiMsg = createMessage('assistant', '')
    setConversations((prev) =>
      prev.map((c) =>
        c.id === conversationId
          ? { ...c, messages: [...c.messages, aiMsg] }
          : c
      )
    )

    try {
      const result = await chatSessionRef.current.sendMessageStream(text)
      let fullText = ''

      for await (const chunk of result.stream) {
        if (abortRef.current) break
        const chunkText = chunk.text()
        fullText += chunkText

        // Stream update AI message
        setConversations((prev) =>
          prev.map((c) => {
            if (c.id !== conversationId) return c
            const msgs = [...c.messages]
            const lastIdx = msgs.length - 1
            msgs[lastIdx] = { ...msgs[lastIdx], content: fullText }
            return { ...c, messages: msgs, updatedAt: Date.now() }
          })
        )
      }

      // Update conversation title after first message
      if (isNewConversation) {
        const title = generateTitleFromMessage(text)
        setConversations((prev) =>
          prev.map((c) => (c.id === conversationId ? { ...c, title } : c))
        )
      }
    } catch (err) {
      console.error('Gemini error:', err)
      const errMsg = err?.message?.includes('API_KEY')
        ? 'Invalid or missing API key. Please set VITE_GEMINI_API_KEY in your .env file.'
        : err?.message || 'An error occurred. Please try again.'
      setError(errMsg)

      // Remove the empty AI placeholder on error
      setConversations((prev) =>
        prev.map((c) => {
          if (c.id !== conversationId) return c
          const msgs = c.messages.filter((m) => m.id !== aiMsg.id)
          return { ...c, messages: msgs }
        })
      )
    } finally {
      setIsLoading(false)
    }
  }, [activeConversationId, conversations, initChatSession, isLoading])

  // Stop generation
  const handleStop = useCallback(() => {
    abortRef.current = true
    setIsLoading(false)
  }, [])

  // Delete conversation
  const handleDeleteConversation = useCallback((id) => {
    setConversations((prev) => prev.filter((c) => c.id !== id))
    if (activeConversationId === id) {
      setActiveConversationId(null)
      chatSessionRef.current = null
    }
  }, [activeConversationId])

  // Rename conversation
  const handleRenameConversation = useCallback((id, newTitle) => {
    setConversations((prev) =>
      prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
    )
  }, [])

  const messages = activeConversation?.messages || []

  return (
    <div className="flex h-screen overflow-hidden" style={{ backgroundColor: 'var(--main-bg)' }}>
      {/* Sidebar */}
      <Sidebar
        conversations={conversations}
        activeConversationId={activeConversationId}
        onNewChat={handleNewChat}
        onSelectConversation={handleSelectConversation}
        onDeleteConversation={handleDeleteConversation}
        onRenameConversation={handleRenameConversation}
        isOpen={sidebarOpen}
        onToggle={() => setSidebarOpen((v) => !v)}
      />

      {/* Main content */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
        {/* Topbar */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-white/5 flex-shrink-0">
          {/* Sidebar toggle (when closed) */}
          {!sidebarOpen && (
            <button
              id="open-sidebar-btn"
              onClick={() => setSidebarOpen(true)}
              className="p-2 rounded-lg text-gray-500 hover:text-white hover:bg-white/10 transition-colors"
              title="Open sidebar"
              aria-label="Open sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}

          {/* Model badge */}
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-gray-200">
              {activeConversation?.title || 'Rifa Chat'}
            </span>
            {activeConversation && (
              <span className="text-xs text-gray-600 hidden sm:block">
                {activeConversation.messages.length} messages
              </span>
            )}
          </div>

          <div className="ml-auto">
            <div className="flex items-center gap-1.5 text-xs text-gray-600 bg-white/5 border border-white/8 rounded-full px-3 py-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              gemini-3.5-flash
            </div>
          </div>
        </header>

        {/* Chat area */}
        <ChatArea
          messages={messages}
          isLoading={isLoading}
          error={error}
        />

        {/* Input */}
        <ChatInput
          onSend={handleSend}
          isLoading={isLoading}
          onStop={handleStop}
        />
      </div>
    </div>
  )
}
