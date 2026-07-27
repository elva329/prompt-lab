import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'prompt-lab';

if (!mongoUri) {
  throw new Error('Missing MONGODB_URI in environment variables.');
}

let connectedClient;
let initPromise = null;

  async function connectWithRetry(maxRetries = 2) {
    const client = new MongoClient(mongoUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 5000,
      socketTimeoutMS: 5000,
      maxPoolSize: 1,
      minPoolSize: 0,
    });

  let lastError;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      connectedClient = await client.connect();
      console.log('[MongoDB] Connected successfully');
      return connectedClient;
    } catch (error) {
      lastError = error;
      console.error(`[MongoDB] Connection attempt ${attempt} failed:`, error.message);
      if (attempt < maxRetries) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * attempt));
      }
    }
  }

  throw lastError;
}

export async function getDb() {
  if (!initPromise) {
    initPromise = connectWithRetry();
  }

  const client = await initPromise;
  return client.db(dbName);
}
