import type {
  InterviewSession,
  CreateSessionResponse,
  JoinSessionResponse,
  SupportedLanguage,
  ExecutionResult,
  User,
  CodeChange,
} from '@/types/interview';

const DEFAULT_POLL_INTERVAL = 1000;

const apiBase = (import.meta as any).env?.VITE_API_URL || 'http://localhost:8000';

async function request<T = any>(input: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${apiBase}${input}`, {
    headers: { 'Content-Type': 'application/json' },
    ...init,
  });

  const text = await res.text();
  try {
    const json = text ? JSON.parse(text) : null;
    if (!res.ok) throw new Error(json?.detail || `HTTP ${res.status}`);
    return json as T;
  } catch (err) {
    if (!res.ok) throw err;
    // If response wasn't JSON, return raw text
    return (text as unknown) as T;
  }
}

// Simple polling-based subscriptions until real-time is added
function createPoller<T>(
  getState: () => Promise<T | null>,
  onChange: (state: T) => void,
  interval = DEFAULT_POLL_INTERVAL,
) {
  let stopped = false;
  let last: T | null = null;

  const run = async () => {
    if (stopped) return;
    try {
      const state = await getState();
      if (state && JSON.stringify(state) !== JSON.stringify(last)) {
        last = state;
        onChange(state);
      }
    } catch (e) {
      // ignore transient errors
    }
    if (!stopped) setTimeout(run, interval);
  };

  run();
  return () => {
    stopped = true;
  };
}

export const api = {
  async createSession(hostName: string): Promise<CreateSessionResponse> {
    const body = await request<CreateSessionResponse>('/sessions', {
      method: 'POST',
      body: JSON.stringify({ hostName }),
    });
    return body;
  },

  async joinSession(sessionId: string, userName: string): Promise<JoinSessionResponse> {
    const body = await request<JoinSessionResponse>(`/sessions/${sessionId}/join`, {
      method: 'POST',
      body: JSON.stringify({ userName }),
    });
    return body;
  },

  async getSession(sessionId: string): Promise<InterviewSession | null> {
    try {
      const body = await request<InterviewSession>(`/sessions/${sessionId}`);
      return body;
    } catch (e) {
      return null;
    }
  },

  async updateCode(sessionId: string, userId: string, code: string, language: SupportedLanguage): Promise<void> {
    await request(`/sessions/${sessionId}/code`, {
      method: 'PATCH',
      body: JSON.stringify({ userId, code, language }),
    });
  },

  async executeCode(code: string, language: SupportedLanguage, sessionId?: string): Promise<ExecutionResult> {
    // Determine sessionId from current location if not provided
    let sid = sessionId;
    if (!sid) {
      const m = window.location.pathname.match(/\/interview\/(.+)/);
      if (m) sid = m[1];
    }

    if (sid) {
      const body = await request<ExecutionResult>(`/sessions/${sid}/execute`, {
        method: 'POST',
        body: JSON.stringify({ code, language }),
      });
      return body;
    }

    // Fallback: local mock (rare)
    return {
      success: true,
      output: 'Code executed locally (no session)',
      executionTime: 0,
    } as ExecutionResult;
  },

  subscribeToCodeChanges(sessionId: string, callback: (change: CodeChange) => void): () => void {
    const getState = async () => {
      const s = await this.getSession(sessionId);
      if (!s) return null;
      return { userId: '', content: s.code, timestamp: new Date(), language: s.language } as unknown as CodeChange;
    };
    // Poll and call callback with a CodeChange-like object
    return createPoller<CodeChange>(getState, callback);
  },

  subscribeToParticipants(sessionId: string, callback: (participants: User[]) => void): () => void {
    const getState = async () => {
      const s = await this.getSession(sessionId);
      return s ? s.participants : null;
    };
    return createPoller<User[]>(getState, callback);
  },

  async leaveSession(sessionId: string, userId: string): Promise<void> {
    await request(`/sessions/${sessionId}/leave`, {
      method: 'POST',
      body: JSON.stringify({ userId }),
    });
  },

  async endSession(sessionId: string): Promise<void> {
    await request(`/sessions/${sessionId}/end`, { method: 'POST' });
  },

  // Keep a synchronous default code map for UI responsiveness; backend is authoritative
  getDefaultCode(language: SupportedLanguage): string {
    const defaultCode: Record<SupportedLanguage, string> = {
      javascript: `// Welcome to the coding interview!\n// Write your solution below\n\nfunction solution(input) {\n  // Your code here\n  return input;\n}\n\n// Test your solution\nconsole.log(solution("Hello, World!"));\n`,
      typescript: `// Welcome to the coding interview!\n// Write your solution below\n\nfunction solution(input: string): string {\n  // Your code here\n  return input;\n}\n\n// Test your solution\nconsole.log(solution("Hello, World!"));\n`,
      python: `# Welcome to the coding interview!\n# Write your solution below\n\ndef solution(input):\n    # Your code here\n    return input\n\n# Test your solution\nprint(solution("Hello, World!"))\n`,
    };
    return defaultCode[language];
  },
};
