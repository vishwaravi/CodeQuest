import { X, CheckCircle, XCircle, Clock, Database, AlertCircle } from 'lucide-react';

const ExecutionResultsModal = ({ isOpen, onClose, results, isSubmission = false }) => {
  if (!isOpen || !results) return null;

  const { summary, results: testResults, hiddenTestCases } = results;

  const getStatusIcon = (passed) => {
    return passed ? (
      <CheckCircle className="w-5 h-5 text-green-500" />
    ) : (
      <XCircle className="w-5 h-5 text-red-500" />
    );
  };

  const getStatusColor = (passed) => {
    return passed ? 'text-green-500' : 'text-red-500';
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="bg-gray-900 rounded-xl border border-gray-700 max-w-4xl w-full max-h-[90vh] overflow-hidden shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-700">
          <div className="flex items-center gap-3">
            {summary.allPassed ? (
              <CheckCircle className="w-8 h-8 text-green-500" />
            ) : (
              <AlertCircle className="w-8 h-8 text-yellow-500" />
            )}
            <div>
              <h2 className="text-2xl font-bold text-white">
                {isSubmission ? 'Submission Results' : 'Execution Results'}
              </h2>
              <p className="text-gray-400 text-sm">
                {summary.passed}/{summary.totalTests} test cases passed ({summary.percentage}%)
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 p-6 bg-gray-800/50">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <span className="text-gray-400">Passed</span>
            </div>
            <p className="text-3xl font-bold text-green-500">{summary.passed}</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Clock className="w-5 h-5 text-blue-500" />
              <span className="text-gray-400">Avg Time</span>
            </div>
            <p className="text-3xl font-bold text-blue-500">{summary.averageTime}s</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-2">
              <Database className="w-5 h-5 text-purple-500" />
              <span className="text-gray-400">Avg Memory</span>
            </div>
            <p className="text-3xl font-bold text-purple-500">{summary.averageMemory}KB</p>
          </div>
        </div>

        {/* Test Cases List */}
        <div className="overflow-y-auto max-h-[50vh] p-6">
          <h3 className="text-lg font-bold text-white mb-4">Test Case Details</h3>
          <div className="space-y-4">
            {testResults.map((test, idx) => (
              <div
                key={idx}
                className={`border rounded-lg p-4 ${
                  test.passed
                    ? 'border-green-500/30 bg-green-500/5'
                    : 'border-red-500/30 bg-red-500/5'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(test.passed)}
                    <span className="font-bold text-white">
                      Test Case {test.testCaseNumber}
                    </span>
                    <span className={`text-sm ${getStatusColor(test.passed)}`}>
                      {test.status}
                    </span>
                  </div>
                  {test.time && (
                    <div className="flex items-center gap-4 text-sm">
                      <span className="text-gray-400">
                        <Clock className="w-4 h-4 inline mr-1" />
                        {test.time}s
                      </span>
                      {test.memory && (
                        <span className="text-gray-400">
                          <Database className="w-4 h-4 inline mr-1" />
                          {test.memory}KB
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="space-y-2 text-sm">
                  <div>
                    <span className="text-gray-400">Input:</span>
                    <pre className="bg-gray-800 rounded p-2 mt-1 text-gray-300 overflow-x-auto">
                      {test.input || 'None'}
                    </pre>
                  </div>
                  <div>
                    <span className="text-gray-400">Expected Output:</span>
                    <pre className="bg-gray-800 rounded p-2 mt-1 text-green-400 overflow-x-auto">
                      {test.expectedOutput}
                    </pre>
                  </div>
                  <div>
                    <span className="text-gray-400">Your Output:</span>
                    <pre
                      className={`bg-gray-800 rounded p-2 mt-1 overflow-x-auto ${
                        test.passed ? 'text-green-400' : 'text-red-400'
                      }`}
                    >
                      {test.actualOutput || 'No output'}
                    </pre>
                  </div>
                  {test.error && (
                    <div>
                      <span className="text-red-400">Error:</span>
                      <pre className="bg-red-900/20 border border-red-500/30 rounded p-2 mt-1 text-red-400 overflow-x-auto">
                        {test.error}
                      </pre>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {hiddenTestCases > 0 && !isSubmission && (
            <div className="mt-6 p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-yellow-500">
                <AlertCircle className="w-5 h-5" />
                <p className="font-medium">
                  {hiddenTestCases} hidden test case{hiddenTestCases > 1 ? 's' : ''} will be evaluated on submission
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-700 flex justify-end">
          <button onClick={onClose} className="btn-primary">
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExecutionResultsModal;
