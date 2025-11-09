/**
 * Battle Controller - Execution Functions
 * Handles code execution and submission during battles
 */

import Battle from '../models/Battle.js';
import Question from '../models/Question.js';
import executionService from '../services/executionService.js';

/**
 * @desc    Execute code (Run Code button - visible test cases only)
 * @route   POST /api/battles/:battleId/execute
 * @access  Private (Battle participant only)
 */
export const executeCode = async (req, res) => {
  try {
    const { battleId } = req.params;
    const { code, language } = req.body;
    const userId = req.user._id;

    console.log(`🏃 User ${userId} executing code in battle ${battleId}`);

    // Validate battle - use findOne with battleId field (not _id)
    const battle = await Battle.findOne({ battleId }).populate('question');
    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found',
      });
    }

    // Check if user is participant (handle both populated and non-populated user)
    const isParticipant = battle.players.some(p => {
      const playerId = p.user._id || p.user;
      return playerId.toString() === userId.toString();
    });
    
    if (!isParticipant) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this battle',
      });
    }

    // Check battle status
    if (battle.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Battle is not in progress',
      });
    }

    // Get only visible (non-hidden) test cases
    const visibleTestCases = battle.question.testCases.filter(tc => !tc.isHidden);

    if (visibleTestCases.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'No test cases available',
      });
    }

    // Execute code against visible test cases
    const executionResult = await executionService.runTestCases(
      code,
      language,
      visibleTestCases
    );

    res.status(200).json({
      success: true,
      message: 'Code executed successfully',
      data: {
        summary: executionResult.summary,
        results: executionResult.results,
        testCasesRun: visibleTestCases.length,
        hiddenTestCases: battle.question.testCases.length - visibleTestCases.length,
      },
    });
  } catch (error) {
    console.error('❌ Error executing code:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to execute code',
      error: error.message,
    });
  }
};

/**
 * @desc    Submit solution (Submit button - ALL test cases including hidden)
 * @route   POST /api/battles/:battleId/submit
 * @access  Private (Battle participant only)
 */
export const submitSolution = async (req, res) => {
  try {
    const { battleId } = req.params;
    const { code, language } = req.body;
    const userId = req.user._id;

    console.log(`📤 User ${userId} submitting solution in battle ${battleId}`);

    // Validate battle - use findOne with battleId field (not _id)
    const battle = await Battle.findOne({ battleId })
      .populate('question')
      .populate('players.user', 'username rating avatar');
    
    if (!battle) {
      return res.status(404).json({
        success: false,
        message: 'Battle not found',
      });
    }

    // Check if user is participant (handle both populated and non-populated user)
    const playerIndex = battle.players.findIndex(p => {
      const playerId = p.user._id || p.user;
      return playerId.toString() === userId.toString();
    });
    
    if (playerIndex === -1) {
      return res.status(403).json({
        success: false,
        message: 'You are not a participant in this battle',
      });
    }

    // Check battle status
    if (battle.status !== 'in-progress') {
      return res.status(400).json({
        success: false,
        message: 'Battle is not in progress',
      });
    }

    // Check if already submitted
    if (battle.players[playerIndex].submitted) {
      return res.status(400).json({
        success: false,
        message: 'You have already submitted a solution',
      });
    }

    // Execute code against ALL test cases (including hidden)
    const allTestCases = battle.question.testCases;
    const executionResult = await executionService.runTestCases(
      code,
      language,
      allTestCases
    );

    // Update battle with submission
    battle.players[playerIndex].code = code;
    battle.players[playerIndex].language = language;
    battle.players[playerIndex].submitted = true;
    battle.players[playerIndex].submittedAt = new Date();
    battle.players[playerIndex].testsPassed = executionResult.summary.passed;
    battle.players[playerIndex].executionTime = parseFloat(executionResult.summary.averageTime);

    await battle.save();

    console.log(`✅ Submission saved: ${executionResult.summary.passed}/${allTestCases.length} tests passed`);

    // Reload battle to get fresh data with all fields
    const freshBattle = await Battle.findOne({ battleId })
      .populate('question')
      .populate('players.user', 'username rating avatar');

    // Check if both players have submitted
    const bothSubmitted = freshBattle.players.every(p => p.submitted === true);
    console.log('📊 Submission status:', {
      player1: {
        userId: freshBattle.players[0].user._id.toString(),
        submitted: freshBattle.players[0].submitted
      },
      player2: {
        userId: freshBattle.players[1].user._id.toString(),
        submitted: freshBattle.players[1].submitted
      },
      bothSubmitted
    });
    
    let winner = null;
    let winnerData = null;

    if (bothSubmitted) {
      console.log('🏁 Both players submitted - determining winner...');
      console.log('📊 Player 1 tests passed:', freshBattle.players[0].testsPassed);
      console.log('📊 Player 2 tests passed:', freshBattle.players[1].testsPassed);
      
      winner = await freshBattle.determineWinner();
      await freshBattle.save();
      
      console.log('🏆 Winner determined:', winner);
      
      // Get winner user data
      if (winner) {
        const winnerPlayer = freshBattle.players.find(p => p.user._id.toString() === winner.toString());
        if (winnerPlayer) {
          winnerData = {
            _id: winnerPlayer.user._id,
            id: winnerPlayer.user._id,
            username: winnerPlayer.user.username,
            rating: winnerPlayer.user.rating
          };
        }
      }
      
      console.log('🏆 Winner data:', winnerData);
    }

    res.status(200).json({
      success: true,
      message: bothSubmitted ? 'Battle completed!' : 'Solution submitted successfully',
      data: {
        summary: executionResult.summary,
        results: executionResult.results,
        bothSubmitted,
        winner: winnerData,
        battleStatus: battle.status,
      },
    });
  } catch (error) {
    console.error('❌ Error submitting solution:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to submit solution',
      error: error.message,
    });
  }
};
