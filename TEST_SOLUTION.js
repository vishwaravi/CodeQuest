// ==========================================
// 🎯 READY-TO-TEST: Two Sum Solution
// Copy and paste this into the Battle Room!
// ==========================================

const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let lines = [];

rl.on('line', (line) => {
  lines.push(line);
});

rl.on('close', () => {
  // Parse input
  const nums = JSON.parse(lines[0]);      // First line: [2,7,11,15]
  const target = parseInt(lines[1]);      // Second line: 9
  
  // Solve Two Sum
  const result = twoSum(nums, target);
  
  // Print result in exact format
  console.log(JSON.stringify(result));
});

// Solution function
function twoSum(nums, target) {
  const map = new Map();
  
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    
    if (map.has(complement)) {
      return [map.get(complement), i];
    }
    
    map.set(nums[i], i);
  }
  
  return [];
}
