import 'dotenv/config';

import bcrypt from 'bcryptjs';
import cors from 'cors';
import express from 'express';
import jwt from 'jsonwebtoken';
import { ObjectId } from 'mongodb';
import { pathToFileURL } from 'url';

import { getDb } from './db.js';

const app = express();
const port = Number(process.env.PORT || 4000);
const SALT_ROUNDS = 10;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRATION = '7d';

// Middleware to verify JWT token
function verifyToken(req, res, next) {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.startsWith('Bearer ') ? authHeader.substring(7) : null;

  if (!token) {
    return res.status(401).json({ message: 'Authorization token is required.' });
  }

  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch (error) {
    console.error('Token verification error:', error.message);
    return res.status(401).json({ message: 'Invalid or expired token.' });
  }
}

function isDuplicateIndexError(error) {
  const message = typeof error?.message === 'string' ? error.message : '';
  const code = error?.code;
  return (
    code === 11000 ||
    code === 11001 ||
    message.includes('already exists') ||
    message.includes('same name') ||
    message.includes('duplicate index') ||
    message.includes('duplicate key')
  );
}

export async function ensureIndexes() {
  const db = await getDb();

  const indexSpecs = [
    ['users', { email: 1 }, { unique: true }],
    ['prompt_library', { promptId: 1 }, { unique: true }],
    ['prompt_library', { category: 1 }, {}],
    ['prompt_library', { title: 'text', promptText: 'text' }, {}],
    ['experiments', { userId: 1, createdAt: -1 }, {}],
    ['results', { userId: 1, createdAt: -1 }, {}],
    ['results', { userId: 1, promptId: 1, createdAt: -1 }, {}],
    ['results', { userId: 1, experimentId: 1 }, {}],
    [
      'favorite_prompts',
      { userId: 1, sourcePromptId: 1 },
      {
        unique: true,
        partialFilterExpression: {
          sourcePromptId: { $exists: true, $type: 'string' },
        },
      },
    ],
    ['favorite_prompts', { userId: 1, updatedAt: -1 }, {}],
  ];

  for (const [collection, spec, options] of indexSpecs) {
    try {
      await db.collection(collection).createIndex(spec, options);
    } catch (error) {
      if (!isDuplicateIndexError(error)) {
        throw error;
      }
    }
  }
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

function idAlternatives(rawValue) {
  const value = String(rawValue || '').trim();
  if (!value) {
    return [];
  }

  const options = [value];
  if (ObjectId.isValid(value)) {
    options.push(new ObjectId(value));
  }

  return options;
}

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

// Proxy endpoint for HKBU GenAI API to bypass CORS
app.post('/api/ai/chat', verifyToken, async (req, res) => {
  try {
    const { messages, model, temperature, max_tokens } = req.body;
    
    const apiKey = process.env.VITE_CUSTOM_API_KEY;
    const baseUrl = process.env.VITE_CUSTOM_BASE_URL || 'https://genai.hkbu.edu.hk/api/v0/rest';
    const deploymentModel = process.env.VITE_CUSTOM_MODEL || model || 'gpt-5-mini';
    const apiVersion = process.env.VITE_CUSTOM_API_VERSION || '2024-12-01-preview';
    
    if (!apiKey) {
      return res.status(500).json({ 
        error: { message: 'AI API key not configured on server' }
      });
    }

    // Construct Azure OpenAI-style URL: /deployments/{model}/chat/completions?api-version={version}
    const apiUrl = `${baseUrl}/deployments/${deploymentModel}/chat/completions?api-version=${apiVersion}`;

    console.log('Proxying request to HKBU GenAI API:', apiUrl);
    console.log('Request body:', JSON.stringify({ temperature, max_tokens, messages: messages?.length }));

    const startTime = Date.now();
    
    // HKBU API only supports temperature=1 (default), so we don't send it
    const requestBody = {
      messages: messages,
      max_tokens: max_tokens ?? 1000,
    };
    
    console.log('Sending request body:', JSON.stringify(requestBody));
    
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': apiKey,
      },
      body: JSON.stringify(requestBody),
    });

    const responseTime = Date.now() - startTime;
    console.log(`HKBU API response: ${response.status} (${responseTime}ms)`);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('HKBU API error:', errorText);
      
      let errorData;
      try {
        errorData = JSON.parse(errorText);
      } catch {
        return res.status(response.status).json({ 
          error: { message: `API returned ${response.status}: ${errorText.substring(0, 200)}` }
        });
      }
      
      return res.status(response.status).json(errorData);
    }

    const data = await response.json();
    console.log('HKBU API success:', JSON.stringify(data).substring(0, 200));
    
    return res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ 
      error: { message: error.message || 'Failed to proxy request to AI API' }
    });
  }
});

