import Question from '../models/Question.js';
import Battle from '../models/Battle.js';

class MatchmakingQueue {
  constructor() {
    // Queue structure: { userId, socketId, rating, difficulty, timestamp }
    this.queue = {
      easy: [],
      medium: [],
      hard: []
    };
    
    // Track active battles: Map<userId, battleId>
    this.activeBattles = new Map();
    
    // Rating difference threshold for matching (increases over time)
    this.baseRatingThreshold = 200;
    this.maxWaitTime = 60000; // 60 seconds max wait
  }

  // Add user to matchmaking queue
  addToQueue(userId, socketId, rating, difficulty) {
    // Check if user is already in queue
    if (this.isUserInQueue(userId)) {
      return { success: false, message: 'Already in queue' };
    }

    // Check if user is already in an active battle
    if (this.activeBattles.has(userId.toString())) {
      return { success: false, message: 'Already in an active battle' };
    }

    const queueEntry = {
      userId: userId.toString(),
      socketId,
      rating,
      difficulty,
      timestamp: Date.now()
    };

    this.queue[difficulty].push(queueEntry);
    
    console.log(`✅ User ${userId} joined ${difficulty} queue. Queue size: ${this.queue[difficulty].length}`);
    
    return { success: true, queueSize: this.queue[difficulty].length };
  }

  // Remove user from queue
  removeFromQueue(userId) {
    let removed = false;
    
    for (const difficulty in this.queue) {
      const index = this.queue[difficulty].findIndex(
        entry => entry.userId === userId.toString()
      );
      
      if (index !== -1) {
        this.queue[difficulty].splice(index, 1);
        removed = true;
        console.log(`❌ User ${userId} left ${difficulty} queue`);
        break;
      }
    }
    
    return removed;
  }

  // Remove user by socket ID (for disconnections)
  removeBySocketId(socketId) {
    let removed = false;
    let userId = null;
    
    for (const difficulty in this.queue) {
      const index = this.queue[difficulty].findIndex(
        entry => entry.socketId === socketId
      );
      
      if (index !== -1) {
        userId = this.queue[difficulty][index].userId;
        this.queue[difficulty].splice(index, 1);
        removed = true;
        console.log(`❌ User (socket: ${socketId}) disconnected from ${difficulty} queue`);
        break;
      }
    }
    
    return { removed, userId };
  }

  // Check if user is in any queue
  isUserInQueue(userId) {
    for (const difficulty in this.queue) {
      if (this.queue[difficulty].some(entry => entry.userId === userId.toString())) {
        return true;
      }
    }
    return false;
  }

  // Find a match for a user based on rating and wait time
  async findMatch(difficulty) {
    const difficultyQueue = this.queue[difficulty];
    
    if (difficultyQueue.length < 2) {
      return null; // Not enough players
    }

    // Sort by timestamp (older players get matched first)
    difficultyQueue.sort((a, b) => a.timestamp - b.timestamp);

    // Try to match the oldest player in queue
    const player1 = difficultyQueue[0];
    const waitTime = Date.now() - player1.timestamp;
    
    // Calculate dynamic rating threshold based on wait time
    const ratingThreshold = this.baseRatingThreshold + 
      (waitTime / this.maxWaitTime) * this.baseRatingThreshold;

    // Find suitable opponent
    for (let i = 1; i < difficultyQueue.length; i++) {
      const player2 = difficultyQueue[i];
      const ratingDiff = Math.abs(player1.rating - player2.rating);

      if (ratingDiff <= ratingThreshold) {
        // Found a match!
        console.log(`🎮 Match found! ${player1.userId} (${player1.rating}) vs ${player2.userId} (${player2.rating})`);
        
        // Remove both players from queue
        difficultyQueue.splice(i, 1); // Remove player2 first (higher index)
        difficultyQueue.splice(0, 1); // Remove player1
        
        // Get a random question for this difficulty
        const question = await Question.getRandomByDifficulty(difficulty);
        
        if (!question) {
          console.error(`❌ No questions found for difficulty: ${difficulty}`);
          // Put players back in queue
          this.queue[difficulty].push(player1, player2);
          return null;
        }

        // Create battle
        const battle = await Battle.createBattle(
          player1.userId,
          player2.userId,
          question,
          difficulty
        );

        // Track active battles
        this.activeBattles.set(player1.userId, battle.battleId);
        this.activeBattles.set(player2.userId, battle.battleId);

        return {
          battle,
          player1: {
            userId: player1.userId,
            socketId: player1.socketId
          },
          player2: {
            userId: player2.userId,
            socketId: player2.socketId
          }
        };
      }
    }

    return null; // No suitable match found
  }

  // Auto-match check for all difficulties
  async checkForMatches() {
    const matches = [];
    
    for (const difficulty in this.queue) {
      let match = await this.findMatch(difficulty);
      while (match) {
        matches.push(match);
        match = await this.findMatch(difficulty);
      }
    }
    
    return matches;
  }

  // Remove battle from active battles when completed
  completeBattle(battleId) {
    for (const [userId, activeBattleId] of this.activeBattles.entries()) {
      if (activeBattleId === battleId) {
        this.activeBattles.delete(userId);
      }
    }
    console.log(`✅ Battle ${battleId} completed and removed from active battles`);
  }

  // Get queue status
  getQueueStatus() {
    return {
      easy: this.queue.easy.length,
      medium: this.queue.medium.length,
      hard: this.queue.hard.length,
      totalInQueue: this.queue.easy.length + this.queue.medium.length + this.queue.hard.length,
      activeBattles: this.activeBattles.size / 2 // Each battle has 2 players
    };
  }

  // Get user's queue position
  getUserQueuePosition(userId) {
    for (const difficulty in this.queue) {
      const index = this.queue[difficulty].findIndex(
        entry => entry.userId === userId.toString()
      );
      
      if (index !== -1) {
        return {
          difficulty,
          position: index + 1,
          totalInQueue: this.queue[difficulty].length,
          waitTime: Date.now() - this.queue[difficulty][index].timestamp
        };
      }
    }
    return null;
  }
}

// Singleton instance
const matchmakingQueue = new MatchmakingQueue();

export default matchmakingQueue;
