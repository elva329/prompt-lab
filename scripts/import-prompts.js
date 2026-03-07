import 'dotenv/config';

import fs from 'fs';
import { MongoClient } from 'mongodb';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const mongoUri = process.env.MONGODB_URI;
const dbName = process.env.MONGODB_DB_NAME || 'prompt-lab';

if (!mongoUri) {
  console.error('❌ Missing MONGODB_URI in environment variables');
  process.exit(1);
}

async function importPrompts() {
  const client = new MongoClient(mongoUri);
  
  try {
    console.log('🔗 Connecting to MongoDB Atlas...');
    await client.connect();
    
    const db = client.db(dbName);
    const promptsCollection = db.collection('prompts');
    
    // Read transformed prompts
    const promptsPath = path.join(__dirname, '../prompts/chatgpt_prompts_transformed.json');
    const prompts = JSON.parse(fs.readFileSync(promptsPath, 'utf-8'));
    
    console.log(`📦 Found ${prompts.length} prompts to import`);
    
    // Clear existing prompts if any
    const existingCount = await promptsCollection.countDocuments();
    if (existingCount > 0) {
      console.log(`🗑️  Removing ${existingCount} existing prompts...`);
      await promptsCollection.deleteMany({});
    }
    
    // Insert transformed prompts
    console.log('⬆️  Importing prompts...');
    const result = await promptsCollection.insertMany(prompts);
    
    // Create indexes
    console.log('🔍 Creating indexes...');
    await promptsCollection.createIndex({ promptId: 1 }, { unique: true });
    await promptsCollection.createIndex({ category: 1 });
    await promptsCollection.createIndex({ title: 'text', promptText: 'text' });
    
    console.log(`✅ Successfully imported ${result.insertedCount} prompts`);
    console.log(`📊 Database: ${dbName}`);
    console.log(`📁 Collection: prompts`);
    
    // Display sample
    console.log('\n📝 Sample prompt:');
    const sample = await promptsCollection.findOne({});
    console.log(JSON.stringify(sample, null, 2));
    
  } catch (error) {
    console.error('❌ Error importing prompts:', error);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n🔌 Database connection closed');
  }
}

importPrompts();
