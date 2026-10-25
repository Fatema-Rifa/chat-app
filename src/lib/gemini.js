import { GoogleGenerativeAI } from '@google/generative-ai'

export function getApiKey() {
  const key = import.meta.env.VITE_GEMINI_API_KEY
  return key ? key.trim() : ''
}

export function createGeminiClient() {
  const apiKey = getApiKey()
  if (!apiKey || apiKey === 'your_gemini_api_key_here') {
    throw new Error('Gemini API key is not configured. Please add VITE_GEMINI_API_KEY to your .env file and restart the dev server.')
  }
  return new GoogleGenerativeAI(apiKey)
}

export function getGeminiModel(modelName = 'gemini-3.5-flash') {
  const genAI = createGeminiClient()
  return genAI.getGenerativeModel({
    model: modelName,
    systemInstruction: `You are a helpful, accurate, and thoughtful AI assistant. 
You provide clear, well-structured responses. When writing code, always use proper markdown code blocks with language syntax highlighting. 
Be concise but thorough. Format responses with markdown when it improves readability.`,
  })
}

/**
 * Creates a new Gemini chat session with history
 * @param {Array} history - Array of {role, parts} objects
 * @param {string} modelName - Model name to use
 */
export function createChatSession(history = [], modelName = 'gemini-3.5-flash') {
  const model = getGeminiModel(modelName)
  return model.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 8192,
      temperature: 0.7,
      topP: 0.95,
    },
  })
}
