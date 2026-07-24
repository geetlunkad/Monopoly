// Core Monopoly Game Engine & Rules Evaluator

import { BOARD_TILES, PROPERTY_GROUPS } from './boardData.js';
import { CHANCE_CARDS, COMMUNITY_CHEST_CARDS } from './cardsData.js';
import { globalLuckEngine } from './luckEngine.js';
import { AuctionManager } from './auctionManager.js';
import { TradeManager } from './tradeManager.js';

export class GameEngine {
  constructor() {
    this.reset();
  }

  reset() {
    this.gameId = 'game_' + Math.random().toString(36).substring(2, 8);
    this.status = 'LOBBY'; // LOBBY, PLAYING, PAUSED, FINISHED
    this.players = [];
    this.currentTurnIndex = 0;
    this.doublesCount = 0;
    this.hasRolled = false;
    this.freeParkingJackpot = 0;
    this.logs = [];
    this.boardState = {};

    this.auctionManager = new AuctionManager();
    this.tradeManager = new TradeManager();

    // Default Configurable House Rules
    this.rules = {
      startingCash: 1500,
      salaryPassGo: 200,
      doubleSalaryOnExactGo: true,
      freeParkingJackpotEnabled: true,
      taxToJackpot: true,
      auctionsEnabled: true,
      rentInJail: true,
      evenBuildingRule: true,
      maxDoublesToJail: 3,
      timedTurns: false,
      turnTimeLimitSec: 45
    };

    // Initialize board ownership & houses
    BOARD_TILES.forEach(tile => {
      this.boardState[tile.id] = {
        ownerId: null,
        houses: 0,
        hotel: false,
        mortgaged: false
      };
    });

    this.chanceDeck = [...CHANCE_CARDS].sort(() => Math.random() - 0.5);
    this.communityDeck = [...COMMUNITY_CHEST_CARDS].sort(() => Math.random() - 0.5);
  }

  addPlayer(name, isAI = false, color = null) {
    if (this.players.length >= 8) return false;
    const id = 'p_' + String(name).replace(/\s+/g, '_') + '_' + Date.now();
    const newPlayer = {
      id,
      name: String(name),
      color: color || ['#38bdf8', '#f59e0b', '#10b981', '#ef4444', '#a855f7', '#ec4899'][this.players.length % 6],
      money: this.rules.startingCash,
      position: 0,
      inJail: false,
      jailTurns: 0,
      jailCards: 0,
      bankrupt: false,
      isAI: !!isAI,
      stats: {
        turnsPlayed: 0,
        propertiesOwned: 0,
        housesBuilt: 0,
        hotelsBuilt: 0,
        rentPaid: 0,
        rentCollected: 0
      }
    };
    this.players.push(newPlayer);
    this.addLog(`${name} joined the game!`);
    return newPlayer;
  }

  startGame() {
    if (this.players.length < 2) return false;
    this.status = 'PLAYING';
    this.currentTurnIndex = 0;
    this.hasRolled = false;
    this.addLog(`🎲 Game started! ${this.getCurrentPlayer().name}'s turn.`);
    return true;
  }

  getCurrentPlayer() {
    return this.players[this.currentTurnIndex];
  }

  nextTurn() {
    if (this.status !== 'PLAYING') return;

    this.doublesCount = 0;
    this.hasRolled = false;
    let nextIndex = (this.currentTurnIndex + 1) % this.players.length;

    // Skip bankrupt players
    let count = 0;
    while (this.players[nextIndex].bankrupt && count < this.players.length) {
      nextIndex = (nextIndex + 1) % this.players.length;
      count++;
    }

    this.currentTurnIndex = nextIndex;
    const activePlayer = this.getCurrentPlayer();
    activePlayer.stats.turnsPlayed++;
    this.addLog(`👉 It is now ${activePlayer.name}'s turn.`);

    // Check if AI turn
    if (activePlayer.isAI && !activePlayer.bankrupt) {
      setTimeout(() => this.handleAITurn(), 1200);
    }
  }

  rollDice() {
    const player = this.getCurrentPlayer();
    if (!player || player.bankrupt) return null;

    if (this.hasRolled) {
      this.addLog(`⚠️ ${player.name} has already rolled this turn. Click End Turn!`);
      return null;
    }

    const roll = globalLuckEngine.rollDice(player, { players: this.players, board: this.boardState });
    this.lastRollSum = roll.sum;
    this.addLog(`🎲 ${player.name} rolled a ${roll.die1} and ${roll.die2} (Total: ${roll.sum})`);

    if (roll.isDouble) {
      this.doublesCount++;
      this.addLog(`✨ Double rolled! (${this.doublesCount}/${this.rules.maxDoublesToJail})`);

      if (this.doublesCount >= this.rules.maxDoublesToJail) {
        this.sendToJail(player, 'Rolled 3 doubles in a row');
        this.hasRolled = true;
        return roll;
      }
      // Bonus roll granted for doubles
      this.hasRolled = false;
    } else {
      // Non-double roll: cannot roll again until next turn
      this.hasRolled = true;
    }

    if (player.inJail) {
      this.handleJailRoll(player, roll);
    } else {
      this.movePlayer(player, roll.sum);
    }

    return roll;
  }

