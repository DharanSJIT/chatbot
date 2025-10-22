import { collections } from '../config/astradb.js';
import { v4 as uuidv4 } from 'uuid';

export const chatService = {
  async saveMessage(userId, message) {
    try {
      const messageDoc = {
        _id: uuidv4(),
        userId,
        role: message.role,
        content: message.content,
        timestamp: message.timestamp || new Date().toISOString(),
        createdAt: new Date().toISOString()
      };

      await collections.messages.insertOne(messageDoc);
      return messageDoc;
    } catch (error) {
      throw new Error(`Failed to save message: ${error.message}`);
    }
  },

  async getUserMessages(userId, limit = 100) {
    try {
      const messages = await collections.messages
        .find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .toArray();
      
      return messages.reverse();
    } catch (error) {
      throw new Error(`Failed to fetch messages: ${error.message}`);
    }
  },

  async createChat(userId, title = 'New Chat') {
    try {
      const chatDoc = {
        _id: uuidv4(),
        userId,
        title,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      await collections.chats.insertOne(chatDoc);
      return chatDoc;
    } catch (error) {
      throw new Error(`Failed to create chat: ${error.message}`);
    }
  },

  async getUserChats(userId) {
    try {
      const chats = await collections.chats
        .find({ userId })
        .sort({ updatedAt: -1 })
        .toArray();
      
      return chats;
    } catch (error) {
      throw new Error(`Failed to fetch chats: ${error.message}`);
    }
  }
};