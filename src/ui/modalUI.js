// Interactive Modals UI Manager (Property Deeds, Auctions, Trades, Rules Settings)

import { BOARD_TILES } from '../game/boardData.js';

export class ModalUI {
  showModal(htmlContent) {
    let backdrop = document.getElementById('globalModalBackdrop');
    if (!backdrop) {
      backdrop = document.createElement('div');
      backdrop.id = 'globalModalBackdrop';
      backdrop.className = 'modal-backdrop';
      document.body.appendChild(backdrop);
    }

    backdrop.innerHTML = `
      <div class="modal-content">
        ${htmlContent}
      </div>
    `;
    backdrop.classList.add('active');
  }

  hideModal() {
    const backdrop = document.getElementById('globalModalBackdrop');
    if (backdrop) {
      backdrop.classList.remove('active');
    }
  }

  showPropertyDeed(tileId, ownerName, onBuy, onBuild, onSell, onMortgage, onUnmortgage, canBuild, currentLevel, isMortgaged) {
    const tile = BOARD_TILES[tileId];
    if (!tile) return;

    let buildLabel = '🏗️ Build House';
    if (currentLevel === 4) buildLabel = '🏨 Build Hotel';

    const mortgageValue = Math.floor(tile.price * 0.5);
    const unmortgageCost = Math.floor(tile.price * 0.55);

    const html = `
      <div class="deed-card">
        <div class="deed-header" style="background: ${tile.color || '#334155'};">
          ${tile.name} ${isMortgaged ? '(MORTGAGED 🏦)' : ''}
        </div>
        <div class="deed-body">
          <div class="deed-row"><span>Purchase Price:</span> <strong>$${tile.price}</strong></div>
          <div class="deed-row"><span>Base Rent:</span> <strong>$${tile.rent ? tile.rent[0] : 0}</strong></div>
          <div class="deed-row"><span>1 House Rent:</span> <strong>$${tile.rent ? tile.rent[1] : 0}</strong></div>
          <div class="deed-row"><span>2 Houses Rent:</span> <strong>$${tile.rent ? tile.rent[2] : 0}</strong></div>
          <div class="deed-row"><span>3 Houses Rent:</span> <strong>$${tile.rent ? tile.rent[3] : 0}</strong></div>
          <div class="deed-row"><span>4 Houses Rent:</span> <strong>$${tile.rent ? tile.rent[4] : 0}</strong></div>
          <div class="deed-row"><span>HOTEL Rent:</span> <strong>$${tile.rent ? tile.rent[5] : 0}</strong></div>
          <div class="deed-row"><span>House/Hotel Cost:</span> <strong>$${tile.houseCost || 0}</strong></div>
          <div class="deed-row"><span>Mortgage Value:</span> <strong>+$${mortgageValue}</strong></div>
          <div class="deed-row"><span>Current Owner:</span> <strong>${ownerName || 'Bank (Unowned)'}</strong></div>
        </div>
      </div>
      <div style="display: flex; gap: 8px; margin-top: 16px; flex-wrap: wrap;">
        ${!ownerName && onBuy ? `<button class="btn btn-success" id="modalBtnBuy" style="flex:1;">🛒 Buy ($${tile.price})</button>` : ''}
        ${ownerName && onBuild && !isMortgaged ? `<button class="btn btn-primary" id="modalBtnBuild" ${!canBuild ? 'disabled style="opacity:0.5;"' : ''} style="flex:1;">${buildLabel} ($${tile.houseCost})</button>` : ''}
        ${ownerName && onSell && currentLevel > 0 ? `<button class="btn btn-danger" id="modalBtnSell" style="flex:1;">💵 Sell Building (+$${Math.floor(tile.houseCost * 0.5)})</button>` : ''}
        ${ownerName && onMortgage && !isMortgaged && currentLevel === 0 ? `<button class="btn btn-warn" id="modalBtnMortgage" style="flex:1;">🏦 Mortgage (+$${mortgageValue})</button>` : ''}
        ${ownerName && onUnmortgage && isMortgaged ? `<button class="btn btn-emerald" id="modalBtnUnmortgage" style="flex:1;">🔓 Unmortgage (-$${unmortgageCost})</button>` : ''}
        <button class="btn" id="modalBtnClose" style="flex:1;">Close</button>
      </div>
    `;

    this.showModal(html);

    document.getElementById('modalBtnClose').onclick = () => this.hideModal();
    if (onBuy && document.getElementById('modalBtnBuy')) {
      document.getElementById('modalBtnBuy').onclick = () => { onBuy(); this.hideModal(); };
    }
    if (onBuild && canBuild && document.getElementById('modalBtnBuild')) {
      document.getElementById('modalBtnBuild').onclick = () => { onBuild(); this.hideModal(); };
    }
    if (onSell && document.getElementById('modalBtnSell')) {
      document.getElementById('modalBtnSell').onclick = () => { onSell(); this.hideModal(); };
    }
    if (onMortgage && document.getElementById('modalBtnMortgage')) {
      document.getElementById('modalBtnMortgage').onclick = () => { onMortgage(); this.hideModal(); };
    }
    if (onUnmortgage && document.getElementById('modalBtnUnmortgage')) {
      document.getElementById('modalBtnUnmortgage').onclick = () => { onUnmortgage(); this.hideModal(); };
    }
  }

