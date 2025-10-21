import { useState, useEffect, useRef } from 'react'

function App() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim()) return

    const userMessage = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)
    setError('')

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer YOUR_API_KEY_HERE'
        },
        body: JSON.stringify({
          model: 'llama-3.1-8b-instant',
          messages: [...messages, userMessage],
          max_tokens: 1000
        })
      })

      const data = await response.json()
      console.log('API Response:', data)
      
      if (!response.ok) {
        throw new Error(data.error || `API request failed: ${response.status}`)
      }
      
      const content = data.choices?.[0]?.message?.content || 'No response received'
      const botMessage = { role: 'assistant', content }
      setMessages(prev => [...prev, botMessage])
    } catch (error) {
      console.error('Frontend error:', error)
      setError(error.message)
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: `Sorry, I encountered an error: ${error.message}` 
      }])
    }
    setLoading(false)
  }

  const clearChat = () => {
    setMessages([])
    setError('')
  }



  return (
    <div className="min-h-screen bg-gray-100 flex flex-col">
      <div className="bg-green-600 text-white p-4 flex justify-between items-center">
        <h1 className="text-xl font-bold">AI Chatbot</h1>
        <button
          onClick={clearChat}
          className="px-3 py-1 bg-green-700 hover:bg-green-800 rounded text-sm"
        >
          Clear Chat
        </button>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-2">
          <strong>Error: </strong>{error}
        </div>
      )}
      
      <div className="flex-1 p-4 overflow-y-auto pb-20">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            <p>Welcome! Start a conversation with Groq AI.</p>
            <p className="text-sm mt-2">Ask anything and get lightning-fast AI responses!</p>
          </div>
        )}
        
        {messages.map((msg, idx) => (
          <div key={idx} className={`mb-4 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
            <div className={`inline-block p-3 rounded-lg max-w-2xl ${
              msg.role === 'user' 
                ? 'bg-green-500 text-white' 
                : 'bg-white border shadow-sm'
            }`}>
              <div className="whitespace-pre-line">
                {msg.content}
              </div>
            </div>
          </div>
        ))}
        {loading && (
          <div className="text-left mb-4">
            <div className="inline-block p-3 rounded-lg bg-gray-200 text-gray-600">
              AI is thinking...
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t">
        <div className="flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
            placeholder="Ask anything..."
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
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