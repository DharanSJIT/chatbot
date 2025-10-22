import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import messageRoutes from './routes/messages.js';
import { collections, initCollections } from '../config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors({
  origin: [
    'http://localhost:5173',
    'http://localhost:3000', 
    'https://chatbot-llm-web.vercel.app'
  ],
  credentials: true
}));
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

app.get('/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    timestamp: new Date().toISOString(),
    cors: 'Vercel domain allowed'
  });
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Chatbot Backend API',
    endpoints: {
      auth: '/api/auth/login, /api/auth/register',
      messages: '/api/messages'
    }
  });
});

// Initialize AstraDB collections
const initializeDatabase = async () => {
  console.log('Initializing AstraDB...');
  const success = await initCollections();
  if (success) {
    console.log('✅ AstraDB initialized successfully');
  } else {
    console.error('❌ AstraDB initialization failed');
  }
};

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/health`);
  initializeDatabase();
});