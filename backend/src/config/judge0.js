/**
 * Judge0 Configuration
 * Language IDs and API settings for code execution
 */

import dotenv from 'dotenv';
dotenv.config();

export const judge0Config = {
  apiUrl: process.env.JUDGE0_API_URL || 'https://judge0-ce.p.rapidapi.com',
  apiKey: process.env.JUDGE0_API_KEY || '',
  apiHost: process.env.JUDGE0_API_HOST || 'judge0-ce.p.rapidapi.com',
};

/**
 * Language ID mapping for Judge0
 * Maps our language names to Judge0 language IDs
 * Full list: https://ce.judge0.com/#system-info-languages-get
 */
export const languageIds = {
  javascript: 63,    // Node.js
  python: 71,        // Python 3
  java: 62,          // Java
  cpp: 54,           // C++ (GCC 9.2.0)
  c: 50,             // C (GCC 9.2.0)
  csharp: 51,        // C# (Mono 6.6.0.161)
  ruby: 72,          // Ruby
  go: 60,            // Go
  rust: 73,          // Rust
  typescript: 74,    // TypeScript
  php: 68,           // PHP
  swift: 83,         // Swift
  kotlin: 78,        // Kotlin
};

/**
 * Get Judge0 language ID from our language name
 */
export const getLanguageId = (language) => {
  return languageIds[language.toLowerCase()] || languageIds.javascript;
};

/**
 * Default execution limits
 */
export const executionLimits = {
  timeLimit: 2,           // seconds
  memoryLimit: 128000,    // KB (128 MB)
  maxProcesses: 60,
  enableNetwork: false,
};

/**
 * Status codes from Judge0
 */
export const judge0Status = {
  1: 'In Queue',
  2: 'Processing',
  3: 'Accepted',
  4: 'Wrong Answer',
  5: 'Time Limit Exceeded',
  6: 'Compilation Error',
  7: 'Runtime Error (SIGSEGV)',
  8: 'Runtime Error (SIGXFSZ)',
  9: 'Runtime Error (SIGFPE)',
  10: 'Runtime Error (SIGABRT)',
  11: 'Runtime Error (NZEC)',
  12: 'Runtime Error (Other)',
  13: 'Internal Error',
  14: 'Exec Format Error',
};

export default {
  judge0Config,
  languageIds,
  getLanguageId,
  executionLimits,
  judge0Status,
};