  movePlayer(player, steps, isDirectMove = false, collectGo = true) {
    const prevPosition = player.position;
    let newPosition = (player.position + steps) % 40;
    if (newPosition < 0) newPosition += 40;

    player.position = newPosition;

    // Check passing GO
    if (!isDirectMove && collectGo && newPosition < prevPosition) {
      const salary = (newPosition === 0 && this.rules.doubleSalaryOnExactGo)
        ? this.rules.salaryPassGo * 2
        : this.rules.salaryPassGo;
      player.money += salary;
      this.addLog(`💰 ${player.name} passed GO and collected $${salary}!`);
    }

    const tile = BOARD_TILES[newPosition];
    this.addLog(`📍 ${player.name} landed on ${tile.name}.`);

    this.handleTileLanding(player, tile);
  }

  handleTileLanding(player, tile) {
    const state = this.boardState[tile.id];

    switch (tile.type) {
      case 'PROPERTY':
      case 'RAILROAD':
      case 'UTILITY':
        if (!state.ownerId) {
          this.addLog(`🏠 ${tile.name} is available for $${tile.price}.`);
        } else if (state.ownerId !== player.id && !state.mortgaged) {
          const owner = this.players.find(p => p.id === state.ownerId);
          
          // Check rent in jail rule
          if (owner.inJail && !this.rules.rentInJail) {
            this.addLog(`🔒 ${owner.name} is in jail and cannot collect rent.`);
            return;
          }

          const rent = this.calculateRent(tile.id);
          this.payPlayer(player, owner, rent, `Rent for ${tile.name}`);
        }
        break;

      case 'TAX':
        const tax = tile.taxAmount;
        player.money -= tax;
        this.addLog(`💸 ${player.name} paid $${tax} in taxes.`);
        if (this.rules.freeParkingJackpotEnabled && this.rules.taxToJackpot) {
          this.freeParkingJackpot += tax;
          this.addLog(`💰 $${tax} added to Free Parking Jackpot! Current total: $${this.freeParkingJackpot}`);
        }
        break;

      case 'FREE_PARKING':
        if (this.rules.freeParkingJackpotEnabled && this.freeParkingJackpot > 0) {
          const jackpot = this.freeParkingJackpot;
          player.money += jackpot;
          this.addLog(`🎉 ${player.name} won the Free Parking Jackpot of $${jackpot}!`);
          this.freeParkingJackpot = 0;
        }
        break;

      case 'GO_TO_JAIL':
        this.sendToJail(player, 'Landed on Go To Jail');
        break;

      case 'CHANCE':
        this.drawCard(player, 'CHANCE');
        break;

      case 'COMMUNITY':
        this.drawCard(player, 'COMMUNITY');
        break;
    }
  }

  calculateRent(tileId) {
    const tile = BOARD_TILES[tileId];
    const state = this.boardState[tileId];
    const ownerId = state.ownerId;

    if (!ownerId || state.mortgaged) return 0;

    if (tile.type === 'PROPERTY') {
      if (state.hotel) return tile.rent[5];
      if (state.houses > 0) return tile.rent[state.houses];
      
      // Check full color monopoly (doubles rent for un-improved properties)
      const groupTiles = PROPERTY_GROUPS[tile.group];
      const ownsAll = groupTiles.every(id => this.boardState[id].ownerId === ownerId);
      return ownsAll ? tile.rent[0] * 2 : tile.rent[0];
    } else if (tile.type === 'RAILROAD') {
      const ownedRRs = PROPERTY_GROUPS.RAILROAD.filter(id => this.boardState[id].ownerId === ownerId).length;
      return tile.rent[ownedRRs - 1] || 25;
    } else if (tile.type === 'UTILITY') {
      const ownedUtilities = PROPERTY_GROUPS.UTILITY.filter(id => this.boardState[id].ownerId === ownerId).length;
      const lastRoll = 7; // Average fallback
      return ownedUtilities === 2 ? lastRoll * 10 : lastRoll * 4;
    }

    return 0;
  }

