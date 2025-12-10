import React from 'react';
import { CheckCircle, XCircle, Clock, Terminal } from 'lucide-react';
import type { ExecutionResult } from '@/types/interview';

interface OutputPanelProps {
  result: ExecutionResult | null;
  isRunning: boolean;
}

export const OutputPanel: React.FC<OutputPanelProps> = ({ result, isRunning }) => {
  return (
    <div className="flex h-full flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Terminal className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">Output</span>
        {result && (
          <span className="ml-auto flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" />
            {result.executionTime.toFixed(0)}ms
          </span>
        )}
      </div>
      
      <div className="flex-1 overflow-auto p-4 font-mono text-sm">
        {isRunning ? (
          <div className="flex items-center gap-2 text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            <span>Running...</span>
          </div>
        ) : result ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              {result.success ? (
                <CheckCircle className="h-4 w-4 text-success" />
              ) : (
                <XCircle className="h-4 w-4 text-destructive" />
              )}
              <span className={result.success ? 'text-success' : 'text-destructive'}>
                {result.success ? 'Execution successful' : 'Execution failed'}
              </span>
            </div>
            
            {result.output && (
              <pre className="mt-3 whitespace-pre-wrap text-foreground">
                {result.output}
              </pre>
            )}
            
            {result.error && (
              <pre className="mt-3 whitespace-pre-wrap text-destructive">
                {result.error}
              </pre>
            )}
          </div>
        ) : (
          <span className="text-muted-foreground">
            Click "Run Code" to execute your code
          </span>
        )}
      </div>
    </div>
  );
};
