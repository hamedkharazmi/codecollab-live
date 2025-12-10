import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Button } from '@/components/ui/button';

describe('Button', () => {
  it('should render with default variant', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole('button')).toHaveTextContent('Click me');
  });

  it('should render with hero variant', () => {
    render(<Button variant="hero">Hero Button</Button>);
    const button = screen.getByRole('button');
    expect(button).toHaveTextContent('Hero Button');
    expect(button.className).toContain('bg-gradient-primary');
  });

  it('should render with different sizes', () => {
    const { rerender } = render(<Button size="sm">Small</Button>);
    expect(screen.getByRole('button').className).toContain('h-9');
    
    rerender(<Button size="lg">Large</Button>);
    expect(screen.getByRole('button').className).toContain('h-12');
    
    rerender(<Button size="xl">Extra Large</Button>);
    expect(screen.getByRole('button').className).toContain('h-14');
  });

  it('should call onClick when clicked', async () => {
    const onClick = vi.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    
    await userEvent.click(screen.getByRole('button'));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it('should be disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled</Button>);
    expect(screen.getByRole('button')).toBeDisabled();
  });
});
