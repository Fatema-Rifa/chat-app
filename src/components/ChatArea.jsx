import { useEffect, useRef, useState } from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'

function CopyButton({ text }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Copy failed:', e)
    }
  }

  return (
    <button
      onClick={handleCopy}
      className="flex items-center gap-1.5 text-xs text-gray-400 hover:text-gray-200 transition-colors px-2 py-1 rounded hover:bg-white/10"
      title="Copy code"
    >
      {copied ? (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
          Copy
        </>
      )}
    </button>
  )
}

function CodeBlock({ language, children }) {
  const code = String(children).replace(/\n$/, '')

  return (
    <div className="my-3 rounded-xl overflow-hidden border border-white/10">
      <div className="code-header">
        <span className="font-mono text-xs text-emerald-400">{language || 'code'}</span>
        <CopyButton text={code} />
      </div>
      <SyntaxHighlighter
        style={oneDark}
        language={language || 'text'}
        PreTag="div"
        customStyle={{
          margin: 0,
          borderRadius: 0,
          background: '#1a1a2e',
          padding: '1rem',
          fontSize: '0.8125rem',
          lineHeight: '1.6',
        }}
        codeTagProps={{
          style: { fontFamily: "'Fira Code', 'Cascadia Code', 'Consolas', monospace" }
        }}
      >
        {code}
      </SyntaxHighlighter>
    </div>
  )
}

function MarkdownContent({ content }) {
  return (
    <div className="prose-chat">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code({ node, inline, className, children, ...props }) {
            const match = /language-(\w+)/.exec(className || '')
            return !inline && match ? (
              <CodeBlock language={match[1]}>{children}</CodeBlock>
            ) : (
              <code className={className} {...props}>{children}</code>
            )
          },
          pre({ children }) {
            return <>{children}</>
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  )
}

function TypingIndicator() {
  return (
    <div className="flex items-center gap-1.5 py-2">
      <span className="typing-dot" />
      <span className="typing-dot" />
      <span className="typing-dot" />
    </div>
  )
}

function MessageActions({ content }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (e) {
      console.error('Copy failed:', e)
    }
  }

  return (
    <div className="flex items-center gap-1 mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
      <button
        onClick={handleCopy}
        className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-300 px-2 py-1 rounded-lg hover:bg-white/8 transition-all"
        title="Copy message"
      >
        {copied ? (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
        ) : (
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
          </svg>
        )}
        {copied ? 'Copied!' : 'Copy'}
      </button>
    </div>
  )
}

export default function ChatArea({ messages, isLoading, error }) {
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, isLoading])

  if (messages.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 pb-8">
        <div className="mb-8 relative">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 flex items-center justify-center shadow-2xl shadow-violet-500/30">
            <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2a10 10 0 0 1 10 10c0 5.52-4.48 10-10 10S2 17.52 2 12 6.48 2 12 2"/>
              <path d="M12 8v4l3 3"/>
            </svg>
          </div>
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-500 border-2 border-[#212121]" />
        </div>

        <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">
          How can I help you today?
        </h1>
        <p className="text-gray-500 text-sm text-center max-w-sm">
          I&apos;m powered by Gemini. Ask me anything — I can help with coding, writing, analysis, and more.
        </p>

        <div className="grid grid-cols-2 gap-3 mt-10 w-full max-w-xl">
          {[
            { icon: '💡', text: 'Explain a complex topic simply' },
            { icon: '🖥️', text: 'Write or debug code' },
            { icon: '✍️', text: 'Help me write an email' },
            { icon: '📊', text: 'Analyze and summarize data' },
          ].map((item) => (
            <div
              key={item.text}
              className="p-4 rounded-xl border border-white/8 bg-white/3 hover:bg-white/7 transition-all duration-200 cursor-pointer group"
            >
              <div className="text-xl mb-2">{item.icon}</div>
              <div className="text-sm text-gray-400 group-hover:text-gray-200 transition-colors leading-snug">{item.text}</div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-enter flex gap-4 group ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {/* AI Avatar */}
            {msg.role === 'assistant' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-violet-500/20 mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 8v4l3 3"/>
                </svg>
              </div>
            )}

            <div className={`flex flex-col max-w-[80%] ${msg.role === 'user' ? 'items-end' : 'items-start'}`}>
              {msg.role === 'user' ? (
                <div className="px-4 py-3 rounded-2xl rounded-tr-sm text-sm leading-relaxed"
                  style={{ backgroundColor: 'var(--user-bubble)', color: 'var(--text-primary)' }}
                >
                  <p className="whitespace-pre-wrap">{msg.content}</p>
                </div>
              ) : (
                <div className="text-[var(--text-primary)]">
                  <MarkdownContent content={msg.content} />
                  <MessageActions content={msg.content} />
                </div>
              )}
            </div>

            {/* User Avatar */}
            {msg.role === 'user' && (
              <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-orange-400 to-pink-500 flex items-center justify-center shadow-md mt-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
            )}
          </div>
        ))}

        {/* Typing indicator */}
        {isLoading && (
          <div className="message-enter flex gap-4 justify-start">
            <div className="flex-shrink-0 w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 via-indigo-500 to-blue-600 flex items-center justify-center shadow-md shadow-violet-500/20 mt-0.5">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <path d="M12 8v4l3 3"/>
              </svg>
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ backgroundColor: 'transparent' }}>
              <TypingIndicator />
            </div>
          </div>
        )}

        {/* Error */}
        {error && (
          <div className="flex justify-center">
            <div className="flex items-center gap-2 px-4 py-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm max-w-md">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="8" x2="12" y2="12"/>
                <line x1="12" y1="16" x2="12.01" y2="16"/>
              </svg>
              {error}
            </div>
          </div>
        )}

        <div ref={bottomRef} />
      </div>
    </div>
  )
}
