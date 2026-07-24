// Main Application Entry Point — Vercel-backed Multiplayer Monopoly

import { GameEngine } from './game/engine.js';
import { MultiplayerManager } from './game/multiplayer.js';
import { BoardUI } from './ui/boardUI.js';
import { ControlsUI } from './ui/controlsUI.js';
import { ModalUI } from './ui/modalUI.js';
import { AdminUI } from './ui/adminUI.js';
import { globalAuthStore } from './store/authStore.js';
import { BOARD_TILES } from './game/boardData.js';

class MonopolyApp {
  constructor() {
    this.engine = new GameEngine();
    this.mpManager = new MultiplayerManager(this.engine);

    this.boardUI = new BoardUI(document.getElementById('boardContainer'));
    this.controlsUI = new ControlsUI(document.getElementById('controlsContainer'));
    this.modalUI = new ModalUI();
    this.adminUI = new AdminUI(document.getElementById('adminPanelContainer'));

    this.currentScreen = 'LOGIN';
    this.init();
  }

  async init() {
    // Render Static Board & Controls
    this.boardUI.renderBoard();
    this.controlsUI.renderControls();

    // Bind all event listeners
    this.bindEvents();

    // Attempt to restore existing session from stored token
    this._setLoginStatus('Restoring session…', false);
    const user = await globalAuthStore.validateSession();

    if (user) {
      this.mpManager.setToken(globalAuthStore.getToken());
      await this.setupLobby(user);
    } else {
      this.showScreen('LOGIN');
      this._setLoginStatus('', false);
    }
  }

  // ── Login Helpers ─────────────────────────────────────────────────────────

  _setLoginStatus(msg, isError = false) {
    const el = document.getElementById('loginStatusMsg');
    if (!el) return;
    el.textContent = msg;
    el.style.color = isError ? 'var(--accent-red, #ef4444)' : 'var(--text-muted, #94a3b8)';
  }

  _setLoginLoading(loading) {
    const btn = document.getElementById('btnLoginSubmit');
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? '⏳ Connecting…' : '🚀 Enter Game';
  }

  // ── Lobby Setup ───────────────────────────────────────────────────────────

  async setupLobby(user) {
    // Update lobby label
    const userLabel = document.getElementById('lobbyLoggedUser');
    if (userLabel) userLabel.innerText = `${user.avatar || ''} ${user.username}`.trim();

    // Wire multiplayer callbacks
    this.mpManager.onStateSynced = (state) => {
      this.updateLobbyUI(user);
      this.updateUI();
      if (state && state.status === 'PLAYING' && this.currentScreen !== 'GAME') {
        this.showScreen('GAME');
      }
    };

    try {
      const isHost = user.username === 'GE' || user.role === 'ADMIN';

      if (isHost) {
        // Host: create a new room
        const roomCode = await this.mpManager.createRoom(user);
        console.log('[App] Room created:', roomCode);

        // Add default AI bots if starting fresh
        if (this.engine.players.length <= 1) {
          this.engine.addPlayer({ id: 'bot_1', name: 'CyberBot 1', isAI: true, color: '#10b981' });
          this.engine.addPlayer({ id: 'bot_2', name: 'CyberBot 2', isAI: true, color: '#ef4444' });
          await this.mpManager.broadcastState();
        }
      } else {
        // Non-host: try to join GE's room or wait in lobby
        // Check URL hash for direct room code (e.g., #join=AB12CD)
        const hashMatch = window.location.hash.match(/join=([A-Z0-9]{6})/i);
        if (hashMatch) {
          const code = hashMatch[1].toUpperCase();
          try {
            await this.mpManager.joinRoom(code, user);
            window.location.hash = '';
          } catch (err) {
            console.warn('[App] Hash join failed:', err.message);
          }
        }
      }

      // If game is already in progress, jump straight to board
      if (this.engine.status === 'PLAYING') {
        this.showScreen('GAME');
      } else {
        this.showScreen('LOBBY');
      }
    } catch (err) {
      console.error('[App] Lobby setup error:', err);
      this.showScreen('LOBBY');
    }

    this.updateLobbyUI(user);
  }

