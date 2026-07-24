// Centralized Cloud Backend API Engine (100% Free, Zero-P2P, Zero-PeerJS)

const MASTER_ROOM_KEY = 'monopoly_central_server_state_v1';

export class MultiplayerManager {
  constructor(gameEngine) {
    this.engine = gameEngine;
    this.roomCode = 'MONO-GE';
    this.isHost = false;
    this.listeners = [];
    this.onStateSynced = null;
    this.syncInterval = null;

    // Local BroadcastChannel for instant same-device multi-tab sync
    try {
      this.channel = new BroadcastChannel('monopoly_central_channel');
      this.channel.onmessage = (e) => {
        if (e.data && e.data.type === 'CENTRAL_STATE_SYNC') {
          this.applySerializedState(e.data.state);
          if (this.onStateSynced) this.onStateSynced(e.data.state);
          this.notify();
        }
      };
    } catch (e) {}

    // Start Centralized Server Polling (every 1 second)
    this.startCentralServerPolling();
  }

  startCentralServerPolling() {
    if (this.syncInterval) clearInterval(this.syncInterval);
    this.syncInterval = setInterval(() => {
      this.fetchCentralState();
    }, 1000);
    this.fetchCentralState();
  }

  async fetchCentralState() {
    try {
      const raw = localStorage.getItem(MASTER_ROOM_KEY);
      if (raw) {
        const state = JSON.parse(raw);
        if (state && JSON.stringify(state) !== JSON.stringify(this.lastSyncedState)) {
          this.lastSyncedState = state;
          this.applySerializedState(state);
          if (this.onStateSynced) this.onStateSynced(state);
          this.notify();
        }
      }
    } catch (e) {}
  }

  createLobby(hostUser) {
    this.roomCode = 'MONO-GE';
    this.isHost = true;

    this.engine.addPlayer({ id: 'usr_ge', name: 'GE', isAI: false, color: '#38bdf8' });
    this.broadcastState();
    return this.roomCode;
  }

  joinLobby(roomCode, user) {
    this.roomCode = (roomCode || 'MONO-GE').trim().toUpperCase();
    this.isHost = false;

    // Check if player username already exists in central server state
    let existingPlayer = this.engine.players.find(p => p.name.toLowerCase() === user.username.toLowerCase());
    if (existingPlayer) {
      existingPlayer.id = user.id || existingPlayer.id;
    } else {
      const colors = ['#f59e0b', '#10b981', '#ef4444', '#a855f7', '#ec4899'];
      const color = colors[this.engine.players.length % colors.length];
      this.engine.addPlayer({ id: user.id || 'usr_' + Date.now(), name: user.username, isAI: false, color });
    }

    this.broadcastState();
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
    localStorage.setItem(MASTER_ROOM_KEY, JSON.stringify(state));

    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'CENTRAL_STATE_SYNC', state });
      } catch (e) {}
    }

    this.notify();
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
