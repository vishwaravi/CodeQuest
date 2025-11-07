import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import socketService from '../services/socket';
import toast from 'react-hot-toast';

const Matchmaking = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [difficulty, setDifficulty] = useState('medium');
  const [searching, setSearching] = useState(false);
  const [queueStatus, setQueueStatus] = useState(null);
  const [stats, setStats] = useState(null);
  
  // Get userId - handle both user.id (from getPublicProfile) and user._id
  const userId = user?.id || user?._id;

  useEffect(() => {
    if (!user || !userId) {
      navigate('/login');
      return;
    }

    console.log('👤 Matchmaking - Current User:', user);
    console.log('🆔 User ID:', userId);

    // Connect socket
    socketService.connect();

    // Check for active battle
    checkActiveBattle();

    // Fetch user stats
    fetchStats();

    // Listen to queue status updates
    socketService.onQueueStatus((status) => {
      setQueueStatus(status);
    });

    // Listen for match found
    socketService.onBattleMatched((data) => {
      console.log('🎮 Battle matched!', data);
      toast.success(`Match found! Opponent: ${data.opponent.username}`);
      setSearching(false);
      
      // Navigate to battle room
      setTimeout(() => {
        navigate(`/battle/${data.battleId}`);
      }, 1500);
    });

    // Listen for errors
    socketService.onQueueError((error) => {
      console.error('Queue error:', error);
      toast.error(error.message);
      setSearching(false);
    });

    socketService.onQueueJoined((data) => {
      console.log('✅ Joined queue:', data);
      toast.success(data.message);
    });

    socketService.onQueueLeft((data) => {
      console.log('❌ Left queue:', data);
      toast.success(data.message);
    });

    // Cleanup
    return () => {
      if (searching && userId) {
        socketService.leaveQueue(userId);
      }
      socketService.offBattleEvents();
    };
  }, [user, userId, navigate]);

  const checkActiveBattle = async () => {
    try {
      const response = await apiService.getActiveBattle();
      if (response.battle) {
        toast.success('You have an active battle!');
        navigate(`/battle/${response.battle.battleId}`);
      }
    } catch (error) {
      console.error('Error checking active battle:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await apiService.getBattleStats();
      setStats(response.stats);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleFindMatch = () => {
    if (searching) {
      // Cancel search
      socketService.leaveQueue(userId);
      setSearching(false);
    } else {
      // Start search
      socketService.joinQueue(userId, difficulty);
      setSearching(true);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-gray-900 py-12 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-white mb-4">
            ⚔️ Battle Arena
          </h1>
          <p className="text-gray-300 text-lg">
            Find an opponent and prove your coding skills!
          </p>
        </div>

        {/* Stats Card */}
        {stats && (
          <div className="bg-gray-800/50 backdrop-blur rounded-lg p-6 mb-8 border border-purple-500/30">
            <h2 className="text-xl font-semibold text-white mb-4">Your Stats</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-3xl font-bold text-purple-400">{stats.totalBattles}</div>
                <div className="text-gray-400 text-sm">Total Battles</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-green-400">{stats.wins}</div>
                <div className="text-gray-400 text-sm">Wins</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-red-400">{stats.losses}</div>
                <div className="text-gray-400 text-sm">Losses</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-bold text-blue-400">{stats.winRate}%</div>
                <div className="text-gray-400 text-sm">Win Rate</div>
              </div>
            </div>
          </div>
        )}

        {/* Matchmaking Card */}
        <div className="bg-gray-800/80 backdrop-blur rounded-lg p-8 border border-purple-500/50 shadow-2xl">
          {!searching ? (
            <>
              <h2 className="text-2xl font-semibold text-white mb-6">Select Difficulty</h2>
              
              {/* Difficulty Selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {['easy', 'medium', 'hard'].map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setDifficulty(diff)}
                    className={`p-6 rounded-lg border-2 transition-all ${
                      difficulty === diff
                        ? 'bg-purple-600 border-purple-400 scale-105'
                        : 'bg-gray-700/50 border-gray-600 hover:border-purple-400'
                    }`}
                  >
                    <div className="text-center">
                      <div className="text-3xl mb-2">
                        {diff === 'easy' && '🟢'}
                        {diff === 'medium' && '🟡'}
                        {diff === 'hard' && '🔴'}
                      </div>
                      <div className={`text-xl font-semibold capitalize ${
                        difficulty === diff ? 'text-white' : 'text-gray-300'
                      }`}>
                        {diff}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Find Match Button */}
              <button
                onClick={handleFindMatch}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white text-xl font-bold py-4 px-8 rounded-lg hover:from-purple-700 hover:to-pink-700 transition-all transform hover:scale-105 shadow-lg"
              >
                🎮 Find Match
              </button>

              {/* Queue Status */}
              {queueStatus && (
                <div className="mt-6 text-center text-gray-400 text-sm">
                  <div>Players in queue: {queueStatus.totalInQueue}</div>
                  <div className="mt-2 flex justify-center gap-4">
                    <span>🟢 Easy: {queueStatus.easy}</span>
                    <span>🟡 Medium: {queueStatus.medium}</span>
                    <span>🔴 Hard: {queueStatus.hard}</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Searching Animation */}
              <div className="text-center">
                <div className="mb-6">
                  <div className="inline-block relative">
                    <div className="w-32 h-32 border-8 border-purple-200 border-t-purple-600 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-4xl">
                      ⚔️
                    </div>
                  </div>
                </div>
                
                <h2 className="text-3xl font-bold text-white mb-3">
                  Finding Opponent...
                </h2>
                <p className="text-gray-400 mb-2">
                  Searching for a worthy challenger
                </p>
                <p className="text-purple-400 font-semibold capitalize mb-6">
                  Difficulty: {difficulty}
                </p>

                {/* Cancel Button */}
                <button
                  onClick={handleFindMatch}
                  className="bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-8 rounded-lg transition-all"
                >
                  Cancel Search
                </button>
              </div>
            </>
          )}
        </div>

        {/* Tips Section */}
        <div className="mt-8 bg-gray-800/30 backdrop-blur rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-3">💡 Battle Tips</h3>
          <ul className="text-gray-400 space-y-2">
            <li>• You'll be matched with players of similar skill level</li>
            <li>• Both players get the same question to solve</li>
            <li>• First to pass all test cases wins!</li>
            <li>• If both pass, the faster submission wins</li>
            <li>• Gain rating for wins, lose rating for losses</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default Matchmaking;
