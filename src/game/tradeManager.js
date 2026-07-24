// Player Trading Engine (Cash, Properties, Get Out of Jail Cards)

export class TradeManager {
  constructor() {
    this.activeTrade = null;
    this.tradeHistory = [];
  }

  createProposal(senderId, receiverId, offer, request) {
    /*
      offer / request schema:
      {
        cash: number,
        properties: [tileId],
        jailCards: number
      }
    */
    this.activeTrade = {
      id: 'trade_' + Date.now(),
      senderId,
      receiverId,
      offer: { cash: offer.cash || 0, properties: offer.properties || [], jailCards: offer.jailCards || 0 },
      request: { cash: request.cash || 0, properties: request.properties || [], jailCards: request.jailCards || 0 },
      status: 'PENDING', // PENDING, ACCEPTED, REJECTED, CANCELLED
      createdAt: Date.now()
    };
    return this.activeTrade;
  }

  acceptTrade(gameState) {
    if (!this.activeTrade || this.activeTrade.status !== 'PENDING') return false;

    const trade = this.activeTrade;
    const sender = gameState.players.find(p => p.id === trade.senderId);
    const receiver = gameState.players.find(p => p.id === trade.receiverId);

    if (!sender || !receiver) return false;

    // Validate balances
    if (sender.money < trade.offer.cash || receiver.money < trade.request.cash) {
      return false;
    }
    if ((sender.jailCards || 0) < trade.offer.jailCards || (receiver.jailCards || 0) < trade.request.jailCards) {
      return false;
    }

    // Execute Cash Transfer
    sender.money -= trade.offer.cash;
    sender.money += trade.request.cash;
    receiver.money -= trade.request.cash;
    receiver.money += trade.offer.cash;

    // Execute Jail Cards Transfer
    sender.jailCards = (sender.jailCards || 0) - trade.offer.jailCards + trade.request.jailCards;
    receiver.jailCards = (receiver.jailCards || 0) - trade.request.jailCards + trade.offer.jailCards;

    // Execute Property Transfers
    trade.offer.properties.forEach(propId => {
      if (gameState.boardState[propId]) gameState.boardState[propId].ownerId = receiver.id;
    });
    trade.request.properties.forEach(propId => {
      if (gameState.boardState[propId]) gameState.boardState[propId].ownerId = sender.id;
    });

    trade.status = 'ACCEPTED';
    this.tradeHistory.push({ ...trade });
    this.activeTrade = null;
    return true;
  }

  rejectTrade() {
    if (!this.activeTrade) return;
    this.activeTrade.status = 'REJECTED';
    this.tradeHistory.push({ ...this.activeTrade });
    this.activeTrade = null;
  }

  cancelTrade() {
    if (!this.activeTrade) return;
    this.activeTrade.status = 'CANCELLED';
    this.activeTrade = null;
  }
}
