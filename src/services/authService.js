import { collections } from '../config/astradb.js';
import { v4 as uuidv4 } from 'uuid';

export const authService = {
  async register(username, email, password) {
    try {
      const existingUser = await collections.users.findOne({ email });
      if (existingUser) {
        throw new Error('User already exists');
      }

      const userId = uuidv4();
      const user = {
        _id: userId,
        username,
        email,
        password, // In production, hash this
        createdAt: new Date().toISOString(),
        isActive: true
      };

      await collections.users.insertOne(user);
      return { userId, username, email };
    } catch (error) {
      throw new Error(`Registration failed: ${error.message}`);
    }
  },

  async login(email, password) {
    try {
      const user = await collections.users.findOne({ email, password });
      if (!user) {
        throw new Error('Invalid credentials');
      }

      return {
        userId: user._id,
        username: user.username,
        email: user.email
      };
    } catch (error) {
      throw new Error(`Login failed: ${error.message}`);
    }
  }
};