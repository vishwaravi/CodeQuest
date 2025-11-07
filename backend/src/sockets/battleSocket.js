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

        battle.markPlayerReady(userId);
        await battle.save();

        // Notify both players
        io.to(battleId).emit('battle:player-ready', {
          userId,
          allReady: battle.players.every(p => p.isReady)
        });

        // If all players ready, start countdown
        if (battle.players.every(p => p.isReady) && battle.status === 'in-progress') {
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
            }
          }, 1000);
        }
      } catch (error) {
        console.error('❌ Error marking player ready:', error);
        socket.emit('battle:error', { message: 'Failed to mark ready' });
      }
    });

    // Code change (real-time sync)
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
