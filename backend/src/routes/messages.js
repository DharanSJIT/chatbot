import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { collections } from '../../config/database.js';

const router = express.Router();

router.post('/', async (req, res) => {
  try {
    const { userId, role, content, timestamp } = req.body;
    console.log('Saving message for user:', userId);
    
    const messageDoc = {
      _id: uuidv4(),
      userId,
      role,
      content,
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    await collections.messages.insertOne(messageDoc);
    console.log('Message saved successfully');
    res.json(messageDoc);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    console.log('Fetching messages for user:', userId);
    
    const messages = await collections.messages
      .find({ userId })
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    
    console.log('Found messages:', messages.length);
    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;