  showAuctionModal(auctionState, onBid, onPass) {
    const tile = BOARD_TILES[auctionState.propertyId];
    const html = `
      <div class="auction-box">
        <h2 style="color: var(--accent-gold);">🔨 Live Auction!</h2>
        <h3>${tile ? tile.name : 'Property'}</h3>
        <div class="timer-circle">${auctionState.timer}s</div>
        <div>Current Highest Bid:</div>
        <div class="current-bid">$${auctionState.currentBid}</div>
        <div class="bid-controls">
          <button class="btn btn-success" id="btnBid10">+ $10</button>
          <button class="btn btn-success" id="btnBid50">+ $50</button>
          <button class="btn btn-danger" id="btnPassAuction">Pass / Exit</button>
        </div>
      </div>
    `;

    this.showModal(html);

    document.getElementById('btnBid10').onclick = () => onBid(auctionState.currentBid + 10);
    document.getElementById('btnBid50').onclick = () => onBid(auctionState.currentBid + 50);
    document.getElementById('btnPassAuction').onclick = () => {
      onPass();
      this.hideModal();
    };
  }

  showRulesModal(rules, gameStatus, onSave) {
    const isLocked = gameStatus === 'PLAYING';
    const html = `
      <div class="modal-header">
        <div class="modal-title">⚙️ Configurable House Rules</div>
        <button class="close-btn" id="closeRules">✕</button>
      </div>

      ${isLocked ? `
        <div style="background: rgba(239, 68, 68, 0.15); border: 1.5px solid #ef4444; color: #ef4444; padding: 10px; border-radius: 8px; font-size: 0.85rem; font-weight: 700; margin-bottom: 12px;">
          🔒 House rules are locked while a game is in progress. Rules can only be changed before starting or by Admin.
        </div>
      ` : ''}

      <div style="display: flex; flex-direction: column; gap: 12px;">
        <div class="setting-row">
          <div>
            <div class="setting-label">Starting Cash</div>
            <div class="setting-desc">Initial money for all players</div>
          </div>
          <input type="number" id="ruleStartingCash" value="${rules.startingCash}" ${isLocked ? 'disabled' : ''} style="width: 80px; padding: 6px; border-radius: 6px;">
        </div>

        <div class="setting-row">
          <div>
            <div class="setting-label">Free Parking Jackpot</div>
            <div class="setting-desc">Taxes pool in Free Parking</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="ruleJackpot" ${rules.freeParkingJackpotEnabled ? 'checked' : ''} ${isLocked ? 'disabled' : ''}>
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div>
            <div class="setting-label">Rent in Jail</div>
            <div class="setting-desc">Players in jail can collect rent</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="ruleRentInJail" ${rules.rentInJail ? 'checked' : ''} ${isLocked ? 'disabled' : ''}>
            <span class="slider"></span>
          </label>
        </div>

        <div class="setting-row">
          <div>
            <div class="setting-label">Property Auctions</div>
            <div class="setting-desc">Auction unpurchased properties</div>
          </div>
          <label class="switch">
            <input type="checkbox" id="ruleAuctions" ${rules.auctionsEnabled ? 'checked' : ''} ${isLocked ? 'disabled' : ''}>
            <span class="slider"></span>
          </label>
        </div>
      </div>
      ${!isLocked ? `<button class="btn btn-primary" id="btnSaveRules" style="width:100%; margin-top: 20px;">Save Rules</button>` : ''}
    `;

    this.showModal(html);
    document.getElementById('closeRules').onclick = () => this.hideModal();
    if (!isLocked && document.getElementById('btnSaveRules')) {
      document.getElementById('btnSaveRules').onclick = () => {
        onSave({
          startingCash: parseInt(document.getElementById('ruleStartingCash').value) || 1500,
          freeParkingJackpotEnabled: document.getElementById('ruleJackpot').checked,
          rentInJail: document.getElementById('ruleRentInJail').checked,
          auctionsEnabled: document.getElementById('ruleAuctions').checked
        });
        this.hideModal();
      };
    }
  }

