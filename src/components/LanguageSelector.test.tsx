import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { LanguageSelector } from '@/components/LanguageSelector';

describe('LanguageSelector', () => {
  it('should render with the selected language', () => {
    const onChange = vi.fn();
    render(<LanguageSelector value="javascript" onChange={onChange} />);
    
    expect(screen.getByRole('combobox')).toBeInTheDocument();
  });

  it('should call onChange when a language is selected', async () => {
    const onChange = vi.fn();
    render(<LanguageSelector value="javascript" onChange={onChange} />);
    
    const trigger = screen.getByRole('combobox');
    await userEvent.click(trigger);
    
    // Wait for the dropdown to appear and click Python
    const pythonOption = await screen.findByText('Python');
    await userEvent.click(pythonOption);
    
    expect(onChange).toHaveBeenCalledWith('python');
  });
});
