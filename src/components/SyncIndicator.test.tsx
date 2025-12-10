import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SyncIndicator } from '@/components/SyncIndicator';

describe('SyncIndicator', () => {
  it('should render connected status', () => {
    render(<SyncIndicator status="connected" />);
    expect(screen.getByText('Connected')).toBeInTheDocument();
  });

  it('should render syncing status', () => {
    render(<SyncIndicator status="syncing" />);
    expect(screen.getByText('Syncing...')).toBeInTheDocument();
  });

  it('should render disconnected status', () => {
    render(<SyncIndicator status="disconnected" />);
    expect(screen.getByText('Disconnected')).toBeInTheDocument();
  });
});
