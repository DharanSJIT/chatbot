import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import { collections } from '../../config/database.js';

const router = express.Router();

// Get user's chat sessions
router.get('/chats/:userId', async (req, res) => {
  try {
    const { userId } = req.params;
    const chats = await collections.chats
      .find({ userId })
      .sort({ updatedAt: -1 })
      .toArray();
    res.json(chats);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new chat session
router.post('/chats', async (req, res) => {
  try {
    const { userId, title } = req.body;
    const chatId = uuidv4();
    const chat = {
      _id: chatId,
      userId,
      title: title || 'New Chat',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    await collections.chats.insertOne(chat);
    res.json(chat);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});



// Delete chat session
router.delete('/chats/:chatId', async (req, res) => {
  try {
    const { chatId } = req.params;
    await collections.chats.deleteOne({ _id: chatId });
    await collections.messages.deleteMany({ chatId });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { userId, chatId, role, content, timestamp } = req.body;
    console.log('Saving message:', { userId, chatId, role, content: content?.substring(0, 30) });
    

    
    const messageDoc = {
      _id: uuidv4(),
      userId,
      chatId,
      role,
      content,
      timestamp: timestamp || new Date().toISOString(),
      createdAt: new Date().toISOString()
    };
    
    await collections.messages.insertOne(messageDoc);
    console.log('Message saved successfully');
    
    // Update chat timestamp only
    if (chatId) {
      await collections.chats.updateOne(
        { _id: chatId },
        { $set: { updatedAt: new Date().toISOString() } }
      );
    }
    
    res.json(messageDoc);
  } catch (error) {
    console.error('Error saving message:', error);
    res.status(500).json({ error: error.message });
  }
});

router.get('/:userId/:chatId?', async (req, res) => {
  try {
    const { userId, chatId } = req.params;
    console.log('Fetching messages for user:', userId, 'chat:', chatId);
    
    let query = { userId };
    
    // If chatId is provided, only get messages for that specific chat
    if (chatId && chatId !== 'undefined') {
      query = { userId, chatId };
    } else {
      // If no chatId, return empty array (don't mix all messages)
      return res.json([]);
    }
    
    const messages = await collections.messages
      .find(query)
      .sort({ createdAt: -1 })
      .limit(100)
      .toArray();
    
    console.log('Found messages for chat:', messages.length);
    res.json(messages.reverse());
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;