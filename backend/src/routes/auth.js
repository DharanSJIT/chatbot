import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { collections } from '../../config/database.js';

const router = express.Router();

router.post('/register', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
    const existingUser = await collections.users.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    const userId = uuidv4();
    const user = {
      _id: userId,
      username,
      email,
      password,
      createdAt: new Date().toISOString()
    };
    
    await collections.users.insertOne(user);
    res.json({ userId, username, email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const user = await collections.users.findOne({ email, password });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    res.json({ 
      userId: user._id, 
      username: user.username, 
      email: user.email 
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

export default router;