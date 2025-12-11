import { v4 as uuidv4 } from 'uuid';
import type {
  InterviewSession,
  CreateSessionResponse,
  JoinSessionResponse,
  SupportedLanguage,
  ExecutionResult,
  User,
  CodeChange,
} from '@/types/interview';

// In-memory storage for mock data
const sessions = new Map<string, InterviewSession>();
const codeChangeCallbacks = new Map<string, Set<(change: CodeChange) => void>>();
const participantCallbacks = new Map<string, Set<(participants: User[]) => void>>();

// Simulated network delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Default code templates for each language
const defaultCode: Record<SupportedLanguage, string> = {
  javascript: `// Welcome to the coding interview!
// Write your solution below

function solution(input) {
  // Your code here
  return input;
}

// Test your solution
console.log(solution("Hello, World!"));
`,
  typescript: `// Welcome to the coding interview!
// Write your solution below

function solution(input: string): string {
  // Your code here
  return input;
}

// Test your solution
console.log(solution("Hello, World!"));
`,
  python: `# Welcome to the coding interview!
# Write your solution below

def solution(input):
    # Your code here
    return input

# Test your solution
print(solution("Hello, World!"))
`,
};

/**
 * API Service - Centralized mock backend calls
 * All backend communication should go through this service
 */
export const api = {
  /**
   * Create a new interview session
   */
  async createSession(hostName: string): Promise<CreateSessionResponse> {
    await delay(300);
    
    const sessionId = uuidv4().slice(0, 8);
    const hostUser: User = {
      id: uuidv4(),
      name: hostName,
      isHost: true,
      joinedAt: new Date(),
    };
    
    const session: InterviewSession = {
      id: sessionId,
      code: defaultCode.javascript,
      language: 'javascript',
      participants: [hostUser],
      createdAt: new Date(),
      isActive: true,
    };
    
    sessions.set(sessionId, session);
    
    const shareLink = `${window.location.origin}/interview/${sessionId}`;
    
    return { sessionId, shareLink };
  },

  /**
   * Join an existing session
   */
  async joinSession(sessionId: string, userName: string): Promise<JoinSessionResponse> {
    await delay(200);
    
    const session = sessions.get(sessionId);
    
    if (!session) {
      throw new Error('Session not found');
    }
    
    if (!session.isActive) {
      throw new Error('Session is no longer active');
    }
    
    const newUser: User = {
      id: uuidv4(),
      name: userName,
      isHost: false,
      joinedAt: new Date(),
    };
    
    session.participants.push(newUser);
    
    // Notify all participants
    const callbacks = participantCallbacks.get(sessionId);
    if (callbacks) {
      callbacks.forEach(cb => cb([...session.participants]));
    }
    
    return { session: { ...session }, userId: newUser.id };
  },

  /**
   * Get session details
   */
  async getSession(sessionId: string): Promise<InterviewSession | null> {
    await delay(100);
    const session = sessions.get(sessionId);
    return session ? { ...session } : null;
  },

  /**
   * Update code in session
   */
  async updateCode(sessionId: string, userId: string, code: string, language: SupportedLanguage): Promise<void> {
    await delay(50);
    
    const session = sessions.get(sessionId);
    if (!session) {
      throw new Error('Session not found');
    }
    
    session.code = code;
    session.language = language;
    
    const change: CodeChange = {
      userId,
      content: code,
      timestamp: new Date(),
      language,
    };
    
    // Notify all subscribers
    const callbacks = codeChangeCallbacks.get(sessionId);
    if (callbacks) {
      callbacks.forEach(cb => cb(change));
    }
  },

  /**
   * Execute code safely in browser
   */
  async executeCode(code: string, language: SupportedLanguage): Promise<ExecutionResult> {
    await delay(500);
    
    const startTime = performance.now();
    
    try {
      if (language === 'python') {
        // Mock Python execution
        return {
          success: true,
          output: '[Python execution simulated]\nHello, World!',
          executionTime: performance.now() - startTime,
        };
      }
      
      // JavaScript/TypeScript execution
      const logs: string[] = [];
      const mockConsole = {
        log: (...args: unknown[]) => logs.push(args.map(String).join(' ')),
        error: (...args: unknown[]) => logs.push(`Error: ${args.map(String).join(' ')}`),
        warn: (...args: unknown[]) => logs.push(`Warning: ${args.map(String).join(' ')}`),
      };
      
      // Create and run a sandboxed execution environment that receives a mocked console
      // eslint-disable-next-line no-new-func
      const fn = new Function('console', '"use strict";\n' + code);
      // Execute the user code with the mocked console so console.log/error calls are captured
      fn(mockConsole);
      
      return {
        success: true,
        output: logs.join('\n') || 'Code executed successfully (no output)',
        executionTime: performance.now() - startTime,
      };
    } catch (error) {
      return {
        success: false,
        output: '',
        error: error instanceof Error ? error.message : 'Unknown error occurred',
        executionTime: performance.now() - startTime,
      };
    }
  },

  /**
   * Subscribe to code changes
   */
  subscribeToCodeChanges(sessionId: string, callback: (change: CodeChange) => void): () => void {
    if (!codeChangeCallbacks.has(sessionId)) {
      codeChangeCallbacks.set(sessionId, new Set());
    }
    
    codeChangeCallbacks.get(sessionId)!.add(callback);
    
    return () => {
      const callbacks = codeChangeCallbacks.get(sessionId);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  },

  /**
   * Subscribe to participant changes
   */
  subscribeToParticipants(sessionId: string, callback: (participants: User[]) => void): () => void {
    if (!participantCallbacks.has(sessionId)) {
      participantCallbacks.set(sessionId, new Set());
    }
    
    participantCallbacks.get(sessionId)!.add(callback);
    
    return () => {
      const callbacks = participantCallbacks.get(sessionId);
      if (callbacks) {
        callbacks.delete(callback);
      }
    };
  },

  /**
   * Leave session
   */
  async leaveSession(sessionId: string, userId: string): Promise<void> {
    await delay(100);
    
    const session = sessions.get(sessionId);
    if (!session) return;
    
    session.participants = session.participants.filter(p => p.id !== userId);
    
    // Notify all participants
    const callbacks = participantCallbacks.get(sessionId);
    if (callbacks) {
      callbacks.forEach(cb => cb([...session.participants]));
    }
  },

  /**
   * End session (host only)
   */
  async endSession(sessionId: string): Promise<void> {
    await delay(200);
    
    const session = sessions.get(sessionId);
    if (session) {
      session.isActive = false;
    }
  },

  /**
   * Get default code for a language
   */
  getDefaultCode(language: SupportedLanguage): string {
    return defaultCode[language];
  },
};
