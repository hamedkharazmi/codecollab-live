import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useLocation, useNavigate } from 'react-router-dom';
import { Play, ArrowLeft, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { CodeEditor } from '@/components/CodeEditor';
import { LanguageSelector } from '@/components/LanguageSelector';
import { OutputPanel } from '@/components/OutputPanel';
import { ParticipantsPanel } from '@/components/ParticipantsPanel';
import { ShareLink } from '@/components/ShareLink';
import { SyncIndicator } from '@/components/SyncIndicator';
import { JoinSessionDialog } from '@/components/JoinSessionDialog';
import { api } from '@/services/api';
import { toast } from '@/hooks/use-toast';
import type { SupportedLanguage, ExecutionResult, User, InterviewSession } from '@/types/interview';

const Interview: React.FC = () => {
  const { sessionId } = useParams<{ sessionId: string }>();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [session, setSession] = useState<InterviewSession | null>(null);
  const [code, setCode] = useState('');
  const [language, setLanguage] = useState<SupportedLanguage>('javascript');
  const [participants, setParticipants] = useState<User[]>([]);
  const [userId, setUserId] = useState<string>('');
  const [isHost, setIsHost] = useState(false);
  const [result, setResult] = useState<ExecutionResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [syncStatus, setSyncStatus] = useState<'connected' | 'syncing' | 'disconnected'>('connected');
  const [showJoinDialog, setShowJoinDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if we have state from navigation (host creating session)
  const locationState = location.state as { userName?: string; isHost?: boolean } | null;

  // Initialize session
  useEffect(() => {
    const initSession = async () => {
      if (!sessionId) {
        navigate('/');
        return;
      }

      try {
        const existingSession = await api.getSession(sessionId);
        
        if (!existingSession) {
          toast({
            title: 'Session not found',
            description: 'This interview session does not exist.',
            variant: 'destructive',
          });
          navigate('/');
          return;
        }

        if (locationState?.isHost) {
          // Host is entering their own session
          const hostUser = existingSession.participants.find(p => p.isHost);
          if (hostUser) {
            setUserId(hostUser.id);
            setIsHost(true);
          }
          setSession(existingSession);
          setCode(existingSession.code);
          setLanguage(existingSession.language);
          setParticipants(existingSession.participants);
          setLoading(false);
        } else {
          // Someone joining via link
          setSession(existingSession);
          setShowJoinDialog(true);
          setLoading(false);
        }
      } catch (error) {
        toast({
          title: 'Error loading session',
          description: 'Failed to load the interview session.',
          variant: 'destructive',
        });
        navigate('/');
      }
    };

    initSession();
  }, [sessionId, navigate, locationState]);

  // Subscribe to real-time updates
  useEffect(() => {
    if (!sessionId || !userId) return;

    const unsubscribeCode = api.subscribeToCodeChanges(sessionId, (change) => {
      if (change.userId !== userId) {
        setCode(change.content);
        setLanguage(change.language);
        setSyncStatus('syncing');
        setTimeout(() => setSyncStatus('connected'), 500);
      }
    });

    const unsubscribeParticipants = api.subscribeToParticipants(sessionId, (newParticipants) => {
      setParticipants(newParticipants);
    });

    return () => {
      unsubscribeCode();
      unsubscribeParticipants();
    };
  }, [sessionId, userId]);

  const handleJoin = useCallback(async (name: string) => {
    if (!sessionId) return;
    
    const { session: joinedSession, userId: newUserId } = await api.joinSession(sessionId, name);
    setUserId(newUserId);
    setCode(joinedSession.code);
    setLanguage(joinedSession.language);
    setParticipants(joinedSession.participants);
    setShowJoinDialog(false);
    
    toast({
      title: 'Joined session!',
      description: 'You can now collaborate on code.',
    });
  }, [sessionId]);

  const handleCodeChange = useCallback(async (newCode: string) => {
    setCode(newCode);
    
    if (sessionId && userId) {
      setSyncStatus('syncing');
      await api.updateCode(sessionId, userId, newCode, language);
      setSyncStatus('connected');
    }
  }, [sessionId, userId, language]);

  const handleLanguageChange = useCallback(async (newLanguage: SupportedLanguage) => {
    setLanguage(newLanguage);
    const newCode = api.getDefaultCode(newLanguage);
    setCode(newCode);
    
    if (sessionId && userId) {
      setSyncStatus('syncing');
      await api.updateCode(sessionId, userId, newCode, newLanguage);
      setSyncStatus('connected');
    }
  }, [sessionId, userId]);

  const handleRunCode = useCallback(async () => {
    setIsRunning(true);
    setResult(null);
    
    try {
      const executionResult = await api.executeCode(code, language);
      setResult(executionResult);
    } catch (error) {
      setResult({
        success: false,
        output: '',
        error: 'Failed to execute code',
        executionTime: 0,
      });
    } finally {
      setIsRunning(false);
    }
  }, [code, language]);

  const handleLeave = useCallback(async () => {
    if (sessionId && userId) {
      await api.leaveSession(sessionId, userId);
    }
    navigate('/');
  }, [sessionId, userId, navigate]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <span className="text-muted-foreground">Loading session...</span>
        </div>
      </div>
    );
  }

  if (showJoinDialog) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <JoinSessionDialog
          open={showJoinDialog}
          onOpenChange={(open) => {
            if (!open) navigate('/');
          }}
          sessionId={sessionId || ''}
          onJoin={handleJoin}
        />
      </div>
    );
  }

  const shareLink = `${window.location.origin}/interview/${sessionId}`;

  return (
    <div className="flex h-screen flex-col bg-background">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-border px-4 py-3">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={handleLeave}>
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div className="flex items-center gap-2">
            <span className="font-mono text-sm text-muted-foreground">Session:</span>
            <code className="rounded bg-secondary px-2 py-1 font-mono text-sm text-primary">
              {sessionId}
            </code>
          </div>
          <SyncIndicator status={syncStatus} />
        </div>

        <div className="flex items-center gap-4">
          <LanguageSelector value={language} onChange={handleLanguageChange} />
          <Button onClick={handleRunCode} disabled={isRunning}>
            <Play className="mr-2 h-4 w-4" />
            {isRunning ? 'Running...' : 'Run Code'}
          </Button>
          <Button variant="outline" onClick={handleLeave}>
            <LogOut className="mr-2 h-4 w-4" />
            Leave
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar */}
        <aside className="flex w-64 flex-col gap-4 border-r border-border p-4">
          {isHost && (
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-muted-foreground">Share Link</h3>
              <ShareLink link={shareLink} />
            </div>
          )}
          <ParticipantsPanel participants={participants} currentUserId={userId} />
        </aside>

        {/* Editor Area */}
        <main className="flex flex-1 flex-col overflow-hidden">
          <div className="flex-1 overflow-hidden p-4">
            <CodeEditor
              code={code}
              language={language}
              onChange={handleCodeChange}
            />
          </div>
          
          {/* Output Panel */}
          <div className="h-48 border-t border-border p-4">
            <OutputPanel result={result} isRunning={isRunning} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Interview;
