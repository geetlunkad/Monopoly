// Hybrid WebRTC + BroadcastChannel Online Multiplayer Synchronization Engine

const Peer = window.Peer || class {};
const SESSION_STORAGE_KEY = 'monopoly_online_session_v2';

export class MultiplayerManager {
  constructor(gameEngine) {
    this.engine = gameEngine;
    this.roomCode = 'MONO-GE';
    this.isHost = false;
    this.peer = null;
    this.connections = [];
    this.hostConn = null;
    this.listeners = [];
    this.onStateSynced = null;

    // Local BroadcastChannel for instant multi-tab sync on same network
    try {
      this.channel = new BroadcastChannel('monopoly_sync_channel');
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
  }

  createLobby(hostUser) {
    this.roomCode = 'MONO-GE';
    this.isHost = true;

    // Ensure Master GE is in players list
    let gePlayer = this.engine.players.find(p => p.name === 'GE');
    if (!gePlayer) {
      this.engine.addPlayer('p_ge', 'GE', '#38bdf8', false);
    }

    this.initPeerServer(this.roomCode);
    this.broadcastState();
    return this.roomCode;
  }

  initPeerServer(peerId) {
    try {
      const peerConfig = {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      };
      this.peer = new Peer(peerId, peerConfig);

      this.peer.on('open', (id) => {
        console.log('Online Host live with Room Code:', id);
        this.engine.addLog(`🌐 WebRTC Room live! Invite Code: ${id}`);
        this.broadcastState();
      });

      this.peer.on('connection', (conn) => {
        console.log('New player connected to host:', conn.peer);
        this.connections.push(conn);

        conn.on('data', (data) => {
          this.handleIncomingData(data, conn);
        });

        conn.on('close', () => {
          this.connections = this.connections.filter(c => c !== conn);
          this.broadcastState();
        });

        setTimeout(() => {
          if (conn.open) {
            conn.send({ type: 'SYNC_STATE', state: this.getSerializedState() });
          }
        }, 200);
      });

      this.peer.on('error', (err) => {
        console.warn('PeerJS Host Error:', err);
      });
    } catch (e) {
      console.error('Failed to init PeerJS Host:', e);
    }
  }

  joinLobby(roomCode, user, onJoined) {
    const cleanCode = (roomCode || 'MONO-GE').trim().toUpperCase();
    this.roomCode = cleanCode;
    this.isHost = false;

    // Register guest in engine local state
    let guestPlayer = this.engine.players.find(p => p.name === user.username);
    if (!guestPlayer) {
      const colors = ['#f59e0b', '#10b981', '#ef4444', '#a855f7', '#ec4899'];
      const color = colors[this.engine.players.length % colors.length];
      this.engine.addPlayer(user.id || 'usr_' + Date.now(), user.username, color, false);
    }

    try {
      const peerConfig = {
        debug: 1,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:stun1.l.google.com:19302' },
            { urls: 'stun:stun2.l.google.com:19302' },
            { urls: 'stun:stun3.l.google.com:19302' },
            { urls: 'stun:stun4.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' }
          ]
        }
      };
      this.peer = new Peer(peerConfig);

      this.peer.on('open', (myId) => {
        this.hostConn = this.peer.connect(cleanCode, { reliable: true });

        this.hostConn.on('open', () => {
          console.log('Connected to room:', cleanCode);
          this.hostConn.send({
            type: 'JOIN_REQUEST',
            user: { id: user.id || 'p_' + Date.now(), username: user.username }
          });
          if (onJoined) onJoined(true);
        });

        this.hostConn.on('data', (data) => {
          if (data.type === 'SYNC_STATE') {
            this.applySerializedState(data.state);
            if (this.onStateSynced) this.onStateSynced(data.state);
            this.notify();
          }
        });
      });

      this.peer.on('error', (err) => {
        console.warn('Guest Peer warning:', err);
        if (onJoined) onJoined(false);
      });
    } catch (e) {
      console.error('Failed to join lobby:', e);
      if (onJoined) onJoined(false);
    }

    this.broadcastState();
  }

  handleIncomingData(data, conn) {
    if (!this.isHost) return;

    if (data.type === 'JOIN_REQUEST') {
      const user = data.user;
      let existing = this.engine.players.find(p => p.id === user.id || p.name === user.username);
      if (!existing && this.engine.players.length < 8) {
        const colors = ['#f59e0b', '#10b981', '#ef4444', '#a855f7', '#ec4899'];
        const color = colors[this.engine.players.length % colors.length];
        this.engine.addPlayer(user.id, user.username, color, false);
      }
      this.broadcastState();
    } else if (data.type === 'PLAYER_ACTION') {
      this.executeAction(data.action, data.payload);
      this.broadcastState();
    }
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

  sendAction(action, payload) {
    if (this.isHost) {
      this.executeAction(action, payload);
      this.broadcastState();
    } else if (this.hostConn && this.hostConn.open) {
      this.hostConn.send({ type: 'PLAYER_ACTION', action, payload });
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

    if (this.isHost && this.connections) {
      this.connections.forEach(conn => {
        if (conn.open) {
          conn.send({ type: 'SYNC_STATE', state });
        }
      });
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

    this.engine.addPlayer('bot_' + Date.now(), botName, color, true);
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
    this.engine.status = state.status;
    this.engine.players = state.players || [];
    this.engine.currentTurnIndex = state.currentTurnIndex || 0;
    this.engine.hasRolled = state.hasRolled;
    this.engine.tradeManager.activeTrade = state.activeTrade;
    this.engine.boardState = state.boardState || {};
    this.engine.freeParkingJackpot = state.freeParkingJackpot || 0;
    this.engine.rules = state.rules || this.engine.rules;
    this.engine.logs = state.logs || [];

    const el = document.getElementById('inviteCodeText');
    if (el) el.innerText = this.roomCode;
  }
}
