import { app, ensureIndexes } from '../server/index.js';

let initPromise;

export default async function handler(req, res) {
  const route = req.query.route;
  const path = Array.isArray(route) ? route.join('/') : typeof route === 'string' ? route : '';
  req.url = path ? `/api/${path}` : '/api/health';

  // Index setup is best-effort: it must never block auth or data endpoints.
  // Failures (e.g. Mongo unavailable, duplicate keys from pre-existing data)
  // are logged and ignored so /api/auth/login and /api/auth/register still run.
  try {
    initPromise ??= ensureIndexes().catch((error) => {
      console.warn('[Index setup] skipped (non-fatal):', error instanceof Error ? error.message : error);
    });
    await initPromise;
  } catch (error) {
    console.warn('[Index setup] failed (non-fatal):', error instanceof Error ? error.message : error);
  }

  return app(req, res);
}
