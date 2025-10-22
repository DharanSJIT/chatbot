import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import messageRoutes from './routes/messages.js';
import { collections, initCollections } from '../config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// CORS configuration
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://chatbot-llm-web.vercel.app'
];

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }
    
    // Allow any Vercel deployment
    if (origin.includes('.vercel.app')) {
      return callback(null, true);
    }
    
    const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
    return callback(new Error(msg), false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Handle preflight requests
app.options('*', cors());
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