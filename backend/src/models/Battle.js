import mongoose from 'mongoose';

const battleSchema = new mongoose.Schema({
  battleId: {
    type: String,
    required: true,
    unique: true,
    index: true
  },
  question: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Question',
    required: true
  },
  difficulty: {
    type: String,
    enum: ['easy', 'medium', 'hard'],
    required: true
  },
  players: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    socketId: String,
    language: {
      type: String,
      default: 'javascript',
      enum: ['javascript', 'python', 'java', 'cpp', 'c', 'csharp', 'typescript', 'go', 'rust', 'php']
    },
    isReady: {
      type: Boolean,
      default: false
    },
    code: {
      type: String,
      default: ''
    },
    submittedAt: Date,
    testsPassed: Number,
    totalTests: Number,
    executionTime: Number, // in milliseconds
    result: {
      type: String,
      enum: ['pending', 'passed', 'failed', 'error', 'timeout', 'forfeit', 'won_by_forfeit'],
      default: 'pending'
    }
  }],
  status: {
    type: String,
    enum: ['waiting', 'ready', 'in-progress', 'completed', 'cancelled'],
    default: 'waiting'
  },
  winner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  startedAt: Date,
  completedAt: Date,
  duration: Number, // in seconds
  ratingChanges: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    oldRating: Number,
    newRating: Number,
    change: Number
  }]
}, {
  timestamps: true
});

// Index for faster queries
battleSchema.index({ 'players.user': 1 });
battleSchema.index({ status: 1, createdAt: -1 });
battleSchema.index({ winner: 1 });

// Methods
battleSchema.methods.getBattleData = function() {
  return {
    battleId: this.battleId,
    question: this.question,
    difficulty: this.difficulty,
    players: this.players.map(p => ({
      user: p.user,
      isReady: p.isReady,
      result: p.result,
      testsPassed: p.testsPassed,
      totalTests: p.totalTests,
      submittedAt: p.submittedAt
    })),
    status: this.status,
    winner: this.winner,
    startedAt: this.startedAt,
    completedAt: this.completedAt,
    duration: this.duration,
    ratingChanges: this.ratingChanges
  };
};

battleSchema.methods.getPlayerData = function(userId) {
  const player = this.players.find(p => p.user.toString() === userId.toString());
  return player || null;
};

battleSchema.methods.updatePlayerCode = function(userId, code) {
  const player = this.players.find(p => p.user.toString() === userId.toString());
  if (player) {
    player.code = code;
  }
};

battleSchema.methods.updatePlayerLanguage = function(userId, language) {
  const player = this.players.find(p => {
    const playerId = p.user._id ? p.user._id.toString() : p.user.toString();
    return playerId === userId.toString();
  });
  
  if (player) {
    player.language = language;
    console.log(`🌐 Player ${userId} changed language to ${language}`);
  }
};

battleSchema.methods.markPlayerReady = function(userId) {
  const player = this.players.find(p => {
    const playerId = p.user._id ? p.user._id.toString() : p.user.toString();
    return playerId === userId.toString();
  });
  
  if (player) {
    player.isReady = true;
    console.log(`✅ Player ${userId} marked ready`);
  } else {
    console.log(`❌ Player ${userId} not found in battle`);
  }
  
  // Check if all players are ready
  const allReady = this.players.every(p => p.isReady);
  console.log(`🔍 All players ready check: ${allReady}`, this.players.map(p => ({ 
    user: p.user._id || p.user, 
    isReady: p.isReady 
  })));
  
  if (allReady && this.status === 'ready') {
    this.status = 'in-progress';
    this.startedAt = new Date();
    console.log(`🚀 Battle status changed to in-progress`);
  }
};

battleSchema.methods.submitPlayerSolution = function(userId, result) {
  const player = this.players.find(p => p.user.toString() === userId.toString());
  if (player) {
    player.submittedAt = new Date();
    player.testsPassed = result.testsPassed;
    player.totalTests = result.totalTests;
    player.executionTime = result.executionTime;
    player.result = result.status;
  }
};

battleSchema.methods.determineBattleWinner = function() {
  if (this.players.length !== 2) return null;

  const [player1, player2] = this.players;

  // Both must have submitted
  if (!player1.submittedAt || !player2.submittedAt) return null;

  // Winner criteria:
  // 1. More tests passed wins
  // 2. If equal, faster submission wins
  // 3. If both fail all tests, it's a draw

  if (player1.testsPassed > player2.testsPassed) {
    this.winner = player1.user;
  } else if (player2.testsPassed > player1.testsPassed) {
    this.winner = player2.user;
  } else if (player1.testsPassed === player2.testsPassed && player1.testsPassed > 0) {
    // Equal tests passed, check submission time
    if (player1.submittedAt < player2.submittedAt) {
      this.winner = player1.user;
    } else {
      this.winner = player2.user;
    }
  }
  // If both fail all tests, winner remains null (draw)

  this.status = 'completed';
  this.completedAt = new Date();
  this.duration = Math.floor((this.completedAt - this.startedAt) / 1000);

  return this.winner;
};

// Static methods
battleSchema.statics.createBattle = async function(player1Id, player2Id, question, difficulty) {
  const battleId = `battle_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  const battle = new this({
    battleId,
    question: question._id,
    difficulty,
    players: [
      { user: player1Id, code: question.starterCode?.javascript || '' },
      { user: player2Id, code: question.starterCode?.javascript || '' }
    ],
    status: 'ready'
  });

  await battle.save();
  await battle.populate([
    { path: 'question', select: '-testCases' },
    { path: 'players.user', select: 'username avatar rating' }
  ]);

  return battle;
};

battleSchema.statics.getUserBattleHistory = async function(userId, limit = 20) {
  return this.find({
    'players.user': userId,
    status: 'completed'
  })
    .populate('question', 'title difficulty')
    .populate('players.user', 'username avatar rating')
    .populate('winner', 'username')
    .sort({ completedAt: -1 })
    .limit(limit);
};

battleSchema.statics.getUserStats = async function(userId) {
  const battles = await this.find({
    'players.user': userId,
    status: 'completed'
  });

  const wins = battles.filter(b => b.winner && b.winner.toString() === userId.toString()).length;
  const total = battles.length;
  const losses = total - wins;
  const winRate = total > 0 ? ((wins / total) * 100).toFixed(2) : 0;

  return {
    totalBattles: total,
    wins,
    losses,
    winRate: parseFloat(winRate)
  };
};

const Battle = mongoose.model('Battle', battleSchema);

export default Battle;