  // ── Screen Management ─────────────────────────────────────────────────────

  showScreen(screenId) {
    this.currentScreen = screenId;
    const screens = {
      LOGIN: document.getElementById('loginScreen'),
      LOBBY: document.getElementById('lobbyScreen'),
      GAME: document.getElementById('gameScreen')
    };

    Object.keys(screens).forEach(id => {
      if (screens[id]) {
        screens[id].classList.toggle('active', id === screenId);
      }
    });

    this.updateUI();
  }

  // ── Lobby UI ──────────────────────────────────────────────────────────────

  updateLobbyUI(currentUser) {
    const isHost = currentUser && (currentUser.username === 'GE' || currentUser.role === 'ADMIN');
    const geControls = document.getElementById('geMasterControls');
    const guestNotice = document.getElementById('guestWaitingNotice');

    if (geControls) geControls.style.display = isHost ? 'block' : 'none';
    if (guestNotice) guestNotice.style.display = isHost ? 'none' : 'block';

    const rosterEl = document.getElementById('lobbyPlayerList');
    if (rosterEl) {
      rosterEl.innerHTML = '';
      this.engine.players.forEach(p => {
        const item = document.createElement('div');
        item.className = 'roster-item';
        item.style.cssText = 'display:flex;align-items:center;justify-content:space-between;padding:10px 14px;background:rgba(255,255,255,0.05);border:1px solid rgba(255,255,255,0.1);border-radius:8px;margin-bottom:6px;';
        item.innerHTML = `
          <div style="display:flex;align-items:center;gap:10px;">
            <div style="width:14px;height:14px;border-radius:50%;background:${p.color || '#38bdf8'};border:2px solid #fff;"></div>
            <strong style="color:var(--text-main);font-size:0.95rem;">${p.name} ${p.isAI ? '🤖 (Bot)' : ''} ${p.name === 'GE' ? '👑 (Host)' : ''}</strong>
          </div>
          <div style="display:flex;align-items:center;gap:10px;">
            <span style="font-size:0.85rem;color:var(--accent-gold);font-weight:700;">$${p.money}</span>
            ${p.isAI && isHost ? `<button class="btn btn-danger btn-sm btn-remove-bot" data-id="${p.id}" style="padding:3px 8px;font-size:0.75rem;">✕</button>` : ''}
          </div>
        `;
        rosterEl.appendChild(item);
      });

      rosterEl.querySelectorAll('.btn-remove-bot').forEach(btn => {
        btn.onclick = () => {
          this.engine.removePlayer(btn.dataset.id);
          this.mpManager.broadcastState();
          this.updateLobbyUI(currentUser);
        };
      });
    }

    // Update room code display
    const codeEl = document.getElementById('inviteCodeText');
    if (codeEl && this.mpManager.roomCode) {
      codeEl.innerText = this.mpManager.roomCode;
    }
  }

  // ── Event Binding ─────────────────────────────────────────────────────────

