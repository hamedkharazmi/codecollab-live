import { describe, it, expect } from 'vitest';
import type { SupportedLanguage, User, InterviewSession, ExecutionResult } from '@/types/interview';

describe('Interview Types', () => {
  it('should support all language types', () => {
    const languages: SupportedLanguage[] = ['javascript', 'typescript', 'python'];
    expect(languages).toHaveLength(3);
  });

  it('should create valid User objects', () => {
    const user: User = {
      id: 'user-123',
      name: 'Test User',
      isHost: false,
      joinedAt: new Date(),
    };
    
    expect(user.id).toBe('user-123');
    expect(user.name).toBe('Test User');
    expect(user.isHost).toBe(false);
    expect(user.joinedAt).toBeInstanceOf(Date);
  });

  it('should create valid InterviewSession objects', () => {
    const session: InterviewSession = {
      id: 'session-123',
      code: 'console.log("Hello");',
      language: 'javascript',
      participants: [],
      createdAt: new Date(),
      isActive: true,
    };
    
    expect(session.id).toBe('session-123');
    expect(session.language).toBe('javascript');
    expect(session.isActive).toBe(true);
  });

  it('should create valid ExecutionResult objects', () => {
    const successResult: ExecutionResult = {
      success: true,
      output: 'Hello, World!',
      executionTime: 50,
    };
    
    const errorResult: ExecutionResult = {
      success: false,
      output: '',
      error: 'SyntaxError',
      executionTime: 10,
    };
    
    expect(successResult.success).toBe(true);
    expect(errorResult.success).toBe(false);
    expect(errorResult.error).toBe('SyntaxError');
  });
});
