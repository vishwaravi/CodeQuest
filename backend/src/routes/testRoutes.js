import express from 'express';
import { healthCheck, testApi } from '../controllers/testController.js';

const router = express.Router();

// Test routes
router.get('/health', healthCheck);
router.get('/test', testApi);

export default router;