  showTradeModal(players, currentPlayer, boardState, onPropose) {
    const opponents = players.filter(p => p.id !== currentPlayer.id && !p.bankrupt);
    if (opponents.length === 0) {
      alert('No other active players available to trade with.');
      return;
    }

    const getPlayerProperties = (playerId) => {
      return BOARD_TILES.filter(tile => boardState[tile.id] && boardState[tile.id].ownerId === playerId);
    };

    const renderPropsList = (propsList, prefix) => {
      if (!propsList || propsList.length === 0) {
        return `<div style="font-size: 0.75rem; color: var(--text-muted); font-style: italic;">No properties owned</div>`;
      }
      return propsList.map(tile => `
        <label class="property-check-item">
          <input type="checkbox" class="${prefix}-prop-cb" value="${tile.id}">
          <span style="width: 10px; height: 10px; border-radius: 2px; background: ${tile.color || '#334155'}; display: inline-block;"></span>
          <span>${tile.name}</span>
        </label>
      `).join('');
    };

    const myProps = getPlayerProperties(currentPlayer.id);

    const html = `
      <div class="modal-header">
        <div class="modal-title">🤝 Propose Property & Cash Trade</div>
        <button class="close-btn" id="closeTrade">✕</button>
      </div>

      <div style="margin-bottom: 12px;">
        <label style="font-weight: 700; font-size: 0.85rem; color: var(--accent-gold);">Trade with Player:</label>
        <select id="tradeTargetSelect" style="width: 100%; padding: 8px; border-radius: 8px; background: rgba(30,41,59,0.9); color: white; border: 1px solid var(--glass-border); margin-top: 4px;">
          ${opponents.map(p => `<option value="${p.id}">${p.name} ($${p.money})</option>`).join('')}
        </select>
      </div>

      <div class="trade-grid">
        <div class="trade-column">
          <div class="trade-column-title">You Offer</div>
          <div style="margin-bottom: 8px;">
            <label style="font-size: 0.75rem;">Cash ($):</label>
            <input type="number" id="offerCash" value="0" min="0" max="${currentPlayer.money}" style="width: 100%; padding: 6px; border-radius: 6px;">
          </div>
          <div style="font-size: 0.75rem; font-weight: 700; margin-top: 6px; margin-bottom: 4px;">Your Properties:</div>
          <div class="property-checklist">
            ${renderPropsList(myProps, 'offer')}
          </div>
        </div>

        <div class="trade-column">
          <div class="trade-column-title">You Request</div>
          <div style="margin-bottom: 8px;">
            <label style="font-size: 0.75rem;">Cash ($):</label>
            <input type="number" id="requestCash" value="0" min="0" style="width: 100%; padding: 6px; border-radius: 6px;">
          </div>
          <div style="font-size: 0.75rem; font-weight: 700; margin-top: 6px; margin-bottom: 4px;">Requested Properties:</div>
          <div class="property-checklist" id="requestPropsContainer">
            ${renderPropsList(getPlayerProperties(opponents[0].id), 'request')}
          </div>
        </div>
      </div>

      <button class="btn btn-primary" id="btnSubmitTrade" style="width:100%; margin-top: 16px;">Send Proposal</button>
    `;

    this.showModal(html);

    // Update target player properties dynamically on dropdown change
    const targetSelect = document.getElementById('tradeTargetSelect');
    const reqContainer = document.getElementById('requestPropsContainer');
    if (targetSelect && reqContainer) {
      targetSelect.onchange = () => {
        const targetId = targetSelect.value;
        reqContainer.innerHTML = renderPropsList(getPlayerProperties(targetId), 'request');
      };
    }

    document.getElementById('closeTrade').onclick = () => this.hideModal();
    document.getElementById('btnSubmitTrade').onclick = () => {
      const targetId = targetSelect.value;
      const offerCash = parseInt(document.getElementById('offerCash').value) || 0;
      const requestCash = parseInt(document.getElementById('requestCash').value) || 0;

      const offerProps = Array.from(document.querySelectorAll('.offer-prop-cb:checked')).map(cb => parseInt(cb.value));
      const requestProps = Array.from(document.querySelectorAll('.request-prop-cb:checked')).map(cb => parseInt(cb.value));

      onPropose({ targetId, offerCash, requestCash, offerProps, requestProps });
      this.hideModal();
    };
  }

