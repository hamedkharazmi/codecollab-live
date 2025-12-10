export type SupportedLanguage = 'javascript' | 'typescript' | 'python';

export interface User {
  id: string;
  name: string;
  isHost: boolean;
  joinedAt: Date;
}

export interface CodeChange {
  userId: string;
  content: string;
  timestamp: Date;
  language: SupportedLanguage;
}

export interface InterviewSession {
  id: string;
  code: string;
  language: SupportedLanguage;
  participants: User[];
  createdAt: Date;
  isActive: boolean;
}

export interface ExecutionResult {
  success: boolean;
  output: string;
  error?: string;
  executionTime: number;
}

export interface CreateSessionResponse {
  sessionId: string;
  shareLink: string;
}

export interface JoinSessionResponse {
  session: InterviewSession;
  userId: string;
}
