/**
 * GET  /api/rooms/state?code=XXXXXX
 *      Returns the current room state (for polling).
 *      No auth required for polling — just need the room code.
 *
 * POST /api/rooms/state
 *      Header: Authorization: Bearer <token>
 *      Body: { roomCode, gameState, version }
 *      Pushes a new game state to the room.
 *      Optimistic concurrency: rejects if server version > client's expected version.
 *      Returns: { ok, version }
 */

import { validateToken, setCORS } from '../_auth.js';
import { getKV } from '../_kv.js';

export default async function handler(req, res) {
  setCORS(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  const kv = await getKV();

  // ── GET: Poll current state ─────────────────────────────────────────────────
  if (req.method === 'GET') {
    const code = (req.query.code || '').trim().toUpperCase();
    if (!code) return res.status(400).json({ error: 'Room code required' });

    const room = await kv.get(`monopoly:room:${code}`);
    if (!room) return res.status(404).json({ error: 'Room not found' });

    return res.status(200).json(room);
  }

  // ── POST: Push new state ────────────────────────────────────────────────────
  if (req.method === 'POST') {
    const auth = await validateToken(req);
    if (auth.error) return res.status(auth.status).json({ error: auth.error });

    const { user } = auth;
    const { roomCode, gameState, version } = req.body || {};

    if (!roomCode) return res.status(400).json({ error: 'roomCode required' });
    if (typeof version !== 'number') return res.status(400).json({ error: 'version (number) required' });
    if (!gameState) return res.status(400).json({ error: 'gameState required' });

    const code = roomCode.trim().toUpperCase();
    const room = await kv.get(`monopoly:room:${code}`);

    if (!room) return res.status(404).json({ error: 'Room not found' });

    // ── Membership check ──────────────────────────────────────────────────────
    const isMember = room.players.some(p => p.id === user.id);
    if (!isMember) return res.status(403).json({ error: 'You are not in this room' });

    // ── Optimistic concurrency check ──────────────────────────────────────────
    // Accept if: client's version === server's current version (next write)
    // OR if client's version > server version (they're ahead — allow and update)
    if (version < room.version) {
      // Client is behind — reject so they poll first
      return res.status(409).json({
        error: 'Version conflict. Poll first to get latest state.',
        serverVersion: room.version
      });
    }

    const newVersion = Math.max(room.version, version) + 1;

    const updatedRoom = {
      ...room,
      version: newVersion,
      updatedAt: Date.now(),
      status: gameState.status || room.status,
      players: gameState.players || room.players,
      gameState
    };

    await kv.set(`monopoly:room:${code}`, updatedRoom, { ex: 86400 });

    return res.status(200).json({ ok: true, version: newVersion });
  }

  return res.status(405).json({ error: 'Method not allowed' });
}
