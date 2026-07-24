// Transparent Dice & Modular Luck Factor Engine

import { BOARD_TILES } from './boardData.js';

export class LuckEngine {
  constructor() {
    // Dict of username -> luckMultiplier (default: 'GE' has very subtle luck enabled)
    this.playerLuckMap = {
      'GE': true
    };
    this.history = [];
  }

  setPlayerLuck(username, enabled) {
    this.playerLuckMap[username] = !!enabled;
  }

  isLuckEnabled(username) {
    return !!this.playerLuckMap[username];
  }

  // Roll standard 2d6 dice, with a very subtle bias applied if luck enabled
  rollDice(player, gameState) {
    const rawDie1 = Math.floor(Math.random() * 6) + 1;
    const rawDie2 = Math.floor(Math.random() * 6) + 1;

    // Default unbiased roll
    let die1 = rawDie1;
    let die2 = rawDie2;

    const currentPosition = player.position;
    const username = player.name;
    const isGeluck = this.isLuckEnabled(username);

    // Find if any other active player has luck enabled (e.g., GE)
    const luckyOwner = gameState?.players?.find(p => this.isLuckEnabled(p.name) && p.id !== player.id);

    // Toned down GE luck: very subtle (~12% gentle nudge chance)
    if ((isGeluck || luckyOwner) && Math.random() < 0.12 && gameState?.boardState) {
      const candidates = [];
      // Generate all possible 2d6 combinations (2 to 12)
      for (let d1 = 1; d1 <= 6; d1++) {
        for (let d2 = 1; d2 <= 6; d2++) {
          const sum = d1 + d2;
          const targetTileId = (currentPosition + sum) % 40;
          const tile = BOARD_TILES[targetTileId];
          const tileOwnerId = gameState.boardState[targetTileId]?.ownerId;

          let score = 10; // Baseline score

          if (isGeluck) {
            // Player's turn with Luck Enabled (Very subtle boosts)
            if (!tileOwnerId && tile.price > 0) {
              score += Math.floor(tile.price / 80);
            } else if (tileOwnerId === player.id) {
              score += 3;
            } else if (tileOwnerId && tileOwnerId !== player.id) {
              score -= 4;
            }
          } else if (luckyOwner) {
            // Opponent's turn: very mild nudge towards lucky owner's tiles
            if (tileOwnerId === luckyOwner.id) {
              score += 6;
            }
          }

          candidates.push({ d1, d2, sum, score: Math.max(1, score) });
        }
      }

      // Weighted random selection from candidates
      const totalScore = candidates.reduce((acc, c) => acc + c.score, 0);
      let randVal = Math.random() * totalScore;
      for (const candidate of candidates) {
        randVal -= candidate.score;
        if (randVal <= 0) {
          die1 = candidate.d1;
          die2 = candidate.d2;
          break;
        }
      }
    }

    const rollData = {
      die1,
      die2,
      sum: die1 + die2,
      isDouble: die1 === die2,
      timestamp: Date.now()
    };

    this.history.push({ username, ...rollData });
    if (this.history.length > 50) this.history.shift();

    return rollData;
  }
}

export const globalLuckEngine = new LuckEngine();
