import Question from '../models/Question.js';

/**
 * @desc    Get all questions (with filters)
 * @route   GET /api/questions
 * @access  Public
 */
export const getQuestions = async (req, res) => {
  try {
    const { difficulty, tags, search, limit = 50, page = 1 } = req.query;

    // Build query
    const query = { isActive: true };

    if (difficulty) {
      query.difficulty = difficulty.toLowerCase();
    }

    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim().toLowerCase());
      query.tags = { $in: tagArray };
    }

    if (search) {
      query.$text = { $search: search };
    }

    // Execute query with pagination
    const questions = await Question.find(query)
      .select('-testCases') // Don't send test cases in list view
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('createdBy', 'username');

    const total = await Question.countDocuments(query);

    res.status(200).json({
      success: true,
      count: questions.length,
      total,
      page: parseInt(page),
      pages: Math.ceil(total / parseInt(limit)),
      data: questions,
    });
  } catch (error) {
    console.error('Get Questions Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch questions',
    });
  }
};

/**
 * @desc    Get single question by ID
 * @route   GET /api/questions/:id
 * @access  Public
 */
export const getQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id).populate(
      'createdBy',
      'username'
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found',
      });
    }

    // If user is not admin, hide hidden test cases
    const isAdmin = req.user?.role === 'admin';
    const questionData = isAdmin ? question : question.getPublicData();

    res.status(200).json({
      success: true,
      data: questionData,
    });
  } catch (error) {
    console.error('Get Question Error:', error);
    
    if (error.name === 'CastError') {
      return res.status(404).json({
        success: false,
        error: 'Question not found',
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to fetch question',
    });
  }
};

/**
 * @desc    Create new question
 * @route   POST /api/questions
 * @access  Private/Admin
 */
export const createQuestion = async (req, res) => {
  try {
    const questionData = {
      ...req.body,
      createdBy: req.user.id,
    };

    const question = await Question.create(questionData);

    res.status(201).json({
      success: true,
      message: 'Question created successfully',
      data: question,
    });
  } catch (error) {
    console.error('Create Question Error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages[0],
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to create question',
    });
  }
};

/**
 * @desc    Update question
 * @route   PUT /api/questions/:id
 * @access  Private/Admin
 */
export const updateQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found',
      });
    }

    const updatedQuestion = await Question.findByIdAndUpdate(
      req.params.id,
      req.body,
      {
        new: true,
        runValidators: true,
      }
    );

    res.status(200).json({
      success: true,
      message: 'Question updated successfully',
      data: updatedQuestion,
    });
  } catch (error) {
    console.error('Update Question Error:', error);

    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((err) => err.message);
      return res.status(400).json({
        success: false,
        error: messages[0],
      });
    }

    res.status(500).json({
      success: false,
      error: 'Failed to update question',
    });
  }
};

/**
 * @desc    Delete question
 * @route   DELETE /api/questions/:id
 * @access  Private/Admin
 */
export const deleteQuestion = async (req, res) => {
  try {
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({
        success: false,
        error: 'Question not found',
      });
    }

    await question.deleteOne();

    res.status(200).json({
      success: true,
      message: 'Question deleted successfully',
    });
  } catch (error) {
    console.error('Delete Question Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to delete question',
    });
  }
};

/**
 * @desc    Get random question by difficulty
 * @route   GET /api/questions/random/:difficulty
 * @access  Public
 */
export const getRandomQuestion = async (req, res) => {
  try {
    const { difficulty } = req.params;

    if (!['easy', 'medium', 'hard'].includes(difficulty.toLowerCase())) {
      return res.status(400).json({
        success: false,
        error: 'Invalid difficulty level',
      });
    }

    const question = await Question.getRandomByDifficulty(
      difficulty.toLowerCase()
    );

    if (!question) {
      return res.status(404).json({
        success: false,
        error: `No ${difficulty} questions available`,
      });
    }

    // Increment usage count
    question.usageCount += 1;
    await question.save();

    const isAdmin = req.user?.role === 'admin';
    const questionData = isAdmin ? question : question.getPublicData();

    res.status(200).json({
      success: true,
      data: questionData,
    });
  } catch (error) {
    console.error('Get Random Question Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch random question',
    });
  }
};

/**
 * @desc    Get question statistics
 * @route   GET /api/questions/stats
 * @access  Private/Admin
 */
export const getQuestionStats = async (req, res) => {
  try {
    const stats = await Question.aggregate([
      {
        $group: {
          _id: '$difficulty',
          count: { $sum: 1 },
          avgUsage: { $avg: '$usageCount' },
        },
      },
    ]);

    const total = await Question.countDocuments();
    const active = await Question.countDocuments({ isActive: true });

    res.status(200).json({
      success: true,
      data: {
        total,
        active,
        byDifficulty: stats,
      },
    });
  } catch (error) {
    console.error('Get Stats Error:', error);
    res.status(500).json({
      success: false,
      error: 'Failed to fetch statistics',
    });
  }
};
