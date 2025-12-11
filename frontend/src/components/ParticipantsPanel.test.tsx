import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ParticipantsPanel } from '@/components/ParticipantsPanel';
import type { User } from '@/types/interview';

const mockParticipants: User[] = [
  { id: '1', name: 'Host User', isHost: true, joinedAt: new Date() },
  { id: '2', name: 'Candidate', isHost: false, joinedAt: new Date() },
];

describe('ParticipantsPanel', () => {
  it('should render participant count', () => {
    render(<ParticipantsPanel participants={mockParticipants} currentUserId="1" />);
    expect(screen.getByText('Participants (2)')).toBeInTheDocument();
  });

  it('should render all participant names', () => {
    render(<ParticipantsPanel participants={mockParticipants} currentUserId="1" />);
    expect(screen.getByText('Host User')).toBeInTheDocument();
    expect(screen.getByText('Candidate')).toBeInTheDocument();
  });

  it('should mark current user with (you)', () => {
    render(<ParticipantsPanel participants={mockParticipants} currentUserId="1" />);
    expect(screen.getByText('(you)')).toBeInTheDocument();
  });

  it('should show host indicator for host users', () => {
    render(<ParticipantsPanel participants={mockParticipants} currentUserId="2" />);
    const hostIndicator = screen.getByLabelText('Host');
    expect(hostIndicator).toBeInTheDocument();
  });
});
