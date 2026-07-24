/**
 * MultiplayerManager — Vercel KV-backed Real-Time Sync
 *
 * Architecture:
 *   - Rooms are created/joined via REST API (/api/rooms/create, /api/rooms/join)
 *   - Full game state is stored in Vercel KV (Redis), keyed by room code
 *   - All clients poll /api/rooms/state?code=XXX every POLL_INTERVAL ms
 *   - The active player pushes new state after every action via POST /api/rooms/state
 *   - Version numbers prevent stale overwrites (optimistic concurrency control)
 */

const POLL_INTERVAL = 1500; // ms

export class MultiplayerManager {
  constructor(gameEngine) {
    this.engine = gameEngine;
    this.roomCode = null;
    this.isHost = false;
    this._token = null;
    this._pollTimer = null;
    this._version = 0;
    this._pushing = false;

    // Callbacks
    this.onStateSynced = null;     // (gameState) => void — called on every incoming state update
    this.onPlayerJoined = null;    // (player) => void
    this.onError = null;           // (message) => void

    this._listeners = [];
  }

  // ── Setup ─────────────────────────────────────────────────────────────────

  setToken(token) {
    this._token = token;
  }

  get _headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this._token}`
    };
  }

  // ── Room Lifecycle ────────────────────────────────────────────────────────

  /**
   * Create a new room and become the host.
   * @returns {string} roomCode
   */
  async createRoom(user) {
    const res = await fetch('/api/rooms/create', {
      method: 'POST',
      headers: this._headers,
      body: JSON.stringify({ hostName: user.username })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to create room');

    this.roomCode = data.roomCode;
    this.isHost = true;
    this._version = data.room.version;

    // Sync local engine with server player list
    this._applyRoomPlayers(data.room.players);

    this._startPolling();
    return data.roomCode;
  }

  /**
   * Join an existing room by code.
   */
  async joinRoom(roomCode, user) {
    const code = (roomCode || '').trim().toUpperCase();
    const res = await fetch('/api/rooms/join', {
      method: 'POST',
      headers: this._headers,
      body: JSON.stringify({ roomCode: code })
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to join room');

    this.roomCode = code;
    this.isHost = data.room.hostId === user.id;
    this._version = data.room.version;

    // Apply server room state to local engine
    if (data.room.gameState) {
      this._applySerializedState(data.room.gameState);
    } else {
      this._applyRoomPlayers(data.room.players);
    }

    this._startPolling();
    return data.room;
  }

  // ── Polling ───────────────────────────────────────────────────────────────

  _startPolling() {
    this._stopPolling();
    // Immediate first poll, then interval
    this._poll();
    this._pollTimer = setInterval(() => this._poll(), POLL_INTERVAL);
  }

  _stopPolling() {
    if (this._pollTimer) {
      clearInterval(this._pollTimer);
      this._pollTimer = null;
    }
  }

  async _poll() {
    if (!this.roomCode) return;
    try {
      const res = await fetch(`/api/rooms/state?code=${this.roomCode}`);
      if (!res.ok) return;

      const room = await res.json();

      // Only apply if server has newer state than what we have
      if (room.version > this._version) {
        this._version = room.version;

        if (room.gameState) {
          this._applySerializedState(room.gameState);
        } else {
          this._applyRoomPlayers(room.players);
        }

        if (this.onStateSynced) {
          this.onStateSynced(room.gameState || { players: room.players, status: room.status });
        }

        this._notify();
      }
    } catch (err) {
      // Network blips are normal — don't spam console
    }
  }

  // ── State Push ────────────────────────────────────────────────────────────

  /**
   * Serialize local engine state and push to server.
   * Debounced — if a push is in-flight, skip.
   */
  async broadcastState() {
    if (!this.roomCode || this._pushing) return;
    this._pushing = true;

    const state = this._getSerializedState();
    const nextVersion = this._version + 1;

    try {
      const res = await fetch('/api/rooms/state', {
        method: 'POST',
        headers: this._headers,
        body: JSON.stringify({
          roomCode: this.roomCode,
          gameState: state,
          version: nextVersion
        })
      });

      const data = await res.json();

      if (res.status === 409) {
        // Version conflict — re-poll and try again
        console.warn('[MP] Version conflict, re-polling...');
        await this._poll();
      } else if (res.ok) {
        this._version = data.version;
      }
    } catch (err) {
      console.warn('[MP] Push failed:', err.message);
    } finally {
      this._pushing = false;
      this._notify();
    }
  }

  // ── Game Actions ──────────────────────────────────────────────────────────

  /**
   * Execute a game action locally, then push new state.
   */
  sendAction(action, payload) {
    this._executeAction(action, payload);
    this.broadcastState();
  }

  _executeAction(action, payload) {
    const activePlayer = this.engine.getCurrentPlayer();

    if (action === 'START_GAME') {
      this.engine.startGame();
    } else if (action === 'ROLL_DICE') {
      return this.engine.rollDice();
    } else if (action === 'END_TURN') {
      this.engine.nextTurn();
    } else if (action === 'BUY_PROPERTY') {
      const p = payload?.playerId
        ? this.engine.players.find(pl => pl.id === payload.playerId)
        : activePlayer;
      if (p) this.engine.buyProperty(p, payload.tileId);
    } else if (action === 'BUILD_HOUSE') {
      const p = payload?.playerId
        ? this.engine.players.find(pl => pl.id === payload.playerId)
        : activePlayer;
      if (p) this.engine.buildHouse(p, payload.tileId);
    } else if (action === 'SELL_HOUSE') {
      const p = payload?.playerId
        ? this.engine.players.find(pl => pl.id === payload.playerId)
        : activePlayer;
      if (p) this.engine.sellHouse(p, payload.tileId);
    } else if (action === 'MORTGAGE') {
      const p = payload?.playerId
        ? this.engine.players.find(pl => pl.id === payload.playerId)
        : activePlayer;
      if (p) this.engine.mortgageProperty(p, payload.tileId);
    } else if (action === 'UNMORTGAGE') {
      const p = payload?.playerId
        ? this.engine.players.find(pl => pl.id === payload.playerId)
        : activePlayer;
      if (p) this.engine.unmortgageProperty(p, payload.tileId);
    } else if (action === 'BANKRUPT') {
      const p = payload?.playerId
        ? this.engine.players.find(pl => pl.id === payload.playerId)
        : activePlayer;
      if (p) this.engine.declareBankruptcy(p);
    }
  }

  addAIBot() {
    if (this.engine.players.length >= 8) return false;
    const botNum = this.engine.players.filter(p => p.isAI).length + 1;
    const botNames = ['CyberBot', 'NexusAI', 'QuantumBot', 'VortexAI'];
    const botName = botNames[botNum - 1] || `Bot #${botNum}`;
    const colors = ['#10b981', '#ef4444', '#a855f7', '#f59e0b'];
    const color = colors[this.engine.players.length % colors.length];
    this.engine.addPlayer({ id: 'bot_' + Date.now(), name: botName, isAI: true, color });
    this.broadcastState();
    return true;
  }

  // ── State Serialization ───────────────────────────────────────────────────

  _getSerializedState() {
    return {
      roomCode: this.roomCode,
      status: this.engine.status,
      players: this.engine.players,
      currentTurnIndex: this.engine.currentTurnIndex,
      hasRolled: this.engine.hasRolled,
      activeTrade: this.engine.tradeManager ? this.engine.tradeManager.activeTrade : null,
      boardState: this.engine.boardState,
      freeParkingJackpot: this.engine.freeParkingJackpot,
      rules: this.engine.rules,
      logs: this.engine.logs
    };
  }

  _applySerializedState(state) {
    if (!state) return;

    if (state.roomCode) this.roomCode = state.roomCode;
    this.engine.status = state.status || 'LOBBY';

    if (Array.isArray(state.players)) {
      // Deduplicate by id
      const seen = new Set();
      this.engine.players = state.players.filter(p => {
        if (!p || !p.id || seen.has(p.id)) return false;
        seen.add(p.id);
        return true;
      });
    }

    this.engine.currentTurnIndex = state.currentTurnIndex ?? 0;
    this.engine.hasRolled = state.hasRolled ?? false;
    if (this.engine.tradeManager) {
      this.engine.tradeManager.activeTrade = state.activeTrade || null;
    }
    this.engine.boardState = state.boardState || {};
    this.engine.freeParkingJackpot = state.freeParkingJackpot ?? 0;
    if (state.rules) this.engine.rules = { ...this.engine.rules, ...state.rules };
    this.engine.logs = state.logs || [];

    // Update room code display
    const el = document.getElementById('inviteCodeText');
    if (el && this.roomCode) el.innerText = this.roomCode;
  }

  _applyRoomPlayers(players) {
    if (!Array.isArray(players)) return;
    const seen = new Set();
    this.engine.players = players.filter(p => {
      if (!p || !p.id || seen.has(p.id)) return false;
      seen.add(p.id);
      return true;
    });
  }

  // ── Pub/Sub ───────────────────────────────────────────────────────────────

  subscribe(callback) {
    this._listeners.push(callback);
  }

  _notify() {
    const state = this._getSerializedState();
    this._listeners.forEach(cb => cb(state));
  }
}
