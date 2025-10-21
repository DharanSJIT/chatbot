import { useState, useEffect, useRef } from 'react'
import { Copy, Check, Square, Download, Moon, Sun } from 'lucide-react'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [darkMode, setDarkMode] = useState(false)
  const messagesEndRef = useRef(null)
  const abortControllerRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Function to remove markdown formatting
  const cleanMarkdown = (text) => {
    return text
      .replace(/\*\*/g, '')
      .replace(/\*/g, '')
      .replace(/\_\_/g, '')
      .replace(/\_/g, '')
      .replace(/\#\#\#\s/g, '')
      .replace(/\#\#\s/g, '')
      .replace(/\#\s/g, '')
  }

  // Copy message to clipboard
  const copyToClipboard = async (text, index) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedIndex(index)
      setTimeout(() => setCopiedIndex(null), 2000)
    } catch (err) {
      console.error('Failed to copy:', err)
    }
  }

  // Format timestamp
  const getTimestamp = () => {
    const now = new Date()
    return now.toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    })
  }

  // Stop generation
  const stopGeneration = () => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      setLoading(false)
    }
  }

  // Export chat as text
  const exportChat = () => {
    if (messages.length === 0) {
      alert('No messages to export!')
      return
    }

    let chatText = 'AI Chatbot Conversation\n'
    chatText += '========================\n\n'
    
    messages.forEach(msg => {
      chatText += `[${msg.timestamp}] ${msg.role === 'user' ? 'You' : 'AI'}:\n`
      chatText += `${msg.content}\n\n`
    })

    const blob = new Blob([chatText], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `chat-${new Date().toISOString().slice(0, 10)}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    const timestamp = getTimestamp()
    const userMessage = { role: 'user', content: input, timestamp }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError('')

    // Create abort controller for this request
    abortControllerRef.current = new AbortController()

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [...messages, userMessage].map(m => ({ role: m.role, content: m.content })),
          max_tokens: 1000
        }),
        signal: abortControllerRef.current.signal
      })

      const data = await response.json()
      
      if (!response.ok) {
        throw new Error(data.error || `API request failed: ${response.status}`)
      }
      
      const rawContent = data.choices?.[0]?.message?.content || 'No response received'
      const cleanedContent = cleanMarkdown(rawContent)
      const botMessage = { role: 'assistant', content: cleanedContent, timestamp: getTimestamp() }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      if (error.name === 'AbortError') {
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: 'Response generation was stopped.',
          timestamp: getTimestamp()
        }])
      } else {
        console.error('Frontend error:', error)
        setError(error.message)
        setMessages(prev => [...prev, { 
          role: 'assistant', 
          content: `Sorry, I encountered an error: ${error.message}`,
          timestamp: getTimestamp()
        }])
      }
    }
    setLoading(false)
    abortControllerRef.current = null
  }

  const clearChat = () => {
    setMessages([])
    setError('')
  }

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      <div className={`${darkMode ? 'bg-green-700' : 'bg-green-600'} text-white p-4 flex justify-between items-center`}>
        <h1 className="text-xl font-bold">AI Chatbot</h1>
        <div className="flex gap-2">
          <button
            onClick={() => setDarkMode(!darkMode)}
            className={`px-3 py-1 ${darkMode ? 'bg-green-800 hover:bg-green-900' : 'bg-green-700 hover:bg-green-800'} rounded text-sm flex items-center gap-2`}
            title={darkMode ? 'Light Mode' : 'Dark Mode'}
          >
            {darkMode ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          <button
            onClick={exportChat}
            className={`px-3 py-1 ${darkMode ? 'bg-green-800 hover:bg-green-900' : 'bg-green-700 hover:bg-green-800'} rounded text-sm flex items-center gap-2`}
            title="Export Chat"
          >
            <Download size={16} />
            Export
          </button>
          <button
            onClick={clearChat}
            className={`px-3 py-1 ${darkMode ? 'bg-green-800 hover:bg-green-900' : 'bg-green-700 hover:bg-green-800'} rounded text-sm`}
          >
            Clear Chat
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2">
          <strong>Error: </strong>{error}
        </div>
      )}
      
      <div className="flex-1 p-4 overflow-y-auto pb-20">
        {messages.length === 0 && (
          <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-8`}>
            <p>Welcome! Start a conversation with Groq AI.</p>
            <p className="text-sm mt-2">Ask anything and get lightning-fast AI responses!</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg max-w-2xl relative group ${
              msg.role === 'user' 
                ? 'bg-green-500 text-white' 
                : darkMode 
                  ? 'bg-gray-800 border border-gray-700 text-gray-100' 
                  : 'bg-white border shadow-sm'
            }`}>
              <div className="whitespace-pre-line">
                {msg.content}
              </div>
              <div className={`text-xs mt-2 ${msg.role === 'user' ? 'text-green-100' : darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {msg.timestamp}
              </div>
              {msg.role === 'assistant' && (
                <button
                  onClick={() => copyToClipboard(msg.content, idx)}
                  className={`absolute top-2 right-2 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                    darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                  }`}
                  title="Copy message"
                >
                  {copiedIndex === idx ? (
                    <Check size={14} className="text-green-500" />
                  ) : (
                    <Copy size={14} className={darkMode ? 'text-gray-300' : 'text-gray-600'} />
                  )}
                </button>
              )}
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-left mb-4">
            <div className={`inline-block p-3 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
              <div className="flex items-center gap-2">
                <span>AI is thinking...</span>
                <button
                  onClick={stopGeneration}
                  className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'}`}
                  title="Stop generation"
                >
                  <Square size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className={`fixed bottom-0 left-0 right-0 p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border-t`}>
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask anything..."
            className={`flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 ${
              darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''
            }`}
            disabled={loading}
          />
          <button
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  )
}

export default App