app.get('/api/prompts', async (req, res) => {
  try {
    const { category, search, limit, offset = 0 } = req.query;
    const db = await getDb();
    const promptsCollection = db.collection('prompt_library');

    const query = {};
    
    if (category && category !== 'all') {
      query.category = category;
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    const parsedOffset = Number(offset);
    const parsedLimit = limit === undefined ? null : Number(limit);

    let promptsCursor = promptsCollection
      .find(query)
      .sort({ promptId: 1 })
      .skip(Number.isFinite(parsedOffset) && parsedOffset > 0 ? parsedOffset : 0);

    if (Number.isFinite(parsedLimit) && parsedLimit > 0) {
      promptsCursor = promptsCursor.limit(parsedLimit);
    }

    const prompts = await promptsCursor.toArray();

    const total = await promptsCollection.countDocuments(query);

    return res.json({
      prompts,
      total,
      limit: Number.isFinite(parsedLimit) ? parsedLimit : null,
      offset: Number.isFinite(parsedOffset) && parsedOffset > 0 ? parsedOffset : 0,
    });
  } catch (error) {
    console.error('Fetch prompts error:', error);
    return res.status(500).json({ message: 'Failed to fetch prompts.' });
  }
});

app.get('/api/prompts/categories', async (_req, res) => {
  try {
    const db = await getDb();
    const promptsCollection = db.collection('prompt_library');

    const categories = await promptsCollection.distinct('category');
    
    return res.json({ categories: categories.sort() });
  } catch (error) {
    console.error('Fetch categories error:', error);
    return res.status(500).json({ message: 'Failed to fetch categories.' });
  }
});

app.get('/api/prompts/category-stats', async (_req, res) => {
  try {
    const db = await getDb();
    const promptsCollection = db.collection('prompt_library');

    const stats = await promptsCollection
      .aggregate([
        {
          $group: {
            _id: { $ifNull: ['$category', 'uncategorized'] },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            name: '$_id',
            count: 1,
          },
        },
        { $sort: { count: -1, name: 1 } },
      ])
      .toArray();

    return res.json({ categories: stats });
  } catch (error) {
    console.error('Fetch category stats error:', error);
    return res.status(500).json({ message: 'Failed to fetch category stats.' });
  }
});

app.get('/api/prompts/:id', async (req, res) => {
  try {
    const promptId = Number(req.params.id);
    
    if (isNaN(promptId)) {
      return res.status(400).json({ message: 'Invalid prompt ID.' });
    }

    const db = await getDb();
    const promptsCollection = db.collection('prompt_library');

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

app.patch('/api/prompts/:id', async (req, res) => {
  try {
    const promptId = Number(req.params.id);
    const { title, promptText, category } = req.body || {};

    if (!Number.isInteger(promptId)) {
      return res.status(400).json({ message: 'Invalid prompt ID.' });
    }

    const updates = {};

    if (typeof title === 'string' && title.trim()) {
      updates.title = title.trim();
    }

    if (typeof promptText === 'string' && promptText.trim()) {
      updates.promptText = promptText.trim();
    }

    if (typeof category === 'string' && category.trim()) {
      updates.category = category.trim().toLowerCase();
    }

    if (!Object.keys(updates).length) {
      return res.status(400).json({ message: 'No valid fields to update.' });
    }

    const db = await getDb();
    const promptsCollection = db.collection('prompt_library');
    const result = await promptsCollection.findOneAndUpdate(
      { promptId },
      { $set: updates },
      { returnDocument: 'after' }
    );

    if (!result) {
      return res.status(404).json({ message: 'Prompt not found.' });
    }

    return res.json({ prompt: result });
  } catch (error) {
    console.error('Update prompt error:', error);
    return res.status(500).json({ message: 'Failed to update prompt.' });
  }
});

app.post('/api/prompts', verifyToken, async (req, res) => {
  try {
    const { title, promptText, category } = req.body || {};
    const userId = req.user.id;

    if (!title || typeof title !== 'string' || !title.trim()) {
      return res.status(400).json({ message: 'Title is required.' });
    }

    if (!promptText || typeof promptText !== 'string' || !promptText.trim()) {
      return res.status(400).json({ message: 'Prompt text is required.' });
    }

    if (!category || typeof category !== 'string' || !category.trim()) {
      return res.status(400).json({ message: 'Category is required.' });
    }

    const db = await getDb();
    const promptsCollection = db.collection('prompt_library');

    const maxPromptIdDoc = await promptsCollection.findOne({}, { sort: { promptId: -1 } });
    const nextPromptId = maxPromptIdDoc ? maxPromptIdDoc.promptId + 1 : 1000;

    const newPrompt = {
      promptId: nextPromptId,
      title: title.trim(),
      promptText: promptText.trim(),
      category: category.trim().toLowerCase(),
      createdAt: new Date().toISOString(),
      createdBy: userId || 'user',
    };

    await promptsCollection.insertOne(newPrompt);

    return res.status(201).json({
      message: 'Prompt created successfully.',
      prompt: newPrompt,
    });
  } catch (error) {
    console.error('Create prompt error:', error);
    return res.status(500).json({ message: 'Failed to create prompt.' });
  }
});

app.post('/api/experiments', verifyToken, async (req, res) => {
  try {
    const { prompts, summary } = req.body || {};
    const userId = req.user.id;

    if (!userId || !ObjectId.isValid(String(userId))) {
      return res.status(400).json({ message: 'Valid userId is required.' });
    }

    if (!Array.isArray(prompts) || prompts.length === 0) {
      return res.status(400).json({ message: 'At least one prompt ID is required.' });
    }

    // Accept both numeric IDs (library prompts) and string IDs (user-created favorites)
    const normalizedPrompts = prompts.filter((entry) => {
      if (typeof entry === 'number' && Number.isInteger(entry)) {
        return true; // Valid numeric ID (library prompt)
      }
      if (typeof entry === 'string' && entry.trim() !== '') {
        return true; // Valid string ID (user-created prompt)
      }
      return false;
    });

    if (normalizedPrompts.length === 0) {
      return res.status(400).json({ message: 'Prompt IDs must be valid numbers or MongoDB ObjectId strings.' });
    }

    const db = await getDb();
    const usersCollection = db.collection('users');
    const experimentsCollection = db.collection('experiments');

    const user = await usersCollection.findOne({ _id: new ObjectId(String(userId)) });
    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    const createdAt = new Date().toISOString();
    const normalizedSummary = summary && typeof summary === 'object'
      ? {
          status: summary.status === 'completed' ? 'completed' : 'draft',
          avgQualityScore:
            typeof summary.avgQualityScore === 'number' && Number.isFinite(summary.avgQualityScore)
              ? Math.round(summary.avgQualityScore)
              : null,
          avgResponseTimeMs:
            typeof summary.avgResponseTimeMs === 'number' && Number.isFinite(summary.avgResponseTimeMs)
              ? Math.round(summary.avgResponseTimeMs)
              : null,
          totalTokens:
            typeof summary.totalTokens === 'number' && Number.isFinite(summary.totalTokens)
              ? Math.max(0, Math.round(summary.totalTokens))
              : 0,
          promptScores: Array.isArray(summary.promptScores)
            ? summary.promptScores
                .map((entry) => {
                  const promptId = typeof entry?.promptId === 'string' 
                    ? entry.promptId.trim() 
                    : Number(entry?.promptId);
                  return {
                    promptId,
                    overallQuality: Number(entry?.overallQuality),
                  };
                })
                .filter((entry) => {
                  // Accept both numeric IDs (library) and non-empty string IDs (user-created)
                  const hasValidId = (typeof entry.promptId === 'number' && Number.isInteger(entry.promptId)) ||
                                    (typeof entry.promptId === 'string' && entry.promptId.trim() !== '');
                  return hasValidId && Number.isFinite(entry.overallQuality);
                })
                .map((entry) => ({
                  promptId: entry.promptId,
                  overallQuality: Math.max(0, Math.min(100, Math.round(entry.overallQuality))),
                }))
            : [],
        }
      : {
          status: 'draft',
          avgQualityScore: null,
          avgResponseTimeMs: null,
          totalTokens: 0,
          promptScores: [],
        };

    const insertResult = await experimentsCollection.insertOne({
      userId: String(user._id),
      prompts: normalizedPrompts,
      createdAt,
      ...normalizedSummary,
    });

    return res.status(201).json({
      message: 'Experiment saved successfully.',
      experiment: {
        id: String(insertResult.insertedId),
        userId: String(user._id),
        prompts: normalizedPrompts,
        createdAt,
        ...normalizedSummary,
      },
    });
  } catch (error) {
    console.error('Create experiment error:', error);
    return res.status(500).json({ message: 'Failed to save experiment.' });
  }
});

app.get('/api/experiments', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const db = await getDb();
    const experimentsCollection = db.collection('experiments');

    const userIdCandidates = idAlternatives(userId);

    const experiments = await experimentsCollection
      .find({ userId: { $in: userIdCandidates } })
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({ experiments });
  } catch (error) {
    console.error('Fetch experiments error:', error);
    return res.status(500).json({ message: 'Failed to fetch experiments.' });
  }
});

app.get('/api/experiments/:id', verifyToken, async (req, res) => {
  try {
    const experimentId = String(req.params.id || '');
    const userId = req.user.id;

    if (!experimentId || !ObjectId.isValid(experimentId)) {
      return res.status(400).json({ message: 'Valid experiment ID is required.' });
    }

    const db = await getDb();
    const experimentsCollection = db.collection('experiments');

    const userIdCandidates = idAlternatives(userId);
    const experiment = await experimentsCollection.findOne({
      _id: new ObjectId(experimentId),
      userId: { $in: userIdCandidates },
    });

    if (!experiment) {
      return res.status(404).json({ message: 'Experiment not found.' });
    }

    return res.json({ experiment });
  } catch (error) {
    console.error('Fetch experiment detail error:', error);
    return res.status(500).json({ message: 'Failed to fetch experiment details.' });
  }
});

app.post('/api/results/batch', verifyToken, async (req, res) => {
  try {
    const { experimentId, promptResults } = req.body || {};
    const userId = req.user.id;

    if (!ObjectId.isValid(String(experimentId))) {
      return res.status(400).json({ message: 'Valid experimentId is required.' });
    }

    if (!Array.isArray(promptResults) || promptResults.length === 0) {
      return res.status(400).json({ message: 'promptResults must be a non-empty array.' });
    }

    const createdAt = new Date().toISOString();
    const normalized = promptResults
      .map((entry) => {
        const promptId = typeof entry?.promptId === 'string' 
          ? entry.promptId.trim() 
          : Number(entry?.promptId);
        return {
          userId: String(userId),
          experimentId: String(experimentId),
          promptId,
          category: typeof entry?.category === 'string' ? entry.category.trim().toLowerCase() : '',
          aiResponse: typeof entry?.aiResponse === 'string' ? entry.aiResponse : '',
          overallQuality: Number(entry?.overallQuality),
          responseTimeMs: Number(entry?.responseTimeMs || 0),
          clarity: Number(entry?.clarity || 0),
          relevance: Number(entry?.relevance || 0),
          coherence: Number(entry?.coherence || 0),
          completeness: Number(entry?.completeness || 0),
          tokensUsed: Number(entry?.tokensUsed || 0),
          createdAt,
        };
      })
      .filter((entry) => {
        // Accept both numeric IDs (library) and non-empty string IDs (user-created)
        const hasValidId = (typeof entry.promptId === 'number' && Number.isInteger(entry.promptId)) ||
                          (typeof entry.promptId === 'string' && entry.promptId.trim() !== '');
        return hasValidId && Number.isFinite(entry.overallQuality);
      })
      .map((entry) => ({
        ...entry,
        category: entry.category || 'uncategorized',
        aiResponse: String(entry.aiResponse || ''),
        overallQuality: Math.max(0, Math.min(100, Math.round(entry.overallQuality))),
        responseTimeMs: Math.max(0, Math.round(entry.responseTimeMs)),
        clarity: Math.max(0, Math.min(100, Math.round(entry.clarity))),
        relevance: Math.max(0, Math.min(100, Math.round(entry.relevance))),
        coherence: Math.max(0, Math.min(100, Math.round(entry.coherence))),
        completeness: Math.max(0, Math.min(100, Math.round(entry.completeness))),
        tokensUsed: Math.max(0, Math.round(entry.tokensUsed)),
      }));

    if (!normalized.length) {
      return res.status(400).json({ message: 'No valid prompt results to save.' });
    }

    const db = await getDb();
    const resultsCollection = db.collection('results');
    const insertResult = await resultsCollection.insertMany(normalized);

    return res.status(201).json({
      message: 'Results saved successfully.',
      insertedCount: insertResult.insertedCount,
    });
  } catch (error) {
    console.error('Save results error:', error);
    return res.status(500).json({ message: 'Failed to save results.' });
  }
});

app.get('/api/results/summary', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const db = await getDb();
    const resultsCollection = db.collection('results');

    const userIdCandidates = idAlternatives(userId);

    const [overall] = await resultsCollection
      .aggregate([
        { $match: { userId: { $in: userIdCandidates } } },
        {
          $group: {
            _id: null,
            avgQualityScore: { $avg: '$overallQuality' },
            avgResponseTimeMs: { $avg: '$responseTimeMs' },
            experiments: { $addToSet: '$experimentId' },
            promptsEvaluated: { $addToSet: '$promptId' },
            passCount: {
              $sum: {
                $cond: [{ $gte: ['$overallQuality', 60] }, 1, 0]
              }
            },
            totalCount: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            avgQualityScore: {
              $cond: [{ $gt: [{ $size: '$experiments' }, 0] }, { $round: ['$avgQualityScore', 0] }, null],
            },
            avgResponseTimeMs: {
              $cond: [{ $gt: [{ $size: '$experiments' }, 0] }, { $round: ['$avgResponseTimeMs', 0] }, null],
            },
            experimentsRun: { $size: '$experiments' },
            promptsEvaluated: { $size: '$promptsEvaluated' },
            passRate: {
              $cond: [
                { $gt: ['$totalCount', 0] },
                { $round: [{ $multiply: [{ $divide: ['$passCount', '$totalCount'] }, 100] }, 1] },
                null
              ]
            },
          },
        },
      ])
      .toArray();

    const topCategoriesByPrompt = await resultsCollection
      .aggregate([
        { $match: { userId: { $in: userIdCandidates } } },
        {
          $group: {
            _id: {
              $cond: [
                { $and: [{ $ne: ['$category', null] }, { $ne: ['$category', ''] }] },
                '$category',
                'uncategorized',
              ],
            },
            count: { $sum: 1 },
          },
        },
        {
          $project: {
            _id: 0,
            name: '$_id',
            count: 1,
          },
        },
        { $sort: { count: -1, name: 1 } },
        { $limit: 6 },
      ])
      .toArray();

    return res.json({
      experimentsRun: overall?.experimentsRun || 0,
      avgQualityScore: typeof overall?.avgQualityScore === 'number' ? overall.avgQualityScore : null,
      avgResponseTimeMs: typeof overall?.avgResponseTimeMs === 'number' ? overall.avgResponseTimeMs : null,
      promptsEvaluated: typeof overall?.promptsEvaluated === 'number' ? overall.promptsEvaluated : 0,
      passRate: typeof overall?.passRate === 'number' ? overall.passRate : null,
      topCategories: topCategoriesByPrompt,
    });
  } catch (error) {
    console.error('Fetch results summary error:', error);
    return res.status(500).json({ message: 'Failed to fetch results summary.' });
  }
});

