import { DataAPIClient } from '@datastax/astra-db-ts';
import dotenv from 'dotenv';

dotenv.config();

const client = new DataAPIClient(process.env.ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(process.env.ASTRA_DB_API_ENDPOINT, { keyspace: 'default_keyspace' });

// Initialize collections
export const initCollections = async () => {
  try {
    // Create users collection
    try {
      await db.createCollection('users');
      console.log('✅ Users collection created');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Users collection exists');
      } else {
        throw error;
      }
    }
    
    // Create messages collection
    try {
      await db.createCollection('messages');
      console.log('✅ Messages collection created');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Messages collection exists');
      } else {
        throw error;
      }
    }
    
    // Create chats collection
    try {
      await db.createCollection('chats');
      console.log('✅ Chats collection created');
    } catch (error) {
      if (error.message.includes('already exists')) {
        console.log('✅ Chats collection exists');
      } else {
        throw error;
      }
    }
    
    return true;
  } catch (error) {
    console.error('❌ Collection creation failed:', error.message);
    return false;
  }
};

export const collections = {
  users: db.collection('users'),
  messages: db.collection('messages'),
  chats: db.collection('chats')
};

export default db;