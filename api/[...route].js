import { app, ensureIndexes } from '../server/index.js';

let initPromise;

export default async function handler(req, res) {
  try {
    initPromise ??= ensureIndexes();
    await initPromise;
    return app(req, res);
  } catch (error) {
    console.error('Server initialization error:', error);
    return res.status(500).json({ message: 'Server initialization failed.' });
  }
}
