import { useEffect, useRef, useState } from 'react'

export default function ChatInput({ onSend, isLoading, onStop }) {
  const [input, setInput] = useState('')
  const textareaRef = useRef(null)

  // Auto-focus on mount
  useEffect(() => {
    textareaRef.current?.focus()
  }, [])

  // Auto-resize textarea
  useEffect(() => {
    const el = textareaRef.current
    if (!el) return
    el.style.height = 'auto'
    el.style.height = Math.min(el.scrollHeight, 200) + 'px'
  }, [input])

  const handleSubmit = () => {
    const trimmed = input.trim()
    if (!trimmed || isLoading) return
    onSend(trimmed)
    setInput('')
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto'
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSubmit()
    }
  }

  const canSend = input.trim().length > 0 && !isLoading

  return (
    <div className="px-4 pb-4 pt-2">
      <div className="max-w-3xl mx-auto">
        <div
          className="flex items-end gap-3 rounded-2xl border transition-all duration-200 px-4 py-3"
          style={{
            backgroundColor: 'var(--input-bg)',
            borderColor: input.length > 0 ? 'rgba(255,255,255,0.15)' : 'var(--border-color)',
            boxShadow: input.length > 0 ? '0 0 0 1px rgba(255,255,255,0.06)' : 'none',
          }}
        >
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            id="chat-input"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything..."
            rows={1}
            disabled={isLoading}
            className="flex-1 bg-transparent text-sm text-gray-100 placeholder-gray-600 outline-none resize-none leading-relaxed min-h-[24px] max-h-[200px] disabled:opacity-50"
            aria-label="Chat message input"
          />

          {/* Action buttons */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Attach file button (decorative) */}
            <button
              className="p-1.5 text-gray-600 hover:text-gray-400 transition-colors rounded-lg hover:bg-white/8"
              title="Attach file"
              aria-label="Attach file"
              type="button"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="m21.44 11.05-9.19 9.19a6 6 0 0 1-8.49-8.49l8.57-8.57A4 4 0 1 1 18 8.84l-8.59 8.57a2 2 0 0 1-2.83-2.83l8.49-8.48"/>
              </svg>
            </button>

            {/* Send / Stop button */}
            {isLoading ? (
              <button
                id="stop-btn"
                onClick={onStop}
                className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-gray-300 transition-all duration-150"
                title="Stop generating"
                aria-label="Stop generating"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="4" y="4" width="16" height="16" rx="2"/>
                </svg>
              </button>
            ) : (
              <button
                id="send-btn"
                onClick={handleSubmit}
                disabled={!canSend}
                className={`p-2 rounded-xl transition-all duration-200 ${
                  canSend
                    ? 'bg-white text-black hover:bg-gray-100 shadow-sm'
                    : 'bg-white/8 text-gray-600 cursor-not-allowed'
                }`}
                title="Send message"
                aria-label="Send message"
                type="button"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 2L11 13"/>
                  <path d="M22 2L15 22L11 13L2 9L22 2z"/>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Footer hint */}
        <p className="text-center text-xs text-gray-600 mt-2.5">
          Gemini can make mistakes. Consider checking important information.
        </p>
      </div>
    </div>
  )
}
