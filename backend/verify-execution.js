/**
 * Quick Verification Test
 */

import executionService from './src/services/executionService.js';

console.log('🔍 Quick Verification Test\n');

// Simple test
const code = `console.log("Test successful!");`;

executionService.executeCode(code, 'javascript', '')
  .then(result => {
    console.log('\n✅ Execution Service is CORRECT!');
    console.log('Status:', result.statusDescription);
    console.log('Output:', result.stdout.trim());
    console.log('\n🎉 Ready for battles!');
    process.exit(0);
  })
  .catch(error => {
    console.log('\n❌ Execution Service has issues!');
    console.log('Error:', error.message);
    process.exit(1);
  });
