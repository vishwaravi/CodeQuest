/**
 * Execution Service Test
 * Tests the executionService.js to ensure it works correctly
 */

import executionService from './src/services/executionService.js';

console.log('🧪 Testing Execution Service...\n');
console.log('='.repeat(60) + '\n');

// Test 1: Simple code execution
async function testSimpleExecution() {
  console.log('📋 Test 1: Simple JavaScript execution');
  console.log('Code: console.log("Hello World");');
  
  try {
    const code = `console.log("Hello World");`;
    const result = await executionService.executeCode(code, 'javascript', '');
    
    console.log('✅ Execution successful!');
    console.log('Status:', result.statusDescription);
    console.log('Output:', result.stdout);
    console.log('Time:', result.time, 'seconds');
    console.log('Memory:', result.memory, 'KB');
    
    return result.stdout.includes('Hello World');
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    return false;
  }
}

// Test 2: Code with input (Two Sum simulation)
async function testWithInput() {
  console.log('\n' + '='.repeat(60) + '\n');
  console.log('📋 Test 2: JavaScript with stdin input');
  
  const code = `
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
  const nums = JSON.parse(lines[0]);
  const target = parseInt(lines[1]);
  
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      console.log(JSON.stringify([map.get(complement), i]));
      return;
    }
    map.set(nums[i], i);
  }
  console.log(JSON.stringify([]));
});
`;

  const input = '[2,7,11,15]\n9';
  const expectedOutput = '[0,1]';
  
  console.log('Input:', input.replace('\n', '\\n'));
  console.log('Expected output:', expectedOutput);
  
  try {
    const result = await executionService.executeCode(code, 'javascript', input);
    
    const actualOutput = result.stdout.trim();
    const passed = actualOutput === expectedOutput;
    
    if (passed) {
      console.log('✅ Test passed!');
    } else {
      console.log('❌ Test failed!');
    }
    
    console.log('Status:', result.statusDescription);
    console.log('Actual output:', actualOutput);
    console.log('Time:', result.time, 'seconds');
    console.log('Memory:', result.memory, 'KB');
    
    return passed;
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    return false;
  }
}

// Test 3: Run test cases (like in battle)
async function testRunTestCases() {
  console.log('\n' + '='.repeat(60) + '\n');
  console.log('📋 Test 3: Running multiple test cases');
  
  const code = `
const readline = require('readline');
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
  terminal: false
});

let lines = [];
rl.on('line', (line) => lines.push(line));
rl.on('close', () => {
  const nums = JSON.parse(lines[0]);
  const target = parseInt(lines[1]);
  
  const map = new Map();
  for (let i = 0; i < nums.length; i++) {
    const complement = target - nums[i];
    if (map.has(complement)) {
      console.log(JSON.stringify([map.get(complement), i]));
      return;
    }
    map.set(nums[i], i);
  }
  console.log(JSON.stringify([]));
});
`;

  const testCases = [
    { input: '[2,7,11,15]\n9', expectedOutput: '[0,1]' },
    { input: '[3,2,4]\n6', expectedOutput: '[1,2]' },
    { input: '[3,3]\n6', expectedOutput: '[0,1]' },
  ];
  
  try {
    const results = await executionService.runTestCases(code, 'javascript', testCases);
    
    console.log('\n📊 Results Summary:');
    console.log('Total tests:', results.summary.totalTests);
    console.log('Passed:', results.summary.passed);
    console.log('Failed:', results.summary.failed);
    console.log('Percentage:', results.summary.percentage + '%');
    console.log('Average time:', results.summary.averageTime, 'seconds');
    console.log('Average memory:', results.summary.averageMemory, 'KB');
    
    console.log('\n📝 Individual Test Results:');
    results.results.forEach(test => {
      console.log(`Test ${test.testCaseNumber}: ${test.passed ? '✅ PASSED' : '❌ FAILED'}`);
      if (!test.passed) {
        console.log(`  Expected: ${test.expectedOutput}`);
        console.log(`  Got: ${test.actualOutput}`);
      }
    });
    
    return results.summary.allPassed;
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    return false;
  }
}

// Test 4: Different language (Python)
async function testPython() {
  console.log('\n' + '='.repeat(60) + '\n');
  console.log('📋 Test 4: Python execution');
  
  const code = `
import sys
import json

lines = sys.stdin.read().strip().split('\\n')
nums = json.loads(lines[0])
target = int(lines[1])

seen = {}
for i, num in enumerate(nums):
    complement = target - num
    if complement in seen:
        print(json.dumps([seen[complement], i]))
        exit()
    seen[num] = i
print(json.dumps([]))
`;

  const input = '[2,7,11,15]\n9';
  const expectedOutput = '[0,1]';
  
  console.log('Testing Python Two Sum solution...');
  
  try {
    const result = await executionService.executeCode(code, 'python', input);
    
    const actualOutput = result.stdout.trim();
    const passed = actualOutput === expectedOutput;
    
    if (passed) {
      console.log('✅ Test passed!');
    } else {
      console.log('❌ Test failed!');
    }
    
    console.log('Status:', result.statusDescription);
    console.log('Output:', actualOutput);
    console.log('Time:', result.time, 'seconds');
    
    return passed;
  } catch (error) {
    console.log('❌ Test failed:', error.message);
    return false;
  }
}

// Run all tests
async function runAllTests() {
  console.log('🚀 Starting Execution Service Tests...\n');
  
  const test1 = await testSimpleExecution();
  const test2 = await testWithInput();
  const test3 = await testRunTestCases();
  const test4 = await testPython();
  
  console.log('\n' + '='.repeat(60) + '\n');
  console.log('📊 Final Test Results:');
  console.log('Test 1 (Simple execution):  ', test1 ? '✅ PASS' : '❌ FAIL');
  console.log('Test 2 (With input):        ', test2 ? '✅ PASS' : '❌ FAIL');
  console.log('Test 3 (Multiple test cases):', test3 ? '✅ PASS' : '❌ FAIL');
  console.log('Test 4 (Python):            ', test4 ? '✅ PASS' : '❌ FAIL');
  console.log('\n' + '='.repeat(60) + '\n');
  
  if (test1 && test2 && test3 && test4) {
    console.log('🎉 All tests passed! Execution service is working perfectly!');
    console.log('✅ Ready for battle code execution!');
  } else {
    console.log('⚠️  Some tests failed. Check the errors above.');
  }
  
  process.exit(test1 && test2 && test3 && test4 ? 0 : 1);
}

runAllTests();
