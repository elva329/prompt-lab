import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'prompt-lab';

if (!mongoUri) {
  throw new Error('Missing MONGODB_URI in environment variables.');
}

let connectedClient;

export async function getDb() {
  if (!connectedClient) {
    const client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 10000,
      maxPoolSize: 1,
    });

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
