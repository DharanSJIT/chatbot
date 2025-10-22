import { DataAPIClient } from '@datastax/astra-db-ts';

const client = new DataAPIClient(import.meta.env.VITE_ASTRA_DB_APPLICATION_TOKEN);
const db = client.db(import.meta.env.VITE_ASTRA_DB_API_ENDPOINT, { keyspace: 'default_keyspace' });

export const collections = {
  users: db.collection('users'),
  chats: db.collection('chats'),
  messages: db.collection('messages')
};

export default db;