// Main Application Entry Point — Single Global Session Multiplayer

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
    this.boardUI.renderBoard();
    this.controlsUI.renderControls();
    this.bindEvents();

    // Try to restore session from stored token
    this._setLoginStatus('Connecting…', false);
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
    el.style.color = isError ? '#ef4444' : '#94a3b8';
  }

  _setLoginLoading(loading) {
    const btn = document.getElementById('btnLoginSubmit');
    if (!btn) return;
    btn.disabled = loading;
    btn.textContent = loading ? '⏳ Connecting…' : '🚀 Enter Game';
  }

  // ── Lobby Setup ───────────────────────────────────────────────────────────

  async setupLobby(user) {
    const isHost = user.username === 'GE' || user.role === 'ADMIN';
    this.mpManager.isHost = isHost;

    const userLabel = document.getElementById('lobbyLoggedUser');
    if (userLabel) userLabel.innerText = `${user.avatar || ''} ${user.username}`.trim();

    // Wire state-sync callback
    this.mpManager.onStateSynced = (state) => {
      this.updateLobbyUI(user);
      this.updateUI();
      if (state && state.status === 'PLAYING' && this.currentScreen !== 'GAME') {
        this.showScreen('GAME');
      }
    };

    try {
      // Everyone calls joinGlobalRoom — GE creates it if needed, others join
      await this.mpManager.joinGlobalRoom(user);

      // If GE, ensure their player entry exists with the right ID
      if (isHost) {
        const geExists = this.engine.players.find(p => p.id === user.id || p.name === 'GE');
        if (!geExists) {
          this.engine.addPlayer({ id: user.id, name: user.username, isAI: false, color: '#38bdf8' });
          await this.mpManager.broadcastState();
        }
      }

      if (this.engine.status === 'PLAYING') {
        this.showScreen('GAME');
      } else {
        this.showScreen('LOBBY');
      }
    } catch (err) {
      console.error('[App] Lobby setup error:', err);
      // Show a useful message if game is in progress
      if (err.message && err.message.includes('in progress')) {
        this._setLoginStatus(`⚠️ ${err.message}`, true);
        this.showScreen('LOBBY'); // still show lobby so they can see what's happening
      } else {
        this.showScreen('LOBBY');
      }
    }

    this.updateLobbyUI(user);
  }

  // ── Screen Management ─────────────────────────────────────────────────────

  showScreen(screenId) {
    this.currentScreen = screenId;
    ['LOGIN', 'LOBBY', 'GAME'].forEach(id => {
      const el = document.getElementById(id.toLowerCase() + 'Screen');
      if (el) el.classList.toggle('active', id === screenId);
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
            <div style="width:14px;height:14px;border-radius:50%;background:${p.color || '#38bdf8'};border:2px solid #fff;flex-shrink:0;"></div>
            <strong style="color:var(--text-main);font-size:0.95rem;">${p.name}${p.isAI ? ' 🤖' : ''}${p.name === 'GE' ? ' 👑' : ''}</strong>
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

    // Update connected player count
    const countEl = document.getElementById('lobbyPlayerCount');
    if (countEl) {
      const human = this.engine.players.filter(p => !p.isAI).length;
      const bots = this.engine.players.filter(p => p.isAI).length;
      countEl.textContent = `${human} player${human !== 1 ? 's' : ''}${bots ? ` + ${bots} bot${bots !== 1 ? 's' : ''}` : ''} connected`;
    }
  }

  // ── Event Binding ─────────────────────────────────────────────────────────

  bindEvents() {

    // ── LOGIN FORM ───────────────────────────────────────────────────────────
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
        this._setLoginStatus('Connecting…', false);

        const res = await globalAuthStore.login(username, password);
        this._setLoginLoading(false);

        if (!res.success) {
          this._setLoginStatus(`❌ ${res.error}`, true);
          return;
        }

        this.mpManager.setToken(globalAuthStore.getToken());
        this._setLoginStatus('✅ Joined! Loading lobby…', false);
        await this.setupLobby(res.user);
      });
    }

    // ── GE MASTER CONTROLS ────────────────────────────────────────────────
    const btnAddBot = document.getElementById('btnLobbyAddBot');
    if (btnAddBot) {
      btnAddBot.onclick = () => {
        const u = globalAuthStore.getCurrentUser();
        if (!u || (u.username !== 'GE' && u.role !== 'ADMIN')) {
          alert('🔒 Only GE can add AI bots.');
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
        if (!confirm('🧹 Reset session? This removes all players and clears the game.')) return;
        this.engine.reset(true);
        const u = globalAuthStore.getCurrentUser();
        if (u) this.engine.addPlayer({ id: u.id, name: u.username, isAI: false, color: '#38bdf8' });
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
          alert('🔒 Only GE can start the game!');
          return;
        }

        if (this.engine.players.length < 2) {
          alert('⚠️ Need at least 2 players to start!');
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

    // ── NAVBAR ───────────────────────────────────────────────────────────────
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
        if (confirm('Dismiss current game and return to lobby?')) this.resetSession();
      };
    }

    // ── GAME CONTROLS ─────────────────────────────────────────────────────
    document.addEventListener('click', (e) => {
        if (e.target?.id === 'btnRollDice' || e.target?.closest('#btnRollDice')) {
        if (this.engine.status !== 'PLAYING') {
          alert('⚠️ GE must click "🚀 START GAME" first.');
          return;
        }
        const activePlayer = this.engine.getCurrentPlayer();
        if (!activePlayer || activePlayer.bankrupt) return;

        // Only the active player's browser can roll
        const cu = globalAuthStore.getCurrentUser();
        const isMyTurn = cu && (
          activePlayer.id === cu.id ||
          activePlayer.name.toLowerCase() === cu.username.toLowerCase()
        );
        if (!isMyTurn || activePlayer.isAI) return;

        if (activePlayer.inJail && !this.engine.hasRolled) {
          this.modalUI.showJailOptionsModal(
            activePlayer,
            () => { const r = this.engine.rollDice(); if (r) this.boardUI.animateDiceRoll(r.die1, r.die2, () => { this.updateUI(); this.checkTileInteraction(); this.mpManager.broadcastState(); }); },
            () => { const r = this.engine.payJailFine(activePlayer); if (r) this.boardUI.animateDiceRoll(r.die1, r.die2, () => { this.updateUI(); this.checkTileInteraction(); this.mpManager.broadcastState(); }); else { this.updateUI(); this.mpManager.broadcastState(); } },
            () => { const r = this.engine.useJailCard(activePlayer); if (r) this.boardUI.animateDiceRoll(r.die1, r.die2, () => { this.updateUI(); this.checkTileInteraction(); this.mpManager.broadcastState(); }); else { this.updateUI(); this.mpManager.broadcastState(); } }
          );
        } else {
          const roll = this.engine.rollDice();
          if (roll) {
            this.boardUI.animateDiceRoll(roll.die1, roll.die2, () => {
              this.updateUI();
              this.checkTileInteraction();
              this.mpManager.broadcastState();
            });
          }
        }
      }
    });

    document.addEventListener('click', (e) => {
      if (e.target?.id === 'btnEndTurn' || e.target?.closest('#btnEndTurn')) {
        if (this.engine.status !== 'PLAYING') return;

        // Only the active player can end their turn
        const endActivePlayer = this.engine.getCurrentPlayer();
        const endUser = globalAuthStore.getCurrentUser();
        const isEndMyTurn = endUser && endActivePlayer && (
          endActivePlayer.id === endUser.id ||
          endActivePlayer.name.toLowerCase() === endUser.username.toLowerCase()
        );
        if (!isEndMyTurn || endActivePlayer.isAI) return;
        if (!this.engine.hasRolled) return; // Must roll before ending turn

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
        this.modalUI.showTradeModal(this.engine.players, activePlayer, this.engine.boardState, (tradeOffer) => {
          const ok = this.engine.tradeManager.proposeTrade(activePlayer.id, tradeOffer.targetPlayerId, tradeOffer.offerProps, tradeOffer.offerCash, tradeOffer.requestProps, tradeOffer.requestCash);
          if (ok) { this.engine.addLog(`🤝 ${activePlayer.name} proposed a trade!`); this.mpManager.broadcastState(); this.updateUI(); }
          else alert('Trade offer invalid.');
        });
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

    // ── ADMIN PANEL ───────────────────────────────────────────────────────
    const btnAdmin = document.getElementById('btnAdminPanel');
    const adminBackdrop = document.getElementById('adminModalBackdrop');
    const closeAdmin = document.getElementById('closeAdminModal');
    if (btnAdmin && adminBackdrop) btnAdmin.onclick = () => { this.adminUI.renderAdminPanel(() => this.resetSession()); adminBackdrop.classList.add('active'); };
    if (closeAdmin && adminBackdrop) closeAdmin.onclick = () => adminBackdrop.classList.remove('active');

    // ── THEME TOGGLE ──────────────────────────────────────────────────────
    const btnTheme = document.getElementById('btnToggleTheme');
    if (btnTheme) {
      btnTheme.onclick = () => {
        const next = document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', next);
        btnTheme.innerText = next === 'light' ? '☀️' : '🌙';
      };
    }

    // ── TILE CLICK ────────────────────────────────────────────────────────
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
          tileId, owner ? owner.name : null,
          !owner && activePlayer && !activePlayer.isAI && this.engine.status === 'PLAYING' ? () => { this.engine.buyProperty(activePlayer, tileId); this.mpManager.broadcastState(); this.updateUI(); } : null,
          owner && activePlayer && owner.id === activePlayer.id && this.engine.status === 'PLAYING' ? () => { this.engine.buildHouse(activePlayer, tileId); this.mpManager.broadcastState(); this.updateUI(); } : null,
          owner && activePlayer && owner.id === activePlayer.id && this.engine.status === 'PLAYING' ? () => { this.engine.sellHouse(activePlayer, tileId); this.mpManager.broadcastState(); this.updateUI(); } : null,
          owner && activePlayer && owner.id === activePlayer.id && this.engine.status === 'PLAYING' ? () => { this.engine.mortgageProperty(activePlayer, tileId); this.mpManager.broadcastState(); this.updateUI(); } : null,
          owner && activePlayer && owner.id === activePlayer.id && this.engine.status === 'PLAYING' ? () => { this.engine.unmortgageProperty(activePlayer, tileId); this.mpManager.broadcastState(); this.updateUI(); } : null,
          canBuild, currentLevel, isMortgaged
        );
      }
    });

    // ── AI TURN HOOK ──────────────────────────────────────────────────────
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

    // Only show the buy prompt on the active player's own screen
    const currentUser = globalAuthStore.getCurrentUser();
    const isMyTurn = currentUser && (
      activePlayer.id === currentUser.id ||
      activePlayer.name.toLowerCase() === currentUser.username.toLowerCase()
    );
    if (!isMyTurn) return;

    const tileId = activePlayer.position;
    const tileData = BOARD_TILES[tileId];
    const tileState = this.engine.boardState[tileId];
    if (tileData && tileData.price > 0 && !tileState?.ownerId) {
      this.modalUI.showPropertyDeed(tileId, null,
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

    const isHost = currentUser && (currentUser.username === 'GE' || currentUser.role === 'ADMIN');
    const btnReset = document.getElementById('btnResetGame');
    if (btnReset) btnReset.style.display = isHost ? 'inline-flex' : 'none';

    const btnAuth = document.getElementById('btnAuthUser');
    if (btnAuth) btnAuth.innerText = currentUser ? `👤 ${currentUser.username}` : '👤 Login';

    const activePlayer = this.engine.getCurrentPlayer();
    const btnRoll = document.getElementById('btnRollDice');
    const btnEnd = document.getElementById('btnEndTurn');

    // Helper: disable a button
    const setBtn = (btn, enabled, label) => {
      if (!btn) return;
      btn.disabled = !enabled;
      btn.style.opacity = enabled ? '1' : '0.38';
      btn.style.cursor = enabled ? 'pointer' : 'not-allowed';
      if (label) btn.innerText = label;
    };

    if (this.engine.status !== 'PLAYING') {
      setBtn(btnRoll, false, '⏳ Waiting for GE to Start');
      setBtn(btnEnd, false);
      return;
    }

    // Is the logged-in user the current active player?
    const myTurn = currentUser && activePlayer && (
      activePlayer.id === currentUser.id ||
      activePlayer.name.toLowerCase() === currentUser.username.toLowerCase()
    );

    if (activePlayer?.isAI) {
      // AI is playing — nobody interacts
      setBtn(btnRoll, false, `🤖 ${activePlayer.name} is playing…`);
      setBtn(btnEnd, false);
    } else if (!myTurn) {
      // Another human player's turn — show who's playing, disable everything
      setBtn(btnRoll, false, `⏳ ${activePlayer?.name || '?'}'s turn…`);
      setBtn(btnEnd, false);
    } else if (!this.engine.hasRolled) {
      // MY turn, haven't rolled yet — enable Roll, lock End Turn
      setBtn(btnRoll, true, '🎲 Roll Dice');
      setBtn(btnEnd, false);
    } else {
      // MY turn, already rolled — lock Roll, enable End Turn
      setBtn(btnRoll, false, '🎲 Already Rolled');
      setBtn(btnEnd, true);
    }
  }
}

document.addEventListener('DOMContentLoaded', () => { new MonopolyApp(); });
