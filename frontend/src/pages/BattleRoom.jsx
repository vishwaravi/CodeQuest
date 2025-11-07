import { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import socketService from '../services/socket';
import toast from 'react-hot-toast';

const BattleRoom = () => {
  const { battleId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  const [battle, setBattle] = useState(null);
  const [question, setQuestion] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [code, setCode] = useState('');
  const [isReady, setIsReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [battleStarted, setBattleStarted] = useState(false);
  const [battleEnded, setBattleEnded] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [opponentStatus, setOpponentStatus] = useState({ codeLength: 0, submitted: false });
  const [winner, setWinner] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  
  const timerRef = useRef(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    // Connect socket
    socketService.connect();

    // Join battle room
    socketService.joinBattle(battleId, user._id);

    // Listen to battle events
    socketService.onBattleJoined((data) => {
      console.log('🎮 Joined battle:', data);
      setBattle(data.battle);
      setQuestion(data.battle.question);
      setCode(data.playerData?.code || data.battle.question.starterCode?.javascript || '');
      
      // Identify opponent
      const opp = data.battle.players.find(p => p.user._id !== user._id);
      setOpponent(opp);
      
      // Check ready status
      const myPlayer = data.battle.players.find(p => p.user._id === user._id);
      setIsReady(myPlayer?.isReady || false);
      setOpponentReady(opp?.isReady || false);
    });

    socketService.onPlayerReady((data) => {
      console.log('👍 Player ready:', data);
      if (data.userId === user._id) {
        setIsReady(true);
      } else {
        setOpponentReady(true);
      }
      
      if (data.allReady) {
        toast.success('Both players ready! Starting battle...');
      }
    });

    socketService.onCountdown((data) => {
      setCountdown(data.count);
      if (data.count > 0) {
        toast.success(`${data.count}...`, { duration: 900 });
      }
    });

    socketService.onBattleStart((data) => {
      console.log('🚀 Battle started!', data);
      setCountdown(null);
      setBattleStarted(true);
      setTimeRemaining(data.timeLimit);
      toast.success('GO! Start coding!', { icon: '🚀', duration: 2000 });
      
      // Start timer
      timerRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    });

    socketService.onOpponentCodeChange((data) => {
      setOpponentStatus(prev => ({ ...prev, codeLength: data.codeLength }));
    });

    socketService.onPlayerSubmitted((data) => {
      console.log('📝 Player submitted:', data);
      if (data.userId !== user._id) {
        setOpponentStatus(prev => ({ ...prev, submitted: true }));
        toast.success('Opponent submitted their solution!');
      }
    });

    socketService.onBattleCompleted((data) => {
      console.log('🏆 Battle completed:', data);
      clearInterval(timerRef.current);
      setBattleEnded(true);
      setWinner(data.winner);
      
      if (data.winner) {
        if (data.winner._id === user._id) {
          toast.success('🎉 Victory! You won the battle!', { duration: 5000 });
        } else {
          toast.error('💔 Defeat! Better luck next time!', { duration: 5000 });
        }
      } else {
        toast('🤝 Draw! Both players had the same result!', { duration: 5000 });
      }
    });

    socketService.onBattleError((error) => {
      console.error('Battle error:', error);
      toast.error(error.message);
    });

    // Cleanup
    return () => {
      clearInterval(timerRef.current);
      socketService.offBattleEvents();
    };
  }, [battleId, user, navigate]);

  const handleReady = () => {
    socketService.markReady(battleId, user._id);
  };

  const handleCodeChange = (e) => {
    const newCode = e.target.value;
    setCode(newCode);
    
    // Throttle code change events (send every 2 seconds)
    if (battleStarted && !submitted) {
      socketService.sendCodeChange(battleId, user._id, newCode);
    }
  };

  const handleSubmit = () => {
    if (submitted) return;

    // Simple test case execution simulation
    // In Phase 6, we'll integrate Judge0 for real execution
    const testsPassed = Math.floor(Math.random() * (question.testCases?.length || 5));
    const totalTests = question.testCases?.length || 5;
    
    const result = {
      testsPassed,
      totalTests,
      executionTime: Math.floor(Math.random() * 1000) + 100,
      status: testsPassed === totalTests ? 'passed' : 'failed'
    };

    socketService.submitSolution(battleId, user._id, code, result);
    setSubmitted(true);
    toast.success('Solution submitted!');
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const getDifficultyColor = (diff) => {
    switch(diff) {
      case 'easy': return 'text-green-400';
      case 'medium': return 'text-yellow-400';
      case 'hard': return 'text-red-400';
      default: return 'text-gray-400';
    }
  };

  if (!battle || !question) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-500 mb-4 mx-auto"></div>
          <p className="text-white text-xl">Loading battle room...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen bg-gray-900 flex flex-col overflow-hidden">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 px-6 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <h1 className="text-xl font-bold text-white">⚔️ Battle Arena</h1>
            <span className={`font-semibold capitalize ${getDifficultyColor(battle.difficulty)}`}>
              {battle.difficulty}
            </span>
          </div>
          
          {battleStarted && timeRemaining !== null && (
            <div className={`text-2xl font-bold ${timeRemaining < 60 ? 'text-red-400' : 'text-white'}`}>
              ⏱️ {formatTime(timeRemaining)}
            </div>
          )}
          
          <div className="flex items-center gap-4">
            <div className="text-sm text-gray-400">
              Battle ID: <span className="text-gray-300">{battleId.slice(-8)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Countdown Overlay */}
      {countdown !== null && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="text-9xl font-bold text-white animate-pulse">
            {countdown > 0 ? countdown : 'GO!'}
          </div>
        </div>
      )}

      {/* Battle End Overlay */}
      {battleEnded && (
        <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-12 text-center max-w-md border-2 border-purple-500">
            <div className="text-6xl mb-4">
              {winner?._id === user._id ? '🏆' : winner ? '💔' : '🤝'}
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              {winner?._id === user._id ? 'Victory!' : winner ? 'Defeat!' : 'Draw!'}
            </h2>
            {winner && (
              <p className="text-xl text-gray-300 mb-6">
                Winner: {winner.username}
              </p>
            )}
            <button
              onClick={() => navigate('/matchmaking')}
              className="bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 px-8 rounded-lg transition-all"
            >
              Back to Matchmaking
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Question Panel */}
        <div className="w-1/3 bg-gray-800 border-r border-gray-700 overflow-y-auto">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-white mb-4">{question.title}</h2>
            
            <div className="mb-6">
              <h3 className="text-lg font-semibold text-gray-300 mb-2">Description</h3>
              <p className="text-gray-400 whitespace-pre-wrap">{question.description}</p>
            </div>

            {question.examples && question.examples.length > 0 && (
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Examples</h3>
                {question.examples.map((example, idx) => (
                  <div key={idx} className="bg-gray-900 p-3 rounded mb-2">
                    <div className="text-sm">
                      <div className="text-gray-400">Input: <span className="text-white">{example.input}</span></div>
                      <div className="text-gray-400">Output: <span className="text-white">{example.output}</span></div>
                      {example.explanation && (
                        <div className="text-gray-500 text-xs mt-1">{example.explanation}</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {question.constraints && (
              <div>
                <h3 className="text-lg font-semibold text-gray-300 mb-2">Constraints</h3>
                <p className="text-gray-400 text-sm whitespace-pre-wrap">{question.constraints}</p>
              </div>
            )}
          </div>
        </div>

        {/* Code + Players Panel */}
        <div className="flex-1 flex flex-col">
          {/* Players Status Bar */}
          <div className="bg-gray-800 border-b border-gray-700 px-6 py-4">
            <div className="flex justify-between items-center">
              {/* You */}
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                  {user.username[0].toUpperCase()}
                </div>
                <div>
                  <div className="text-white font-semibold">{user.username} (You)</div>
                  <div className="text-sm text-gray-400">
                    {submitted ? '✅ Submitted' : isReady ? '👍 Ready' : '⏳ Not Ready'}
                  </div>
                </div>
              </div>

              <div className="text-2xl">VS</div>

              {/* Opponent */}
              <div className="flex items-center gap-3 flex-row-reverse">
                <div className="w-10 h-10 bg-pink-600 rounded-full flex items-center justify-center text-white font-bold">
                  {opponent?.user?.username?.[0]?.toUpperCase() || '?'}
                </div>
                <div className="text-right">
                  <div className="text-white font-semibold">{opponent?.user?.username || 'Opponent'}</div>
                  <div className="text-sm text-gray-400">
                    {opponentStatus.submitted ? '✅ Submitted' : opponentReady ? '👍 Ready' : '⏳ Not Ready'}
                    {battleStarted && !opponentStatus.submitted && ` • ${opponentStatus.codeLength} chars`}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 flex flex-col bg-gray-900 p-4">
            <textarea
              value={code}
              onChange={handleCodeChange}
              disabled={!battleStarted || submitted}
              className="flex-1 bg-gray-800 text-white font-mono p-4 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
              placeholder="// Write your code here..."
              spellCheck="false"
            />
          </div>

          {/* Action Buttons */}
          <div className="bg-gray-800 border-t border-gray-700 px-6 py-4">
            {!battleStarted ? (
              <button
                onClick={handleReady}
                disabled={isReady}
                className={`w-full font-bold py-3 px-6 rounded-lg transition-all ${
                  isReady
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isReady ? '✅ Ready - Waiting for opponent...' : '👍 Ready to Battle'}
              </button>
            ) : (
              <button
                onClick={handleSubmit}
                disabled={submitted}
                className={`w-full font-bold py-3 px-6 rounded-lg transition-all ${
                  submitted
                    ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
              >
                {submitted ? '✅ Submitted - Waiting for results...' : '🚀 Submit Solution'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BattleRoom;
