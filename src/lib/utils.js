/**
 * Generates a concise title from the first user message
 */
export function generateTitleFromMessage(message) {
  const cleaned = message.trim().replace(/\n+/g, ' ')
  if (cleaned.length <= 40) return cleaned
  return cleaned.substring(0, 40).trim() + '…'
}

/**
 * Creates a new conversation object
 */
export function createConversation(firstMessage = '') {
  return {
    id: `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    title: firstMessage ? generateTitleFromMessage(firstMessage) : 'New Chat',
    messages: [],
    createdAt: Date.now(),
    updatedAt: Date.now(),
  }
}

/**
 * Creates a message object
 */
export function createMessage(role, content) {
  return {
    id: `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    role, // 'user' | 'assistant'
    content,
    timestamp: Date.now(),
  }
}

/**
 * Groups conversations by time period
 */
export function groupConversationsByDate(conversations) {
  const now = Date.now()
  const oneDay = 86400000
  const oneWeek = oneDay * 7
  const oneMonth = oneDay * 30

  const groups = {
    Today: [],
    Yesterday: [],
    'Previous 7 Days': [],
    'Previous 30 Days': [],
    Older: [],
  }

  conversations.forEach((conv) => {
    const age = now - conv.updatedAt
    if (age < oneDay) groups.Today.push(conv)
    else if (age < oneDay * 2) groups.Yesterday.push(conv)
    else if (age < oneWeek) groups['Previous 7 Days'].push(conv)
    else if (age < oneMonth) groups['Previous 30 Days'].push(conv)
    else groups.Older.push(conv)
  })

  return Object.entries(groups).filter(([, items]) => items.length > 0)
}

/**
 * Convert app messages to Gemini history format
 */
export function messagesToGeminiHistory(messages) {
  return messages.map((msg) => ({
    role: msg.role === 'user' ? 'user' : 'model',
    parts: [{ text: msg.content }],
  }))
}

/**
 * Save conversations to localStorage
 */
export function saveConversations(conversations) {
  try {
    localStorage.setItem('gemini_conversations', JSON.stringify(conversations))
  } catch (e) {
    console.warn('Could not save conversations:', e)
  }
}

/**
 * Load conversations from localStorage
 */
export function loadConversations() {
  try {
    const stored = localStorage.getItem('gemini_conversations')
    return stored ? JSON.parse(stored) : []
  } catch (e) {
    return []
  }
}
