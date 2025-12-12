import React, { useCallback } from 'react';
import Editor, { OnMount, useMonaco } from '@monaco-editor/react';
import type { SupportedLanguage } from '@/types/interview';
import * as monaco from 'monaco-editor';

interface CodeEditorProps {
  code: string;
  language: SupportedLanguage;
  onChange: (value: string) => void;
  readOnly?: boolean;
}

const languageMap: Record<SupportedLanguage, string> = {
  javascript: 'javascript',
  typescript: 'typescript',
  python: 'python',
};

// Language-specific editor options
const getLanguageOptions = (lang: SupportedLanguage) => {
  const baseOptions = {
    insertSpaces: true,
    trimAutoWhitespace: true,
    formatOnType: true,
    formatOnPaste: true,
    autoClosingBrackets: 'always' as const,
    autoClosingQuotes: 'always' as const,
    autoIndent: 'full' as const,
    bracketPairColorization: { enabled: true },
    wordBasedSuggestions: 'matchingDocuments' as const,
    suggestOnTriggerCharacters: true,
    quickSuggestions: {
      other: true,
      comments: false,
      strings: false,
    },
  };

  const languageSpecific = {
    javascript: { tabSize: 2, ...baseOptions },
    typescript: { tabSize: 2, ...baseOptions },
    python: { tabSize: 4, insertSpaces: true, ...baseOptions },
  };

  return languageSpecific[lang] || baseOptions;
};

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  onChange,
  readOnly = false,
}) => {
  const monacoInstance = useMonaco();

  const handleEditorMount: OnMount = useCallback((editor) => {
    editor.focus();

    // Set up semantic highlighting for Python and JavaScript
    if (monacoInstance) {
      const model = editor.getModel();
      if (model) {
        const lang = model.getLanguageId();
        // Ensure proper tokenization for syntax highlighting
        editor.updateOptions({
          'bracketPairColorization.enabled': true,
          'editor.semanticHighlighting.enabled': true,
        });
      }
    }
  }, [monacoInstance]);

  const handleChange = useCallback((value: string | undefined) => {
    onChange(value || '');
  }, [onChange]);

  const languageOptions = getLanguageOptions(language);

  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-border bg-[#1e1e1e]">
      <Editor
        height="100%"
        language={languageMap[language]}
        value={code}
        onChange={handleChange}
        onMount={handleEditorMount}
        theme="vs-dark"
        loading={<div className="flex items-center justify-center h-full text-gray-400">Loading editor...</div>}
        options={{
          fontSize: 14,
          fontFamily: "'Fira Code', 'JetBrains Mono', monospace",
          fontLigatures: true,
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          lineNumbers: 'on',
          glyphMargin: false,
          folding: true,
          foldingStrategy: 'indentation' as const,
          foldingHighlight: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          renderLineHighlight: 'gutter',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          readOnly,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          // Syntax highlighting options
          'bracketPairColorization.enabled': true,
          'bracketPairColorization.independentColorPoolPerBracketType': false,
          semanticHighlighting: { enabled: true },
          // Language-specific options
          ...languageOptions,
          // Enhanced visual features
          renderWhitespace: 'none' as const,
          renderControlCharacters: true,
          renderIndentGuides: true,
          highlightActiveIndentGuide: true,
          acceptSuggestionOnCommitCharacter: true,
          acceptSuggestionOnEnter: 'smart' as const,
          parameterHints: { enabled: true },
          'editor.suggest.preview': true,
          'editor.suggest.showIcons': true,
        }}
      />
    </div>
  );
};
