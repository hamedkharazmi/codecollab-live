import { describe, it, expect, beforeEach, vi } from 'vitest';
import { api } from '@/services/api';

describe('API Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createSession', () => {
    it('should create a new session with a unique ID', async () => {
      const result = await api.createSession('Test Host');
      
      expect(result.sessionId).toBeDefined();
      expect(result.sessionId.length).toBe(8);
      expect(result.shareLink).toContain(result.sessionId);
    });

    it('should create session with host as participant', async () => {
      const { sessionId } = await api.createSession('Test Host');
      const session = await api.getSession(sessionId);
      
      expect(session).toBeDefined();
      expect(session?.participants).toHaveLength(1);
      expect(session?.participants[0].name).toBe('Test Host');
      expect(session?.participants[0].isHost).toBe(true);
    });
  });

  describe('joinSession', () => {
    it('should allow joining an existing session', async () => {
      const { sessionId } = await api.createSession('Host');
      const { session, userId } = await api.joinSession(sessionId, 'Candidate');
      
      expect(userId).toBeDefined();
      expect(session.participants).toHaveLength(2);
      expect(session.participants[1].name).toBe('Candidate');
      expect(session.participants[1].isHost).toBe(false);
    });

    it('should throw error for non-existent session', async () => {
      await expect(api.joinSession('invalid-id', 'User')).rejects.toThrow('Session not found');
    });
  });

  describe('getSession', () => {
    it('should return null for non-existent session', async () => {
      const session = await api.getSession('non-existent');
      expect(session).toBeNull();
    });

    it('should return session data for existing session', async () => {
      const { sessionId } = await api.createSession('Host');
      const session = await api.getSession(sessionId);
      
      expect(session).toBeDefined();
      expect(session?.id).toBe(sessionId);
      expect(session?.isActive).toBe(true);
    });
  });

  describe('updateCode', () => {
    it('should update session code', async () => {
      const { sessionId } = await api.createSession('Host');
      const session = await api.getSession(sessionId);
      const hostId = session?.participants[0].id || '';
      
      const newCode = 'console.log("Updated!");';
      await api.updateCode(sessionId, hostId, newCode, 'javascript');
      
      const updatedSession = await api.getSession(sessionId);
      expect(updatedSession?.code).toBe(newCode);
    });

    it('should throw error for non-existent session', async () => {
      await expect(
        api.updateCode('invalid-id', 'user-id', 'code', 'javascript')
      ).rejects.toThrow('Session not found');
    });
  });

  describe('executeCode', () => {
    it('should execute JavaScript code successfully', async () => {
      const code = 'console.log("Hello, World!");';
      const result = await api.executeCode(code, 'javascript');
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Hello, World!');
      expect(result.executionTime).toBeGreaterThanOrEqual(0);
    });

    it('should handle JavaScript errors', async () => {
      const code = 'throw new Error("Test error");';
      const result = await api.executeCode(code, 'javascript');
      
      expect(result.success).toBe(false);
      expect(result.error).toContain('Test error');
    });

    it('should return simulated output for Python', async () => {
      const code = 'print("Hello")';
      const result = await api.executeCode(code, 'python');
      
      expect(result.success).toBe(true);
      expect(result.output).toContain('Python execution simulated');
    });
  });

  describe('subscribeToCodeChanges', () => {
    it('should notify subscribers of code changes', async () => {
      const { sessionId } = await api.createSession('Host');
      const session = await api.getSession(sessionId);
      const hostId = session?.participants[0].id || '';
      
      const callback = vi.fn();
      const unsubscribe = api.subscribeToCodeChanges(sessionId, callback);
      
      await api.updateCode(sessionId, hostId, 'new code', 'javascript');
      
      expect(callback).toHaveBeenCalledWith(
        expect.objectContaining({
          content: 'new code',
          language: 'javascript',
          userId: hostId,
        })
      );
      
      unsubscribe();
    });

    it('should stop notifying after unsubscribe', async () => {
      const { sessionId } = await api.createSession('Host');
      const session = await api.getSession(sessionId);
      const hostId = session?.participants[0].id || '';
      
      const callback = vi.fn();
      const unsubscribe = api.subscribeToCodeChanges(sessionId, callback);
      
      unsubscribe();
      await api.updateCode(sessionId, hostId, 'new code', 'javascript');
      
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('subscribeToParticipants', () => {
    it('should notify subscribers when participants join', async () => {
      const { sessionId } = await api.createSession('Host');
      
      const callback = vi.fn();
      const unsubscribe = api.subscribeToParticipants(sessionId, callback);
      
      await api.joinSession(sessionId, 'Candidate');
      
      expect(callback).toHaveBeenCalled();
      expect(callback.mock.calls[0][0]).toHaveLength(2);
      
      unsubscribe();
    });
  });

  describe('leaveSession', () => {
    it('should remove participant from session', async () => {
      const { sessionId } = await api.createSession('Host');
      const { userId } = await api.joinSession(sessionId, 'Candidate');
      
      await api.leaveSession(sessionId, userId);
      
      const session = await api.getSession(sessionId);
      expect(session?.participants).toHaveLength(1);
    });
  });

  describe('endSession', () => {
    it('should mark session as inactive', async () => {
      const { sessionId } = await api.createSession('Host');
      
      await api.endSession(sessionId);
      
      const session = await api.getSession(sessionId);
      expect(session?.isActive).toBe(false);
    });
  });

  describe('getDefaultCode', () => {
    it('should return default code for JavaScript', () => {
      const code = api.getDefaultCode('javascript');
      expect(code).toContain('function solution');
    });

    it('should return default code for Python', () => {
      const code = api.getDefaultCode('python');
      expect(code).toContain('def solution');
    });

    it('should return default code for TypeScript', () => {
      const code = api.getDefaultCode('typescript');
      expect(code).toContain('function solution');
      expect(code).toContain(': string');
    });
  });
});