  buyProperty(player, tileId) {
    const tile = BOARD_TILES[tileId];
    const state = this.boardState[tileId];

    if (!tile || state.ownerId || player.money < tile.price) return false;

    player.money -= tile.price;
    state.ownerId = player.id;
    player.stats.propertiesOwned++;
    this.addLog(`🔑 ${player.name} bought ${tile.name} for $${tile.price}.`);
    return true;
  }

  getEffectiveBuildingLevel(tileId) {
    const state = this.boardState[tileId];
    if (!state) return 0;
    if (state.hotel) return 5;
    return state.houses || 0;
  }

  canBuildHouse(player, tileId) {
    const tile = BOARD_TILES[tileId];
    const state = this.boardState[tileId];

    if (!tile || tile.type !== 'PROPERTY' || !state || state.ownerId !== player.id || state.mortgaged || player.money < tile.houseCost) return false;

    // Check Monopoly ownership requirement
    const groupTiles = PROPERTY_GROUPS[tile.group];
    const ownsMonopoly = groupTiles.every(id => this.boardState[id].ownerId === player.id);
    if (!ownsMonopoly) return false;

    // Check if any property in group is mortgaged
    if (groupTiles.some(id => this.boardState[id].mortgaged)) return false;

    const currentLevel = this.getEffectiveBuildingLevel(tileId);
    if (currentLevel >= 5) return false; // Already has Hotel

    // Check Even Building Rule
    if (this.rules.evenBuildingRule) {
      const minLevel = Math.min(...groupTiles.map(id => this.getEffectiveBuildingLevel(id)));
      if (currentLevel > minLevel) return false;
    }

    return true;
  }

  buildHouse(player, tileId) {
    if (!this.canBuildHouse(player, tileId)) return false;

    const tile = BOARD_TILES[tileId];
    const state = this.boardState[tileId];
    const currentLevel = this.getEffectiveBuildingLevel(tileId);

    if (currentLevel < 4) {
      state.houses++;
      player.money -= tile.houseCost;
      player.stats.housesBuilt++;
      this.addLog(`🏗️ ${player.name} built house #${state.houses} on ${tile.name}.`);
      return true;
    } else if (currentLevel === 4) {
      state.houses = 0;
      state.hotel = true;
      player.money -= tile.houseCost;
      player.stats.hotelsBuilt++;
      this.addLog(`🏨 ${player.name} upgraded to a HOTEL on ${tile.name}!`);
      return true;
    }

    return false;
  }

  sellHouse(player, tileId) {
    const tile = BOARD_TILES[tileId];
    const state = this.boardState[tileId];

    if (!tile || state.ownerId !== player.id) return false;

    const groupTiles = PROPERTY_GROUPS[tile.group];
    const currentLevel = this.getEffectiveBuildingLevel(tileId);
    if (currentLevel <= 0) return false;

    // Check Even Selling Rule
    if (this.rules.evenBuildingRule) {
      const maxLevel = Math.max(...groupTiles.map(id => this.getEffectiveBuildingLevel(id)));
      if (currentLevel < maxLevel) return false;
    }

    const refund = Math.floor(tile.houseCost * 0.5);

    if (state.hotel) {
      state.hotel = false;
      state.houses = 4; // Hotel degrades back to 4 houses
      player.money += refund;
      this.addLog(`💵 ${player.name} sold HOTEL on ${tile.name} for $${refund} (degraded to 4 houses).`);
      return true;
    } else if (state.houses > 0) {
      state.houses--;
      player.money += refund;
      this.addLog(`💵 ${player.name} sold 1 house on ${tile.name} for $${refund}.`);
      return true;
    }

    return false;
  }

  sendToJail(player, reason) {
    player.inJail = true;
    player.jailTurns = 0;
    player.position = 10; // Jail space
    this.addLog(`🔒 ${player.name} sent to Jail! Reason: ${reason}.`);
  }

  payJailFine(player) {
    if (!player || !player.inJail || player.money < 50) return null;
    player.money -= 50;
    player.inJail = false;
    player.jailTurns = 0;
    this.addLog(`💳 ${player.name} paid $50 fine and exited Jail.`);
    if (this.rules.freeParkingJackpotEnabled && this.rules.taxToJackpot) {
      this.freeParkingJackpot += 50;
    }
    const roll = this.rollDice();
    this.hasRolled = true;
    return roll;
  }

  useJailCard(player) {
    if (!player || !player.inJail || !player.jailCards || player.jailCards <= 0) return null;
    player.jailCards--;
    player.inJail = false;
    player.jailTurns = 0;
    this.addLog(`🎴 ${player.name} used a Get Out of Jail Free card!`);
    const roll = this.rollDice();
    this.hasRolled = true;
    return roll;
  }

