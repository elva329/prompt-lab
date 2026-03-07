import 'dotenv/config';

import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';

import { getDb } from './db.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const SALT_ROUNDS = 10;

async function ensureIndexes() {
  const db = await getDb();
  await db.collection('users').createIndex({ email: 1 }, { unique: true });
  await db.collection('prompts').createIndex({ promptId: 1 }, { unique: true });
  await db.collection('prompts').createIndex({ category: 1 });
}

app.use(cors());
app.use(express.json());

function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase();
}

function validateCredentials(email, password) {
  const normalizedEmail = normalizeEmail(email);

  if (!normalizedEmail || !password) {
    return 'Email and password are required.';
  }

  if (!/^\S+@\S+\.\S+$/.test(normalizedEmail)) {
    return 'Please provide a valid email address.';
  }

  if (String(password).length < 6) {
    return 'Password must be at least 6 characters.';
  }

  return null;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/prompts', async (req, res) => {
  try {
    const { category, search, limit = 100, offset = 0 } = req.query;
    const db = await getDb();
    const promptsCollection = db.collection('prompts');

    const query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const prompts = await promptsCollection
      .find(query)
      .sort({ promptId: 1 })
      .skip(Number(offset))
      .limit(Number(limit))
      .toArray();

    const total = await promptsCollection.countDocuments(query);

    return res.json({
      prompts,
      total,
      limit: Number(limit),
      offset: Number(offset),
    });
  } catch (error) {
    console.error('Fetch prompts error:', error);
    return res.status(500).json({ message: 'Failed to fetch prompts.' });
  }
});

app.get('/api/prompts/categories', async (_req, res) => {
  try {
    const db = await getDb();
    const promptsCollection = db.collection('prompts');

    const categories = await promptsCollection.distinct('category');
    
    return res.json({ categories: categories.sort() });
  } catch (error) {
    console.error('Fetch categories error:', error);
    return res.status(500).json({ message: 'Failed to fetch categories.' });
  }
});

app.get('/api/prompts/:id', async (req, res) => {
  try {
    const promptId = Number(req.params.id);
    
    if (isNaN(promptId)) {
      return res.status(400).json({ message: 'Invalid prompt ID.' });
    }

    const db = await getDb();
    const promptsCollection = db.collection('prompts');

    const prompt = await promptsCollection.findOne({ promptId });

    if (!prompt) {
      return res.status(404).json({ message: 'Prompt not found.' });
    }

    return res.json(prompt);
  } catch (error) {
    console.error('Fetch prompt error:', error);
    return res.status(500).json({ message: 'Failed to fetch prompt.' });
  }
});

app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password } = req.body || {};
    const error = validateCredentials(email, password);

    if (error) {
      return res.status(400).json({ message: error });
    }

    const normalizedEmail = normalizeEmail(email);
    const db = await getDb();
    const usersCollection = db.collection('users');

    const existingUser = await usersCollection.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already registered.' });
    }

    const passwordHash = await bcrypt.hash(String(password), SALT_ROUNDS);
    await usersCollection.insertOne({
      email: normalizedEmail,
      passwordHash,
    });

    return res.status(201).json({
      message: 'Registration successful.',
      user: {
        email: normalizedEmail,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (!email || !password) {
      return res.status(400).json({ message: 'Email and password are required.' });
    }

    const normalizedEmail = normalizeEmail(email);
    const db = await getDb();
    const usersCollection = db.collection('users');

    const user = await usersCollection.findOne({ email: normalizedEmail });
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    const matches = await bcrypt.compare(String(password), user.passwordHash);
    if (!matches) {
      return res.status(401).json({ message: 'Invalid email or password.' });
    }

    return res.status(200).json({
      message: 'Login successful.',
      user: {
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

ensureIndexes()
  .then(() => {
    app.listen(port, () => {
      console.log(`Auth API running on http://localhost:${port}`);
    });
  })
  .catch((error) => {
    console.error('Failed to initialize server:', error);
    process.exit(1);
  });
