// Side Controls UI: Turn Card, Player Dashboard, Action Buttons, Event Log

export class ControlsUI {
  constructor(containerEl) {
    this.container = containerEl;
  }

  renderControls() {
    this.container.innerHTML = `
      <div class="controls-wrapper" style="display: flex; flex-direction: column; gap: 16px;">

        <!-- Roll Dice (prominent, top) -->
        <div class="glass-panel" style="padding: 16px; text-align: center;">
          <button class="btn btn-primary" id="btnRollDice" style="
            width: 100%; padding: 18px; font-size: 1.15rem; font-weight: 900;
            justify-content: center; letter-spacing: 0.03em;
          ">🎲 Roll Dice</button>
        </div>

        <!-- Active Turn Card -->
        <div class="glass-panel" style="padding: 16px;" id="turnCard">
          <div style="font-size: 0.75rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700; letter-spacing: 0.06em;">Current Turn</div>
          <div id="activePlayerName" style="font-size: 1.3rem; font-weight: 800; margin: 6px 0 12px; color: var(--accent-neon-blue);">Loading…</div>
          <div id="turnStatusMsg" style="font-size: 0.82rem; color: var(--text-muted); margin-bottom: 12px; min-height: 1.2em;"></div>
          <div style="display: flex; gap: 8px; flex-wrap: wrap;">
            <button class="btn btn-success" id="btnEndTurn" style="flex: 1; justify-content: center;">⏩ End Turn</button>
            <button class="btn btn-accent" id="btnOpenTrade">🤝 Trade</button>
            <button class="btn btn-danger btn-sm" id="btnDeclareBankruptcy" style="padding: 6px 10px; font-size: 0.75rem;">💥 Bankrupt</button>
          </div>
        </div>

        <!-- Players List & Net Worth -->
        <div class="glass-panel" style="padding: 16px;">
          <div style="font-size: 0.82rem; font-weight: 800; margin-bottom: 10px; color: var(--accent-gold);">👥 Players & Balance</div>
          <div id="playersList" style="display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto;"></div>
        </div>

        <!-- Event Log -->
        <div class="glass-panel" style="padding: 16px; flex: 1;">
          <div style="font-size: 0.82rem; font-weight: 800; margin-bottom: 10px; color: var(--accent-neon-blue);">📜 Activity Log</div>
          <div id="gameLogFeed" style="font-size: 0.78rem; display: flex; flex-direction: column; gap: 5px; max-height: 260px; overflow-y: auto; color: var(--text-muted);"></div>
        </div>
      </div>
    `;
  }

  update(engine) {
    if (!engine) return;

    const activePlayer = engine.getCurrentPlayer();

    // Active player name & color
    const nameEl = document.getElementById('activePlayerName');
    if (nameEl) {
      if (activePlayer) {
        nameEl.innerText = `${activePlayer.name}${activePlayer.isAI ? ' 🤖' : ''}`;
        nameEl.style.color = activePlayer.color || 'var(--accent-primary)';
      } else {
        nameEl.innerText = 'Waiting for game…';
        nameEl.style.color = 'var(--text-muted)';
      }
    }

    // Turn status message
    const statusEl = document.getElementById('turnStatusMsg');
    if (statusEl && engine.status === 'PLAYING' && activePlayer) {
      if (activePlayer.isAI) {
        statusEl.innerText = '🤖 AI is thinking…';
      } else if (engine.hasRolled) {
        statusEl.innerText = `Rolled — now end your turn or manage properties.`;
      } else if (activePlayer.inJail) {
        statusEl.innerText = `In Jail — roll doubles to escape, or pay $50.`;
      } else {
        statusEl.innerText = `Roll the dice to move!`;
      }
    } else if (statusEl) {
      statusEl.innerText = '';
    }

    // Players list
    const listEl = document.getElementById('playersList');
    if (listEl && engine.players) {
      listEl.innerHTML = '';
      engine.players.forEach((p, idx) => {
        const isCurrentTurn = idx === engine.currentTurnIndex;
        const item = document.createElement('div');
        item.style.cssText = `
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 12px; border-radius: 8px; background: #1e293b;
          border: 2px solid ${isCurrentTurn ? p.color : '#334155'};
          ${isCurrentTurn ? `box-shadow: 0 0 10px ${p.color}55;` : ''}
          ${p.bankrupt ? 'opacity: 0.45;' : ''}
          transition: border-color 0.3s;
        `;
        item.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="width:12px;height:12px;border-radius:50%;background:${p.color};border:1px solid #fff;flex-shrink:0;"></span>
            <span style="font-weight:700;color:#fff;${p.bankrupt ? 'text-decoration:line-through;' : ''}">
              ${p.name}${p.isAI ? ' 🤖' : ''}${isCurrentTurn ? ' 🎲' : ''}${p.inJail ? ' 🔒' : ''}
            </span>
          </div>
          <span style="font-weight:800;color:${p.money < 100 ? '#ef4444' : '#f59e0b'};">
            $${p.money}
          </span>
        `;
        listEl.appendChild(item);
      });
    }

    // Event log — NOTE: engine log entries have .timestamp and .msg fields
    const logEl = document.getElementById('gameLogFeed');
    if (logEl && engine.logs) {
      logEl.innerHTML = '';
      engine.logs.slice(0, 35).forEach(log => {
        const item = document.createElement('div');
        item.style.cssText = 'padding: 3px 0; border-bottom: 1px solid rgba(255,255,255,0.05); line-height: 1.4;';
        item.innerHTML = `<span style="opacity:0.45;font-size:0.72rem;">[${log.timestamp || ''}]</span> ${log.msg || log.message || ''}`;
        logEl.appendChild(item);
      });
    }
  }
}
