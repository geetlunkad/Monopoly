// Real-time WebRTC Multiplayer Room Manager (PeerJS - 100% Free Zero-Cost Cross-Device Sync)

const Peer = window.Peer || class {};

export class MultiplayerManager {
  constructor(gameEngine) {
    this.engine = gameEngine;
    this.roomCode = null;
    this.isHost = false;
    this.peer = null;
    this.connections = []; // Host's active connections to guests
    this.hostConn = null;  // Guest's connection to host
    this.spectators = [];
    this.listeners = [];
  }

  createLobby(hostUser) {
    const randomId = Math.random().toString(36).substring(2, 6).toUpperCase();
    this.roomCode = `MONO-${randomId}`;
    this.isHost = true;
    this.engine.reset();
    this.engine.addPlayer(hostUser.id || 'p_host', hostUser.username || 'Host', '#38bdf8', false);

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
            { urls: 'stun:stun4.l.google.com:19302' }
          ]
        }
      };
      this.peer = new Peer(peerId, peerConfig);

      this.peer.on('open', (id) => {
        console.log('PeerJS server initialized with Room Code:', id);
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

        // Send current game state to new connected peer
        setTimeout(() => {
          conn.send({ type: 'SYNC_STATE', state: this.getSerializedState() });
        }, 500);
      });

      this.peer.on('error', (err) => {
        console.warn('PeerJS Error:', err);
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
            { urls: 'stun:stun4.l.google.com:19302' }
          ]
        }
      };
      this.peer = new Peer(peerConfig);
      this.peer.on('open', (myId) => {
        console.log('Guest Peer initialized with ID:', myId);
        this.hostConn = this.peer.connect(cleanCode);

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
            this.notify();
          }
        });

        this.hostConn.on('close', () => {
          alert('Disconnected from host room.');
        });
      });

      this.peer.on('error', (err) => {
        alert(`Failed to join room ${cleanCode}. Check code and try again.`);
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
      if (!existing) {
        if (this.engine.players.length >= 8) {
          this.spectators.push(user);
          this.engine.addLog(`👀 ${user.username} joined as a Spectator.`);
        } else {
          this.engine.addPlayer(user.id, user.username, null, false);
        }
      }
      this.broadcastState();
    } else if (data.type === 'PLAYER_ACTION') {
      // Execute incoming player action on host engine
      const { action, payload } = data;
      if (action === 'ROLL_DICE') {
        this.engine.rollDice();
      } else if (action === 'END_TURN') {
        this.engine.nextTurn();
      } else if (action === 'BUY_PROPERTY') {
        const p = this.engine.players.find(player => player.id === payload.playerId);
        if (p) this.engine.buyProperty(p, payload.tileId);
      } else if (action === 'BUILD_HOUSE') {
        const p = this.engine.players.find(player => player.id === payload.playerId);
        if (p) this.engine.buildHouse(p, payload.tileId);
      }
      this.broadcastState();
    }
  }

  sendAction(action, payload) {
    if (this.isHost) {
      // Host executes locally and broadcasts
      if (action === 'ROLL_DICE') this.engine.rollDice();
      if (action === 'END_TURN') this.engine.nextTurn();
      this.broadcastState();
    } else if (this.hostConn) {
      // Guest sends action to host
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

    document.getElementById('inviteCodeText').innerText = state.roomCode;
  }
}
