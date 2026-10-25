# 💬 Rifa Chat — AI Assistant

A modern, responsive ChatGPT-style web interface powered by Google Gemini AI, built with **React**, **Tailwind CSS**, and **Vite**.

![Rifa Chat Preview](https://img.shields.io/badge/Powered%20by-Google%20Gemini-4285F4?style=for-the-badge&logo=google)
![React](https://img.shields.io/badge/React-19-61DAFB?style=for-the-badge&logo=react)
![TailwindCSS](https://img.shields.io/badge/Tailwind_CSS-v4-38B2AC?style=for-the-badge&logo=tailwind-css)
![Vite](https://img.shields.io/badge/Vite-8-646CFF?style=for-the-badge&logo=vite)

---

## ✨ Features

- ⚡ **Real-Time Streaming**: Streamed responses directly from Gemini AI (`gemini-3.5-flash`).
- 🎨 **ChatGPT-Inspired UI**: Sleek dark theme, clean typography with Google Inter font, smooth micro-interactions.
- 📝 **Rich Markdown & Code Highlighting**: Full Markdown support (tables, lists, blockquotes) and syntax-highlighted code blocks with one-click copy.
- 🗂️ **Multi-Chat Management**: Create new chats, rename conversation titles, delete chats, and switch between threads seamlessly.
- 💾 **Persistent Chat History**: Automatically saves conversations to `localStorage` organized by date (Today, Yesterday, Previous 7 Days, etc.).
- 📱 **Fully Responsive**: Mobile-friendly slide-over sidebar and desktop collapsible layout.
- ⏹️ **Stop Generation**: Cancel streaming in-flight with a single click.

---

## 🚀 Getting Started

### 1. Clone the repository
```bash
git clone https://github.com/Fatema-Rifa/chat-app.git
cd chat-app
```

### 2. Install dependencies
```bash
npm install
```

### 3. Configure your API key
Create a `.env` file in the project root (you can copy `.env.example`):
```bash
cp .env.example .env
```

Add your Google Gemini API key:
```env
VITE_GEMINI_API_KEY=your_gemini_api_key_here
```
> 💡 Get a free API key at [Google AI Studio](https://aistudio.google.com/).

### 4. Run the development server
```bash
npm run dev
```

Open your browser and navigate to `http://localhost:5173` (or the port shown in your terminal).

---

## 🛠️ Tech Stack

- **Frontend**: React 19, Vite 8
- **Styling**: Tailwind CSS v4, Vanilla CSS variables
- **AI SDK**: `@google/generative-ai`
- **Markdown & Code**: `react-markdown`, `remark-gfm`, `react-syntax-highlighter`