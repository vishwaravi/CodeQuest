/**
 * Test Controller
 * Basic endpoints to verify API functionality
 */

// @desc    Health check endpoint
// @route   GET /health
// @access  Public
export const healthCheck = (req, res) => {
  res.status(200).json({
    success: true,
    message: '🚀 CodeQuest Backend is running!',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV,
  });
};

// @desc    Test API endpoint
// @route   GET /api/test
// @access  Public
export const testApi = (req, res) => {
  res.status(200).json({
    success: true,
    message: '✅ API is working perfectly!',
    data: {
      version: '1.0.0',
      features: [
        'Real-time battles',
        'Code execution',
        'Matchmaking',
        'Leaderboards',
      ],
    },
  });
};
