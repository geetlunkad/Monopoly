// Side Controls UI, Player Dashboard, Action Controls & Event Log Feed

export class ControlsUI {
  constructor(containerEl) {
    this.container = containerEl;
  }

  renderControls() {
    this.container.innerHTML = `
      <div class="controls-wrapper" style="display: flex; flex-direction: column; gap: 16px;">
        <!-- Active Turn Card -->
        <div class="glass-panel" style="padding: 16px;" id="turnCard">
          <div style="font-size: 0.8rem; color: var(--text-muted); text-transform: uppercase; font-weight: 700;">Current Turn</div>
          <div id="activePlayerName" style="font-size: 1.4rem; font-weight: 800; margin: 4px 0; color: var(--accent-neon-blue);">Loading...</div>
          <div style="display: flex; gap: 8px; margin-top: 10px;" id="actionButtons">
            <button class="btn btn-success" id="btnEndTurn" style="flex: 1;">⏩ End Turn</button>
            <button class="btn btn-accent" id="btnOpenTrade">🤝 Trade</button>
          </div>
        </div>

        <!-- Players List & Net Worth -->
        <div class="glass-panel" style="padding: 16px;">
          <div style="font-size: 0.85rem; font-weight: 800; margin-bottom: 10px; color: var(--accent-gold);">
            👥 Players & Balance
          </div>
          <div id="playersList" style="display: flex; flex-direction: column; gap: 8px; max-height: 220px; overflow-y: auto;">
          </div>
        </div>

        <!-- Real-Time Event Log Feed -->
        <div class="glass-panel" style="padding: 16px; flex: 1;">
          <div style="font-size: 0.85rem; font-weight: 800; margin-bottom: 10px; color: var(--accent-neon-blue);">
            📜 Game Activity Log
          </div>
          <div id="gameLogFeed" style="font-size: 0.78rem; display: flex; flex-direction: column; gap: 6px; max-height: 250px; overflow-y: auto; color: var(--text-muted);">
          </div>
        </div>
      </div>
    `;
  }

  update(engine) {
    if (!engine) return;

    const activePlayer = engine.getCurrentPlayer();
    const nameEl = document.getElementById('activePlayerName');
    if (nameEl) {
      if (activePlayer) {
        nameEl.innerText = `${activePlayer.name}${activePlayer.isAI ? ' 🤖' : ''}`;
        nameEl.style.color = activePlayer.color || 'var(--accent-primary)';
      } else {
        nameEl.innerText = 'Waiting for Game';
        nameEl.style.color = 'var(--text-muted)';
      }
    }

    // Render Players List
    const listEl = document.getElementById('playersList');
    if (listEl && engine.players) {
      listEl.innerHTML = '';
      engine.players.forEach((p, idx) => {
        const item = document.createElement('div');
        const isCurrentTurn = idx === engine.currentTurnIndex;
        item.style.cssText = `
          display: flex; justify-content: space-between; align-items: center;
          padding: 8px 12px; border-radius: 8px; background: #1e293b;
          border: 2px solid ${isCurrentTurn ? p.color : '#334155'};
          ${isCurrentTurn ? 'box-shadow: 0 0 10px ' + p.color + '66;' : ''}
        `;
        item.innerHTML = `
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 12px; height: 12px; border-radius: 50%; background: ${p.color}; border: 1px solid #fff;"></span>
            <span style="font-weight: 700; color: #ffffff; ${p.bankrupt ? 'text-decoration: line-through; opacity: 0.5;' : ''}">${p.name} ${p.isAI ? '🤖' : ''} ${isCurrentTurn ? '🎲' : ''}</span>
          </div>
          <span style="font-weight: 800; color: #f59e0b;">$${p.money}</span>
        `;
        listEl.appendChild(item);
      });
    }

    // Render Log Feed
    const logFeedEl = document.getElementById('gameLogFeed');
    if (logFeedEl && engine.logs) {
      logFeedEl.innerHTML = '';
      engine.logs.slice(0, 30).forEach(log => {
        const item = document.createElement('div');
        item.innerHTML = `<span style="opacity: 0.5;">[${log.time}]</span> ${log.message}`;
        logFeedEl.appendChild(item);
      });
    }
  }
}
