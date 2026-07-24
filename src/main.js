// Main Application Entry Point - Single Global Game Architecture

import { GameEngine } from './game/engine.js';
import { BoardUI } from './ui/boardUI.js';
import { ControlsUI } from './ui/controlsUI.js';
import { ModalUI } from './ui/modalUI.js';
import { AdminUI } from './ui/adminUI.js';
import { globalAuthStore } from './store/authStore.js';
import { BOARD_TILES } from './game/boardData.js';

class MonopolyApp {
  constructor() {
    this.engine = new GameEngine();

    this.boardUI = new BoardUI(document.getElementById('boardContainer'));
    this.controlsUI = new ControlsUI(document.getElementById('controlsContainer'));
    this.modalUI = new ModalUI();
    this.adminUI = new AdminUI(document.getElementById('adminPanelContainer'));

    this.currentScreen = 'LOGIN';
    this.init();
  }

  init() {
    // Render Static Board & Controls UI
    this.boardUI.renderBoard();
    this.controlsUI.renderControls();

    // Bind Event Listeners
    this.bindEvents();

    // Check Initial Authentication State
    const currentUser = globalAuthStore.getCurrentUser();
    if (currentUser) {
      this.setupLobby(currentUser);
      this.showScreen('LOBBY');
    } else {
      this.showScreen('LOGIN');
    }
  }

  setupLobby(user) {
    const userLabel = document.getElementById('lobbyLoggedUser');
    if (userLabel) userLabel.innerText = user.username;

    this.mpManager.onStateSynced = (state) => {
      this.updateLobbyUI(user);
      this.updateUI();
      if (state && state.status === 'PLAYING' && this.currentScreen !== 'GAME') {
        this.showScreen('GAME');
      }
    };

    try {
      if (user.username === 'GE') {
        const roomCode = this.mpManager.createLobby(user);
        if (this.engine.players.length === 1) {
          this.engine.addPlayer({ id: 'bot_1', name: 'CyberBot 1', isAI: true, color: '#10b981' });
          this.engine.addPlayer({ id: 'bot_2', name: 'CyberBot 2', isAI: true, color: '#ef4444' });
          this.mpManager.broadcastState();
        }
      } else {
        this.mpManager.joinLobby('MONO-GE', user, (joined) => {
          console.log('Player join synced:', user.username);
        });
      }

      // Progress Restoration Check: If game is in progress, jump directly to active board!
      if (this.engine.status === 'PLAYING') {
        this.showScreen('GAME');
      } else {
        this.showScreen('LOBBY');
      }
    } catch (err) {
      console.warn('Lobby setup error:', err);
    }

    this.updateLobbyUI(user);
  }

  showScreen(screenId) {
    this.currentScreen = screenId;
    const screens = {
      LOGIN: document.getElementById('loginScreen'),
      LOBBY: document.getElementById('lobbyScreen'),
      GAME: document.getElementById('gameScreen')
    };

    Object.keys(screens).forEach(id => {
      if (screens[id]) {
        if (id === screenId) {
          screens[id].classList.add('active');
        } else {
          screens[id].classList.remove('active');
        }
      }
    });

    this.updateUI();
  }

