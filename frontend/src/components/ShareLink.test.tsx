import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ShareLink } from '@/components/ShareLink';

// Mock the toast hook
vi.mock('@/hooks/use-toast', () => ({
  toast: vi.fn(),
}));

describe('ShareLink', () => {
  const mockLink = 'https://example.com/interview/abc123';

  beforeEach(() => {
    // Mock clipboard API
    Object.assign(navigator, {
      clipboard: {
        writeText: vi.fn().mockResolvedValue(undefined),
      },
    });
  });

  it('should render the share link', () => {
    render(<ShareLink link={mockLink} />);
    expect(screen.getByDisplayValue(mockLink)).toBeInTheDocument();
  });

  it('should copy link to clipboard when button is clicked', async () => {
    render(<ShareLink link={mockLink} />);
    
    const copyButton = screen.getByRole('button');
    await userEvent.click(copyButton);
    
    expect(navigator.clipboard.writeText).toHaveBeenCalledWith(mockLink);
  });
});