  showIncomingTradeModal(trade, senderName, onAccept, onDecline) {
    const offerPropsText = trade.offer.properties.map(id => BOARD_TILES[id]?.name).filter(Boolean).join(', ') || 'None';
    const reqPropsText = trade.request.properties.map(id => BOARD_TILES[id]?.name).filter(Boolean).join(', ') || 'None';

    const html = `
      <div class="modal-header">
        <div class="modal-title" style="color: var(--accent-gold);">📜 Incoming Trade Offer!</div>
      </div>

      <div style="text-align: center; margin: 10px 0; font-weight: 700; font-size: 1.1rem; color: var(--accent-neon-blue);">
        ${senderName} proposed a trade to you!
      </div>

      <div class="trade-grid">
        <div class="trade-column">
          <div class="trade-column-title" style="color: var(--accent-emerald);">You Receive:</div>
          <div>💰 Cash: <strong>$${trade.offer.cash}</strong></div>
          <div style="margin-top: 6px;">🏠 Properties: <strong>${offerPropsText}</strong></div>
        </div>

        <div class="trade-column">
          <div class="trade-column-title" style="color: var(--accent-rose);">You Give:</div>
          <div>💰 Cash: <strong>$${trade.request.cash}</strong></div>
          <div style="margin-top: 6px;">🏠 Properties: <strong>${reqPropsText}</strong></div>
        </div>
      </div>

      <div style="display: flex; gap: 10px; margin-top: 20px;">
        <button class="btn btn-success" id="btnAcceptTradeOffer" style="flex: 1;">✅ Accept Trade</button>
        <button class="btn btn-danger" id="btnDeclineTradeOffer" style="flex: 1;">❌ Decline</button>
      </div>
    `;

    this.showModal(html);

    document.getElementById('btnAcceptTradeOffer').onclick = () => {
      onAccept();
      this.hideModal();
    };
    document.getElementById('btnDeclineTradeOffer').onclick = () => {
      onDecline();
      this.hideModal();
    };
  }

  showJailOptionsModal(player, onRollDoubles, onPayFine, onUseCard) {
    const hasCard = player.jailCards && player.jailCards > 0;
    const canPay = player.money >= 50;

    const html = `
      <div class="modal-header">
        <div class="modal-title" style="color: var(--accent-warn);">🔒 You are in Jail!</div>
      </div>

      <div style="text-align: center; margin: 12px 0; font-size: 0.95rem; color: var(--text-main);">
        Choose how you want to handle your turn:
      </div>

      <div style="display: flex; flex-direction: column; gap: 10px; margin-top: 16px;">
        <button class="btn btn-primary" id="btnJailRollDoubles" style="padding: 12px; font-size: 0.95rem;">
          🎲 Roll for Doubles (Free Exit if Successful)
        </button>

        <button class="btn btn-success" id="btnJailPayFine" ${!canPay ? 'disabled style="opacity:0.5;"' : 'style="padding: 12px; font-size: 0.95rem;"'}>
          💳 Pay $50 Fine & Exit Immediately
        </button>

        ${hasCard ? `
          <button class="btn btn-accent" id="btnJailUseCard" style="padding: 12px; font-size: 0.95rem;">
            🎴 Use "Get Out of Jail Free" Card (${player.jailCards})
          </button>
        ` : ''}
      </div>
    `;

    this.showModal(html);

    document.getElementById('btnJailRollDoubles').onclick = () => {
      onRollDoubles();
      this.hideModal();
    };

    if (canPay && document.getElementById('btnJailPayFine')) {
      document.getElementById('btnJailPayFine').onclick = () => {
        onPayFine();
        this.hideModal();
      };
    }

    if (hasCard && document.getElementById('btnJailUseCard')) {
      document.getElementById('btnJailUseCard').onclick = () => {
        onUseCard();
        this.hideModal();
      };
    }
  }
}
