import Battle from '../models/Battle.js';
import matchmakingQueue from '../utils/matchmakingQueue.js';

// Get user's battle history
export const getBattleHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const limit = parseInt(req.query.limit) || 20;

    const battles = await Battle.getUserBattleHistory(userId, limit);

    res.json({
      success: true,
      count: battles.length,
      battles
    });
  } catch (error) {
    console.error('Error fetching battle history:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch battle history'
    });
  }
};

// Get specific battle details
export const getBattleDetails = async (req, res) => {
  try {
    const { battleId } = req.params;
    const userId = req.user._id;

    const battle = await Battle.findOne({ battleId })
      .populate('question')
      .populate('players.user', 'username avatar rating')
      .populate('winner', 'username');

    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found'
      });
    }

    // Check if user is authorized to view this battle
    const isPlayer = battle.players.some(
      p => p.user._id.toString() === userId.toString()
    );

    if (!isPlayer) {
      return res.status(403).json({
        success: false,
        message: 'Not authorized to view this battle'
      });
    }

    res.json({
      success: true,
      battle: battle.getBattleData()
    });
  } catch (error) {
    console.error('Error fetching battle details:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch battle details'
    });
  }
};

// Get user's battle statistics
export const getBattleStats = async (req, res) => {
  try {
    const userId = req.user._id;

    const stats = await Battle.getUserStats(userId);

    res.json({
      success: true,
      stats
    });
  } catch (error) {
    console.error('Error fetching battle stats:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch battle statistics'
    });
  }
};

// Get active battle for user
export const getActiveBattle = async (req, res) => {
  try {
    const userId = req.user._id;

    const activeBattle = await Battle.findOne({
      'players.user': userId,
      status: { $in: ['waiting', 'ready', 'in-progress'] }
    })
      .populate('question')
      .populate('players.user', 'username avatar rating');

    if (!activeBattle) {
      return res.json({
        success: true,
        battle: null
      });
    }

    res.json({
      success: true,
      battle: activeBattle.getBattleData()
    });
  } catch (error) {
    console.error('Error fetching active battle:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch active battle'
    });
  }
};

// Get matchmaking queue status
export const getQueueStatus = async (req, res) => {
  try {
    const status = matchmakingQueue.getQueueStatus();

    res.json({
      success: true,
      queue: status
    });
  } catch (error) {
    console.error('Error fetching queue status:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch queue status'
    });
  }
};

// Get user's queue position
export const getUserQueuePosition = async (req, res) => {
  try {
    const userId = req.user._id;

    const position = matchmakingQueue.getUserQueuePosition(userId);

    if (!position) {
      return res.json({
        success: true,
        inQueue: false
      });
    }

    res.json({
      success: true,
      inQueue: true,
      position
    });
  } catch (error) {
    console.error('Error fetching queue position:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch queue position'
    });
  }
};

// Get leaderboard
export const getLeaderboard = async (req, res) => {
  try {
    const limit = parseInt(req.query.limit) || 50;

    const leaderboard = await Battle.aggregate([
      { $match: { status: 'completed' } },
      { $unwind: '$players' },
      {
        $group: {
          _id: '$players.user',
          totalBattles: { $sum: 1 },
          wins: {
            $sum: {
              $cond: [{ $eq: ['$winner', '$players.user'] }, 1, 0]
            }
          },
          testsPassed: { $sum: '$players.testsPassed' },
          totalTests: { $sum: '$players.totalTests' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      {
        $project: {
          _id: 0,
          user: {
            _id: '$user._id',
            username: '$user.username',
            avatar: '$user.avatar',
            rating: '$user.rating'
          },
          stats: {
            totalBattles: '$totalBattles',
            wins: '$wins',
            winRate: {
              $multiply: [{ $divide: ['$wins', '$totalBattles'] }, 100]
            },
            testsPassed: '$testsPassed',
            totalTests: '$totalTests'
          }
        }
      },
      { $sort: { 'user.rating': -1 } },
      { $limit: limit }
    ]);

    res.json({
      success: true,
      leaderboard
    });
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to fetch leaderboard'
    });
  }
};
