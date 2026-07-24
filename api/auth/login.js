/**
 * POST /api/auth/login
 * Body: { username, password }
 * Returns: { token, user }
 *
 * - GE / admin require their specific passwords.
 * - Any other username: auto-registers on first login (password stored).
 * - Subsequent logins for regular players check stored password.
 */

import { randomUUID } from 'crypto';
import { getKV, getUsers, saveUsers } from '../_kv.js';
import { setCORS } from '../_auth.js';

export default async function handler(req, res) {
  setCORS(res);

  // Handle CORS pre-flight
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { username, password } = req.body || {};

  if (!username || !username.trim()) {
    return res.status(400).json({ error: 'Username is required' });
  }

  const cleanName = username.trim();
  const kv = await getKV();
  const users = await getUsers(kv);

  let user = users.find(u => u.username.toLowerCase() === cleanName.toLowerCase());

  if (!user) {
    // ── Auto-register new player ──────────────────────────────────────────────
    // Prevent squatting on GE username
    if (cleanName.toLowerCase() === 'ge' || cleanName.toLowerCase() === 'admin') {
      return res.status(401).json({ error: `Incorrect password for "${cleanName}"` });
    }

    const newUser = {
      id: 'usr_' + Date.now(),
      username: cleanName,
      password: password || '',
      role: 'PLAYER',
      avatar: '🎲',
      banned: false,
      createdAt: Date.now()
    };

    users.push(newUser);
    await saveUsers(kv, users);
    user = newUser;

  } else {
    // ── Validate existing user ────────────────────────────────────────────────
    if (user.banned) {
      return res.status(403).json({ error: 'This account has been banned by the admin.' });
    }

    // Strict password check for GE and admin
    if ((user.role === 'ADMIN' || user.username.toLowerCase() === 'ge') && password !== user.password) {
      return res.status(401).json({ error: `Incorrect password for "${user.username}"` });
    }

    // For regular players: if a password was set, enforce it; otherwise allow login
    if (user.password && password && password !== user.password) {
      return res.status(401).json({ error: 'Incorrect password.' });
    }
  }

  // ── Issue session token ───────────────────────────────────────────────────
  const token = randomUUID();
  const session = {
    id: user.id,
    username: user.username,
    role: user.role,
    avatar: user.avatar
  };

  // 24 hour TTL
  await kv.set(`monopoly:session:${token}`, session, { ex: 86400 });

  return res.status(200).json({ token, user: session });
}
