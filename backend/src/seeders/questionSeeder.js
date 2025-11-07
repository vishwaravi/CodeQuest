import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Question from '../models/Question.js';

dotenv.config();

const questions = [
  {
    title: 'Two Sum',
    description: `Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.

You may assume that each input would have exactly one solution, and you may not use the same element twice.

You can return the answer in any order.`,
    difficulty: 'easy',
    tags: ['array', 'hash-table', 'sorting'],
    testCases: [
      { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]', isHidden: false },
      { input: '[3,2,4]\n6', expectedOutput: '[1,2]', isHidden: false },
      { input: '[3,3]\n6', expectedOutput: '[0,1]', isHidden: false },
      { input: '[1,5,3,7,8,9]\n12', expectedOutput: '[2,4]', isHidden: true },
    ],
    examples: [
      {
        input: 'nums = [2,7,11,15], target = 9',
        output: '[0,1]',
        explanation: 'Because nums[0] + nums[1] == 9, we return [0, 1].',
      },
    ],
    constraints: '2 <= nums.length <= 10^4\n-10^9 <= nums[i] <= 10^9\n-10^9 <= target <= 10^9',
    starterCode: {
      javascript: `function twoSum(nums, target) {
    // Your code here
}`,
      python: `def two_sum(nums, target):
    # Your code here
    pass`,
      java: `class Solution {
    public int[] twoSum(int[] nums, int target) {
        // Your code here
    }
}`,
    },
    hints: ['Try using a hash map to store numbers you\'ve seen', 'For each number, check if target - number exists in the map'],
    timeLimit: 2000,
    memoryLimit: 256,
  },
  {
    title: 'Reverse String',
    description: `Write a function that reverses a string. The input string is given as an array of characters s.

You must do this by modifying the input array in-place with O(1) extra memory.`,
    difficulty: 'easy',
    tags: ['string', 'two-pointers'],
    testCases: [
      { input: '["h","e","l","l","o"]', expectedOutput: '["o","l","l","e","h"]', isHidden: false },
      { input: '["H","a","n","n","a","h"]', expectedOutput: '["h","a","n","n","a","H"]', isHidden: false },
      { input: '["A"]', expectedOutput: '["A"]', isHidden: true },
    ],
    examples: [
      {
        input: 's = ["h","e","l","l","o"]',
        output: '["o","l","l","e","h"]',
        explanation: 'The string is reversed in place.',
      },
    ],
    constraints: '1 <= s.length <= 10^5\ns[i] is a printable ascii character.',
    starterCode: {
      javascript: `function reverseString(s) {
    // Your code here
}`,
      python: `def reverse_string(s):
    # Your code here
    pass`,
    },
    hints: ['Use two pointers approach', 'Swap characters from both ends moving towards center'],
    timeLimit: 1500,
    memoryLimit: 128,
  },
  {
    title: 'Valid Parentheses',
    description: `Given a string s containing just the characters '(', ')', '{', '}', '[' and ']', determine if the input string is valid.

An input string is valid if:
1. Open brackets must be closed by the same type of brackets.
2. Open brackets must be closed in the correct order.
3. Every close bracket has a corresponding open bracket of the same type.`,
    difficulty: 'medium',
    tags: ['string', 'stack'],
    testCases: [
      { input: '"()"', expectedOutput: 'true', isHidden: false },
      { input: '"()[]{}"', expectedOutput: 'true', isHidden: false },
      { input: '"(]"', expectedOutput: 'false', isHidden: false },
      { input: '"([)]"', expectedOutput: 'false', isHidden: true },
      { input: '"{[]}"', expectedOutput: 'true', isHidden: true },
    ],
    examples: [
      { input: 's = "()"', output: 'true', explanation: 'The parentheses are balanced.' },
      { input: 's = "()[]{}"', output: 'true', explanation: 'All brackets are properly closed.' },
      { input: 's = "(]"', output: 'false', explanation: 'Mismatched bracket types.' },
    ],
    constraints: '1 <= s.length <= 10^4\ns consists of parentheses only \'()[]{}\'.',
    starterCode: {
      javascript: `function isValid(s) {
    // Your code here
}`,
      python: `def is_valid(s):
    # Your code here
    pass`,
    },
    hints: ['Use a stack data structure', 'Push opening brackets onto stack', 'Pop and match when you see closing brackets'],
    timeLimit: 2000,
    memoryLimit: 256,
  },
  {
    title: 'Merge Two Sorted Lists',
    description: `You are given the heads of two sorted linked lists list1 and list2.

Merge the two lists into one sorted list. The list should be made by splicing together the nodes of the first two lists.

Return the head of the merged linked list.`,
    difficulty: 'medium',
    tags: ['linked-list', 'recursion', 'sorting'],
    testCases: [
      { input: '[1,2,4]\n[1,3,4]', expectedOutput: '[1,1,2,3,4,4]', isHidden: false },
      { input: '[]\n[]', expectedOutput: '[]', isHidden: false },
      { input: '[]\n[0]', expectedOutput: '[0]', isHidden: false },
      { input: '[1,3,5]\n[2,4,6]', expectedOutput: '[1,2,3,4,5,6]', isHidden: true },
    ],
    examples: [
      {
        input: 'list1 = [1,2,4], list2 = [1,3,4]',
        output: '[1,1,2,3,4,4]',
        explanation: 'The merged list is created by alternating nodes from both lists.',
      },
    ],
    constraints: 'The number of nodes in both lists is in the range [0, 50].\n-100 <= Node.val <= 100\nBoth list1 and list2 are sorted in non-decreasing order.',
    starterCode: {
      javascript: `function mergeTwoLists(list1, list2) {
    // Your code here
}`,
      python: `def merge_two_lists(list1, list2):
    # Your code here
    pass`,
    },
    hints: ['Use a dummy node to simplify edge cases', 'Compare values and link the smaller one', 'Don\'t forget to handle remaining nodes'],
    timeLimit: 2500,
    memoryLimit: 256,
  },
  {
    title: 'Binary Tree Maximum Depth',
    description: `Given the root of a binary tree, return its maximum depth.

A binary tree's maximum depth is the number of nodes along the longest path from the root node down to the farthest leaf node.`,
    difficulty: 'hard',
    tags: ['binary-tree', 'depth-first-search', 'recursion'],
    testCases: [
      { input: '[3,9,20,null,null,15,7]', expectedOutput: '3', isHidden: false },
      { input: '[1,null,2]', expectedOutput: '2', isHidden: false },
      { input: '[]', expectedOutput: '0', isHidden: true },
      { input: '[1,2,3,4,5,null,null,6]', expectedOutput: '4', isHidden: true },
    ],
    examples: [
      {
        input: 'root = [3,9,20,null,null,15,7]',
        output: '3',
        explanation: 'The maximum depth is 3 (path: 3 -> 20 -> 7).',
      },
    ],
    constraints: 'The number of nodes in the tree is in the range [0, 10^4].\n-100 <= Node.val <= 100',
    starterCode: {
      javascript: `function maxDepth(root) {
    // Your code here
}`,
      python: `def max_depth(root):
    # Your code here
    pass`,
    },
    hints: ['Use recursion or BFS', 'Base case: null node has depth 0', 'Recursive case: 1 + max(left depth, right depth)'],
    timeLimit: 3000,
    memoryLimit: 512,
  },
];

