import mongoose from 'mongoose';

const testCaseSchema = new mongoose.Schema({
  input: {
    type: String,
    required: true,
  },
  expectedOutput: {
    type: String,
    required: true,
  },
  isHidden: {
    type: Boolean,
    default: false, // Hidden test cases not shown to users
  },
});

const questionSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Question title is required'],
      trim: true,
      minlength: [5, 'Title must be at least 5 characters'],
      maxlength: [200, 'Title cannot exceed 200 characters'],
    },
    description: {
      type: String,
      required: [true, 'Question description is required'],
      minlength: [20, 'Description must be at least 20 characters'],
    },
    difficulty: {
      type: String,
      required: [true, 'Difficulty level is required'],
      enum: {
        values: ['easy', 'medium', 'hard'],
        message: '{VALUE} is not a valid difficulty level',
      },
      lowercase: true,
    },
    tags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],
    testCases: {
      type: [testCaseSchema],
      validate: {
        validator: function (v) {
          return v && v.length > 0;
        },
        message: 'At least one test case is required',
      },
    },
    constraints: {
      type: String,
      default: '',
    },
    examples: [
      {
        input: String,
        output: String,
        explanation: String,
      },
    ],
    starterCode: {
      javascript: { type: String, default: '' },
      python: { type: String, default: '' },
      java: { type: String, default: '' },
      cpp: { type: String, default: '' },
    },
    hints: [
      {
        type: String,
      },
    ],
    timeLimit: {
      type: Number,
      default: 2000, // milliseconds
      min: [100, 'Time limit must be at least 100ms'],
      max: [10000, 'Time limit cannot exceed 10000ms'],
    },
    memoryLimit: {
      type: Number,
      default: 256, // MB
      min: [64, 'Memory limit must be at least 64MB'],
      max: [1024, 'Memory limit cannot exceed 1024MB'],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    usageCount: {
      type: Number,
      default: 0,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for better query performance
questionSchema.index({ difficulty: 1 });
questionSchema.index({ tags: 1 });
questionSchema.index({ isActive: 1 });
questionSchema.index({ title: 'text', description: 'text' }); // Text search

// Method to get public question data (hide hidden test cases)
questionSchema.methods.getPublicData = function () {
  const question = this.toObject();
  
  // Filter out hidden test cases for non-admin users
  question.testCases = question.testCases.filter(tc => !tc.isHidden);
  
  return question;
};

// Static method to get random question by difficulty
questionSchema.statics.getRandomByDifficulty = async function (difficulty) {
  const count = await this.countDocuments({ difficulty, isActive: true });
  const random = Math.floor(Math.random() * count);
  return this.findOne({ difficulty, isActive: true }).skip(random);
};

const Question = mongoose.model('Question', questionSchema);

export default Question;
