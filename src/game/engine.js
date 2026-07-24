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

    this.initBoardState();
  }

  initBoardState() {
    this.boardState = {};
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

  addPlayer(arg1, arg2 = false, arg3 = null, arg4 = null) {
    if (this.players.length >= 8) return false;

    let id, name, isAI, color;

    if (typeof arg1 === 'object' && arg1 !== null) {
      id = arg1.id;
      name = arg1.name || arg1.username;
      isAI = !!arg1.isAI;
      color = arg1.color;
    } else if (typeof arg1 === 'string' && (arg1.startsWith('usr_') || arg1.startsWith('p_') || arg1.startsWith('bot_'))) {
      id = arg1;
      name = String(arg2);
      color = arg3;
      isAI = (arg4 === true);
    } else {
      name = String(arg1);
      isAI = (arg2 === true);
      color = arg3;
      id = arg4;
    }

    const cleanName = String(name).trim();
    if (!cleanName || cleanName === 'true' || cleanName === 'false' || cleanName.startsWith('usr_') || cleanName.startsWith('p_')) {
      return false;
    }

    // Check case-insensitive existing player by name OR id
    const existingPlayer = this.players.find(p => p.id === id || p.name.toLowerCase() === cleanName.toLowerCase());

    if (existingPlayer) {
      // PRESERVE ALL GAME PROGRESS & RESTORE!
      existingPlayer.name = cleanName;
      existingPlayer.isAI = isAI;
      if (color) existingPlayer.color = color;
      if (this.onStateChange) this.onStateChange();
      return existingPlayer;
    }

    const playerID = id || ('p_' + cleanName.replace(/\s+/g, '_').toLowerCase());
    const playerColor = color || ['#38bdf8', '#f59e0b', '#10b981', '#ef4444', '#a855f7', '#ec4899'][this.players.length % 6];

    const newPlayer = {
      id: playerID,
      name: cleanName,
      color: playerColor,
      money: this.rules.startingCash,
      position: 0,
      inJail: false,
      jailTurns: 0,
      jailCards: 0,
      bankrupt: false,
      isAI: isAI,
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
    this.addLog(`${cleanName} joined the game!`);
    if (this.onStateChange) this.onStateChange();
    return newPlayer;
  }

  removePlayer(playerIdOrName) {
    const player = this.players.find(p => p.id === playerIdOrName || p.name === playerIdOrName);
    if (!player || player.name === 'GE') return false;

    this.players = this.players.filter(p => p.id !== player.id);
    if (this.currentTurnIndex >= this.players.length) {
      this.currentTurnIndex = 0;
    }
    this.addLog(`🤖 ${player.name} was removed from the game.`);
    if (this.onStateChange) this.onStateChange();
    return true;
  }

  startGame() {
    if (this.players.length < 1) return false;
    this.status = 'PLAYING';
    this.currentTurnIndex = 0;
    this.hasRolled = false;
    this.addLog(`🎲 Game started! ${this.getCurrentPlayer() ? this.getCurrentPlayer().name : 'Player'}'s turn.`);
    if (this.onStateChange) this.onStateChange();
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
    while (this.players[nextIndex] && this.players[nextIndex].bankrupt && count < this.players.length) {
      nextIndex = (nextIndex + 1) % this.players.length;
      count++;
    }

    this.currentTurnIndex = nextIndex;
    const activePlayer = this.getCurrentPlayer();
    if (activePlayer) {
      activePlayer.stats.turnsPlayed++;
      this.addLog(`👉 It is now ${activePlayer.name}'s turn.`);

      if (activePlayer.isAI && !activePlayer.bankrupt) {
        setTimeout(() => this.handleAITurn(), 1200);
      }
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
      this.hasRolled = false;
    } else {
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

    if (tile.type === 'TAX') {
      const taxAmount = tile.taxAmount || 100;
      player.money -= taxAmount;
      this.addLog(`💸 ${player.name} paid $${taxAmount} in ${tile.name}.`);
      if (this.rules.freeParkingJackpotEnabled && this.rules.taxToJackpot) {
        this.freeParkingJackpot += taxAmount;
      }
      this.checkBankruptcy(player);
    } else if (tile.type === 'GO_TO_JAIL') {
      this.sendToJail(player, 'Landed on Go to Jail');
    } else if (tile.type === 'FREE_PARKING' && this.rules.freeParkingJackpotEnabled) {
      if (this.freeParkingJackpot > 0) {
        player.money += this.freeParkingJackpot;
        this.addLog(`🎁 ${player.name} claimed Free Parking Jackpot of $${this.freeParkingJackpot}!`);
        this.freeParkingJackpot = 0;
      }
    } else if (tile.type === 'CHANCE') {
      this.drawCard(player, 'CHANCE');
    } else if (tile.type === 'COMMUNITY_CHEST') {
      this.drawCard(player, 'COMMUNITY_CHEST');
    } else if (tile.price > 0 && state && state.ownerId && state.ownerId !== player.id) {
      const owner = this.players.find(p => p.id === state.ownerId);
      if (owner && !owner.bankrupt) {
        if (owner.inJail && !this.rules.rentInJail) {
          this.addLog(`🙈 ${owner.name} is in Jail and cannot collect rent.`);
          return;
        }

        const rent = this.calculateRent(tile.id);
        if (rent > 0) {
          this.payPlayer(player, owner, rent, `Rent for ${tile.name}`);
        }
      }
    }
  }

  calculateRent(tileId) {
    const tile = BOARD_TILES[tileId];
    const state = this.boardState[tileId];
    const ownerId = state ? state.ownerId : null;

    if (!ownerId || state.mortgaged) return 0;

    if (tile.type === 'PROPERTY') {
      if (state.hotel) return tile.rent[5];
      if (state.houses > 0) return tile.rent[state.houses];
      
      const groupTiles = PROPERTY_GROUPS[tile.group];
      const ownsAll = groupTiles.every(id => this.boardState[id].ownerId === ownerId);
      return ownsAll ? tile.rent[0] * 2 : tile.rent[0];
    } else if (tile.type === 'RAILROAD') {
      const ownedRRs = PROPERTY_GROUPS.RAILROAD.filter(id => this.boardState[id].ownerId === ownerId).length;
      return tile.rent[ownedRRs - 1] || 25;
    } else if (tile.type === 'UTILITY') {
      const ownedUtilities = PROPERTY_GROUPS.UTILITY.filter(id => this.boardState[id].ownerId === ownerId).length;
      const lastRoll = this.lastRollSum || 7;
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
    if (this.onStateChange) this.onStateChange();
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

    const groupTiles = PROPERTY_GROUPS[tile.group];
    const ownsMonopoly = groupTiles.every(id => this.boardState[id].ownerId === player.id);
    if (!ownsMonopoly) return false;

    if (groupTiles.some(id => this.boardState[id].mortgaged)) return false;

    const currentLevel = this.getEffectiveBuildingLevel(tileId);
    if (currentLevel >= 5) return false;

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
      if (this.onStateChange) this.onStateChange();
      return true;
    } else if (currentLevel === 4) {
      state.houses = 0;
      state.hotel = true;
      player.money -= tile.houseCost;
      player.stats.hotelsBuilt++;
      this.addLog(`🏨 ${player.name} upgraded to a HOTEL on ${tile.name}!`);
      if (this.onStateChange) this.onStateChange();
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

    if (this.rules.evenBuildingRule) {
      const maxLevel = Math.max(...groupTiles.map(id => this.getEffectiveBuildingLevel(id)));
      if (currentLevel < maxLevel) return false;
    }

    const refund = Math.floor(tile.houseCost * 0.5);

    if (state.hotel) {
      state.hotel = false;
      state.houses = 4;
      player.money += refund;
      this.addLog(`💵 ${player.name} sold HOTEL on ${tile.name} for $${refund} (degraded to 4 houses).`);
      if (this.onStateChange) this.onStateChange();
      return true;
    } else if (state.houses > 0) {
      state.houses--;
      player.money += refund;
      this.addLog(`💵 ${player.name} sold 1 house on ${tile.name} for $${refund}.`);
      if (this.onStateChange) this.onStateChange();
      return true;
    }

    return false;
  }

  mortgageProperty(player, tileId) {
    const tile = BOARD_TILES[tileId];
    const state = this.boardState[tileId];

    if (!tile || state.ownerId !== player.id || state.mortgaged) return false;

    if (tile.type === 'PROPERTY') {
      const groupTiles = PROPERTY_GROUPS[tile.group];
      const hasBuildings = groupTiles.some(id => this.getEffectiveBuildingLevel(id) > 0);
      if (hasBuildings) return false;
    }

    const mortgageValue = Math.floor(tile.price * 0.5);
    state.mortgaged = true;
    player.money += mortgageValue;
    this.addLog(`🏦 ${player.name} mortgaged ${tile.name} for +$${mortgageValue}.`);
    if (this.onStateChange) this.onStateChange();
    return true;
  }

  unmortgageProperty(player, tileId) {
    const tile = BOARD_TILES[tileId];
    const state = this.boardState[tileId];

    if (!tile || state.ownerId !== player.id || !state.mortgaged) return false;

    const unmortgageCost = Math.floor(tile.price * 0.55);
    if (player.money < unmortgageCost) return false;

    player.money -= unmortgageCost;
    state.mortgaged = false;
    this.addLog(`🔓 ${player.name} unmortgaged ${tile.name} for $${unmortgageCost}.`);
    if (this.onStateChange) this.onStateChange();
    return true;
  }

  declareBankruptcy(player) {
    if (!player || player.bankrupt) return false;

    this.addLog(`💥 ${player.name} declared voluntary BANKRUPTCY!`);

    Object.keys(this.boardState).forEach(tileId => {
      const state = this.boardState[tileId];
      if (state.ownerId === player.id) {
        state.ownerId = null;
        state.houses = 0;
        state.hotel = false;
        state.mortgaged = false;
      }
    });

    player.money = 0;
    player.bankrupt = true;

    const activePlayers = this.players.filter(p => !p.bankrupt);
    if (activePlayers.length === 1) {
      this.status = 'FINISHED';
      this.addLog(`🏆 GAME OVER! ${activePlayers[0].name} IS THE WINNER!`);
    } else if (this.getCurrentPlayer() && this.getCurrentPlayer().id === player.id) {
      this.nextTurn();
    }

    if (this.onStateChange) this.onStateChange();
    return true;
  }

  sendToJail(player, reason) {
    player.inJail = true;
    player.jailTurns = 0;
    player.position = 10;
    this.addLog(`🔒 ${player.name} sent to Jail! Reason: ${reason}.`);
    if (this.onStateChange) this.onStateChange();
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
      
      Object.keys(this.boardState).forEach(id => {
        if (this.boardState[id].ownerId === player.id) {
          this.boardState[id].ownerId = null;
          this.boardState[id].houses = 0;
          this.boardState[id].hotel = false;
          this.boardState[id].mortgaged = false;
        }
      });

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
    deck.push(card);

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
      case 'JAIL':
        this.sendToJail(player, card.text);
        break;
      case 'JAIL_FREE':
        player.jailCards = (player.jailCards || 0) + 1;
        break;
    }
    this.checkBankruptcy(player);
  }

  addLog(msg) {
    const logEntry = {
      id: Date.now() + Math.random(),
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
      msg
    };
    this.logs.unshift(logEntry);
    if (this.logs.length > 50) this.logs.pop();
  }
}
