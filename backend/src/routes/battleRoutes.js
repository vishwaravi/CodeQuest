import express from 'express';
import {
  getBattleHistory,
  getBattleDetails,
  getBattleStats,
  getActiveBattle,
  getQueueStatus,
  getUserQueuePosition,
  getLeaderboard
} from '../controllers/battleController.js';
import {
  executeCode,
  submitSolution
} from '../controllers/battleExecutionController.js';
import { protect } from '../middlewares/auth.js';

const router = express.Router();

// All battle routes require authentication
router.use(protect);

// Get user's battle history
router.get('/history', getBattleHistory);

// Get user's battle statistics
router.get('/stats', getBattleStats);

// Get user's active battle
router.get('/active', getActiveBattle);

// Get specific battle details
router.get('/:battleId', getBattleDetails);

// Get matchmaking queue status
router.get('/queue/status', getQueueStatus);

// Get user's queue position
router.get('/queue/position', getUserQueuePosition);

// Get leaderboard
router.get('/leaderboard/top', getLeaderboard);

// Code execution routes
router.post('/:battleId/execute', executeCode);
router.post('/:battleId/submit', submitSolution);

export default router;
