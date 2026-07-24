// Board UI Renderer, 3D Animated Dice & Sound FX Controller

import { BOARD_TILES } from '../game/boardData.js';

export class BoardUI {
  constructor(containerEl) {
    this.container = containerEl;
    this.tileElements = {};
  }

  renderBoard() {
    this.container.innerHTML = `
      <div class="board-wrapper glass-panel">
        <div class="board-grid" id="boardGrid"></div>
      </div>
    `;

    const grid = document.getElementById('boardGrid');
    grid.innerHTML = '';

    // Create 11x11 Grid Layout matching Monopoly standard positioning
    // Grid coordinate mapping for 40 spaces:
    // Bottom row: 10 -> 0 (rows 11, cols 11..1)
    // Left col: 10 -> 20 (cols 1, rows 11..1)
    // Top row: 20 -> 30 (rows 1, cols 1..11)
    // Right col: 30 -> 39 (cols 11, rows 1..10)

    for (let row = 1; row <= 11; row++) {
      for (let col = 1; col <= 11; col++) {
        const tileId = this.getTileIdAtGridPos(row, col);

        if (tileId !== null) {
          const tileData = BOARD_TILES[tileId];
          const tileEl = document.createElement('div');
          tileEl.className = `tile ${tileData.type === 'GO' || tileData.type === 'JAIL' || tileData.type === 'FREE_PARKING' || tileData.type === 'GO_TO_JAIL' ? 'tile-corner' : ''}`;
          tileEl.dataset.tileId = tileId;
          tileEl.style.gridRow = row;
          tileEl.style.gridColumn = col;

          if (tileData.type === 'PROPERTY') {
            const flagMarkup = tileData.country ? `<img src="https://flagcdn.com/w40/${tileData.country}.png" class="flag-badge" alt="${tileData.country}">` : '';
            tileEl.innerHTML = `
              <div class="color-bar" style="background: ${tileData.color}"></div>
              <div class="tile-header">
                ${flagMarkup}
                <div class="tile-name">${tileData.name}</div>
              </div>
              <div class="buildings-container" id="bld_${tileId}"></div>
              <div class="tile-price">$${tileData.price}</div>
              <div class="tokens-container" id="tokens_${tileId}"></div>
            `;
          } else if (tileData.type === 'RAILROAD' || tileData.type === 'UTILITY') {
            let icon = tileData.icon || (tileData.type === 'RAILROAD' ? '✈️' : '⚡');
            tileEl.innerHTML = `
              <div class="color-bar" style="background: ${tileData.color}"></div>
              <div class="special-tile-icon">${icon}</div>
              <div class="tile-name">${tileData.name}</div>
              <div class="tile-price">$${tileData.price}</div>
              <div class="tokens-container" id="tokens_${tileId}"></div>
            `;
          } else {
            // Special tiles (GO, Jail, Free Parking, Go To Jail, Chance, Community, Tax)
            let icon = '🏁';
            if (tileData.type === 'JAIL') icon = '🔒';
            if (tileData.type === 'FREE_PARKING') icon = '🚗';
            if (tileData.type === 'GO_TO_JAIL') icon = '👮';
            if (tileData.type === 'CHANCE') icon = '❓';
            if (tileData.type === 'COMMUNITY') icon = '📦';
            if (tileData.type === 'TAX') icon = '💸';

            tileEl.innerHTML = `
              <div class="corner-icon">${icon}</div>
              <div class="corner-title">${tileData.name}</div>
              <div class="tokens-container" id="tokens_${tileId}"></div>
            `;
          }

          grid.appendChild(tileEl);
          this.tileElements[tileId] = tileEl;
        } else if (row === 2 && col === 2) {
          // Render Center Board Area spanning rows 2..10, cols 2..10
          const centerEl = document.createElement('div');
          centerEl.className = 'board-center';
          centerEl.innerHTML = `
            <div class="center-title-badge">
              <h1>MONOPOLY</h1>
              <p>Property Trading Game</p>
              <div class="jackpot-banner" id="jackpotBanner">
                🏆 Free Parking Jackpot: <span id="jackpotAmount">$0</span>
              </div>
            </div>

            <div class="dice-area">
              <div class="dice-container">
                <div class="dice-cube" id="die1">
                  <div class="dot" style="grid-area: 2/2"></div>
                </div>
                <div class="dice-cube" id="die2">
                  <div class="dot" style="grid-area: 2/2"></div>
                </div>
              </div>
              <button class="btn btn-primary" id="btnRollDice">🎲 Roll Dice</button>
            </div>

            <div class="deck-containers">
              <div class="card-deck chance">Chance</div>
              <div class="card-deck community">Community</div>
            </div>
          `;
          grid.appendChild(centerEl);
        }
      }
    }
  }

