import React from 'react';
import { Users, Crown, Circle } from 'lucide-react';
import type { User } from '@/types/interview';

interface ParticipantsPanelProps {
  participants: User[];
  currentUserId: string;
}

export const ParticipantsPanel: React.FC<ParticipantsPanelProps> = ({
  participants,
  currentUserId,
}) => {
  return (
    <div className="flex flex-col rounded-lg border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <Users className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm font-medium text-foreground">
          Participants ({participants.length})
        </span>
      </div>
      
      <div className="flex-1 overflow-auto p-2">
        <ul className="space-y-1">
          {participants.map((participant) => (
            <li
              key={participant.id}
              className="flex items-center gap-2 rounded-md px-3 py-2 hover:bg-secondary"
            >
              <Circle className="h-2 w-2 fill-success text-success" />
              <span className="flex-1 text-sm text-foreground">
                {participant.name}
                {participant.id === currentUserId && (
                  <span className="ml-1 text-muted-foreground">(you)</span>
                )}
              </span>
              {participant.isHost && (
                <Crown className="h-4 w-4 text-warning" aria-label="Host" />
              )}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
