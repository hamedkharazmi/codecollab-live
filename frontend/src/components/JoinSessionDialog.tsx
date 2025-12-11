import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from '@/hooks/use-toast';

interface JoinSessionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sessionId: string;
  onJoin: (name: string) => Promise<void>;
}

export const JoinSessionDialog: React.FC<JoinSessionDialogProps> = ({
  open,
  onOpenChange,
  sessionId,
  onJoin,
}) => {
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);

  const handleJoin = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name.trim()) {
      toast({
        title: 'Name required',
        description: 'Please enter your name to join the session.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    try {
      await onJoin(name.trim());
    } catch (error) {
      toast({
        title: 'Failed to join session',
        description: error instanceof Error ? error.message : 'Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="border-border bg-card sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-foreground">Join Interview Session</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Enter your name to join session <code className="rounded bg-secondary px-1.5 py-0.5 font-mono text-primary">{sessionId}</code>
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleJoin} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="join-name" className="text-foreground">Your Name</Label>
            <Input
              id="join-name"
              placeholder="Enter your name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="border-border bg-secondary text-foreground placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
          
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="hero" disabled={loading}>
              {loading ? 'Joining...' : 'Join Session'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};
