// Centralized Cloud Database Synchronization Engine (100% Free Central Cloud Server API)

const CENTRAL_CLOUD_DB_URL = 'https://api.restful-api.dev/objects/ff8081819f7e10ae019f92da7e851e0b';
const LOCAL_CACHE_KEY = 'monopoly_central_server_state_v1';

export class MultiplayerManager {
  constructor(gameEngine) {
    this.engine = gameEngine;
    this.roomCode = 'MONO-GE';
    this.isHost = false;
    this.listeners = [];
    this.onStateSynced = null;
    this.lastStateHash = '';
    this.isUpdatingCloud = false;

    // 1. Multi-tab local channel for instant zero-latency same-device sync
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

    // 2. High-Frequency Centralized Cloud Polling Loop (every 1.2s across all devices worldwide)
    setInterval(() => {
      this.fetchCentralCloudState();
    }, 1200);

    // Initial fetch from Central Cloud Server
    this.fetchCentralCloudState();
  }

  async fetchCentralCloudState() {
    if (this.isUpdatingCloud) return;
    try {
      const res = await fetch(CENTRAL_CLOUD_DB_URL);
      if (res.ok) {
        const json = await res.json();
        if (json && json.data) {
          const cloudState = json.data;
          const hash = JSON.stringify(cloudState);
          if (hash !== this.lastStateHash) {
            this.lastStateHash = hash;
            this.applySerializedState(cloudState);
            if (this.onStateSynced) this.onStateSynced(cloudState);
            this.notify();
          }
        }
      }
    } catch (e) {
      console.warn('Central Cloud Server fetch warning:', e);
    }
  }

  async pushCentralCloudState(state) {
    this.isUpdatingCloud = true;
    try {
      const payload = {
        name: 'MONOPOLY_GLOBAL_SESSION',
        data: state
      };
      const res = await fetch(CENTRAL_CLOUD_DB_URL, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        this.lastStateHash = JSON.stringify(state);
      }
    } catch (e) {
      console.warn('Central Cloud Server PUT warning:', e);
    } finally {
      this.isUpdatingCloud = false;
    }
  }

  async createLobby(hostUser) {
    this.roomCode = 'MONO-GE';
    this.isHost = true;

    await this.fetchCentralCloudState();

    // Register Master GE in Central Cloud Store
    this.engine.addPlayer({ id: 'usr_ge', name: 'GE', isAI: false, color: '#38bdf8' });
    this.broadcastState();
    return this.roomCode;
  }

  async joinLobby(roomCode, user) {
    this.roomCode = (roomCode || 'MONO-GE').trim().toUpperCase();
    this.isHost = false;

    // Fetch latest Central Cloud DB state before joining
    await this.fetchCentralCloudState();

    // Register guest player in Central Cloud Store
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
    localStorage.setItem(LOCAL_CACHE_KEY, JSON.stringify(state));

    if (this.channel) {
      try {
        this.channel.postMessage({ type: 'CENTRAL_STATE_SYNC', state });
      } catch (e) {}
    }

    this.pushCentralCloudState(state);
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
        if (p && p.name) {
          const key = String(p.name).trim().toLowerCase();
          if (!seenNames.has(key)) {
            seenNames.add(key);
            uniquePlayers.push(p);
          }
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
