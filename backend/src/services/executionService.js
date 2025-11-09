/**
 * Code Execution Service
 * Handles code execution via Judge0 API
 */

import axios from 'axios';
import { judge0Config, getLanguageId, judge0Status, executionLimits } from '../config/judge0.js';

class ExecutionService {
  constructor() {
    this.baseURL = judge0Config.apiUrl;
    this.headers = judge0Config.apiKey
      ? {
          'Content-Type': 'application/json',
          'X-RapidAPI-Key': judge0Config.apiKey,
          'X-RapidAPI-Host': judge0Config.apiHost,
        }
      : {
          'Content-Type': 'application/json',
        };
  }

  /**
   * Submit code for execution
   * @param {string} code - Source code to execute
   * @param {string} language - Programming language
   * @param {string} stdin - Input for the program
   * @param {number} timeLimit - Time limit in seconds
   * @returns {Promise<string>} Token for checking submission status
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

      console.log(`🚀 Submitting code for execution (${language}, ID: ${languageId})`);

      const response = await axios.post(
        `${this.baseURL}/submissions?base64_encoded=true&wait=false`,
        payload,
        { headers: this.headers }
      );

      return response.data.token;
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
      const response = await axios.get(
        `${this.baseURL}/submissions/${token}?base64_encoded=true`,
        { headers: this.headers }
      );

      const data = response.data;

      // Decode base64 outputs
      const result = {
        status: data.status,
        statusDescription: judge0Status[data.status.id] || 'Unknown',
        time: data.time,
        memory: data.memory,
        stdout: data.stdout ? Buffer.from(data.stdout, 'base64').toString() : '',
        stderr: data.stderr ? Buffer.from(data.stderr, 'base64').toString() : '',
        compile_output: data.compile_output ? Buffer.from(data.compile_output, 'base64').toString() : '',
        message: data.message ? Buffer.from(data.message, 'base64').toString() : '',
      };

      return result;
    } catch (error) {
      console.error('❌ Error getting submission:', error.response?.data || error.message);
      throw new Error('Failed to get submission result');
    }
  }

  /**
   * Wait for submission to complete (with polling)
   * @param {string} token - Submission token
   * @param {number} maxAttempts - Maximum polling attempts
   * @returns {Promise<Object>} Final execution result
   */
  async waitForSubmission(token, maxAttempts = 10) {
    for (let i = 0; i < maxAttempts; i++) {
      const result = await this.getSubmission(token);
      
      // Status 1 = In Queue, 2 = Processing
      if (result.status.id > 2) {
        return result;
      }

      // Wait 500ms before next attempt
      await new Promise(resolve => setTimeout(resolve, 500));
    }

    throw new Error('Execution timeout - took too long to complete');
  }

  /**
   * Execute code and get result (convenience method)
   * @param {string} code - Source code
   * @param {string} language - Programming language
   * @param {string} stdin - Input
   * @returns {Promise<Object>} Execution result
   */
  async executeCode(code, language, stdin = '') {
    const token = await this.submitCode(code, language, stdin);
    const result = await this.waitForSubmission(token);
    return result;
  }

  /**
   * Run code against multiple test cases
   * @param {string} code - Source code
   * @param {string} language - Programming language
   * @param {Array} testCases - Array of {input, expectedOutput}
   * @returns {Promise<Object>} Test results
   */
  async runTestCases(code, language, testCases) {
    console.log(`🧪 Running ${testCases.length} test cases for ${language}`);

    const results = [];
    let passed = 0;
    let failed = 0;
    let totalTime = 0;
    let totalMemory = 0;

    for (let i = 0; i < testCases.length; i++) {
      const testCase = testCases[i];
      
      try {
        console.log(`   Test ${i + 1}/${testCases.length}: Running...`);
        
        const result = await this.executeCode(code, language, testCase.input);
        
        // Normalize outputs (trim whitespace)
        const actualOutput = (result.stdout || '').trim();
        const expectedOutput = testCase.expectedOutput.trim();
        
        const isPassed = actualOutput === expectedOutput && result.status.id === 3;
        
        if (isPassed) {
          passed++;
          console.log(`   ✅ Test ${i + 1}: PASSED (${result.time}s, ${result.memory}KB)`);
        } else {
          failed++;
          console.log(`   ❌ Test ${i + 1}: FAILED`);
        }

        totalTime += parseFloat(result.time || 0);
        totalMemory += parseInt(result.memory || 0);

        results.push({
          testCaseNumber: i + 1,
          passed: isPassed,
          input: testCase.input,
          expectedOutput: expectedOutput,
          actualOutput: actualOutput,
          status: result.statusDescription,
          time: result.time,
          memory: result.memory,
          error: result.stderr || result.compile_output || result.message || null,
        });
      } catch (error) {
        failed++;
        console.log(`   ❌ Test ${i + 1}: ERROR - ${error.message}`);
        
        results.push({
          testCaseNumber: i + 1,
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

    return {
      summary,
      results,
    };
  }
}

export default new ExecutionService();
