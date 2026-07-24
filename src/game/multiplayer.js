/**
 * MultiplayerManager — Single Global Session
 *
 * There is exactly ONE game room: "GLOBAL".
 * All players auto-join it on login. No room codes needed.
 * GE is the only one who can start the game or reset the session.
 *
 * Sync model:
 *   - All clients poll /api/rooms/state?code=GLOBAL every 1.5s
 *   - The active player pushes state after every action via POST /api/rooms/state
 *   - Version numbers prevent stale overwrites
 */

const GLOBAL_ROOM = 'GLOBAL';
const POLL_INTERVAL = 1500; // ms

export class MultiplayerManager {
  constructor(gameEngine) {
    this.engine = gameEngine;
    this.roomCode = GLOBAL_ROOM;
    this.isHost = false;
    this._token = null;
    this._pollTimer = null;
    this._version = 0;
    this._pushing = false;

    // Callbacks
    this.onStateSynced = null;   // (gameState) => void
    this._listeners = [];
  }

  // ── Auth ──────────────────────────────────────────────────────────────────

  setToken(token) {
    this._token = token;
  }

  get _headers() {
    return {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this._token}`
    };
  }

  // ── Join Global Room ──────────────────────────────────────────────────────

  /**
   * Called for every player (including GE) right after login.
   * Joins the single global room or creates it if it doesn't exist.
   */
  async joinGlobalRoom(user) {
    this.isHost = user.username === 'GE' || user.role === 'ADMIN';

    const res = await fetch('/api/rooms/join', {
      method: 'POST',
      headers: this._headers,
      body: JSON.stringify({})
    });

    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to join global room');

    this._version = data.room.version;
    this.roomCode = GLOBAL_ROOM;

    // Sync local engine with server state
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
    try {
      const res = await fetch(`/api/rooms/state?code=${GLOBAL_ROOM}`);
      if (!res.ok) return;

      const room = await res.json();

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
    } catch (_) {
      // Network blip — ignore
    }
  }

  // ── State Push ────────────────────────────────────────────────────────────

  async broadcastState() {
    if (this._pushing) return;
    this._pushing = true;

    const state = this._getSerializedState();
    const nextVersion = this._version + 1;

    try {
      const res = await fetch('/api/rooms/state', {
        method: 'POST',
        headers: this._headers,
        body: JSON.stringify({
          roomCode: GLOBAL_ROOM,
          gameState: state,
          version: nextVersion
        })
      });

      const data = await res.json();

      if (res.status === 409) {
        // Version conflict — re-poll then retry
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

  // ── Actions ───────────────────────────────────────────────────────────────

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
      const p = payload?.playerId ? this.engine.players.find(pl => pl.id === payload.playerId) : activePlayer;
      if (p) this.engine.buyProperty(p, payload.tileId);
    } else if (action === 'BUILD_HOUSE') {
      const p = payload?.playerId ? this.engine.players.find(pl => pl.id === payload.playerId) : activePlayer;
      if (p) this.engine.buildHouse(p, payload.tileId);
    } else if (action === 'SELL_HOUSE') {
      const p = payload?.playerId ? this.engine.players.find(pl => pl.id === payload.playerId) : activePlayer;
      if (p) this.engine.sellHouse(p, payload.tileId);
    } else if (action === 'MORTGAGE') {
      const p = payload?.playerId ? this.engine.players.find(pl => pl.id === payload.playerId) : activePlayer;
      if (p) this.engine.mortgageProperty(p, payload.tileId);
    } else if (action === 'UNMORTGAGE') {
      const p = payload?.playerId ? this.engine.players.find(pl => pl.id === payload.playerId) : activePlayer;
      if (p) this.engine.unmortgageProperty(p, payload.tileId);
    } else if (action === 'BANKRUPT') {
      const p = payload?.playerId ? this.engine.players.find(pl => pl.id === payload.playerId) : activePlayer;
      if (p) this.engine.declareBankruptcy(p);
    }
  }

  addAIBot() {
    if (this.engine.players.length >= 8) return false;
    const botNum = this.engine.players.filter(p => p.isAI).length + 1;
    const botNames = ['CyberBot', 'NexusAI', 'QuantumBot', 'VortexAI'];
    const botName = botNames[botNum - 1] || `Bot #${botNum}`;
    const colors = ['#10b981', '#ef4444', '#a855f7', '#f59e0b'];
    const color = colors[(this.engine.players.length) % colors.length];
    this.engine.addPlayer({ id: 'bot_' + Date.now(), name: botName, isAI: true, color });
    this.broadcastState();
    return true;
  }

  // ── State Serialization ───────────────────────────────────────────────────

  _getSerializedState() {
    return {
      roomCode: GLOBAL_ROOM,
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

    this.engine.status = state.status || 'LOBBY';

    if (Array.isArray(state.players)) {
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
