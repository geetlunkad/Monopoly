/**
 * Shared authentication helper for API route handlers.
 * Validates Bearer tokens from the Authorization header.
 */

import { getKV } from './_kv.js';

/**
 * Validates the Authorization: Bearer <token> header.
 * Returns { user } on success or { error, status } on failure.
 */
export async function validateToken(req) {
  const authHeader = req.headers['authorization'] || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.slice(7).trim() : null;

  if (!token) {
    return { error: 'Authorization token required', status: 401 };
  }

  const kv = await getKV();
  const user = await kv.get(`monopoly:session:${token}`);

  if (!user) {
    return { error: 'Invalid or expired session token', status: 401 };
  }

  return { user, token };
}

/**
 * Standard JSON error response helper.
 */
export function jsonError(res, status, message) {
  return res.status(status).json({ error: message });
}

/**
 * Add permissive CORS headers (same-origin in prod, any origin in dev).
 */
export function setCORS(res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
}