  updateLobbyUI(currentUser) {
    const isGE = currentUser && (currentUser.username === 'GE' || currentUser.role === 'ADMIN');
    const geControls = document.getElementById('geMasterControls');
    const guestNotice = document.getElementById('guestWaitingNotice');

    if (geControls) geControls.style.display = isGE ? 'block' : 'none';
    if (guestNotice) guestNotice.style.display = isGE ? 'none' : 'block';

    const rosterEl = document.getElementById('lobbyPlayerList');
    if (rosterEl) {
      rosterEl.innerHTML = '';

      if (this.engine.players.length === 0 && currentUser) {
        const colors = ['#38bdf8', '#f59e0b', '#10b981', '#ef4444'];
        this.engine.addPlayer(currentUser.id || 'usr_me', currentUser.username, colors[0], false);
      }

      this.engine.players.forEach(p => {
        const item = document.createElement('div');
        item.className = 'roster-item';
        item.style.cssText = 'display: flex; align-items: center; justify-content: space-between; padding: 10px 14px; background: rgba(255,255,255,0.05); border: 1px solid rgba(255,255,255,0.1); border-radius: 8px; margin-bottom: 6px;';
        item.innerHTML = `
          <div style="display: flex; align-items: center; gap: 10px;">
            <div style="width: 14px; height: 14px; border-radius: 50%; background: ${p.color || '#38bdf8'}; border: 2px solid #fff;"></div>
            <strong style="color: var(--text-main); font-size: 0.95rem;">${p.name} ${p.isAI ? '🤖 (Bot)' : ''} ${p.name === 'GE' ? '👑 (Master)' : ''}</strong>
          </div>
          <div style="display: flex; align-items: center; gap: 10px;">
            <span style="font-size: 0.85rem; color: var(--accent-gold); font-weight: 700;">$${p.money}</span>
            ${p.isAI && isGE ? `<button class="btn btn-danger btn-sm btn-remove-bot" data-id="${p.id}" style="padding: 3px 8px; font-size: 0.75rem;">✕ Remove</button>` : ''}
          </div>
        `;
        rosterEl.appendChild(item);
      });

      // Bind remove bot buttons
      rosterEl.querySelectorAll('.btn-remove-bot').forEach(btn => {
        btn.onclick = () => {
          const id = btn.dataset.id;
          this.engine.removePlayer(id);
          this.mpManager.broadcastState();
          this.updateLobbyUI(currentUser);
        };
      });
    }
  }

