import { MongoClient } from 'mongodb';

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'prompt-lab';

if (!mongoUri) {
  throw new Error('Missing MONGODB_URI in environment variables.');
}

const client = new MongoClient(mongoUri);
let connectedClient;

export async function getDb() {
  if (!connectedClient) {
    connectedClient = await client.connect();
  }

  return connectedClient.db(dbName);
}
