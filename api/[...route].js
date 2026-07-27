import { app, ensureIndexes } from '../server/index.js';

let initPromise;

export default async function handler(req, res) {
  try {
    initPromise ??= ensureIndexes();
    await initPromise;

    const route = req.query.route;
    const path = Array.isArray(route) ? route.join('/') : typeof route === 'string' ? route : '';
    req.url = path ? `/api/${path}` : '/api/health';

    return app(req, res);
  } catch (error) {
    console.error('Server initialization error:', error);
    const message = error instanceof Error ? error.message : 'Server initialization failed.';
    return res.status(500).json({ message });
  }
}