  bindEvents() {
    // 1. LOGIN SCREEN HANDLERS (2 BUTTON DESIGN)
    const btnGE = document.getElementById('btnLoginGE');
    if (btnGE) {
      btnGE.onclick = () => {
        const pass = prompt('🔑 Enter Master GE Password:');
        if (pass === null) return;
        const res = globalAuthStore.login('GE', pass);
        if (res.success) {
          this.showScreen('LOBBY');
          this.setupLobby(res.user);
        } else {
          alert('❌ Incorrect password for Master GE! (Password is: geetelectric)');
        }
      };
    }

    const btnPlayer = document.getElementById('btnLoginPlayer');
    if (btnPlayer) {
      btnPlayer.onclick = () => {
        const username = prompt('👤 Enter Your Player Name:');
        if (!username || !username.trim()) return;
        const cleanName = username.trim();
        const res = globalAuthStore.login(cleanName, '123456');
        if (res.success) {
          this.showScreen('LOBBY');
          this.setupLobby(res.user);
        } else {
          alert(`❌ Login failed: ${res.error}`);
        }
      };
    }

    // Copy Invite Link
    const btnCopy = document.getElementById('btnCopyInviteLink');
    if (btnCopy) {
      btnCopy.onclick = () => {
        const code = document.getElementById('inviteCodeText')?.innerText || 'MONO-GE';
        const url = `${window.location.origin}${window.location.pathname}#join=${code}`;
        navigator.clipboard.writeText(url).then(() => {
          alert(`📋 Direct Join Link copied to clipboard!\n\n${url}`);
        });
      };
    }

    // Join Room Code Submit
    const btnJoinSubmit = document.getElementById('btnJoinRoomSubmit');
    if (btnJoinSubmit) {
      btnJoinSubmit.onclick = () => {
        const codeInput = document.getElementById('inputJoinRoomCode');
        const code = codeInput ? codeInput.value.trim().toUpperCase() : '';
        if (!code) {
          alert('Please enter a valid room code!');
          return;
        }
        const currentUser = globalAuthStore.getCurrentUser() || { id: 'usr_guest', username: 'Guest' };
        this.mpManager.joinLobby(code, currentUser, (joined) => {
          if (joined) {
            alert(`✅ Joined Room ${code}!`);
          } else {
            alert(`❌ Failed to connect to Room ${code}. Please make sure host "GE" is online.`);
          }
        });
      };
    }

    // 2. LOBBY SCREEN HANDLERS (GE MASTER)
    const btnLobbyAddBot = document.getElementById('btnLobbyAddBot');
    if (btnLobbyAddBot) {
      btnLobbyAddBot.onclick = () => {
        const currentUser = globalAuthStore.getCurrentUser();
        if (!currentUser || (currentUser.username !== 'GE' && currentUser.role !== 'ADMIN')) {
          alert('🔒 Only Room Master "GE" can add AI bots.');
          return;
        }
        this.mpManager.addAIBot();
        this.updateLobbyUI(currentUser);
      };
    }

    const btnResetSession = document.getElementById('btnResetSession');
    if (btnResetSession) {
      btnResetSession.onclick = () => {
        if (confirm('🧹 Are you sure you want to reset the current game session and start fresh?')) {
          this.engine.reset(true);
          const currentUser = globalAuthStore.getCurrentUser();
          if (currentUser) {
            this.engine.addPlayer({ id: currentUser.id, name: currentUser.username, isAI: false, color: '#38bdf8' });
          }
          this.engine.addPlayer({ id: 'bot_1', name: 'CyberBot 1', isAI: true, color: '#10b981' });
          this.engine.addPlayer({ id: 'bot_2', name: 'CyberBot 2', isAI: true, color: '#ef4444' });
          this.mpManager.broadcastState();
          this.showScreen('LOBBY');
          this.updateLobbyUI(currentUser);
          alert('✨ Session reset successfully!');
        }
      };
    }

    const btnStartLaunch = document.getElementById('btnStartGameLaunch');
    if (btnStartLaunch) {
      btnStartLaunch.onclick = () => {
        const currentUser = globalAuthStore.getCurrentUser();
        if (!currentUser || (currentUser.username !== 'GE' && currentUser.role !== 'ADMIN')) {
          alert('🔒 Only Room Master "GE" can start the game session!');
          return;
        }

        // Apply GE Master Settings
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

    // 3. TOP NAVBAR HANDLERS
    const btnAuth = document.getElementById('btnAuthUser');
    if (btnAuth) {
      btnAuth.onclick = () => {
        this.showScreen('LOGIN');
      };
    }

    // Dismiss New Game Button (Header)
    const btnReset = document.getElementById('btnResetGame');
    if (btnReset) {
      btnReset.onclick = () => {
        if (confirm('Dismiss current game session and start a new game setup?')) {
          this.resetSession();
        }
      };
    }

    // Roll Dice Button
    document.addEventListener('click', (e) => {
      if (e.target && (e.target.id === 'btnRollDice' || e.target.closest('#btnRollDice'))) {
        if (this.engine.status !== 'PLAYING') {
          alert('⚠️ Game has not started yet! Master "GE" must click "🚀 START GAME" in the lobby first.');
          return;
        }
        const activePlayer = this.engine.getCurrentPlayer();
        if (!activePlayer || activePlayer.bankrupt) return;

        if (activePlayer.inJail && !this.engine.hasRolled) {
          this.modalUI.showJailOptionsModal(
            activePlayer,
            () => {
              const roll = this.engine.rollDice();
              if (roll) {
                this.boardUI.animateDiceRoll(roll.die1, roll.die2, () => {
                  this.updateUI();
                  this.checkTileInteraction();
                });
              }
            },
            () => {
              // Option 2: Pay $50 Fine & Exit Jail
              const roll = this.engine.payJailFine(activePlayer);
              if (roll) {
                this.boardUI.animateDiceRoll(roll.die1, roll.die2, () => {
                  this.updateUI();
                  this.checkTileInteraction();
                });
              } else {
                this.updateUI();
              }
            },
            () => {
              // Option 3: Use Get Out of Jail Free Card
              const roll = this.engine.useJailCard(activePlayer);
              if (roll) {
                this.boardUI.animateDiceRoll(roll.die1, roll.die2, () => {
                  this.updateUI();
                  this.checkTileInteraction();
                });
              } else {
                this.updateUI();
              }
            }
          );
        } else {
          const roll = this.engine.rollDice();
          if (roll) {
            this.boardUI.animateDiceRoll(roll.die1, roll.die2, () => {
              this.updateUI();
              this.checkTileInteraction();
            });
          }
        }
      }
    });

    // End Turn Button
    document.addEventListener('click', (e) => {
      if (e.target && (e.target.id === 'btnEndTurn' || e.target.closest('#btnEndTurn'))) {
        if (this.engine.status !== 'PLAYING') return;
        this.engine.nextTurn();
        this.updateUI();
      }
    });

    // Trade Button
    document.addEventListener('click', (e) => {
      if (e.target && (e.target.id === 'btnOpenTrade' || e.target.closest('#btnOpenTrade'))) {
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
              this.updateUI();
            } else {
              alert('Trade offer invalid.');
            }
          }
        );
      }
    });

