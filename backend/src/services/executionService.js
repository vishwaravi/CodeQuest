/**
 * 🧠 Code Execution Service
 * Handles code execution using the Judge0 API.
 * Docs: https://judge0.com/
 */

import axios from 'axios';
import { 
  judge0Config, 
  getLanguageId, 
  judge0Status, 
  executionLimits 
} from '../config/judge0.js';

class ExecutionService {
  constructor() {
    this.baseURL = judge0Config.apiUrl;

    // Debug Configuration
    console.log('🔧 Judge0 Config:', {
      apiUrl: judge0Config.apiUrl,
      apiKey: judge0Config.apiKey 
        ? `${judge0Config.apiKey.substring(0, 10)}...` 
        : 'NOT SET',
      apiHost: judge0Config.apiHost,
    });

    this.headers = {
      'Content-Type': 'application/json',
      ...(judge0Config.apiKey && {
        'x-rapidapi-key': judge0Config.apiKey,
        'x-rapidapi-host': judge0Config.apiHost,
      }),
    };

    console.log('📋 Headers configured:', Object.keys(this.headers));
  }

  /**
   * Submit code for execution
   * @param {string} code - Source code to execute
   * @param {string} language - Programming language
   * @param {string} [stdin=''] - Input for the program
   * @param {number} [timeLimit=executionLimits.timeLimit] - Time limit in seconds
   * @returns {Promise<string>} Submission token
   */
  async submitCode(code, language, stdin = '', timeLimit = executionLimits.timeLimit) {
    try {
      const languageId = getLanguageId(language);

      const payload = {
        source_code: Buffer.from(code).toString('base64'),
        language_id: languageId,
        stdin: stdin ? Buffer.from(stdin).toString('base64') : '',
        cpu_time_limit: timeLimit,
        memory_limit: executionLimits.memoryLimit,
        max_processes_and_or_threads: executionLimits.maxProcesses,
        enable_network: executionLimits.enableNetwork,
      };

      const url = `${this.baseURL}/submissions?base64_encoded=true&wait=false`;

      console.log(`🚀 Submitting code (${language}, ID: ${languageId})`);
      console.log('📍 URL:', url);

      const { data } = await axios.post(url, payload, { headers: this.headers });

      console.log('✅ Submission successful, token:', data.token);
      return data.token;
    } catch (error) {
      console.error('❌ Error submitting code:', error.response?.data || error.message);
      throw new Error('Failed to submit code for execution');
    }
  }

  /**
   * Get submission result
   * @param {string} token - Submission token
   * @returns {Promise<Object>} Execution result
   */
  async getSubmission(token) {
    try {
      const url = `${this.baseURL}/submissions/${token}?base64_encoded=true`;
      const { data } = await axios.get(url, { headers: this.headers });

      const decode = str => (str ? Buffer.from(str, 'base64').toString() : '');

      return {
        status: data.status,
        statusDescription: judge0Status[data.status.id] || 'Unknown',
        time: data.time,
        memory: data.memory,
        stdout: decode(data.stdout),
        stderr: decode(data.stderr),
        compile_output: decode(data.compile_output),
        message: decode(data.message),
      };
    } catch (error) {
      console.error('❌ Error fetching submission:', error.response?.data || error.message);
      throw new Error('Failed to get submission result');
    }
  }

  /**
   * Wait for submission to complete (polling)
   * @param {string} token - Submission token
   * @param {number} [maxAttempts=10] - Max polling attempts
   * @returns {Promise<Object>} Final execution result
   */
  async waitForSubmission(token, maxAttempts = 10) {
    for (let i = 0; i < maxAttempts; i++) {
      const result = await this.getSubmission(token);

      // Status IDs: 1 = In Queue, 2 = Processing
      if (result.status.id > 2) return result;

      await new Promise(res => setTimeout(res, 500));
    }

    throw new Error('Execution timeout — submission took too long to complete');
  }

  /**
   * Execute code and fetch result
   * @param {string} code - Source code
   * @param {string} language - Programming language
   * @param {string} [stdin=''] - Input
   * @returns {Promise<Object>} Execution result
   */
  async executeCode(code, language, stdin = '') {
    const token = await this.submitCode(code, language, stdin);
    return await this.waitForSubmission(token);
  }

  /**
   * Run code against multiple test cases
   * @param {string} code - Source code
   * @param {string} language - Programming language
   * @param {Array<{input: string, expectedOutput: string}>} testCases
   * @returns {Promise<{summary: Object, results: Array}>} Test results summary
   */
  async runTestCases(code, language, testCases) {
    console.log(`🧪 Running ${testCases.length} test cases for ${language}`);

    const results = [];
    let passed = 0, failed = 0, totalTime = 0, totalMemory = 0;

    for (const [i, testCase] of testCases.entries()) {
      const testIndex = i + 1;
      console.log(`   Test ${testIndex}/${testCases.length}: Running...`);

      try {
        const result = await this.executeCode(code, language, testCase.input);
        const actualOutput = (result.stdout || '').trim();
        const expectedOutput = testCase.expectedOutput.trim();
        const isPassed = actualOutput === expectedOutput && result.status.id === 3;

        if (isPassed) {
          passed++;
          console.log(`   ✅ Test ${testIndex}: PASSED (${result.time}s, ${result.memory}KB)`);
        } else {
          failed++;
          console.log(`   ❌ Test ${testIndex}: FAILED`);
        }

        totalTime += parseFloat(result.time || 0);
        totalMemory += parseInt(result.memory || 0);

        results.push({
          testCaseNumber: testIndex,
          passed: isPassed,
          input: testCase.input,
          expectedOutput,
          actualOutput,
          status: result.statusDescription,
          time: result.time,
          memory: result.memory,
          error: result.stderr || result.compile_output || result.message || null,
        });
      } catch (error) {
        failed++;
        console.log(`   ❌ Test ${testIndex}: ERROR - ${error.message}`);

        results.push({
          testCaseNumber: testIndex,
          passed: false,
          input: testCase.input,
          expectedOutput: testCase.expectedOutput,
          actualOutput: '',
          status: 'Error',
          error: error.message,
        });
      }
    }

    const summary = {
      totalTests: testCases.length,
      passed,
      failed,
      percentage: Math.round((passed / testCases.length) * 100),
      averageTime: (totalTime / testCases.length).toFixed(4),
      averageMemory: Math.round(totalMemory / testCases.length),
      allPassed: passed === testCases.length,
    };

    console.log(`📊 Results: ${passed}/${testCases.length} passed (${summary.percentage}%)`);

    return { summary, results };
  }
}

export default new ExecutionService();
