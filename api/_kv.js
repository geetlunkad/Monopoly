/**
 * KV Store abstraction backed by Upstash Redis.
 *
 * When UPSTASH_REDIS_REST_URL + UPSTASH_REDIS_REST_TOKEN env vars are set,
 * uses the Upstash Redis REST API for real shared persistence across all devices.
 *
 * Without env vars (local dev), falls back to a module-level in-memory Map
 * which works fine with `vercel dev` (long-lived process) for local testing.
 *
 * ── Setup (free, 2 minutes) ──────────────────────────────────────────────────
 * 1. Go to https://console.upstash.com → Create Redis Database (free tier)
 * 2. Copy "UPSTASH_REDIS_REST_URL" and "UPSTASH_REDIS_REST_TOKEN" from the
 *    "REST API" tab in your database dashboard.
 * 3. Paste them into .env.local (for local dev) and into Vercel env vars (for prod).
 */

// ─── In-Memory Fallback ───────────────────────────────────────────────────────
// Used when Redis env vars are not configured. Sufficient for local single-machine testing.

const _mem = new Map();
const _memExpiry = new Map();

const memKV = {
  async get(key) {
    const expiry = _memExpiry.get(key);
    if (expiry && Date.now() > expiry) {
      _mem.delete(key);
      _memExpiry.delete(key);
      return null;
    }
    const v = _mem.get(key);
    return v !== undefined ? JSON.parse(JSON.stringify(v)) : null;
  },

  async set(key, value, opts) {
    _mem.set(key, value);
    if (opts?.ex) {
      _memExpiry.set(key, Date.now() + opts.ex * 1000);
    }
    return 'OK';
  },

  async del(key) {
    _mem.delete(key);
    _memExpiry.delete(key);
    return 1;
  }
};

// ─── Redis Client Singleton ───────────────────────────────────────────────────

let _redis = null;

export async function getKV() {
  if (_redis) return _redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) {
    try {
      const { Redis } = await import('@upstash/redis');
      _redis = new Redis({ url, token });
      console.log('[KV] Connected to Upstash Redis');
    } catch (err) {
      console.warn('[KV] @upstash/redis unavailable, using in-memory fallback:', err.message);
      _redis = memKV;
    }
  } else {
    console.warn('[KV] No UPSTASH_REDIS_REST_URL/TOKEN found — using in-memory store (local dev mode).\n    For real multiplayer across devices, set these vars (see .env.example).');
    _redis = memKV;
  }

  return _redis;
}

// ─── Default Users (seeded on first request) ──────────────────────────────────

export const DEFAULT_USERS = [
  { id: 'usr_admin', username: 'admin', password: 'adminpassword', role: 'ADMIN', avatar: '👑', banned: false, createdAt: 0 },
  { id: 'usr_ge',    username: 'GE',    password: 'geetelectric',  role: 'ADMIN', avatar: '🚀', banned: false, createdAt: 0 }
];

export async function getUsers(kv) {
  const users = await kv.get('monopoly:users');
  if (!users || users.length === 0) {
    await kv.set('monopoly:users', DEFAULT_USERS);
    return [...DEFAULT_USERS];
  }
  return users;
}

export async function saveUsers(kv, users) {
  await kv.set('monopoly:users', users);
}
