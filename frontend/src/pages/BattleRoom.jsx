import { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/api';
import socketService from '../services/socket';
import toast from 'react-hot-toast';
import CodeComparison from '../components/CodeComparison';
import ExecutionResultsModal from '../components/ExecutionResultsModal';
import { LANGUAGE_OPTIONS, STARTER_CODE } from '../constants/languages';

const BattleRoom = () => {
  const { battleId } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  
  // Get userId - handle both user.id (from getPublicProfile) and user._id
  const userId = user?.id || user?._id;
  
  const [battle, setBattle] = useState(null);
  const [question, setQuestion] = useState(null);
  const [opponent, setOpponent] = useState(null);
  const [myCode, setMyCode] = useState('');
  const [opponentCode, setOpponentCode] = useState('');
  const [language, setLanguage] = useState('javascript');
  const [isReady, setIsReady] = useState(false);
  const [opponentReady, setOpponentReady] = useState(false);
  const [countdown, setCountdown] = useState(null);
  const [battleStarted, setBattleStarted] = useState(false);
  const [battleEnded, setBattleEnded] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState(null);
  const [opponentStatus, setOpponentStatus] = useState({ codeLength: 0, submitted: false });
  const [winner, setWinner] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [showLeaveModal, setShowLeaveModal] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [executionResults, setExecutionResults] = useState(null);
  const [showResultsModal, setShowResultsModal] = useState(false);
  
  const timerRef = useRef(null);
  const codeSyncRef = useRef(null);
  const countdownTimeoutRef = useRef(null);

  // Debounced code sync
  const syncCode = useCallback((code) => {
    if (codeSyncRef.current) {
      clearTimeout(codeSyncRef.current);
    }

    codeSyncRef.current = setTimeout(() => {
      if (battleStarted && !submitted && userId) {
        socketService.sendCodeSync(battleId, userId, code, code.length);
      }
    }, 500); // 500ms debounce
  }, [battleId, userId, battleStarted, submitted]);

  useEffect(() => {
    if (!user || !userId) {
      navigate('/login');
      return;
    }

    console.log('👤 BattleRoom - Current User:', user);
    console.log('🆔 User ID:', userId);

    // Connect socket
    socketService.connect();

    // Join battle room
    socketService.joinBattle(battleId, userId);

    // Listen to battle events
    socketService.onBattleJoined((data) => {
      console.log('🎮 Joined battle:', data);
      setBattle(data.battle);
      setQuestion(data.question || data.battle.question);
      
      // Get my player data
      const myPlayer = data.battle.players.find(p => {
        const playerId = p.user._id || p.user.id || p.user;
        return playerId.toString() === userId.toString();
      });
      const myLang = myPlayer?.language || data.playerData?.language || 'javascript';
      setLanguage(myLang);
      
      // Set initial code
      const initialCode = myPlayer?.code || 
                          data.playerData?.code ||
                          data.question?.starterCode?.[myLang] ||
                          data.battle.question?.starterCode?.[myLang] || 
                          STARTER_CODE[myLang] || 
                          '';
      setMyCode(initialCode);
      
      // Identify opponent
      const opp = data.opponent || data.battle.players.find(p => {
        const playerId = p.user._id || p.user.id || p.user;
        return playerId.toString() !== userId.toString();
      });
      setOpponent(opp);
      setOpponentCode(opp?.code || '');
      
      // Check ready status
      const myIsReady = myPlayer?.isReady || data.playerData?.isReady || false;
      const oppIsReady = opp?.isReady || false;
      setIsReady(myIsReady);
      setOpponentReady(oppIsReady);
      
      // Check if battle already started
      if (data.battleStatus === 'in-progress') {
        console.log('⚡ Battle already in progress');
        setBattleStarted(true);
        setIsReady(true);
        setOpponentReady(true);
        
        // Set submitted status if already submitted
        if (data.playerData?.submitted) {
          setSubmitted(true);
        }
      }
    });

    // Handle battle already started event
    socketService.on('battle:already-started', (data) => {
      console.log('⚡ Battle already started:', data);
      setBattleStarted(true);
      setIsReady(true);
      setOpponentReady(true);
      setTimeRemaining(data.timeRemaining);
      
      toast.success('Rejoined ongoing battle!', { duration: 3000 });
      
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

    socketService.onPlayerReady((data) => {
      console.log('👍 Player ready event received:', data);
      console.log('📊 Current userId:', userId);
      console.log('📊 data.userId:', data.userId);
      console.log('📊 data.allReady:', data.allReady);
      
      // Update ready state for the player who clicked
      if (data.userId.toString() === userId.toString()) {
        console.log('✅ I am ready!');
        setIsReady(true);
      } else {
        console.log('✅ Opponent is ready!');
        setOpponentReady(true);
      }
      
      if (data.allReady) {
        console.log('🎉 ALL PLAYERS READY - Both players confirmed ready!');
        // Ensure both states are set to ready when allReady is true
        setIsReady(true);
        setOpponentReady(true);
        toast.success('Both players ready! Starting battle...');
        
        // Fallback: If countdown doesn't start in 5 seconds, manually start battle
        countdownTimeoutRef.current = setTimeout(() => {
          console.warn('⚠️ Countdown not received! Manually starting battle...');
          if (!battleStarted) {
            console.log('🚀 FALLBACK: Setting battleStarted to TRUE');
            setBattleStarted(true);
            setTimeRemaining(900); // 15 minutes
            toast.success('Battle started!', { icon: '🚀' });
            
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
          }
        }, 5000); // 5 second timeout
      }
    });

    socketService.onCountdown((data) => {
      console.log('⏰ Countdown event received:', data.count);
      
      // Clear the fallback timeout since countdown started
      if (countdownTimeoutRef.current) {
        clearTimeout(countdownTimeoutRef.current);
        countdownTimeoutRef.current = null;
      }
      
      setCountdown(data.count);
      if (data.count > 0) {
        toast.success(`${data.count}...`, { duration: 900 });
      }
    });

    socketService.onBattleStart((data) => {
      console.log('🚀 Battle started!', data);
      console.log('📝 Setting battleStarted to TRUE');
      setCountdown(null);
      setBattleStarted(true);
      setTimeRemaining(data.timeLimit);
      toast.success('GO! Start coding!', { icon: '🚀', duration: 2000 });
      
      console.log('✅ Battle state updated - editor should be unlocked');
      
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

    // Listen for opponent code sync (full code)
    socketService.onOpponentCodeSync((data) => {
      setOpponentCode(data.code);
      setOpponentStatus(prev => ({ ...prev, codeLength: data.codeLength }));
    });

    // Listen for language changes
    socketService.onLanguageChanged((data) => {
      if (data.userId !== userId) {
        toast.success(`Opponent changed language to ${data.language}`);
      }
    });

    socketService.onPlayerSubmitted((data) => {
      console.log('📝 Player submitted:', data);
      if (data.userId !== userId) {
        setOpponentStatus(prev => ({ ...prev, submitted: true }));
        toast.success('Opponent submitted their solution!');
      }
    });

    socketService.onBattleCompleted((data) => {
      console.log('🏆 Battle completed:', data);
      clearInterval(timerRef.current);
      setBattleEnded(true);
      setWinner(data.winner);
      
      if (data.reason === 'forfeit') {
        const winnerId = data.winner?._id || data.winner?.id;
        if (winnerId === userId) {
          toast.success('You win by forfeit! 🏆', { duration: 5000 });
        } else {
          toast.error('You lost the battle', { duration: 5000 });
        }
      } else if (data.winner) {
        const winnerId = data.winner._id || data.winner.id;
        if (winnerId === userId) {
          toast.success('🎉 Victory! You won the battle!', { duration: 5000 });
        } else {
          toast.error('💔 Defeat! Better luck next time!', { duration: 5000 });
        }
      } else {
        toast('🤝 Draw! Both players had the same result!', { duration: 5000 });
      }
    });

    socketService.onBattleCancelled((data) => {
      console.log('❌ Battle cancelled:', data);
      toast.error(data.message || 'Battle was cancelled');
      setTimeout(() => {
        navigate('/matchmaking');
      }, 2000);
    });

    socketService.onPlayerLeft((data) => {
      console.log('🚪 Player left:', data);
      toast.success(data.message, { duration: 5000 });
      setBattleEnded(true);
      setWinner(data.winner);
    });

    socketService.onBattleError((error) => {
      console.error('Battle error:', error);
      toast.error(error.message);
    });

    // Execution events
    socketService.onOpponentExecutionStart((data) => {
      toast(`${opponent?.username || 'Opponent'} is running their code...`, { icon: '⚡' });
    });

    socketService.onOpponentExecutionComplete((data) => {
      toast.success(
        `${opponent?.username || 'Opponent'} ran code: ${data.testsPassed}/${data.totalTests} tests passed (${data.percentage}%)`,
        { duration: 4000 }
      );
    });

    socketService.onOpponentSubmitted((data) => {
      setOpponentStatus(prev => ({ ...prev, submitted: true }));
      toast(`${opponent?.username || 'Opponent'} submitted their solution!`, { icon: '📤' });
    });

    // Cleanup
    return () => {
      clearInterval(timerRef.current);
      if (codeSyncRef.current) {
        clearTimeout(codeSyncRef.current);
      }
      if (countdownTimeoutRef.current) {
        clearTimeout(countdownTimeoutRef.current);
      }
      socketService.offBattleEvents();
    };
  }, [battleId, user, userId, navigate, battleStarted]);

  const handleReady = () => {
    socketService.markReady(battleId, userId);
  };

  const handleCodeChange = (newCode) => {
    setMyCode(newCode);
    syncCode(newCode);
  };

  const handleLanguageChange = (newLanguage) => {
    setLanguage(newLanguage);
    
    // Load starter code for new language
    const newStarterCode = question.starterCode?.[newLanguage] || STARTER_CODE[newLanguage] || '';
    setMyCode(newStarterCode);
    
    // Notify server and opponent
    socketService.sendLanguageChange(battleId, userId, newLanguage);
    
    toast.success(`Switched to ${newLanguage}`);
  };

  const handleRunCode = async () => {
    if (!myCode.trim()) {
      toast.error('Please write some code first!');
      return;
    }

    setExecuting(true);
    socketService.emitExecutionStart(battleId, userId);
    
    try {
      toast.loading('Running your code...', { id: 'execution' });
      
      const response = await apiService.executeCode(battleId, myCode, language);
      
      setExecutionResults(response.data);
      setShowResultsModal(true);
      
      socketService.emitExecutionComplete(battleId, userId, response.data);
      
      toast.success(
        `${response.data.summary.passed}/${response.data.summary.totalTests} tests passed!`,
        { id: 'execution' }
      );
    } catch (error) {
      console.error('Execution error:', error);
      toast.error(error.response?.data?.message || 'Failed to execute code', { id: 'execution' });
    } finally {
      setExecuting(false);
    }
  };

  const handleSubmit = async () => {
    if (submitted) return;

    if (!myCode.trim()) {
      toast.error('Please write some code first!');
      return;
    }

    const confirmed = window.confirm(
      'Are you sure you want to submit? This will run your code against all test cases (including hidden ones).'
    );
    
    if (!confirmed) return;

    setSubmitting(true);
    
    try {
      toast.loading('Submitting your solution...', { id: 'submission' });
      
      const response = await apiService.submitSolution(battleId, myCode, language);
      
      setExecutionResults(response.data);
      setShowResultsModal(true);
      setSubmitted(true);
      
      // Notify opponent via socket
      socketService.emitSubmissionComplete(
        battleId,
        userId,
        response.data,
        response.data.bothSubmitted,
        response.data.winner
      );
      
      if (response.data.bothSubmitted) {
        setBattleEnded(true);
        setWinner(response.data.winner);
        toast.success('Battle completed!', { id: 'submission' });
      } else {
        toast.success('Solution submitted! Waiting for opponent...', { id: 'submission' });
      }
    } catch (error) {
      console.error('Submission error:', error);
      toast.error(error.response?.data?.message || 'Failed to submit solution', { id: 'submission' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleLeaveBattle = () => {
    setShowLeaveModal(true);
  };

  const confirmLeaveBattle = () => {
    socketService.leaveBattle(battleId, userId);
    setShowLeaveModal(false);
    toast.success('Leaving battle...');
    setTimeout(() => {
      navigate('/matchmaking');
    }, 1000);
  };

  const cancelLeaveBattle = () => {
    setShowLeaveModal(false);
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
            {!battleEnded && (
              <button
                onClick={handleLeaveBattle}
                className="bg-red-600 hover:bg-red-700 text-white font-semibold px-4 py-2 rounded-lg transition-all text-sm"
              >
                🚪 Leave Battle
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Leave Battle Confirmation Modal */}
      {showLeaveModal && (
        <div className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center">
          <div className="bg-gray-800 rounded-lg p-8 max-w-md border-2 border-red-500">
            <div className="text-center">
              <div className="text-6xl mb-4">⚠️</div>
              <h2 className="text-2xl font-bold text-white mb-4">Leave Battle?</h2>
              <p className="text-gray-300 mb-6">
                {battleStarted 
                  ? "Leaving an ongoing battle will count as a loss and you'll lose 30 rating points. Your opponent will win by forfeit."
                  : "Are you sure you want to leave this battle? The match will be cancelled."}
              </p>
              <div className="flex gap-4">
                <button
                  onClick={cancelLeaveBattle}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-all"
                >
                  Stay
                </button>
                <button
                  onClick={confirmLeaveBattle}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition-all"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

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
              {(() => {
                const winnerId = winner?._id || winner?.id;
                if (winnerId === userId) return '🏆';
                if (winner) return '💔';
                return '🤝';
              })()}
            </div>
            <h2 className="text-4xl font-bold text-white mb-4">
              {(() => {
                const winnerId = winner?._id || winner?.id;
                if (winnerId === userId) return 'Victory!';
                if (winner) return 'Defeat!';
                return 'Draw!';
              })()}
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

          {/* Language Selector & Code Editor */}
          <div className="flex-1 flex flex-col">
            {/* Language Selector */}
            <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
              <div className="flex items-center justify-between">
                <select
                  value={language}
                  onChange={(e) => handleLanguageChange(e.target.value)}
                  disabled={!battleStarted || submitted}
                  className="bg-gray-700 text-white px-3 py-1 rounded text-sm focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-50"
                >
                  {LANGUAGE_OPTIONS.map(lang => (
                    <option key={lang.value} value={lang.value}>
                      {lang.icon} {lang.label}
                    </option>
                  ))}
                </select>
                <div className="text-xs text-gray-400">
                  {myCode?.length || 0} characters
                </div>
              </div>
            </div>

            {/* Monaco Code Comparison */}
            <div className="flex-1">
              <CodeComparison
                myCode={myCode}
                opponentCode={opponentCode}
                language={language}
                onMyCodeChange={handleCodeChange}
                myUsername={user.username}
                opponentUsername={opponent?.user?.username || 'Opponent'}
                battleStarted={battleStarted}
              />
            </div>
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
              <div className="flex gap-3">
                <button
                  onClick={handleRunCode}
                  disabled={executing || submitted}
                  className={`flex-1 font-bold py-3 px-6 rounded-lg transition-all ${
                    executing || submitted
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700 text-white'
                  }`}
                >
                  {executing ? '⏳ Running...' : '▶️ Run Code'}
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={submitted || submitting}
                  className={`flex-1 font-bold py-3 px-6 rounded-lg transition-all ${
                    submitted || submitting
                      ? 'bg-gray-700 text-gray-400 cursor-not-allowed'
                      : 'bg-purple-600 hover:bg-purple-700 text-white'
                  }`}
                >
                  {submitted ? '✅ Submitted' : submitting ? '⏳ Submitting...' : '🚀 Submit'}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Execution Results Modal */}
      <ExecutionResultsModal
        isOpen={showResultsModal}
        onClose={() => setShowResultsModal(false)}
        results={executionResults}
        isSubmission={submitted}
      />
    </div>
  );
};

export default BattleRoom;
