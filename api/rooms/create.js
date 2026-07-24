/**
 * POST /api/rooms/create
 * Header: Authorization: Bearer <token>
 * Body: { hostName? }
 * Returns: { roomCode, room }
 *
 * Creates a new game room. The authenticated user becomes the host.
 * Room codes are 6-character alphanumeric (e.g., "MONO-GE" or "AB12CD").
 * If the user already has an active room, it is replaced.
 */

import { validateToken, setCORS } from '../_auth.js';
import { getKV } from '../_kv.js';

function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
}

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

  // Generate a unique room code
  let roomCode;
  let attempts = 0;
  do {
    roomCode = generateRoomCode();
    attempts++;
  } while ((await kv.get(`monopoly:room:${roomCode}`)) !== null && attempts < 10);

  const now = Date.now();
  const hostPlayer = {
    id: user.id,
    name: user.username,
    isAI: false,
    isHost: true,
    color: '#38bdf8',
    money: 1500,
    position: 0,
    inJail: false,
    jailTurns: 0,
    bankrupt: false,
    properties: [],
    getOutOfJailCards: 0
  };

  const room = {
    code: roomCode,
    hostId: user.id,
    hostName: user.username,
    version: 1,
    status: 'LOBBY',
    createdAt: now,
    updatedAt: now,
    players: [hostPlayer],
    gameState: null
  };

  // Store with 24h TTL
  await kv.set(`monopoly:room:${roomCode}`, room, { ex: 86400 });

  // Track rooms by host (for reconnection)
  await kv.set(`monopoly:host:${user.id}`, roomCode, { ex: 86400 });

  return res.status(200).json({ roomCode, room });
}
