import { useState, useRef, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import prettier from 'prettier/standalone';
import parserBabel from 'prettier/parser-babel';
import parserTypescript from 'prettier/parser-typescript';
import {
  MONACO_LANGUAGE_MAP,
  EDITOR_THEMES,
  DEFAULT_EDITOR_OPTIONS,
  PRETTIER_OPTIONS,
} from '../constants/languages';

const CodeEditor = ({
  value,
  onChange,
  language = 'javascript',
  theme = 'vs-dark',
  readOnly = false,
  height = '100%',
  showFormatButton = true,
  showLanguageInfo = true,
  onMount,
}) => {
  const editorRef = useRef(null);
  const [isFormatting, setIsFormatting] = useState(false);

  const handleEditorDidMount = (editor, monaco) => {
    editorRef.current = editor;
    
    // Focus editor
    editor.focus();
    
    // Set up keyboard shortcuts
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      formatCode();
    });

    // Call parent onMount if provided
    if (onMount) {
      onMount(editor, monaco);
    }
  };

  const handleEditorChange = (newValue) => {
    if (onChange && !readOnly) {
      onChange(newValue);
    }
  };

  const formatCode = async () => {
    if (!editorRef.current || isFormatting) return;

    try {
      setIsFormatting(true);
      const currentCode = editorRef.current.getValue();

      // Only format JavaScript and TypeScript with Prettier
      if (language === 'javascript' || language === 'typescript') {
        const formatted = await prettier.format(currentCode, {
          ...PRETTIER_OPTIONS[language],
          plugins: [language === 'typescript' ? parserTypescript : parserBabel],
        });

        editorRef.current.setValue(formatted);
        
        if (onChange) {
          onChange(formatted);
        }
      } else {
        // Use Monaco's built-in formatting for other languages
        await editorRef.current.getAction('editor.action.formatDocument').run();
      }
    } catch (error) {
      console.error('Format error:', error);
    } finally {
      setIsFormatting(false);
    }
  };

  const increaseFontSize = () => {
    const model = editorRef.current?.getModel();
    if (model) {
      const currentOptions = editorRef.current.getOptions();
      const currentSize = currentOptions.get(Monaco.editor.EditorOption.fontSize);
      editorRef.current.updateOptions({ fontSize: Math.min(currentSize + 2, 24) });
    }
  };

  const decreaseFontSize = () => {
    const model = editorRef.current?.getModel();
    if (model) {
      const currentOptions = editorRef.current.getOptions();
      const currentSize = currentOptions.get(Monaco.editor.EditorOption.fontSize);
      editorRef.current.updateOptions({ fontSize: Math.max(currentSize - 2, 10) });
    }
  };

  return (
    <div className="relative h-full flex flex-col bg-gray-900">
      {/* Toolbar */}
      {(showFormatButton || showLanguageInfo) && (
        <div className="flex items-center justify-between bg-gray-800 border-b border-gray-700 px-4 py-2">
          <div className="flex items-center gap-2">
            {showLanguageInfo && (
              <div className="text-sm text-gray-400">
                Language: <span className="text-white font-semibold capitalize">{language}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Font Size Controls */}
            <button
              onClick={decreaseFontSize}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition"
              title="Decrease font size"
            >
              A-
            </button>
            <button
              onClick={increaseFontSize}
              className="px-2 py-1 text-xs bg-gray-700 hover:bg-gray-600 text-white rounded transition"
              title="Increase font size"
            >
              A+
            </button>

            {/* Format Button */}
            {showFormatButton && !readOnly && (
              <button
                onClick={formatCode}
                disabled={isFormatting}
                className={`px-3 py-1 text-xs rounded transition ${
                  isFormatting
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 hover:bg-purple-700 text-white'
                }`}
                title="Format code (Ctrl/Cmd + S)"
              >
                {isFormatting ? '⏳ Formatting...' : '✨ Format Code'}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1">
        <Editor
          height={height}
          language={MONACO_LANGUAGE_MAP[language] || 'javascript'}
          value={value}
          onChange={handleEditorChange}
          onMount={handleEditorDidMount}
          theme={theme}
          options={{
            ...DEFAULT_EDITOR_OPTIONS,
            readOnly,
          }}
          loading={
            <div className="flex items-center justify-center h-full bg-gray-900">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-4 border-purple-500 mb-3 mx-auto"></div>
                <p className="text-gray-400">Loading editor...</p>
              </div>
            </div>
          }
        />
      </div>

      {/* Read-only overlay message */}
      {readOnly && (
        <div className="absolute top-0 right-0 m-4 px-3 py-1 bg-yellow-600/80 text-white text-xs rounded-full backdrop-blur">
          👁️ Read Only
        </div>
      )}
    </div>
  );
};

export default CodeEditor;
