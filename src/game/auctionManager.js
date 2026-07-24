// Live Property Auction Management System

export class AuctionManager {
  constructor() {
    this.active = false;
    this.propertyId = null;
    this.currentBid = 0;
    this.highestBidder = null;
    this.bidders = []; // List of player IDs still in auction
    this.timer = 15; // Seconds count
    this.intervalId = null;
    this.onUpdateCallback = null;
    this.onEndCallback = null;
  }

  startAuction(propertyId, initialPrice, players, onUpdate, onEnd) {
    this.active = true;
    this.propertyId = propertyId;
    this.currentBid = Math.max(10, Math.floor(initialPrice * 0.5));
    this.highestBidder = null;
    this.bidders = players.filter(p => !p.bankrupt).map(p => p.id);
    this.timer = 15;
    this.onUpdateCallback = onUpdate;
    this.onEndCallback = onEnd;

    this.resetTimer();
  }

  resetTimer() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.timer = 15;
    
    this.intervalId = setInterval(() => {
      this.timer--;
      if (this.onUpdateCallback) this.onUpdateCallback(this.getState());

      if (this.timer <= 0) {
        this.endAuction();
      }
    }, 1000);

    if (this.onUpdateCallback) this.onUpdateCallback(this.getState());
  }

  placeBid(playerId, bidAmount) {
    if (!this.active || !this.bidders.includes(playerId)) return false;
    if (bidAmount <= this.currentBid) return false;

    this.currentBid = bidAmount;
    this.highestBidder = playerId;
    this.resetTimer(); // Reset timer on active bid
    return true;
  }

  passBid(playerId) {
    if (!this.active) return;
    this.bidders = this.bidders.filter(id => id !== playerId);

    if (this.bidders.length <= 1 && this.highestBidder) {
      this.endAuction();
    } else if (this.bidders.length === 0) {
      this.endAuction();
    } else {
      if (this.onUpdateCallback) this.onUpdateCallback(this.getState());
    }
  }

  endAuction() {
    if (this.intervalId) clearInterval(this.intervalId);
    this.active = false;

    const result = {
      propertyId: this.propertyId,
      winnerId: this.highestBidder,
      finalBid: this.highestBidder ? this.currentBid : 0
    };

    if (this.onEndCallback) this.onEndCallback(result);
  }

  getState() {
    return {
      active: this.active,
      propertyId: this.propertyId,
      currentBid: this.currentBid,
      highestBidder: this.highestBidder,
      biddersCount: this.bidders.length,
      timer: this.timer
    };
  }
}
