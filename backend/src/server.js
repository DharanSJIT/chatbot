import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js';
import messageRoutes from './routes/messages.js';
import { collections, initCollections } from '../config/database.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

app.use('/api/auth', authRoutes);
app.use('/api/messages', messageRoutes);

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
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