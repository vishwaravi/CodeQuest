import express from 'express';
import {
  getQuestions,
  getQuestion,
  createQuestion,
  updateQuestion,
  deleteQuestion,
  getRandomQuestion,
  getQuestionStats,
} from '../controllers/questionController.js';
import { protect, optionalAuth } from '../middlewares/auth.js';
import { authorizeAdmin } from '../middlewares/authorize.js';

const router = express.Router();

// Public routes (optional auth for test case visibility)
router.get('/', getQuestions);
router.get('/stats', protect, authorizeAdmin, getQuestionStats);
router.get('/random/:difficulty', optionalAuth, getRandomQuestion);
router.get('/:id', optionalAuth, getQuestion);

// Admin only routes
router.post('/', protect, authorizeAdmin, createQuestion);
router.put('/:id', protect, authorizeAdmin, updateQuestion);
router.delete('/:id', protect, authorizeAdmin, deleteQuestion);

export default router;
