import { useEffect, useRef, useState } from 'react'
import { groupConversationsByDate } from '../lib/utils'

export default function Sidebar({
  conversations,
  activeConversationId,
  onNewChat,
  onSelectConversation,
  onDeleteConversation,
  onRenameConversation,
  isOpen,
  onToggle,
}) {
  const [hoveredId, setHoveredId] = useState(null)
  const [contextMenu, setContextMenu] = useState(null)
  const [editingId, setEditingId] = useState(null)
  const [editTitle, setEditTitle] = useState('')
  const contextMenuRef = useRef(null)

  const grouped = groupConversationsByDate([...conversations].sort((a, b) => b.updatedAt - a.updatedAt))

  // Close context menu on outside click
  useEffect(() => {
    const handleClick = (e) => {
      if (contextMenuRef.current && !contextMenuRef.current.contains(e.target)) {
        setContextMenu(null)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  const handleContextMenu = (e, conv) => {
    e.preventDefault()
    setContextMenu({ x: e.clientX, y: e.clientY, conv })
  }

  const startEdit = (conv) => {
    setEditingId(conv.id)
    setEditTitle(conv.title)
    setContextMenu(null)
  }

  const submitEdit = (id) => {
    if (editTitle.trim()) {
      onRenameConversation(id, editTitle.trim())
    }
    setEditingId(null)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 md:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed md:relative z-30 flex flex-col h-full
          sidebar-transition overflow-hidden
          ${isOpen ? 'w-64' : 'w-0 md:w-0'}
        `}
        style={{ backgroundColor: 'var(--sidebar-bg)' }}
      >
        <div className="flex flex-col h-full w-64">
          {/* Header */}
          <div className="flex items-center justify-between p-3 mt-1">
            <button
              onClick={onToggle}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Close sidebar"
              aria-label="Toggle sidebar"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>

            <button
              id="new-chat-btn"
              onClick={onNewChat}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
              title="New chat"
              aria-label="New chat"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
            </button>
          </div>

          {/* New Chat Button */}
          <div className="px-2 mb-2">
            <button
              onClick={onNewChat}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-300 hover:bg-white/10 hover:text-white transition-all duration-150"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
              New chat
            </button>
          </div>

          {/* Conversation List */}
          <div className="flex-1 overflow-y-auto px-2 pb-4">
            {grouped.length === 0 ? (
              <div className="text-center text-xs text-gray-600 py-8 px-4">
                No conversations yet. Start chatting!
              </div>
            ) : (
              grouped.map(([label, convs]) => (
                <div key={label} className="mb-4">
                  <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider px-2 py-1.5 mb-1">
                    {label}
                  </div>
                  {convs.map((conv) => (
                    <div
                      key={conv.id}
                      className="relative group"
                      onMouseEnter={() => setHoveredId(conv.id)}
                      onMouseLeave={() => setHoveredId(null)}
                      onContextMenu={(e) => handleContextMenu(e, conv)}
                    >
                      {editingId === conv.id ? (
                        <input
                          className="w-full px-3 py-2 text-sm bg-white/10 rounded-lg border border-white/20 text-white outline-none"
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          onBlur={() => submitEdit(conv.id)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') submitEdit(conv.id)
                            if (e.key === 'Escape') setEditingId(null)
                          }}
                          autoFocus
                        />
                      ) : (
                        <button
                          id={`conv-${conv.id}`}
                          onClick={() => onSelectConversation(conv.id)}
                          className={`
                            w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150
                            flex items-center gap-2 overflow-hidden
                            ${activeConversationId === conv.id
                              ? 'bg-white/15 text-white'
                              : 'text-gray-400 hover:bg-white/8 hover:text-gray-200'
                            }
                          `}
                        >
                          <span className="flex-1 truncate leading-snug">{conv.title}</span>

                          {/* Action buttons on hover */}
                          {hoveredId === conv.id && (
                            <div className="flex items-center gap-0.5 flex-shrink-0">
                              <button
                                onClick={(e) => { e.stopPropagation(); startEdit(conv) }}
                                className="p-1 rounded hover:bg-white/15 text-gray-500 hover:text-gray-300 transition-colors"
                                title="Rename"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button
                                onClick={(e) => { e.stopPropagation(); onDeleteConversation(conv.id) }}
                                className="p-1 rounded hover:bg-red-500/20 text-gray-500 hover:text-red-400 transition-colors"
                                title="Delete"
                              >
                                <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                  <polyline points="3 6 5 6 21 6" />
                                  <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                  <path d="M10 11v6M14 11v6" />
                                  <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-white/5 p-3">
            <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-white/8 transition-colors cursor-pointer">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                G
              </div>
              <div className="min-w-0">
                <div className="text-sm font-medium text-gray-200 truncate">Rifa Chat</div>
                <div className="text-xs text-gray-500 truncate">gemini-3.5-flash</div>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Context Menu */}
      {contextMenu && (
        <div
          ref={contextMenuRef}
          className="fixed z-50 bg-[#2a2a2a] border border-white/10 rounded-xl shadow-2xl py-1 min-w-[160px] overflow-hidden"
          style={{ left: contextMenu.x, top: contextMenu.y }}
        >
          <button
            className="w-full text-left px-4 py-2.5 text-sm text-gray-300 hover:bg-white/10 transition-colors flex items-center gap-2.5"
            onClick={() => startEdit(contextMenu.conv)}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
            </svg>
            Rename
          </button>
          <div className="h-px bg-white/8 my-1" />
          <button
            className="w-full text-left px-4 py-2.5 text-sm text-red-400 hover:bg-red-500/15 transition-colors flex items-center gap-2.5"
            onClick={() => {
              onDeleteConversation(contextMenu.conv.id)
              setContextMenu(null)
            }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="3 6 5 6 21 6" />
              <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
            </svg>
            Delete
          </button>
        </div>
      )}
    </>
  )
}
