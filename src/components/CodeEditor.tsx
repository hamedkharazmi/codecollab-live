import React, { useCallback } from 'react';
import Editor, { OnMount } from '@monaco-editor/react';
import type { SupportedLanguage } from '@/types/interview';

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

export const CodeEditor: React.FC<CodeEditorProps> = ({
  code,
  language,
  onChange,
  readOnly = false,
}) => {
  const handleEditorMount: OnMount = useCallback((editor) => {
    editor.focus();
  }, []);

  const handleChange = useCallback((value: string | undefined) => {
    onChange(value || '');
  }, [onChange]);

  return (
    <div className="h-full w-full overflow-hidden rounded-lg border border-border">
      <Editor
        height="100%"
        language={languageMap[language]}
        value={code}
        onChange={handleChange}
        onMount={handleEditorMount}
        theme="vs-dark"
        options={{
          fontSize: 14,
          fontFamily: "'JetBrains Mono', monospace",
          minimap: { enabled: false },
          scrollBeyondLastLine: false,
          wordWrap: 'on',
          lineNumbers: 'on',
          glyphMargin: false,
          folding: true,
          lineDecorationsWidth: 10,
          lineNumbersMinChars: 3,
          renderLineHighlight: 'line',
          cursorBlinking: 'smooth',
          cursorSmoothCaretAnimation: 'on',
          smoothScrolling: true,
          readOnly,
          automaticLayout: true,
          padding: { top: 16, bottom: 16 },
          tabSize: 2,
        }}
      />
    </div>
  );
};