  getTileIdAtGridPos(row, col) {
    if (row === 11 && col === 11) return 0;
    if (row === 11 && col > 1 && col < 11) return 11 - col; // 1..9 -> Mediterranean to Connecticut
    if (row === 11 && col === 1) return 10;
    if (col === 1 && row > 1 && row < 11) return 21 - row; // 11..19 -> St. Charles to NY Ave
    if (row === 1 && col === 1) return 20;
    if (row === 1 && col > 1 && col < 11) return 19 + col; // 21..29 -> Kentucky to Marvin Gardens
    if (row === 1 && col === 11) return 30;
    if (col === 11 && row > 1 && row < 11) return 29 + row; // 31..39 -> Pacific to Boardwalk
    return null;
  }

  updateBoardState(gameState) {
    if (!gameState) return;

    // Reset tokens
    for (let i = 0; i < 40; i++) {
      const container = document.getElementById(`tokens_${i}`);
      if (container) container.innerHTML = '';
    }

    // Place Player Tokens
    gameState.players.forEach(player => {
      if (player.bankrupt) return;
      const container = document.getElementById(`tokens_${player.position}`);
      if (container) {
        const tokenEl = document.createElement('div');
        tokenEl.className = 'player-token';
        tokenEl.style.backgroundColor = player.color;
        tokenEl.innerText = player.name.substring(0, 2).toUpperCase();
        tokenEl.title = `${player.name} ($${player.money})`;
        container.appendChild(tokenEl);
      }
    });

    // Update Houses/Hotels and Ownership Borders
    Object.keys(gameState.boardState).forEach(tileId => {
      const state = gameState.boardState[tileId];
      const tileEl = this.tileElements[tileId];
      if (!tileEl) return;

      if (state.ownerId) {
        const owner = gameState.players.find(p => p.id === state.ownerId);
        if (owner) {
          tileEl.style.outline = `3.5px solid ${owner.color}`;
          tileEl.style.outlineOffset = '-3.5px';
          tileEl.style.boxShadow = `inset 0 0 14px ${owner.color}66, 0 0 10px ${owner.color}aa`;
          tileEl.style.zIndex = '4';
        }
      } else {
        tileEl.style.outline = 'none';
        tileEl.style.boxShadow = 'none';
        tileEl.style.zIndex = '1';
      }

      const bldContainer = document.getElementById(`bld_${tileId}`);
      if (bldContainer) {
        bldContainer.innerHTML = '';
        if (state.hotel) {
          bldContainer.innerHTML = `<div class="hotel-icon" title="Hotel"></div>`;
        } else if (state.houses > 0) {
          for (let h = 0; h < state.houses; h++) {
            bldContainer.innerHTML += `<div class="house-icon" title="House"></div>`;
          }
        }
      }
    });

    // Update Free Parking Jackpot text
    const jackpotEl = document.getElementById('jackpotAmount');
    if (jackpotEl) jackpotEl.innerText = `$${gameState.freeParkingJackpot || 0}`;
  }

  animateDiceRoll(die1Value, die2Value, onComplete) {
    const die1 = document.getElementById('die1');
    const die2 = document.getElementById('die2');
    if (!die1 || !die2) return;

    die1.classList.add('rolling');
    die2.classList.add('rolling');

    // Play synthesized dice roll sound effect
    this.playAudioSynth(300, 'sine', 0.2);

    setTimeout(() => {
      die1.classList.remove('rolling');
      die2.classList.remove('rolling');
      this.renderDieDots(die1, die1Value);
      this.renderDieDots(die2, die2Value);
      if (onComplete) onComplete();
    }, 600);
  }

  renderDieDots(dieEl, val) {
    dieEl.innerHTML = '';
    const dotPositions = {
      1: ['2/2'],
      2: ['1/1', '3/3'],
      3: ['1/1', '2/2', '3/3'],
      4: ['1/1', '1/3', '3/1', '3/3'],
      5: ['1/1', '1/3', '2/2', '3/1', '3/3'],
      6: ['1/1', '1/3', '2/1', '2/3', '3/1', '3/3']
    };

    const positions = dotPositions[val] || ['2/2'];
    positions.forEach(pos => {
      const dot = document.createElement('div');
      dot.className = 'dot';
      dot.style.gridArea = pos;
      dieEl.appendChild(dot);
    });
  }

  playAudioSynth(freq, type = 'sine', duration = 0.15) {
    try {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      // Audio context ignored if un-interacted
    }
  }
}
