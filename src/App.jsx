import { useState, useEffect, useRef } from 'react'
import { Copy, Check, Square, Download, Moon, Sun, Search, X, Menu, Trash2, LogOut } from 'lucide-react'
import Auth from './components/Auth'

function App() {
  const [user, setUser] = useState(null)
  const [isLoading, setIsLoading] = useState(true)
  const [showAuthPrompt, setShowAuthPrompt] = useState(false)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [copiedIndex, setCopiedIndex] = useState(null)
  const [darkMode, setDarkMode] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchActive, setSearchActive] = useState(false)
  const [highlightedMessages, setHighlightedMessages] = useState(new Set())
  const [menuOpen, setMenuOpen] = useState(false)
  const [streamingMessage, setStreamingMessage] = useState('')
  const [isStreaming, setIsStreaming] = useState(false)
  const messagesEndRef = useRef(null)
  const abortControllerRef = useRef(null)
  const searchInputRef = useRef(null)
  const menuRef = useRef(null)

  // Check for existing user session
  useEffect(() => {
    const checkAuth = async () => {
      const savedUser = localStorage.getItem('user')
      if (savedUser) {
        try {
          const userData = JSON.parse(savedUser)
          setUser(userData)
          await loadUserMessages(userData.userId)
        } catch (error) {
          console.error('Invalid user data, clearing session')
          localStorage.removeItem('user')
        }
      }
      setIsLoading(false)
    }
    checkAuth()
  }, [])

  // Load user messages from backend
  const loadUserMessages = async (userId) => {
    try {
      const response = await fetch(`http://localhost:3001/api/messages/${userId}`)
      if (response.ok) {
        const messages = await response.json()
        setMessages(Array.isArray(messages) ? messages : [])
      } else {
        setMessages([])
      }
    } catch (error) {
      console.error('Failed to load messages:', error)
      setMessages([])
    }
  }

  // Save message to backend
  const saveMessage = async (message) => {
    if (user) {
      try {
        await fetch('http://localhost:3001/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ ...message, userId: user.userId })
        })
      } catch (error) {
        console.error('Failed to save message:', error)
      }
    }
  }

  // Handle user login
  const handleLogin = (userData) => {
    setUser(userData)
    loadUserMessages(userData.userId)
  }

  // Handle user logout
  const handleLogout = () => {
    localStorage.removeItem('user')
    localStorage.removeItem('guestMode')
    setUser(null)
    setMessages([])
  }

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, streamingMessage])

  useEffect(() => {
    if (searchActive && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchActive])

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false)
      }
    }

    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('touchstart', handleClickOutside)
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
      document.removeEventListener('touchstart', handleClickOutside)
    }
  }, [menuOpen])

  // Search messages
  useEffect(() => {
    if (searchQuery.trim()) {
      const highlighted = new Set()
      messages.forEach((msg, idx) => {
        if (msg.content.toLowerCase().includes(searchQuery.toLowerCase())) {
          highlighted.add(idx)
        }
      })
      setHighlightedMessages(highlighted)
    } else {
      setHighlightedMessages(new Set())
    }
  }, [searchQuery, messages])

  // Calculate character and approximate token count
  const getInputStats = () => {
    const charCount = input.length
    const tokenCount = Math.ceil(input.split(/\s+/).filter(w => w.length > 0).length * 1.3)
    return { charCount, tokenCount }
  }

  const { charCount, tokenCount } = getInputStats()

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
      
      // If streaming, save current message
      if (isStreaming && streamingMessage) {
        const botMessage = { role: 'assistant', content: streamingMessage, timestamp: getTimestamp() }
        setMessages(prev => [...prev, botMessage])
      }
      
      setIsStreaming(false)
      setStreamingMessage('')
    }
  }

  // Toggle search
  const toggleSearch = () => {
    setSearchActive(!searchActive)
    setMenuOpen(false)
    if (searchActive) {
      setSearchQuery('')
      setHighlightedMessages(new Set())
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
    setMenuOpen(false)
  }

  const sendMessage = async () => {
    if (!input.trim()) return

    // Show auth prompt if user not logged in and hasn't chosen to continue
    if (!user && !localStorage.getItem('guestMode')) {
      setShowAuthPrompt(true)
      return
    }

    const timestamp = getTimestamp()
    const userMessage = { role: 'user', content: input, timestamp }
    setMessages(prev => [...prev, userMessage])
    
    // Only save if user is logged in
    if (user) {
      await saveMessage(userMessage)
    }
    
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
      
      // Simulate streaming by typing character by character
      setIsStreaming(true)
      let currentText = ''
      for (let i = 0; i < cleanedContent.length; i++) {
        if (abortControllerRef.current?.signal.aborted) break
        
        currentText += cleanedContent[i]
        setStreamingMessage(currentText)
        
        // Scroll to bottom during typing
        scrollToBottom()
        
        // Add delay between characters (adjust speed here)
        await new Promise(resolve => setTimeout(resolve, 0))
      }
      
      // Add final message to chat
      setIsStreaming(false)
      setStreamingMessage('')
      setLoading(false)
      const botMessage = { role: 'assistant', content: cleanedContent, timestamp: getTimestamp() }
      setMessages(prev => [...prev, botMessage])
      
      // Only save if user is logged in
      if (user) {
        await saveMessage(botMessage)
      }
    } catch (error) {
      if (error.name === 'AbortError') {
        const stoppedMessage = { 
          role: 'assistant', 
          content: 'Response generation was stopped.',
          timestamp: getTimestamp()
        }
        setMessages(prev => [...prev, stoppedMessage])
        
        // Only save if user is logged in
        if (user) {
          await saveMessage(stoppedMessage)
        }
      } else {
        console.error('Frontend error:', error)
        setError(error.message)
        const errorMessage = { 
          role: 'assistant', 
          content: `Sorry, I encountered an error: ${error.message}`,
          timestamp: getTimestamp()
        }
        setMessages(prev => [...prev, errorMessage])
        
        // Only save if user is logged in
        if (user) {
          await saveMessage(errorMessage)
        }
      }
    }
    setLoading(false)
    setIsStreaming(false)
    setStreamingMessage('')
    abortControllerRef.current = null
  }

  const clearChat = () => {
    setMessages([])
    setError('')
    setSearchQuery('')
    setHighlightedMessages(new Set())
    setMenuOpen(false)
  }

  // Highlight text in search results
  const highlightText = (text, query) => {
    if (!query.trim()) return text
    
    const parts = text.split(new RegExp(`(${query})`, 'gi'))
    return parts.map((part, i) => 
      part.toLowerCase() === query.toLowerCase() 
        ? <mark key={i} className="bg-yellow-300 dark:bg-yellow-600">{part}</mark>
        : part
    )
  }

  // Show loading spinner while checking auth
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  // Show auth prompt modal
  if (showAuthPrompt) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-6 max-w-md mx-4">
          <h3 className="text-lg font-semibold mb-4">Save your chat history</h3>
          <p className="text-gray-600 mb-6">Sign up or log in to save and continue your conversations across devices.</p>
          <div className="flex gap-3">
            <button
              onClick={() => {
                localStorage.setItem('guestMode', 'true')
                setShowAuthPrompt(false)
                // Retry sending the message
                setTimeout(() => sendMessage(), 100)
              }}
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              Continue without saving
            </button>
            <button
              onClick={() => {
                setShowAuthPrompt(false)
                setUser('temp')
              }}
              className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
              Sign up
            </button>
          </div>
        </div>
      </div>
    )
  }

  // Show full auth component
  if (user === 'temp') {
    return <Auth onLogin={(userData) => {
      handleLogin(userData)
    }} />
  }

  return (
    <div className={`min-h-screen flex flex-col ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
      {/* Header */}
      <div className={`${darkMode ? 'bg-green-700' : 'bg-green-600'} text-white p-3 sm:p-4`}>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg sm:text-xl font-bold">AI Chatbot</h1>
            {user && <p className="text-sm opacity-75">Welcome, {user.username}</p>}
          </div>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex gap-2">
            <button
              onClick={toggleSearch}
              className={`px-3 py-1 ${darkMode ? 'bg-green-800 hover:bg-green-900' : 'bg-green-700 hover:bg-green-800'} rounded text-sm flex items-center gap-2 transition-colors ${searchActive ? 'ring-2 ring-white' : ''}`}
              title="Search Chat"
            >
              <Search size={16} />
            </button>
            <button
              onClick={() => setDarkMode(!darkMode)}
              className={`px-3 py-1 ${darkMode ? 'bg-green-800 hover:bg-green-900' : 'bg-green-700 hover:bg-green-800'} rounded text-sm flex items-center gap-2 transition-colors`}
              title={darkMode ? 'Light Mode' : 'Dark Mode'}
            >
              {darkMode ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button
              onClick={exportChat}
              className={`px-3 py-1 ${darkMode ? 'bg-green-800 hover:bg-green-900' : 'bg-green-700 hover:bg-green-800'} rounded text-sm flex items-center gap-2 transition-colors`}
              title="Export Chat"
            >
              <Download size={16} />
              <span className="hidden lg:inline">Export</span>
            </button>
            <button
              onClick={clearChat}
              className={`px-3 py-1 ${darkMode ? 'bg-green-800 hover:bg-green-900' : 'bg-green-700 hover:bg-green-800'} rounded text-sm transition-colors`}
            >
              Clear Chat
            </button>
            {user ? (
              <button
                onClick={handleLogout}
                className={`px-3 py-1 ${darkMode ? 'bg-green-800 hover:bg-green-900' : 'bg-green-700 hover:bg-green-800'} rounded text-sm flex items-center gap-2 transition-colors`}
                title="Logout"
              >
                <LogOut size={16} />
              </button>
            ) : (
              <button
                onClick={() => setShowAuthPrompt(true)}
                className={`px-3 py-1 ${darkMode ? 'bg-green-800 hover:bg-green-900' : 'bg-green-700 hover:bg-green-800'} rounded text-sm transition-colors`}
              >
                Sign In
              </button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden relative" ref={menuRef}>
            <button
              onClick={() => setMenuOpen(!menuOpen)}
              className={`p-2 ${darkMode ? 'bg-green-800 hover:bg-green-900' : 'bg-green-700 hover:bg-green-800'} rounded transition-all duration-200`}
            >
              {menuOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            
            {/* Mobile Dropdown Menu */}
            {menuOpen && (
              <div className={`absolute right-0 mt-2 w-48 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-lg z-50 overflow-hidden border ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>
                <button
                  onClick={toggleSearch}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-800'} transition-colors`}
                >
                  <Search size={18} />
                  <span>Search</span>
                </button>
                <button
                  onClick={() => {
                    setDarkMode(!darkMode)
                    setMenuOpen(false)
                  }}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-800'} transition-colors`}
                >
                  {darkMode ? <Sun size={18} /> : <Moon size={18} />}
                  <span>{darkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </button>
                <button
                  onClick={exportChat}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-800'} transition-colors`}
                >
                  <Download size={18} />
                  <span>Export Chat</span>
                </button>
                <button
                  onClick={clearChat}
                  className={`w-full px-4 py-3 text-left flex items-center gap-3 ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-800'} transition-colors border-t ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}
                >
                  <Trash2 size={18} />
                  <span>Clear Chat</span>
                </button>
                {user ? (
                  <button
                    onClick={handleLogout}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-800'} transition-colors`}
                  >
                    <LogOut size={18} />
                    <span>Logout</span>
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setShowAuthPrompt(true)
                      setMenuOpen(false)
                    }}
                    className={`w-full px-4 py-3 text-left flex items-center gap-3 ${darkMode ? 'hover:bg-gray-700 text-white' : 'hover:bg-gray-100 text-gray-800'} transition-colors`}
                  >
                    <LogOut size={18} />
                    <span>Sign In</span>
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
        
        {/* Search Bar */}
        {searchActive && (
          <div className="mt-3 flex items-center gap-2">
            <div className="flex-1 relative">
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search messages..."
                className={`w-full p-2 pr-8 rounded text-gray-900 focus:outline-none focus:ring-2 focus:ring-white text-sm sm:text-base`}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                >
                  <X size={16} />
                </button>
              )}
            </div>
            <span className="text-xs sm:text-sm whitespace-nowrap">
              {highlightedMessages.size} {highlightedMessages.size === 1 ? 'result' : 'results'}
            </span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-3 py-2 sm:px-4 text-sm">
          <strong>Error: </strong>{error}
        </div>
      )}
      
      {/* Messages Container */}
      <div className="flex-1 p-3 sm:p-4 overflow-y-auto pb-32 sm:pb-36">
        {messages.length === 0 && (
          <div className={`text-center ${darkMode ? 'text-gray-400' : 'text-gray-500'} mt-8 px-4`}>
            <p className="text-base sm:text-lg">Welcome! Start a conversation with AI.</p>
            <p className="text-xs sm:text-sm mt-2">Ask anything and get lightning-fast AI responses!</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div 
            key={idx} 
            className={`mb-3 sm:mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'} ${
              highlightedMessages.has(idx) ? 'animate-pulse' : ''
            }`}
          >
            <div className={`inline-block p-2.5 sm:p-3 rounded-lg max-w-[85%] sm:max-w-2xl relative group ${
              msg.role === 'user' 
                ? darkMode 
                  ? 'bg-gray-700 text-white border border-gray-600' 
                  : 'bg-gray-100 text-gray-900 border border-gray-300'
                : darkMode 
                  ? 'bg-gray-800 border border-gray-700 text-gray-100' 
                  : 'bg-white border shadow-sm'
            } ${highlightedMessages.has(idx) ? 'ring-2 ring-yellow-400' : ''}`}>
              <div className="whitespace-pre-line text-sm sm:text-base break-words">
                {highlightedMessages.has(idx) && searchQuery 
                  ? highlightText(msg.content, searchQuery)
                  : msg.content
                }
              </div>
              <div className={`text-xs mt-1.5 sm:mt-2 ${msg.role === 'user' ? darkMode ? 'text-gray-400' : 'text-gray-500' : darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
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
        
        {/* Streaming Message */}
        {isStreaming && streamingMessage && (
          <div className="text-left mb-3 sm:mb-4">
            <div className={`inline-block p-2.5 sm:p-3 rounded-lg max-w-[85%] sm:max-w-2xl relative group ${
              darkMode ? 'bg-gray-800 border border-gray-700 text-gray-100' : 'bg-white border shadow-sm'
            }`}>
              <div className="whitespace-pre-line text-sm sm:text-base break-words">
                {streamingMessage}<span className="animate-pulse">|</span>
              </div>
              <div className={`text-xs mt-1.5 sm:mt-2 ${darkMode ? 'text-gray-500' : 'text-gray-400'}`}>
                {getTimestamp()}
              </div>
              <button
                onClick={stopGeneration}
                className={`absolute top-2 right-2 p-1.5 rounded opacity-0 group-hover:opacity-100 transition-opacity ${
                  darkMode ? 'bg-gray-700 hover:bg-gray-600' : 'bg-gray-100 hover:bg-gray-200'
                }`}
                title="Stop generation"
              >
                <Square size={14} className="fill-current" />
              </button>
            </div>
          </div>
        )}
        
        {/* Typing Indicator */}
        {loading && !isStreaming && (
          <div className="text-left mb-3 sm:mb-4">
            <div className={`inline-block p-2.5 sm:p-3 rounded-lg ${darkMode ? 'bg-gray-800 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
              <div className="flex items-center gap-2">
                <span className="flex items-center gap-1 text-sm sm:text-base">
                  AI is typing
                  <span className="flex gap-0.5">
                    <span className="animate-bounce" style={{ animationDelay: '0ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '150ms' }}>.</span>
                    <span className="animate-bounce" style={{ animationDelay: '300ms' }}>.</span>
                  </span>
                </span>
                <button
                  onClick={stopGeneration}
                  className={`p-1 rounded ${darkMode ? 'hover:bg-gray-700' : 'hover:bg-gray-300'} transition-colors`}
                  title="Stop generation"
                >
                  <Square size={14} className="fill-current" />
                </button>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className={`fixed bottom-0 left-0 right-0 p-3 sm:p-4 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white'} border-t`}>
        <div className="flex flex-col gap-1.5 sm:gap-2">
          
          {/* Input and Send Button */}
          <div className="flex gap-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault()
                  sendMessage()
                }
              }}
              placeholder="Ask anything..."
              rows="1"
              className={`flex-1 p-2.5 sm:p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 resize-none text-sm sm:text-base ${
                darkMode ? 'bg-gray-700 border-gray-600 text-white placeholder-gray-400' : ''
              }`}
              style={{ minHeight: '44px', maxHeight: '120px' }}
              disabled={loading}
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="px-4 sm:px-6 py-2.5 sm:py-3 bg-green-500 text-white rounded-lg hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors text-sm sm:text-base font-medium"
            >
              Send
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App