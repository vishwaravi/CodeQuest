import matchmakingQueue from '../utils/matchmakingQueue.js';
import Battle from '../models/Battle.js';
import User from '../models/User.js';

// Store socket-to-user mapping
const socketUserMap = new Map(); // socketId -> userId

export const initializeBattleSocket = (io) => {
  // Matchmaking auto-check interval
  const matchmakingInterval = setInterval(async () => {
    try {
      const matches = await matchmakingQueue.checkForMatches();
      
      for (const match of matches) {
        const { battle, player1, player2 } = match;
        
        // Notify both players they've been matched
        io.to(player1.socketId).emit('battle:matched', {
          battleId: battle.battleId,
          opponent: {
            username: battle.players[1].user.username,
            avatar: battle.players[1].user.avatar,
            rating: battle.players[1].user.rating
          },
          question: battle.question,
          difficulty: battle.difficulty
        });
        
        io.to(player2.socketId).emit('battle:matched', {
          battleId: battle.battleId,
          opponent: {
            username: battle.players[0].user.username,
            avatar: battle.players[0].user.avatar,
            rating: battle.players[0].user.rating
          },
          question: battle.question,
          difficulty: battle.difficulty
        });
      }
    } catch (error) {
      console.error('❌ Error in matchmaking interval:', error);
    }
  }, 3000); // Check every 3 seconds

  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // Join matchmaking queue
    socket.on('queue:join', async ({ userId, difficulty }) => {
      try {
        const user = await User.findById(userId);
        if (!user) {
          socket.emit('queue:error', { message: 'User not found' });
          return;
        }

        socketUserMap.set(socket.id, userId);

        const result = matchmakingQueue.addToQueue(
          userId,
          socket.id,
          user.rating,
          difficulty
        );

        if (result.success) {
          socket.emit('queue:joined', {
            message: `Joined ${difficulty} queue`,
            queueSize: result.queueSize,
            difficulty
          });

          // Broadcast queue status to all clients
          io.emit('queue:status', matchmakingQueue.getQueueStatus());
        } else {
          socket.emit('queue:error', { message: result.message });
        }
      } catch (error) {
        console.error('❌ Error joining queue:', error);
        socket.emit('queue:error', { message: 'Failed to join queue' });
      }
    });

    // Leave matchmaking queue
    socket.on('queue:leave', ({ userId }) => {
      try {
        const removed = matchmakingQueue.removeFromQueue(userId);
        
        if (removed) {
          socket.emit('queue:left', { message: 'Left matchmaking queue' });
          io.emit('queue:status', matchmakingQueue.getQueueStatus());
        }
      } catch (error) {
        console.error('❌ Error leaving queue:', error);
      }
    });

    // Join battle room
    socket.on('battle:join', async ({ battleId, userId }) => {
      try {
        const battle = await Battle.findOne({ battleId })
          .populate('question')
          .populate('players.user', 'username avatar rating');

        if (!battle) {
          socket.emit('battle:error', { message: 'Battle not found' });
          return;
        }

        // Verify user is part of this battle
        const isPlayer = battle.players.some(
          p => p.user._id.toString() === userId.toString()
        );

        if (!isPlayer) {
          socket.emit('battle:error', { message: 'Not authorized for this battle' });
          return;
        }

        // Join socket room
        socket.join(battleId);

        // Update socket ID for this player
        const player = battle.players.find(
          p => p.user._id.toString() === userId.toString()
        );
        if (player) {
          player.socketId = socket.id;
          await battle.save();
        }

        socketUserMap.set(socket.id, userId);

        // Send battle data to player
        socket.emit('battle:joined', {
          battle: battle.getBattleData(),
          playerData: battle.getPlayerData(userId)
        });

        console.log(`🎮 User ${userId} joined battle ${battleId}`);
      } catch (error) {
        console.error('❌ Error joining battle:', error);
        socket.emit('battle:error', { message: 'Failed to join battle' });
      }
    });

    // Player ready
    socket.on('battle:ready', async ({ battleId, userId }) => {
      try {
        const battle = await Battle.findOne({ battleId })
          .populate('players.user', 'username avatar');

        if (!battle) {
          socket.emit('battle:error', { message: 'Battle not found' });
          return;
        }

        console.log(`👍 Player ${userId} clicked ready in battle ${battleId}`);
        console.log(`📊 Current battle status: ${battle.status}`);
        console.log(`👥 Players before marking ready:`, battle.players.map(p => ({
          userId: p.user._id,
          username: p.user.username,
          isReady: p.isReady
        })));

        battle.markPlayerReady(userId);
        await battle.save();

        const allReady = battle.players.every(p => p.isReady);
        console.log(`✅ All players ready: ${allReady}`);

        // Notify both players
        io.to(battleId).emit('battle:player-ready', {
          userId,
          allReady
        });

        // If all players ready, start countdown
        if (allReady && battle.status === 'in-progress') {
          console.log(`🎬 Starting countdown for battle ${battleId}`);
          // Start 3-second countdown
          let countdown = 3;
          const countdownInterval = setInterval(() => {
            io.to(battleId).emit('battle:countdown', { count: countdown });
            countdown--;

            if (countdown < 0) {
              clearInterval(countdownInterval);
              io.to(battleId).emit('battle:start', {
                startTime: new Date(),
                timeLimit: battle.question.timeLimit || 1800 // 30 minutes default
              });
              console.log(`🚀 Battle ${battleId} started!`);
            }
          }, 1000);
        }
      } catch (error) {
        console.error('❌ Error marking player ready:', error);
        socket.emit('battle:error', { message: 'Failed to mark ready' });
      }
    });

    // Code change (real-time sync) - DEPRECATED, use battle:code-sync instead
    socket.on('battle:code-change', async ({ battleId, userId, code }) => {
      try {
        const battle = await Battle.findOne({ battleId });
        
        if (!battle) return;

        battle.updatePlayerCode(userId, code);
        await battle.save();

        // Broadcast code change to opponent only
        socket.to(battleId).emit('battle:opponent-code-change', {
          userId,
          codeLength: code.length // Don't send actual code, just length for UI
        });
      } catch (error) {
        console.error('❌ Error updating code:', error);
      }
    });

    // Code sync with full code (debounced from client)
    socket.on('battle:code-sync', async ({ battleId, userId, code, codeLength }) => {
      try {
        const battle = await Battle.findOne({ battleId });
        
        if (!battle) return;

        battle.updatePlayerCode(userId, code);
        await battle.save();

        // Broadcast full code to opponent
        socket.to(battleId).emit('battle:opponent-code-sync', {
          userId,
          code,
          codeLength
        });

        console.log(`📝 Code synced for user ${userId}: ${codeLength} chars`);
      } catch (error) {
        console.error('❌ Error syncing code:', error);
      }
    });

    // Language change
    socket.on('battle:language-change', async ({ battleId, userId, language }) => {
      try {
        const battle = await Battle.findOne({ battleId });
        
        if (!battle) return;

        battle.updatePlayerLanguage(userId, language);
        await battle.save();

        // Notify both players
        io.to(battleId).emit('battle:language-changed', {
          userId,
          language
        });

        console.log(`🌐 Language changed for user ${userId}: ${language}`);
      } catch (error) {
        console.error('❌ Error changing language:', error);
      }
    });

    // Submit solution
    socket.on('battle:submit', async ({ battleId, userId, code, result }) => {
      try {
        const battle = await Battle.findOne({ battleId })
          .populate('players.user', 'username avatar rating');

        if (!battle) {
          socket.emit('battle:error', { message: 'Battle not found' });
          return;
        }

        // Save submission result
        battle.submitPlayerSolution(userId, result);
        await battle.save();

        // Notify both players of submission
        io.to(battleId).emit('battle:player-submitted', {
          userId,
          testsPassed: result.testsPassed,
          totalTests: result.totalTests,
          status: result.status
        });

        // Check if both players have submitted
        const allSubmitted = battle.players.every(p => p.submittedAt);

        if (allSubmitted) {
          // Determine winner
          const winner = battle.determineBattleWinner();
          await battle.save();

          // Update user stats
          for (const player of battle.players) {
            const user = await User.findById(player.user._id);
            if (user) {
              user.stats.totalMatches += 1;
              if (winner && winner.toString() === user._id.toString()) {
                user.stats.wins += 1;
                user.rating += 25; // Simple rating system
              } else if (!winner) {
                // Draw - no rating change
              } else {
                user.stats.losses += 1;
                user.rating = Math.max(0, user.rating - 15);
              }
              user.stats.winRate = user.stats.totalMatches > 0 
                ? ((user.stats.wins / user.stats.totalMatches) * 100).toFixed(2)
                : 0;
              await user.save();
            }
          }

          // Notify battle completion
          io.to(battleId).emit('battle:completed', {
            winner: winner ? battle.players.find(p => p.user._id.toString() === winner.toString()).user : null,
            battle: battle.getBattleData()
          });

          // Remove from active battles
          matchmakingQueue.completeBattle(battleId);

          console.log(`🏆 Battle ${battleId} completed. Winner: ${winner || 'Draw'}`);
        }
      } catch (error) {
        console.error('❌ Error submitting solution:', error);
        socket.emit('battle:error', { message: 'Failed to submit solution' });
      }
    });

    // Handle player leaving battle
    socket.on('battle:leave', async ({ battleId, userId }) => {
      try {
        console.log(`🚪 Player ${userId} leaving battle ${battleId}`);

        const battle = await Battle.findOne({ battleId })
          .populate('players.user', 'username avatar rating')
          .populate('question');

        if (!battle) {
          return socket.emit('battle:error', { message: 'Battle not found' });
        }

        // Find the leaving player and opponent
        const leavingPlayer = battle.players.find(p => p.user._id.toString() === userId);
        const opponent = battle.players.find(p => p.user._id.toString() !== userId);

        if (!leavingPlayer) {
          return socket.emit('battle:error', { message: 'Player not in battle' });
        }

        // If battle hasn't started yet, just cancel it
        if (battle.status === 'waiting' || battle.status === 'ready') {
          battle.status = 'cancelled';
          await battle.save();

          // Notify both players
          io.to(battleId).emit('battle:cancelled', {
            message: `${leavingPlayer.user.username} left the battle`,
            reason: 'player_left'
          });

          // Remove from active battles
          matchmakingQueue.completeBattle(battleId);
          
          console.log(`❌ Battle ${battleId} cancelled - player left before start`);
          return;
        }

        // If battle is in progress, opponent wins by forfeit
        if (battle.status === 'in-progress') {
          battle.status = 'completed';
          battle.winner = opponent.user._id;
          battle.completedAt = new Date();
          
          // Calculate duration
          if (battle.startedAt) {
            battle.duration = Math.floor((battle.completedAt - battle.startedAt) / 1000);
          }

          // Mark leaving player as failed
          leavingPlayer.result = 'forfeit';
          leavingPlayer.testsPassed = 0;
          leavingPlayer.totalTests = 0;

          // Mark opponent as winner
          opponent.result = 'won_by_forfeit';
          opponent.testsPassed = opponent.totalTests || 0;

          await battle.save();

          // Update user stats and ratings
          const leavingUser = await User.findById(userId);
          const opponentUser = await User.findById(opponent.user._id);

          if (leavingUser) {
            leavingUser.stats.totalMatches += 1;
            leavingUser.stats.losses += 1;
            leavingUser.rating = Math.max(0, leavingUser.rating - 30); // Harsh penalty for leaving
            leavingUser.stats.winRate = leavingUser.stats.totalMatches > 0 
              ? ((leavingUser.stats.wins / leavingUser.stats.totalMatches) * 100).toFixed(2)
              : 0;
            await leavingUser.save();
          }

          if (opponentUser) {
            opponentUser.stats.totalMatches += 1;
            opponentUser.stats.wins += 1;
            opponentUser.rating += 20; // Bonus for opponent
            opponentUser.stats.winRate = opponentUser.stats.totalMatches > 0 
              ? ((opponentUser.stats.wins / opponentUser.stats.totalMatches) * 100).toFixed(2)
              : 0;
            await opponentUser.save();
          }

          // Notify both players
          io.to(battleId).emit('battle:player-left', {
            leftPlayer: {
              userId: leavingPlayer.user._id,
              username: leavingPlayer.user.username
            },
            winner: opponent.user,
            message: `${leavingPlayer.user.username} left the battle. ${opponent.user.username} wins by forfeit!`
          });

          // Notify battle completion
          io.to(battleId).emit('battle:completed', {
            winner: opponent.user,
            battle: battle.getBattleData(),
            reason: 'forfeit'
          });

          // Remove from active battles
          matchmakingQueue.completeBattle(battleId);

          console.log(`🏆 Battle ${battleId} completed by forfeit. Winner: ${opponent.user.username}`);
        }
      } catch (error) {
        console.error('❌ Error handling player leave:', error);
        socket.emit('battle:error', { message: 'Failed to leave battle' });
      }
    });

    // Handle disconnection
    socket.on('disconnect', () => {
      console.log(`🔌 Socket disconnected: ${socket.id}`);
      
      // Remove from queue if in queue
      const { removed, userId } = matchmakingQueue.removeBySocketId(socket.id);
      
      if (removed) {
        io.emit('queue:status', matchmakingQueue.getQueueStatus());
      }

      // Clean up socket-user mapping
      socketUserMap.delete(socket.id);
    });
  });

  // Cleanup on server shutdown
  process.on('SIGTERM', () => {
    clearInterval(matchmakingInterval);
  });

  console.log('⚔️ Battle Socket initialized');
};
