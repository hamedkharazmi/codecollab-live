import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { OutputPanel } from '@/components/OutputPanel';
import type { ExecutionResult } from '@/types/interview';

describe('OutputPanel', () => {
  it('should show default message when no result', () => {
    render(<OutputPanel result={null} isRunning={false} />);
    expect(screen.getByText('Click "Run Code" to execute your code')).toBeInTheDocument();
  });

  it('should show running indicator when running', () => {
    render(<OutputPanel result={null} isRunning={true} />);
    expect(screen.getByText('Running...')).toBeInTheDocument();
  });

  it('should show success result', () => {
    const result: ExecutionResult = {
      success: true,
      output: 'Hello, World!',
      executionTime: 50,
    };
    
    render(<OutputPanel result={result} isRunning={false} />);
    expect(screen.getByText('Execution successful')).toBeInTheDocument();
    expect(screen.getByText('Hello, World!')).toBeInTheDocument();
    expect(screen.getByText('50ms')).toBeInTheDocument();
  });

  it('should show error result', () => {
    const result: ExecutionResult = {
      success: false,
      output: '',
      error: 'SyntaxError: Unexpected token',
      executionTime: 10,
    };
    
    render(<OutputPanel result={result} isRunning={false} />);
    expect(screen.getByText('Execution failed')).toBeInTheDocument();
    expect(screen.getByText('SyntaxError: Unexpected token')).toBeInTheDocument();
  });
});
