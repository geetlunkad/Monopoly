/**
 * POST /api/rooms/join
 * Header: Authorization: Bearer <token>
 * Body: { roomCode }
 * Returns: { room }
 *
 * Joins an existing room. If the player is already in the room,
 * returns the current room state (idempotent). Returns 404 if room not found,
 * 409 if room is full or game already started.
 */

import { validateToken, setCORS } from '../_auth.js';
import { getKV } from '../_kv.js';

const PLAYER_COLORS = ['#f59e0b', '#10b981', '#ef4444', '#a855f7', '#ec4899', '#f97316'];

export default async function handler(req, res) {
  setCORS(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await validateToken(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });

  const { user } = auth;
  const { roomCode } = req.body || {};

  if (!roomCode || !roomCode.trim()) {
    return res.status(400).json({ error: 'Room code is required' });
  }

  const code = roomCode.trim().toUpperCase();
  const kv = await getKV();
  const room = await kv.get(`monopoly:room:${code}`);

  if (!room) {
    return res.status(404).json({ error: `Room "${code}" not found. Ask the host to share their room code.` });
  }

  // Already in room — idempotent rejoin
  const existing = room.players.find(p => p.id === user.id);
  if (existing) {
    return res.status(200).json({ room });
  }

  // Max 8 players
  if (room.players.length >= 8) {
    return res.status(409).json({ error: 'Room is full (max 8 players).' });
  }

  // Can't join a game that already started
  if (room.status === 'PLAYING') {
    return res.status(409).json({ error: 'Game has already started. You cannot join mid-game.' });
  }

  // Assign a color not already taken
  const takenColors = new Set(room.players.map(p => p.color));
  const color = PLAYER_COLORS.find(c => !takenColors.has(c)) || '#6366f1';

  const newPlayer = {
    id: user.id,
    name: user.username,
    isAI: false,
    isHost: false,
    color,
    money: 1500,
    position: 0,
    inJail: false,
    jailTurns: 0,
    bankrupt: false,
    properties: [],
    getOutOfJailCards: 0
  };

  room.players.push(newPlayer);
  room.version += 1;
  room.updatedAt = Date.now();

  await kv.set(`monopoly:room:${code}`, room, { ex: 86400 });

  return res.status(200).json({ room });
}
