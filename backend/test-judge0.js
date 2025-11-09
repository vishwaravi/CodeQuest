/**
 * Judge0 API Test Script
 * Tests if Judge0 API credentials are working
 */

import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const JUDGE0_API_URL = process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com';
const JUDGE0_API_KEY = process.env.JUDGE0_API_KEY;
const JUDGE0_API_HOST = process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com';

console.log('🔧 Testing Judge0 API Configuration...\n');
console.log('API URL:', JUDGE0_API_URL);
console.log('API Key:', JUDGE0_API_KEY ? `${JUDGE0_API_KEY.substring(0, 10)}...` : '❌ NOT SET');
console.log('API Host:', JUDGE0_API_HOST);
console.log('\n' + '='.repeat(60) + '\n');

// Test 1: About endpoint
async function testAbout() {
  try {
    console.log('📋 Test 1: Checking /about endpoint...');
    
    const response = await axios.get(`${JUDGE0_API_URL}/about`, {
      headers: {
        'x-rapidapi-key': JUDGE0_API_KEY,
        'x-rapidapi-host': JUDGE0_API_HOST,
      },
    });

    console.log('✅ SUCCESS! Judge0 is responding');
    console.log('Version:', response.data.version || 'N/A');
    console.log('Response:', JSON.stringify(response.data, null, 2));
    return true;
  } catch (error) {
    console.log('❌ FAILED!');
    console.log('Error:', error.response?.data || error.message);
    return false;
  }
}

// Test 2: Submit a simple code execution
async function testExecution() {
  try {
    console.log('\n' + '='.repeat(60) + '\n');
    console.log('📋 Test 2: Submitting a simple code execution...');

    // Simple JavaScript code that prints "Hello, Judge0!"
    const code = `console.log('Hello, Judge0!');`;
    const payload = {
      source_code: Buffer.from(code).toString('base64'),
      language_id: 63, // JavaScript (Node.js)
      stdin: Buffer.from('').toString('base64'),
    };

    console.log('Submitting code...');
    const submitResponse = await axios.post(
      `${JUDGE0_API_URL}/submissions?base64_encoded=true&wait=false`,
      payload,
      {
        headers: {
          'Content-Type': 'application/json',
          'x-rapidapi-key': JUDGE0_API_KEY,
          'x-rapidapi-host': JUDGE0_API_HOST,
        },
      }
    );

    const token = submitResponse.data.token;
    console.log('✅ Submission successful! Token:', token);

    // Wait and get result
    console.log('Waiting for execution result...');
    await new Promise(resolve => setTimeout(resolve, 2000));

    const resultResponse = await axios.get(
      `${JUDGE0_API_URL}/submissions/${token}?base64_encoded=true`,
      {
        headers: {
          'x-rapidapi-key': JUDGE0_API_KEY,
          'x-rapidapi-host': JUDGE0_API_HOST,
        },
      }
    );

    const result = resultResponse.data;
    const stdout = result.stdout ? Buffer.from(result.stdout, 'base64').toString() : '';
    const stderr = result.stderr ? Buffer.from(result.stderr, 'base64').toString() : '';

    console.log('✅ SUCCESS! Code executed');
    console.log('Status:', result.status?.description || 'Unknown');
    console.log('Output:', stdout || '(empty)');
    if (stderr) console.log('Errors:', stderr);
    console.log('Time:', result.time, 'seconds');
    console.log('Memory:', result.memory, 'KB');

    return true;
  } catch (error) {
    console.log('❌ FAILED!');
    console.log('Error:', error.response?.data || error.message);
    return false;
  }
}

// Run all tests
async function runTests() {
  console.log('🚀 Starting Judge0 API Tests...\n');

  if (!JUDGE0_API_KEY) {
    console.log('❌ ERROR: JUDGE0_API_KEY is not set in .env file!');
    console.log('Please add your RapidAPI key to backend/.env');
    process.exit(1);
  }

  const test1 = await testAbout();
  const test2 = test1 ? await testExecution() : false;

  console.log('\n' + '='.repeat(60) + '\n');
  console.log('📊 Test Results:');
  console.log('Test 1 (About):     ', test1 ? '✅ PASS' : '❌ FAIL');
  console.log('Test 2 (Execution): ', test2 ? '✅ PASS' : '❌ FAIL');
  console.log('\n' + '='.repeat(60) + '\n');

  if (test1 && test2) {
    console.log('🎉 All tests passed! Your Judge0 API is working correctly!');
    console.log('You can now use code execution in battles.');
  } else {
    console.log('⚠️  Some tests failed. Please check your API configuration.');
    console.log('\nTroubleshooting:');
    console.log('1. Verify your API key is correct in backend/.env');
    console.log('2. Check you are subscribed to Judge0 CE on RapidAPI');
    console.log('3. Make sure you have remaining API quota');
  }

  process.exit(test1 && test2 ? 0 : 1);
}

runTests();