  handleJailRoll(player, roll) {
    this.hasRolled = true;
    if (roll.isDouble) {
      player.inJail = false;
      player.jailTurns = 0;
      this.addLog(`🔓 ${player.name} rolled doubles (${roll.die1}-${roll.die2}) and broke out of Jail!`);
      this.movePlayer(player, roll.sum);
    } else {
      player.jailTurns++;
      this.addLog(`🔒 ${player.name} failed to roll doubles in Jail (${player.jailTurns}/3).`);

      if (player.jailTurns >= 3) {
        player.money -= 50;
        player.inJail = false;
        player.jailTurns = 0;
        this.addLog(`🔓 ${player.name} paid $50 fine after 3 turns and exited Jail.`);
        this.movePlayer(player, roll.sum);
      }
    }
  }

  payPlayer(sender, receiver, amount, reason) {
    if (sender.money < amount) {
      // Automatic bankruptcy check or payment of remaining cash
      const paid = Math.max(0, sender.money);
      sender.money -= amount;
      receiver.money += paid;
      this.addLog(`⚠️ ${sender.name} owed $${amount} to ${receiver.name} for ${reason}, but only had $${paid}.`);
      this.checkBankruptcy(sender);
    } else {
      sender.money -= amount;
      receiver.money += amount;
      this.addLog(`💸 ${sender.name} paid $${amount} to ${receiver.name} for ${reason}.`);
    }
  }

  checkBankruptcy(player) {
    if (player.money < 0) {
      player.bankrupt = true;
      this.addLog(`💥 ${player.name} went bankrupt and is eliminated from the game!`);
      
      // Relinquish properties to Bank
      Object.keys(this.boardState).forEach(id => {
        if (this.boardState[id].ownerId === player.id) {
          this.boardState[id].ownerId = null;
          this.boardState[id].houses = 0;
          this.boardState[id].hotel = false;
          this.boardState[id].mortgaged = false;
        }
      });

      // Check win condition
      const activePlayers = this.players.filter(p => !p.bankrupt);
      if (activePlayers.length === 1) {
        this.status = 'FINISHED';
        this.addLog(`🏆 GAME OVER! ${activePlayers[0].name} IS THE WINNER!`);
      }
    }
  }

  drawCard(player, deckType) {
    const deck = deckType === 'CHANCE' ? this.chanceDeck : this.communityDeck;
    const card = deck.shift();
    deck.push(card); // Recycle card

    this.addLog(`🎴 ${player.name} drew ${deckType} Card: "${card.text}"`);

    switch (card.action) {
      case 'MONEY':
        player.money += card.amount;
        break;
      case 'MOVE_TO':
        this.movePlayer(player, (card.target - player.position + 40) % 40, false, card.collectGo);
        break;
      case 'MOVE_RELATIVE':
        this.movePlayer(player, card.amount);
        break;
      case 'GO_TO_JAIL':
        this.sendToJail(player, 'Chance/Chest Card');
        break;
      case 'JAIL_CARD':
        player.jailCards = (player.jailCards || 0) + 1;
        break;
      case 'COLLECT_ALL':
        this.players.filter(p => p.id !== player.id && !p.bankrupt).forEach(p => {
          this.payPlayer(p, player, card.amount, 'Card Gift');
        });
        break;
      case 'PAY_ALL':
        this.players.filter(p => p.id !== player.id && !p.bankrupt).forEach(p => {
          this.payPlayer(player, p, card.amount, 'Card Fee');
        });
        break;
    }
  }

  handleAITurn() {
    const player = this.getCurrentPlayer();
    if (!player || !player.isAI || player.bankrupt || this.status !== 'PLAYING') return;

    // Ensure AI turn can roll
    this.hasRolled = false;
    const roll = this.rollDice();

    if (this.onStateChange) this.onStateChange();

    // AI Decision: Buy Property if landing on unowned tile
    const currentTile = BOARD_TILES[player.position];
    const tileState = this.boardState[currentTile.id];
    if (tileState && !tileState.ownerId && currentTile.price > 0 && player.money >= currentTile.price + 100) {
      this.buyProperty(player, currentTile.id);
      if (this.onStateChange) this.onStateChange();
    }

    if (roll && roll.isDouble && !player.inJail && !player.bankrupt && this.doublesCount < 3) {
      // AI rolls again on doubles after a short delay
      setTimeout(() => this.handleAITurn(), 1500);
    } else {
      // AI ends turn
      setTimeout(() => {
        this.nextTurn();
        if (this.onStateChange) this.onStateChange();
      }, 1500);
    }
  }

  addLog(msg) {
    const logItem = { time: new Date().toLocaleTimeString(), message: msg };
    this.logs.unshift(logItem);
    if (this.logs.length > 80) this.logs.pop();
  }
}