app.get('/api/results/prompt-summary', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const db = await getDb();
    const resultsCollection = db.collection('results');

    const userIdCandidates = idAlternatives(userId);

    const summary = await resultsCollection
      .aggregate([
        { $match: { userId: { $in: userIdCandidates } } },
        {
          $group: {
            _id: '$promptId',
            avgQualityScore: { $avg: '$overallQuality' },
            testCount: { $sum: 1 },
            lastTestedAt: { $max: '$createdAt' },
          },
        },
        {
          $project: {
            _id: 0,
            promptId: '$_id',
            avgQualityScore: { $round: ['$avgQualityScore', 0] },
            testCount: 1,
            lastTestedAt: 1,
          },
        },
        { $sort: { promptId: 1 } },
      ])
      .toArray();

    return res.json({ prompts: summary });
  } catch (error) {
    console.error('Fetch prompt result summary error:', error);
    return res.status(500).json({ message: 'Failed to fetch prompt result summary.' });
  }
});

app.get('/api/results/by-user', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const db = await getDb();
    const resultsCollection = db.collection('results');
    const userIdCandidates = idAlternatives(userId);

    const results = await resultsCollection
      .find({ userId: { $in: userIdCandidates } })
      .sort({ createdAt: -1 })
      .toArray();

    return res.json({ results });
  } catch (error) {
    console.error('Fetch results by user error:', error);
    return res.status(500).json({ message: 'Failed to fetch user results.' });
  }
});

