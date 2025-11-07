import { useState } from 'react';
import Split from 'react-split';
import CodeEditor from './CodeEditor';

const CodeComparison = ({
  myCode,
  opponentCode,
  language,
  onMyCodeChange,
  myUsername,
  opponentUsername,
  readOnlyOpponent = true,
  battleStarted = false,
}) => {
  const [viewMode, setViewMode] = useState('split'); // 'split', 'my-code', 'opponent-code'

  const renderSingleView = (code, onChange, username, readOnly) => (
    <div className="h-full flex flex-col">
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-white">{username}'s Code</h3>
          <div className="text-xs text-gray-400">
            {code?.length || 0} characters
          </div>
        </div>
      </div>
      <div className="flex-1">
        <CodeEditor
          value={code}
          onChange={onChange}
          language={language}
          readOnly={readOnly}
          height="100%"
          showFormatButton={!readOnly}
          showLanguageInfo={false}
        />
      </div>
    </div>
  );

  const renderSplitView = () => (
    <Split
      className="flex h-full"
      sizes={[50, 50]}
      minSize={200}
      gutterSize={8}
      cursor="col-resize"
      direction="horizontal"
    >
      {/* My Code */}
      <div className="h-full flex flex-col bg-gray-900">
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-green-500 rounded-full"></span>
              {myUsername} (You)
            </h3>
            <div className="text-xs text-gray-400">
              {myCode?.length || 0} chars
            </div>
          </div>
        </div>
        <div className="flex-1">
          <CodeEditor
            value={myCode}
            onChange={onMyCodeChange}
            language={language}
            readOnly={!battleStarted}
            height="100%"
            showFormatButton={battleStarted}
            showLanguageInfo={false}
          />
        </div>
      </div>

      {/* Opponent Code */}
      <div className="h-full flex flex-col bg-gray-900">
        <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-white flex items-center gap-2">
              <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
              {opponentUsername}
            </h3>
            <div className="text-xs text-gray-400">
              {opponentCode?.length || 0} chars
            </div>
          </div>
        </div>
        <div className="flex-1">
          <CodeEditor
            value={opponentCode || '// Opponent code will appear here...'}
            onChange={null}
            language={language}
            readOnly={true}
            height="100%"
            showFormatButton={false}
            showLanguageInfo={false}
          />
        </div>
      </div>
    </Split>
  );

  return (
    <div className="h-full flex flex-col">
      {/* View Mode Selector */}
      <div className="bg-gray-800 border-b border-gray-700 px-4 py-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setViewMode('my-code')}
              className={`px-3 py-1 text-xs rounded transition ${
                viewMode === 'my-code'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              My Code
            </button>
            <button
              onClick={() => setViewMode('split')}
              className={`px-3 py-1 text-xs rounded transition ${
                viewMode === 'split'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Split View
            </button>
            <button
              onClick={() => setViewMode('opponent-code')}
              className={`px-3 py-1 text-xs rounded transition ${
                viewMode === 'opponent-code'
                  ? 'bg-purple-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Opponent Code
            </button>
          </div>

          <div className="text-xs text-gray-400">
            {battleStarted ? '⚔️ Battle in progress' : '⏳ Waiting to start...'}
          </div>
        </div>
      </div>

      {/* Code Views */}
      <div className="flex-1 overflow-hidden">
        {viewMode === 'my-code' && renderSingleView(myCode, onMyCodeChange, myUsername, !battleStarted)}
        {viewMode === 'split' && renderSplitView()}
        {viewMode === 'opponent-code' && renderSingleView(opponentCode, null, opponentUsername, true)}
      </div>
    </div>
  );
};

export default CodeComparison;
