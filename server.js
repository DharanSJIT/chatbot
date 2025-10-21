import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3002;
// Groq API - fast real-time responses

app.use(cors({
  origin: ['http://localhost:5173', 'http://localhost:3000'],
  credentials: true
}));

app.use(express.json());

// Request logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

app.post('/api/chat', async (req, res) => {
  try {
    const { messages, model = 'claude-3-5-sonnet-20241022', max_tokens = 1000 } = req.body;

    // Validate required fields
    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({ error: 'Messages array is required' });
    }



    if (!process.env.GROQ_API_KEY) {
      return res.status(500).json({ error: 'Groq API key not configured' });
    }

    console.log('Sending to Groq API:', {
      model,
      messageCount: messages.length,
      lastMessage: messages[messages.length - 1]?.content
    });

    const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: 'llama-3.1-8b-instant',
        messages: messages,
        temperature: 0.7,
        max_tokens: max_tokens,
        stream: false
      })
    });

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Groq API request failed with status ${response.status}: ${errorData}`);
    }

    const data = await response.json();
    console.log('Groq API response received');

    let content = data.choices?.[0]?.message?.content || 'No response received';
    
    // Clean up the response: remove markdown formatting and structure it
    content = content
      .replace(/\*\*(.*?)\*\*/g, '$1')  // Remove **bold** formatting
      .replace(/\*(.*?)\*/g, '$1')     // Remove *italic* formatting
      .replace(/#{1,6}\s/g, '')        // Remove markdown headers
      .replace(/```[\s\S]*?```/g, '')  // Remove code blocks
      .replace(/`([^`]+)`/g, '$1')     // Remove inline code formatting
      .replace(/\n\s*\n/g, '\n')       // Remove extra line breaks
      .trim();

    res.json({
      id: data.id || `groq-${Date.now()}`,
      choices: [{
        message: {
          role: 'assistant',
          content: content
        }
      }],
      usage: data.usage || {
        prompt_tokens: 0,
        completion_tokens: 0,
        total_tokens: 0
      }
    });

  } catch (error) {
    console.error('Groq API error:', error);
    
    let errorMessage = 'An error occurred while processing your request';
    let statusCode = 500;

    if (error.message.includes('401') || error.message.includes('unauthorized')) {
      errorMessage = 'Invalid Groq API key. Please check your API key.';
      statusCode = 401;
    } else if (error.message.includes('429') || error.message.includes('rate limit')) {
      errorMessage = 'Rate limit exceeded. Please try again later.';
      statusCode = 429;
    } else if (error.message.includes('400') || error.message.includes('bad request')) {
      errorMessage = 'Invalid request. Please check your request parameters.';
      statusCode = 400;
    }

    res.status(statusCode).json({ 
      error: errorMessage,
      details: error.message 
    });
  }
});



// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    // Simple health check without API call
    res.json({ 
      status: 'OK', 
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      api_service: 'Groq (Real-time AI)'
    });
  } catch (error) {
    res.status(500).json({ 
      status: 'ERROR', 
      message: 'Server error',
      error: error.message 
    });
  }
});



// Root endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Groq AI Chat API Server',
    endpoints: {
      chat: 'POST /api/chat',
      health: 'GET /api/health'
    }
  });
});

app.listen(port, () => {
  console.log(`🚀 Server running on http://localhost:${port}`);
  console.log(`📊 Health check: http://localhost:${port}/api/health`);
  console.log(`💬 Chat endpoint: POST http://localhost:${port}/api/chat`);
  
  if (!process.env.GROQ_API_KEY) {
    console.warn('⚠️  GROQ_API_KEY environment variable is not set!');
  } else {
    console.log('✅ Groq API key configured');
    console.log('⚡ Real-time AI responses enabled!');
  }
});