    // Declare Bankruptcy Button
    document.addEventListener('click', (e) => {
      if (e.target && (e.target.id === 'btnDeclareBankruptcy' || e.target.closest('#btnDeclareBankruptcy'))) {
        if (this.engine.status !== 'PLAYING') return;
        const activePlayer = this.engine.getCurrentPlayer();
        if (!activePlayer || activePlayer.isAI) return;

        if (confirm(`💥 ${activePlayer.name}, declare bankruptcy? Your properties will be sold to the bank at 50% market value and you will be eliminated.`)) {
          this.engine.declareBankruptcy(activePlayer);
          this.updateUI();
        }
      }
    });

    // Toggle Admin Panel Modal
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
      closeAdmin.onclick = () => {
        adminBackdrop.classList.remove('active');
      };
    }

    // Theme Toggle Button
    const btnTheme = document.getElementById('btnToggleTheme');
    if (btnTheme) {
      btnTheme.onclick = () => {
        const currentTheme = document.documentElement.getAttribute('data-theme');
        const newTheme = currentTheme === 'light' ? 'dark' : 'light';
        document.documentElement.setAttribute('data-theme', newTheme);
        btnTheme.innerText = newTheme === 'light' ? '☀️' : '🌙';
      };
    }

    // Tile Click Inspector & Buy Menu Handler
    document.addEventListener('click', (e) => {
      const tileEl = e.target.closest('.tile');
      if (tileEl && tileEl.dataset.tileId !== undefined) {
        const tileId = parseInt(tileEl.dataset.tileId);
        const tileData = BOARD_TILES[tileId];
        if (!tileData || tileData.price <= 0) return;

        const tileState = this.engine.boardState[tileId];
        const owner = this.engine.players.find(p => p.id === tileState.ownerId);
        const activePlayer = this.engine.getCurrentPlayer();
        const canBuild = activePlayer ? this.engine.canBuildHouse(activePlayer, tileId) : false;
        const currentLevel = this.engine.getEffectiveBuildingLevel(tileId);
        const isMortgaged = tileState ? tileState.mortgaged : false;

        this.modalUI.showPropertyDeed(
          tileId,
          owner ? owner.name : null,
          !owner && activePlayer && !activePlayer.isAI && this.engine.status === 'PLAYING' ? () => {
            this.engine.buyProperty(activePlayer, tileId);
            this.updateUI();
          } : null,
          owner && activePlayer && owner.id === activePlayer.id && this.engine.status === 'PLAYING' ? () => {
            this.engine.buildHouse(activePlayer, tileId);
            this.updateUI();
          } : null,
          owner && activePlayer && owner.id === activePlayer.id && this.engine.status === 'PLAYING' ? () => {
            this.engine.sellHouse(activePlayer, tileId);
            this.updateUI();
          } : null,
          owner && activePlayer && owner.id === activePlayer.id && this.engine.status === 'PLAYING' ? () => {
            this.engine.mortgageProperty(activePlayer, tileId);
            this.updateUI();
          } : null,
          owner && activePlayer && owner.id === activePlayer.id && this.engine.status === 'PLAYING' ? () => {
            this.engine.unmortgageProperty(activePlayer, tileId);
            this.updateUI();
          } : null,
          canBuild,
          currentLevel,
          isMortgaged
        );
      }
    });

    // Attach state change listener for AI bot turns
    this.engine.onStateChange = () => {
      this.updateUI();
    };
  }

  resetSession() {
    this.engine.reset();
    const currentUser = globalAuthStore.getCurrentUser();
    if (currentUser) {
      this.setupLobby(currentUser);
    }
    const adminBackdrop = document.getElementById('adminModalBackdrop');
    if (adminBackdrop) adminBackdrop.classList.remove('active');
    this.showScreen('LOBBY');
    alert('🔄 Game session dismissed. Master GE can now configure rules for a new game!');
  }

  checkTileInteraction() {
    if (this.engine.status !== 'PLAYING') return;
    const activePlayer = this.engine.getCurrentPlayer();
    if (!activePlayer || activePlayer.isAI) return;

    const tileId = activePlayer.position;
    const tileData = BOARD_TILES[tileId];
    const tileState = this.engine.boardState[tileId];

    if (tileData && tileData.price > 0 && !tileState.ownerId) {
      this.modalUI.showPropertyDeed(
        tileId,
        null,
        () => {
          this.engine.buyProperty(activePlayer, tileId);
          this.updateUI();
        },
        null
      );
    }
  }

  updateUI() {
    this.boardUI.updateBoardState(this.engine);
    this.controlsUI.update(this.engine);
    const currentUser = globalAuthStore.getCurrentUser();
    this.updateLobbyUI(currentUser);

    // Show New Game button for GE or Admin
    const btnReset = document.getElementById('btnResetGame');
    if (btnReset) {
      if (currentUser && (currentUser.username === 'GE' || currentUser.role === 'ADMIN')) {
        btnReset.style.display = 'inline-flex';
      } else {
        btnReset.style.display = 'none';
      }
    }

    // Update Auth Button Label
    const btnAuth = document.getElementById('btnAuthUser');
    if (btnAuth) {
      btnAuth.innerText = currentUser ? `👤 ${currentUser.username}` : '👤 Login';
    }

    // Strict Turn Control & Button States
    const activePlayer = this.engine.getCurrentPlayer();
    const btnRoll = document.getElementById('btnRollDice');
    const btnEnd = document.getElementById('btnEndTurn');

    if (this.engine.status !== 'PLAYING') {
      if (btnRoll) {
        btnRoll.disabled = true;
        btnRoll.style.opacity = '0.5';
        btnRoll.style.cursor = 'not-allowed';
        btnRoll.innerText = '⏳ Waiting for Game Start';
      }
      if (btnEnd) {
        btnEnd.disabled = true;
        btnEnd.style.opacity = '0.5';
        btnEnd.style.cursor = 'not-allowed';
      }
      return;
    }

    if (activePlayer && activePlayer.isAI) {
      if (btnRoll) {
        btnRoll.disabled = true;
        btnRoll.style.opacity = '0.5';
        btnRoll.style.cursor = 'not-allowed';
        btnRoll.innerText = '🤖 AI Playing...';
      }
      if (btnEnd) {
        btnEnd.disabled = true;
        btnEnd.style.opacity = '0.5';
        btnEnd.style.cursor = 'not-allowed';
      }
    } else {
      if (btnEnd) {
        btnEnd.disabled = false;
        btnEnd.style.opacity = '1';
        btnEnd.style.cursor = 'pointer';
      }
      if (btnRoll) {
        if (this.engine.hasRolled) {
          btnRoll.disabled = true;
          btnRoll.style.opacity = '0.5';
          btnRoll.style.cursor = 'not-allowed';
          btnRoll.innerText = '🎲 Rolled (End Turn)';
        } else {
          btnRoll.disabled = false;
          btnRoll.style.opacity = '1';
          btnRoll.style.cursor = 'pointer';
          btnRoll.innerText = '🎲 Roll Dice';
        }
      }
    }
  }
}

// Initialize Monopoly Web Application
document.addEventListener('DOMContentLoaded', () => {
  new MonopolyApp();
});
