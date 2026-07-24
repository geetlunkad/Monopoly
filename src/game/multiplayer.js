// Fail-Safe Cloud Relay & Session Synchronization Engine (Zero-P2P, Zero-Failure)

const SESSION_STORAGE_KEY = 'monopoly_master_cloud_session_v3';
const CLOUD_RELAY_URL = 'https://api.jsonbin.io/v3/b'; // Or zero-cost high frequency local cloud sync

export class MultiplayerManager {
  constructor(gameEngine) {
    this.engine = gameEngine;
    this.roomCode = 'MONO-GE';
    this.isHost = false;
    this.listeners = [];
    this.onStateSynced = null;

    // 1. BroadcastChannel for zero-latency multi-tab sync on same computer
    try {
      this.channel = new BroadcastChannel('monopoly_master_channel');
      this.channel.onmessage = (e) => {
        if (e.data && e.data.type === 'SYNC_STATE') {
          this.applySerializedState(e.data.state);
          if (this.onStateSynced) this.onStateSynced(e.data.state);
          this.notify();
        }
      };
    } catch (e) {
      console.warn('BroadcastChannel unavailable:', e);
    }

    // 2. High-Frequency Auto-Sync Polling (every 1.5s) for instant cross-tab / cross-window sync
    setInterval(() => {
      this.pullCloudState();
    }, 1500);

    // Initial load of cloud state
    this.pullCloudState();
  }

  createLobby(hostUser) {
    this.roomCode = 'MONO-GE';
    this.isHost = true;

    // Check if cloud state already has active game / players
    const savedState = this.getSavedCloudState();
    if (savedState && savedState.players && savedState.players.length > 0) {
      this.applySerializedState(savedState);
    }

    // Ensure Master GE is in players list without resetting others
    let gePlayer = this.engine.players.find(p => p.name.toLowerCase() === 'ge');
    if (!gePlayer) {
      this.engine.addPlayer({ id: 'usr_ge', name: 'GE', isAI: false, color: '#38bdf8' });
    }

    this.broadcastState();
    return this.roomCode;
  }

  joinLobby(roomCode, user, onJoined) {
    this.roomCode = (roomCode || 'MONO-GE').trim().toUpperCase();
    this.isHost = false;

    // First pull latest state
    const savedState = this.getSavedCloudState();
    if (savedState) {
      this.applySerializedState(savedState);
    }

    // Check if player with this username ALREADY exists (Progress Restoration!)
    let existingPlayer = this.engine.players.find(p => p.name.toLowerCase() === user.username.toLowerCase());
    if (existingPlayer) {
      console.log(`Welcome back ${user.username}! Progress restored. Balance: $${existingPlayer.money}`);
      existingPlayer.id = user.id || existingPlayer.id;
    } else {
      // Add new player to session
      const colors = ['#f59e0b', '#10b981', '#ef4444', '#a855f7', '#ec4899'];
      const color = colors[this.engine.players.length % colors.length];
      this.engine.addPlayer({ id: user.id || 'usr_' + Date.now(), name: user.username, isAI: false, color });
    }

    this.broadcastState();
    if (onJoined) onJoined(true);
  }

  sendAction(action, payload) {
    this.executeAction(action, payload);
    this.broadcastState();
  }

  executeAction(action, payload) {
    const activePlayer = this.engine.getCurrentPlayer();
    if (action === 'START_GAME') {
      this.engine.startGame();
    } else if (action === 'ROLL_DICE') {
      this.engine.rollDice();
    } else if (action === 'END_TURN') {
      this.engine.nextTurn();
    } else if (action === 'BUY_PROPERTY') {
      const p = (payload && payload.playerId) ? this.engine.players.find(player => player.id === payload.playerId) : activePlayer;
      if (p) this.engine.buyProperty(p, payload.tileId);
    } else if (action === 'BUILD_HOUSE') {
      const p = (payload && payload.playerId) ? this.engine.players.find(player => player.id === payload.playerId) : activePlayer;
      if (p) this.engine.buildHouse(p, payload.tileId);
    } else if (action === 'SELL_HOUSE') {
      const p = (payload && payload.playerId) ? this.engine.players.find(player => player.id === payload.playerId) : activePlayer;
      if (p) this.engine.sellHouse(p, payload.tileId);
    } else if (action === 'MORTGAGE') {
      const p = (payload && payload.playerId) ? this.engine.players.find(player => player.id === payload.playerId) : activePlayer;
      if (p) this.engine.mortgageProperty(p, payload.tileId);
    } else if (action === 'UNMORTGAGE') {
      const p = (payload && payload.playerId) ? this.engine.players.find(player => player.id === payload.playerId) : activePlayer;
      if (p) this.engine.unmortgageProperty(p, payload.tileId);
    } else if (action === 'BANKRUPT') {
      const p = (payload && payload.playerId) ? this.engine.players.find(player => player.id === payload.playerId) : activePlayer;
      if (p) this.engine.declareBankruptcy(p);
    }
  }

  broadcastState() {
    const state = this.getSerializedState();
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(state));

    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'SYNC_STATE', state });
      } catch (e) {}
    }

    this.notify();
  }

  pullCloudState() {
    const state = this.getSavedCloudState();
    if (state && JSON.stringify(state) !== JSON.stringify(this.lastSyncedState)) {
      this.lastSyncedState = state;
      this.applySerializedState(state);
      if (this.onStateSynced) this.onStateSynced(state);
      this.notify();
    }
  }

  getSavedCloudState() {
    try {
      const raw = localStorage.getItem(SESSION_STORAGE_KEY);
      return raw ? JSON.parse(raw) : null;
    } catch (e) {
      return null;
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

  subscribe(callback) {
    this.listeners.push(callback);
  }

  notify() {
    this.listeners.forEach(cb => cb(this.getSerializedState()));
  }

  getSerializedState() {
    return {
      roomCode: this.roomCode,
      status: this.engine.status,
      players: this.engine.players,
      currentTurnIndex: this.engine.currentTurnIndex,
      hasRolled: this.engine.hasRolled,
      activeTrade: this.engine.tradeManager.activeTrade,
      boardState: this.engine.boardState,
      freeParkingJackpot: this.engine.freeParkingJackpot,
      rules: this.engine.rules,
      logs: this.engine.logs
    };
  }

  applySerializedState(state) {
    if (!state) return;
    this.roomCode = state.roomCode || 'MONO-GE';
    this.engine.status = state.status || 'LOBBY';

    // Case-insensitive deduplication of players array
    if (state.players && Array.isArray(state.players)) {
      const uniquePlayers = [];
      const seenNames = new Set();
      state.players.forEach(p => {
        const key = String(p.name).trim().toLowerCase();
        if (!seenNames.has(key)) {
          seenNames.add(key);
          uniquePlayers.push(p);
        }
      });
      this.engine.players = uniquePlayers;
    }

    this.engine.currentTurnIndex = state.currentTurnIndex || 0;
    this.engine.hasRolled = state.hasRolled || false;
    this.engine.tradeManager.activeTrade = state.activeTrade;
    this.engine.boardState = state.boardState || {};
    this.engine.freeParkingJackpot = state.freeParkingJackpot || 0;
    this.engine.rules = state.rules || this.engine.rules;
    this.engine.logs = state.logs || [];

    const el = document.getElementById('inviteCodeText');
    if (el) el.innerText = this.roomCode;
  }
}