app.get('/api/results/by-experiment', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const experimentId = String(req.query.experimentId || '');

    if (!experimentId) {
      return res.status(400).json({ message: 'experimentId is required.' });
    }

    const db = await getDb();
    const resultsCollection = db.collection('results');

    const userIdCandidates = idAlternatives(userId);
    const experimentIdCandidates = idAlternatives(experimentId);

    const results = await resultsCollection
      .find({
        userId: { $in: userIdCandidates },
        experimentId: { $in: experimentIdCandidates.length ? experimentIdCandidates : [experimentId] },
      })
      .sort({ promptId: 1 })
      .toArray();

    return res.json({ results });
  } catch (error) {
    console.error('Fetch results by experiment error:', error);
    return res.status(500).json({ message: 'Failed to fetch experiment results.' });
  }
});

app.post('/api/favorites', verifyToken, async (req, res) => {
  try {
    const { customTitle, customCategory, customPromptText, sourcePromptId } = req.body || {};
    const userId = req.user.id;

    if (!customTitle || !customPromptText) {
      return res.status(400).json({ message: 'Title and prompt content are required.' });
    }

    const db = await getDb();
    const favoritesCollection = db.collection('favorite_prompts');
    const now = new Date().toISOString();
    // Always provide a unique sourcePromptId for user-created prompts
    const newSourcePromptId = sourcePromptId || `user_${userId}_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    const insertData = {
      userId: String(userId),
      sourcePromptId: newSourcePromptId,
      customTitle: customTitle.trim(),
      customCategory: (typeof customCategory === 'string' && customCategory.trim()) ? customCategory.trim() : 'General',
      customPromptText: customPromptText.trim(),
      createdAt: now,
      updatedAt: now,
    };

    const result = await favoritesCollection.insertOne(insertData);

    return res.status(201).json({
      message: 'Prompt created successfully.',
      favorite: { ...insertData, _id: result.insertedId },
    });
  } catch (error) {
    console.error('Create prompt error:', error);
    return res.status(500).json({ message: 'Failed to create prompt.' });
  }
});

app.put('/api/favorites/:id', verifyToken, async (req, res) => {
  try {
    const { customTitle, customCategory, customPromptText } = req.body || {};
    const userId = req.user.id;
    const id = req.params.id;

    if (!customTitle || !customPromptText) {
      return res.status(400).json({ message: 'Title and prompt content are required.' });
    }

    const db = await getDb();
    const favoritesCollection = db.collection('favorite_prompts');
    const { ObjectId } = await import('mongodb');

    let result;
    try {
      const objectId = new ObjectId(id);
      result = await favoritesCollection.findOneAndUpdate(
        { _id: objectId, userId },
        {
          $set: {
            customTitle: customTitle.trim(),
            customCategory: (typeof customCategory === 'string' && customCategory.trim()) ? customCategory.trim() : 'General',
            customPromptText: customPromptText.trim(),
            updatedAt: new Date().toISOString(),
          },
        },
        { returnDocument: 'after' }
      );
    } catch (e) {
      return res.status(400).json({ message: 'Invalid prompt ID.' });
    }

    if (!result) {
      return res.status(404).json({ message: 'Prompt not found.' });
    }

    return res.status(200).json({
      message: 'Prompt updated successfully.',
      favorite: result,
    });
  } catch (error) {
    console.error('Update prompt error:', error);
    return res.status(500).json({ message: 'Failed to update prompt.' });
  }
});

app.get('/api/favorites', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;

    const db = await getDb();
    const favoritesCollection = db.collection('favorite_prompts');

    const favorites = await favoritesCollection
      .find({ userId })
      .sort({ updatedAt: -1 })
      .toArray();

    const merged = favorites.map((fav) => ({
      ...fav,
      promptId: fav._id.toString(),
      title: fav.customTitle,
      category: fav.customCategory || 'General',
      promptText: fav.customPromptText,
    }));

    return res.json({ favorites: merged });
  } catch (error) {
    console.error('Fetch favorites error:', error);
    return res.status(500).json({ message: 'Failed to fetch favorites.' });
  }
});

app.get('/api/favorites/:id', verifyToken, async (req, res) => {
  try {
    const userId = String(req.user.id);
    const id = req.params.id;

    console.log(`GET /api/favorites/${id} for userId: ${userId}`);

    const db = await getDb();
    const favoritesCollection = db.collection('favorite_prompts');
    const { ObjectId } = await import('mongodb');

    let favorite;
    try {
      const objectId = new ObjectId(id);
      console.log(`Looking for ObjectId: ${objectId}`);
      favorite = await favoritesCollection.findOne({
        _id: objectId,
        userId: userId,
      });
      console.log(`Found favorite:`, favorite ? 'yes' : 'no');
    } catch (e) {
      console.error('Error parsing ObjectId:', e.message);
      return res.status(400).json({ message: 'Invalid prompt ID.' });
    }

    if (!favorite) {
      console.error(`Favorite not found for ID: ${id}, userId: ${userId}`);
      return res.status(404).json({ message: 'Prompt not found.' });
    }

    const result = {
      promptId: favorite._id.toString(),
      title: favorite.customTitle,
      category: favorite.customCategory || 'General',
      promptText: favorite.customPromptText,
    };

    return res.json(result);
  } catch (error) {
    console.error('Fetch favorite error:', error);
    return res.status(500).json({ message: 'Failed to fetch favorite.' });
  }
});

app.delete('/api/favorites/:id', verifyToken, async (req, res) => {
  try {
    const userId = req.user.id;
    const id = req.params.id;

    const db = await getDb();
    const favoritesCollection = db.collection('favorite_prompts');
    const { ObjectId } = await import('mongodb');

    let result;
    try {
      const objectId = new ObjectId(id);
      result = await favoritesCollection.deleteOne({
        _id: objectId,
        userId,
      });
    } catch (e) {
      return res.status(400).json({ message: 'Invalid prompt ID.' });
    }

    if (result.deletedCount === 0) {
      return res.status(404).json({ message: 'Prompt not found.' });
    }

    return res.json({ message: 'Prompt removed successfully.' });
  } catch (error) {
    console.error('Remove favorite error:', error);
    return res.status(500).json({ message: 'Failed to remove favorite.' });
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
    const insertResult = await usersCollection.insertOne({
      email: normalizedEmail,
      passwordHash,
    });

    const userId = String(insertResult.insertedId);
    const token = jwt.sign(
      { id: userId, email: normalizedEmail },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    return res.status(201).json({
      message: 'Registration successful.',
      token,
      user: {
        id: userId,
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

    const userId = String(user._id);
    const token = jwt.sign(
      { id: userId, email: user.email },
      JWT_SECRET,
      { expiresIn: JWT_EXPIRATION }
    );

    return res.status(200).json({
      message: 'Login successful.',
      token,
      user: {
        id: userId,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
});

app.get('/api/auth/user', async (req, res) => {
  try {
    const email = normalizeEmail(req.query.email);

    if (!email) {
      return res.status(400).json({ message: 'Email is required.' });
    }

    const db = await getDb();
    const usersCollection = db.collection('users');
    const user = await usersCollection.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found.' });
    }

    return res.json({
      user: {
        id: String(user._id),
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Fetch user by email error:', error);
    return res.status(500).json({ message: 'Failed to fetch user.' });
  }
});

export { app };

const isDirectRun =
  Boolean(process.argv[1]) && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  // Index setup is best-effort; the server must still start and serve auth routes
  // even if index creation fails (e.g. duplicate keys in existing data).
  ensureIndexes()
    .catch((error) => {
      console.warn('[Index setup] failed (non-fatal):', error?.message);
    })
    .finally(() => {
      app.listen(port, () => {
        console.log(`Auth API running on http://localhost:${port}`);
      });
    });
}