const seedQuestions = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Find or create admin user
    let admin = await User.findOne({ email: 'admin@codequest.com' });
    
    if (!admin) {
      console.log('📝 Creating admin user...');
      admin = await User.create({
        username: 'admin',
        email: 'admin@codequest.com',
        password: 'admin123',
        role: 'admin',
      });
      console.log('✅ Admin user created');
      console.log('📧 Email: admin@codequest.com');
      console.log('🔑 Password: admin123');
    } else {
      console.log('✅ Admin user already exists');
    }

    // Clear existing questions
    await Question.deleteMany({});
    console.log('🗑️  Cleared existing questions');

    // Insert questions with admin as creator
    const questionsWithCreator = questions.map(q => ({
      ...q,
      createdBy: admin._id,
    }));

    await Question.insertMany(questionsWithCreator);
    console.log(`✅ Seeded ${questions.length} questions`);

    // Show statistics
    const stats = {
      easy: await Question.countDocuments({ difficulty: 'easy' }),
      medium: await Question.countDocuments({ difficulty: 'medium' }),
      hard: await Question.countDocuments({ difficulty: 'hard' }),
    };

    console.log('\n📊 Question Statistics:');
    console.log(`   Easy: ${stats.easy}`);
    console.log(`   Medium: ${stats.medium}`);
    console.log(`   Hard: ${stats.hard}`);
    console.log(`   Total: ${stats.easy + stats.medium + stats.hard}\n`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding Error:', error);
    process.exit(1);
  }
};

seedQuestions();
