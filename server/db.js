import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'prompt-lab';

if (!mongoUri) {
  throw new Error('Missing MONGODB_URI in environment variables.');
}

const client = new MongoClient(mongoUri, {
  serverSelectionTimeoutMS: 10000,
  connectTimeoutMS: 10000,
  socketTimeoutMS: 10000,
});
let connectedClient;

export async function getDb() {
  if (!connectedClient) {
    try {
      connectedClient = await client.connect();
      console.log('[MongoDB] Connected successfully');
    } catch (error) {
      console.error('[MongoDB] Connection failed:', error.message);
      throw error;
    }
  }

  return connectedClient.db(dbName);
}