  bindEvents() {

    // ── 1. LOGIN FORM ────────────────────────────────────────────────────────
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
      loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = document.getElementById('loginUsername')?.value?.trim();
        const password = document.getElementById('loginPassword')?.value || '';

        if (!username) {
          this._setLoginStatus('Please enter your name.', true);
          return;
        }

        this._setLoginLoading(true);
        this._setLoginStatus('Connecting to server…', false);

        const res = await globalAuthStore.login(username, password);

        this._setLoginLoading(false);

        if (!res.success) {
          this._setLoginStatus(`❌ ${res.error}`, true);
          return;
        }

        this.mpManager.setToken(globalAuthStore.getToken());
        this._setLoginStatus('✅ Logged in! Setting up lobby…', false);
        await this.setupLobby(res.user);
      });
    }

    // ── 2. COPY INVITE LINK ──────────────────────────────────────────────────
    const btnCopy = document.getElementById('btnCopyInviteLink');
    if (btnCopy) {
      btnCopy.onclick = () => {
        const code = this.mpManager.roomCode || document.getElementById('inviteCodeText')?.innerText || '';
        if (!code) { alert('No room code available yet.'); return; }
        const url = `${window.location.origin}${window.location.pathname}#join=${code}`;
        navigator.clipboard.writeText(url).then(() => {
          btnCopy.textContent = '✅ Copied!';
          setTimeout(() => { btnCopy.textContent = '📋 Copy Join Link'; }, 2000);
        });
      };
    }

    // ── 3. JOIN ROOM BY CODE ─────────────────────────────────────────────────
    const btnJoinSubmit = document.getElementById('btnJoinRoomSubmit');
    if (btnJoinSubmit) {
      btnJoinSubmit.onclick = async () => {
        const code = document.getElementById('inputJoinRoomCode')?.value?.trim()?.toUpperCase();
        if (!code) { alert('Please enter a room code.'); return; }

        const currentUser = globalAuthStore.getCurrentUser();
        if (!currentUser) { alert('You must be logged in to join a room.'); return; }

        btnJoinSubmit.disabled = true;
        btnJoinSubmit.textContent = '⏳ Joining…';

        try {
          await this.mpManager.joinRoom(code, currentUser);
          this.updateLobbyUI(currentUser);
          btnJoinSubmit.textContent = '✅ Joined!';
        } catch (err) {
          alert(`❌ ${err.message}`);
          btnJoinSubmit.textContent = '🔗 Join Room';
        } finally {
          btnJoinSubmit.disabled = false;
        }
      };
    }

    // ── 4. GE MASTER CONTROLS ────────────────────────────────────────────────
    const btnAddBot = document.getElementById('btnLobbyAddBot');
    if (btnAddBot) {
      btnAddBot.onclick = () => {
        const u = globalAuthStore.getCurrentUser();
        if (!u || (u.username !== 'GE' && u.role !== 'ADMIN')) {
          alert('🔒 Only the host can add AI bots.');
          return;
        }
        const added = this.mpManager.addAIBot();
        if (!added) alert('Max 8 players reached.');
        else this.updateLobbyUI(u);
      };
    }

    const btnResetSession = document.getElementById('btnResetSession');
    if (btnResetSession) {
      btnResetSession.onclick = async () => {
        if (!confirm('🧹 Reset session? This clears all players and bot config.')) return;
        this.engine.reset(true);
        const u = globalAuthStore.getCurrentUser();
        if (u) {
          this.engine.addPlayer({ id: u.id, name: u.username, isAI: false, color: '#38bdf8' });
        }
        this.engine.addPlayer({ id: 'bot_1', name: 'CyberBot 1', isAI: true, color: '#10b981' });
        this.engine.addPlayer({ id: 'bot_2', name: 'CyberBot 2', isAI: true, color: '#ef4444' });
        await this.mpManager.broadcastState();
        this.showScreen('LOBBY');
        this.updateLobbyUI(u);
      };
    }

    const btnStart = document.getElementById('btnStartGameLaunch');
    if (btnStart) {
      btnStart.onclick = async () => {
        const u = globalAuthStore.getCurrentUser();
        if (!u || (u.username !== 'GE' && u.role !== 'ADMIN')) {
          alert('🔒 Only the host can start the game!');
          return;
        }

        const startingCash = parseInt(document.getElementById('lobbyStartingCash')?.value) || 1500;
        const jackpot = document.getElementById('lobbyJackpot')?.checked ?? true;
        const rentInJail = document.getElementById('lobbyRentInJail')?.checked ?? false;
        const auctions = document.getElementById('lobbyAuctions')?.checked ?? true;

        this.engine.rules.startingCash = startingCash;
        this.engine.rules.freeParkingJackpotEnabled = jackpot;
        this.engine.rules.rentInJail = rentInJail;
        this.engine.rules.auctionsEnabled = auctions;
        this.engine.players.forEach(p => { p.money = startingCash; });

        this.mpManager.sendAction('START_GAME');
        this.showScreen('GAME');
      };
    }

    // ── 5. NAVBAR ────────────────────────────────────────────────────────────
    const btnAuth = document.getElementById('btnAuthUser');
    if (btnAuth) {
      btnAuth.onclick = () => {
        if (globalAuthStore.getCurrentUser()) {
          if (confirm('Log out?')) {
            globalAuthStore.logout();
            this.mpManager._stopPolling();
            this.engine.reset();
            this.showScreen('LOGIN');
          }
        } else {
          this.showScreen('LOGIN');
        }
      };
    }

    const btnReset = document.getElementById('btnResetGame');
    if (btnReset) {
      btnReset.onclick = () => {
        if (confirm('Dismiss current game and start a new session?')) {
          this.resetSession();
        }
      };
    }

    // ── 6. GAME CONTROLS ─────────────────────────────────────────────────────
    document.addEventListener('click', (e) => {
      if (e.target?.id === 'btnRollDice' || e.target?.closest('#btnRollDice')) {
        if (this.engine.status !== 'PLAYING') {
          alert('⚠️ Game has not started yet! The host must click "🚀 START GAME" first.');
          return;
        }
        const activePlayer = this.engine.getCurrentPlayer();
        if (!activePlayer || activePlayer.bankrupt) return;

        if (activePlayer.inJail && !this.engine.hasRolled) {
          this.modalUI.showJailOptionsModal(
            activePlayer,
            () => {
              const roll = this.engine.rollDice();
              if (roll) { this.boardUI.animateDiceRoll(roll.die1, roll.die2, () => { this.updateUI(); this.checkTileInteraction(); }); }
            },
            () => {
              const roll = this.engine.payJailFine(activePlayer);
              if (roll) { this.boardUI.animateDiceRoll(roll.die1, roll.die2, () => { this.updateUI(); this.checkTileInteraction(); }); }
              else { this.updateUI(); }
            },
            () => {
              const roll = this.engine.useJailCard(activePlayer);
              if (roll) { this.boardUI.animateDiceRoll(roll.die1, roll.die2, () => { this.updateUI(); this.checkTileInteraction(); }); }
              else { this.updateUI(); }
            }
          );
        } else {
          const roll = this.engine.rollDice();
          if (roll) {
            this.boardUI.animateDiceRoll(roll.die1, roll.die2, () => {
              this.updateUI();
              this.checkTileInteraction();
              this.mpManager.broadcastState(); // push after roll
            });
          }
        }
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target?.id === 'btnEndTurn' || e.target?.closest('#btnEndTurn')) {
        if (this.engine.status !== 'PLAYING') return;
        this.engine.nextTurn();
        this.mpManager.broadcastState();
        this.updateUI();
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target?.id === 'btnOpenTrade' || e.target?.closest('#btnOpenTrade')) {
        if (this.engine.status !== 'PLAYING') return;
        const activePlayer = this.engine.getCurrentPlayer();
        if (!activePlayer) return;

        this.modalUI.showTradeModal(
          this.engine.players,
          activePlayer,
          this.engine.boardState,
          (tradeOffer) => {
            const success = this.engine.tradeManager.proposeTrade(
              activePlayer.id,
              tradeOffer.targetPlayerId,
              tradeOffer.offerProps,
              tradeOffer.offerCash,
              tradeOffer.requestProps,
              tradeOffer.requestCash
            );
            if (success) {
              this.engine.addLog(`🤝 ${activePlayer.name} offered a trade!`);
              this.mpManager.broadcastState();
              this.updateUI();
            } else {
              alert('Trade offer invalid.');
            }
          }
        );
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target?.id === 'btnDeclareBankruptcy' || e.target?.closest('#btnDeclareBankruptcy')) {
        if (this.engine.status !== 'PLAYING') return;
        const activePlayer = this.engine.getCurrentPlayer();
        if (!activePlayer || activePlayer.isAI) return;

        if (confirm(`💥 ${activePlayer.name}, declare bankruptcy?`)) {
          this.engine.declareBankruptcy(activePlayer);
          this.mpManager.broadcastState();
          this.updateUI();
        }
      }
    });

    // ── 7. ADMIN PANEL ───────────────────────────────────────────────────────
    const btnAdmin = document.getElementById('btnAdminPanel');
    const adminBackdrop = document.getElementById('adminModalBackdrop');
    const closeAdmin = document.getElementById('closeAdminModal');

    if (btnAdmin && adminBackdrop) {
      btnAdmin.onclick = () => {
        this.adminUI.renderAdminPanel(() => this.resetSession());
        adminBackdrop.classList.add('active');
      };
    }
    if (closeAdmin && adminBackdrop) {
      closeAdmin.onclick = () => adminBackdrop.classList.remove('active');
    }

    // ── 8. THEME TOGGLE ──────────────────────────────────────────────────────
    const btnTheme = document.getElementById('btnToggleTheme');
    if (btnTheme) {
      btnTheme.onclick = () => {
        const curr = document.documentElement.getAttribute('data-theme');
        const next = curr === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        btnTheme.innerText = next === 'light' ? '☀️' : '🌙';
      };
    }

    // ── 9. TILE CLICK INSPECTOR ──────────────────────────────────────────────
    document.addEventListener('click', (e) => {
      const tileEl = e.target.closest('.tile');
      if (tileEl && tileEl.dataset.tileId !== undefined) {
        const tileId = parseInt(tileEl.dataset.tileId);
        const tileData = BOARD_TILES[tileId];
        if (!tileData || tileData.price <= 0) return;

        const tileState = this.engine.boardState[tileId];
        const owner = this.engine.players.find(p => p.id === tileState?.ownerId);
        const activePlayer = this.engine.getCurrentPlayer();
        const canBuild = activePlayer ? this.engine.canBuildHouse(activePlayer, tileId) : false;
        const currentLevel = this.engine.getEffectiveBuildingLevel(tileId);
        const isMortgaged = tileState?.mortgaged ?? false;

        this.modalUI.showPropertyDeed(
          tileId,
          owner ? owner.name : null,
          !owner && activePlayer && !activePlayer.isAI && this.engine.status === 'PLAYING'
            ? () => { this.engine.buyProperty(activePlayer, tileId); this.mpManager.broadcastState(); this.updateUI(); }
            : null,
          owner && activePlayer && owner.id === activePlayer.id && this.engine.status === 'PLAYING'
            ? () => { this.engine.buildHouse(activePlayer, tileId); this.mpManager.broadcastState(); this.updateUI(); }
            : null,
          owner && activePlayer && owner.id === activePlayer.id && this.engine.status === 'PLAYING'
            ? () => { this.engine.sellHouse(activePlayer, tileId); this.mpManager.broadcastState(); this.updateUI(); }
            : null,
          owner && activePlayer && owner.id === activePlayer.id && this.engine.status === 'PLAYING'
            ? () => { this.engine.mortgageProperty(activePlayer, tileId); this.mpManager.broadcastState(); this.updateUI(); }
            : null,
          owner && activePlayer && owner.id === activePlayer.id && this.engine.status === 'PLAYING'
            ? () => { this.engine.unmortgageProperty(activePlayer, tileId); this.mpManager.broadcastState(); this.updateUI(); }
            : null,
          canBuild, currentLevel, isMortgaged
        );
      }
    });

    // ── 10. AI TURN HOOK ─────────────────────────────────────────────────────
    this.engine.onStateChange = () => {
      this.updateUI();
      this.mpManager.broadcastState();
    };
  }

  // ── Session Reset ─────────────────────────────────────────────────────────

  async resetSession() {
    this.engine.reset();
    const user = globalAuthStore.getCurrentUser();
    if (user) await this.setupLobby(user);
    document.getElementById('adminModalBackdrop')?.classList.remove('active');
    this.showScreen('LOBBY');
  }

  // ── Tile Interaction ──────────────────────────────────────────────────────

  checkTileInteraction() {
    if (this.engine.status !== 'PLAYING') return;
    const activePlayer = this.engine.getCurrentPlayer();
    if (!activePlayer || activePlayer.isAI) return;

    const tileId = activePlayer.position;
    const tileData = BOARD_TILES[tileId];
    const tileState = this.engine.boardState[tileId];

    if (tileData && tileData.price > 0 && !tileState?.ownerId) {
      this.modalUI.showPropertyDeed(
        tileId, null,
        () => { this.engine.buyProperty(activePlayer, tileId); this.mpManager.broadcastState(); this.updateUI(); },
        null
      );
    }
  }

  // ── UI Update ─────────────────────────────────────────────────────────────

  updateUI() {
    this.boardUI.updateBoardState(this.engine);
    this.controlsUI.update(this.engine);
    const currentUser = globalAuthStore.getCurrentUser();
    if (currentUser) this.updateLobbyUI(currentUser);

    // Show/hide New Game button
    const btnReset = document.getElementById('btnResetGame');
    if (btnReset) {
      const isHost = currentUser && (currentUser.username === 'GE' || currentUser.role === 'ADMIN');
      btnReset.style.display = isHost ? 'inline-flex' : 'none';
    }

    // Auth button label
    const btnAuth = document.getElementById('btnAuthUser');
    if (btnAuth) {
      btnAuth.innerText = currentUser ? `👤 ${currentUser.username}` : '👤 Login';
    }

    // Roll / End Turn button states
    const activePlayer = this.engine.getCurrentPlayer();
    const btnRoll = document.getElementById('btnRollDice');
    const btnEnd = document.getElementById('btnEndTurn');

    if (this.engine.status !== 'PLAYING') {
      if (btnRoll) { btnRoll.disabled = true; btnRoll.style.opacity = '0.5'; btnRoll.style.cursor = 'not-allowed'; btnRoll.innerText = '⏳ Waiting for Game Start'; }
      if (btnEnd)  { btnEnd.disabled = true;  btnEnd.style.opacity = '0.5';  btnEnd.style.cursor = 'not-allowed'; }
      return;
    }

    if (activePlayer?.isAI) {
      if (btnRoll) { btnRoll.disabled = true; btnRoll.style.opacity = '0.5'; btnRoll.style.cursor = 'not-allowed'; btnRoll.innerText = '🤖 AI Playing…'; }
      if (btnEnd)  { btnEnd.disabled = true;  btnEnd.style.opacity = '0.5';  btnEnd.style.cursor = 'not-allowed'; }
    } else {
      if (btnEnd) { btnEnd.disabled = false; btnEnd.style.opacity = '1'; btnEnd.style.cursor = 'pointer'; }
      if (btnRoll) {
        if (this.engine.hasRolled) {
          btnRoll.disabled = true; btnRoll.style.opacity = '0.5'; btnRoll.style.cursor = 'not-allowed'; btnRoll.innerText = '🎲 Rolled (End Turn)';
        } else {
          btnRoll.disabled = false; btnRoll.style.opacity = '1'; btnRoll.style.cursor = 'pointer'; btnRoll.innerText = '🎲 Roll Dice';
        }
      }
    }
  }
}

// Initialize app after DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  new MonopolyApp();
});
