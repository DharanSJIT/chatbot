import express from 'express'
import cors from 'cors'
import dotenv from 'dotenv'

dotenv.config()

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

app.post('/api/chat', async (req, res) => {
  try {
    const { messages } = req.body
    const lastMessage = messages[messages.length - 1]?.content || ''
    
    // Mock Claude responses
    const responses = [
      "Hello! I'm Claude, an AI assistant. How can I help you today?",
      "That's an interesting question. Let me think about that...",
      "I understand what you're asking. Here's my perspective on that topic.",
      "Thanks for sharing that with me. I'd be happy to help you explore this further.",
      "That's a great point. Let me provide some additional context."
    ]
    
    let response
    if (lastMessage.toLowerCase().includes('hello') || lastMessage.toLowerCase().includes('hi')) {
      response = "Hello! I'm Claude, your AI assistant. How can I help you today?"
    } else if (lastMessage.toLowerCase().includes('how are you')) {
      response = "I'm doing well, thank you for asking! I'm here and ready to help with any questions or tasks you have."
    } else {
      response = responses[Math.floor(Math.random() * responses.length)]
    }
    
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    res.json({
      choices: [{
        message: {
          content: response
        }
      }]
    })
  } catch (error) {
    res.status(500).json({ error: 'Server error' })
  }
})

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})