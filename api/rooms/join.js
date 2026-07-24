/**
 * POST /api/rooms/join
 * Header: Authorization: Bearer <token>
 * Body: {} (no room code needed — there is only ONE global session)
 *
 * All players automatically join the single global game room.
 * If the room doesn't exist yet (GE hasn't logged in), it is created here.
 * Idempotent — safe to call multiple times for the same player.
 */

import { validateToken, setCORS } from '../_auth.js';
import { getKV } from '../_kv.js';

const GLOBAL_ROOM = 'GLOBAL';

const PLAYER_COLORS = ['#38bdf8', '#f59e0b', '#10b981', '#ef4444', '#a855f7', '#ec4899', '#f97316', '#84cc16'];

export default async function handler(req, res) {
  setCORS(res);
  if (req.method === 'OPTIONS') return res.status(200).end();

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const auth = await validateToken(req);
  if (auth.error) return res.status(auth.status).json({ error: auth.error });

  const { user } = auth;
  const kv = await getKV();

  let room = await kv.get(`monopoly:room:${GLOBAL_ROOM}`);

  // Create the global room if it doesn't exist yet
  if (!room) {
    const hostPlayer = {
      id: user.id,
      name: user.username,
      isAI: false,
      isHost: user.role === 'ADMIN' || user.username === 'GE',
      color: PLAYER_COLORS[0],
      money: 1500,
      position: 0,
      inJail: false,
      jailTurns: 0,
      bankrupt: false,
      properties: [],
      getOutOfJailCards: 0
    };

    room = {
      code: GLOBAL_ROOM,
      hostId: user.id,
      hostName: user.username,
      version: 1,
      status: 'LOBBY',
      createdAt: Date.now(),
      updatedAt: Date.now(),
      players: [hostPlayer],
      gameState: null
    };

    await kv.set(`monopoly:room:${GLOBAL_ROOM}`, room, { ex: 86400 });
    return res.status(200).json({ room, joined: true });
  }

  // Already in room — idempotent rejoin, refresh updatedAt
  const existing = room.players.find(p => p.id === user.id);
  if (existing) {
    room.updatedAt = Date.now();
    await kv.set(`monopoly:room:${GLOBAL_ROOM}`, room, { ex: 86400 });
    return res.status(200).json({ room, joined: false });
  }

  // Can't join a game already in progress
  if (room.status === 'PLAYING') {
    return res.status(409).json({ error: 'A game is already in progress. Please wait for the next session.' });
  }

  // Max 8 players
  if (room.players.length >= 8) {
    return res.status(409).json({ error: 'Room is full (max 8 players).' });
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

  await kv.set(`monopoly:room:${GLOBAL_ROOM}`, room, { ex: 86400 });

  return res.status(200).json({ room, joined: true });
}
