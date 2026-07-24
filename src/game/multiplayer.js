// Real-time WebRTC Multiplayer Room Manager (PeerJS - 100% Free Cross-Device Sync)

const Peer = window.Peer || class {};

export class MultiplayerManager {
  constructor(gameEngine) {
    this.engine = gameEngine;
    this.roomCode = null;
    this.isHost = false;
    this.peer = null;
    this.connections = []; // Host's connections to guests
    this.hostConn = null;  // Guest's connection to host
    this.listeners = [];
    this.onStateSynced = null;
  }

  createLobby(hostUser) {
    // Standardize Master GE host room code
    const randomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.roomCode = hostUser.username === 'GE' ? `MONO-GE` : `MONO-${randomId}`;
    this.isHost = true;
    this.engine.reset();
    this.engine.addPlayer(hostUser.id || 'p_ge', hostUser.username || 'GE', '#38bdf8', false);

    this.initPeerServer(this.roomCode);
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
        console.log('PeerJS Host Server listening on Room Code:', id);
        this.engine.addLog(`🌐 WebRTC Room live! Invite Code: ${id}`);
        this.notify();
      });

      this.peer.on('connection', (conn) => {
        console.log('New peer connected to host:', conn.peer);
        this.connections.push(conn);

        conn.on('data', (data) => {
          this.handleIncomingData(data, conn);
        });

        conn.on('close', () => {
          this.connections = this.connections.filter(c => c !== conn);
          this.engine.addLog(`⚠️ A player disconnected.`);
          this.broadcastState();
        });

        // Immediately send full state snapshot to connected peer
        setTimeout(() => {
          if (conn.open) {
            conn.send({ type: 'SYNC_STATE', state: this.getSerializedState() });
          }
        }, 300);
      });

      this.peer.on('error', (err) => {
        console.warn('PeerJS Host Warning/Error:', err);
        // Fallback to random ID if ID taken
        if (err.type === 'unavailable-id') {
          const fallbackId = `MONO-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
          this.roomCode = fallbackId;
          this.initPeerServer(fallbackId);
        }
      });
    } catch (e) {
      console.error('Failed to init PeerJS:', e);
    }
  }

  joinLobby(roomCode, user, onJoined) {
    const cleanCode = roomCode.trim().toUpperCase();
    this.roomCode = cleanCode;
    this.isHost = false;

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
        console.log('Guest Peer initialized with ID:', myId);
        this.hostConn = this.peer.connect(cleanCode, { reliable: true });

        this.hostConn.on('open', () => {
          console.log('Connected to host room:', cleanCode);
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

        this.hostConn.on('close', () => {
          alert('Disconnected from host room.');
        });
      });

      this.peer.on('error', (err) => {
        console.warn('Guest Peer Error:', err);
        if (onJoined) onJoined(false);
      });
    } catch (e) {
      console.error('Failed to join lobby:', e);
      if (onJoined) onJoined(false);
    }
  }

  handleIncomingData(data, conn) {
    if (!this.isHost) return;

    if (data.type === 'JOIN_REQUEST') {
      const user = data.user;
      const existing = this.engine.players.find(p => p.id === user.id || p.name === user.username);
      if (!existing && this.engine.players.length < 8) {
        this.engine.addPlayer(user.id, user.username, null, false);
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
    if (!this.isHost) return;
    const state = this.getSerializedState();
    this.connections.forEach(conn => {
      if (conn.open) {
        conn.send({ type: 'SYNC_STATE', state });
      }
    });
    this.notify();
  }

  addAIBot() {
    if (!this.isHost || this.engine.players.length >= 8) return false;
    const botNum = this.engine.players.filter(p => p.isAI).length + 1;
    const botNames = ['CyberBot', 'NexusAI', 'QuantumBot', 'VortexAI'];
    const botName = botNames[botNum - 1] || `Bot #${botNum}`;
    
    this.engine.addPlayer('bot_' + Date.now(), botName, null, true);
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
    this.roomCode = state.roomCode;
    this.engine.status = state.status;
    this.engine.players = state.players;
    this.engine.currentTurnIndex = state.currentTurnIndex;
    this.engine.hasRolled = state.hasRolled;
    this.engine.tradeManager.activeTrade = state.activeTrade;
    this.engine.boardState = state.boardState;
    this.engine.freeParkingJackpot = state.freeParkingJackpot;
    this.engine.rules = state.rules;
    this.engine.logs = state.logs;

    const el = document.getElementById('inviteCodeText');
    if (el) el.innerText = state.roomCode || 'MONO-GE';
  }
}
