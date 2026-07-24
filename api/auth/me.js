/**
 * GET /api/auth/me
 * Header: Authorization: Bearer <token>
 * Returns: { user }
 *
 * Validates an existing session token and returns the current user info.
 */

import { validateToken, setCORS } from '../_auth.js';

export default async function handler(req, res) {
  setCORS(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const result = await validateToken(req);
  if (result.error) {
    return res.status(result.status).json({ error: result.error });
  }

  return res.status(200).json({ user: result.user });
}
