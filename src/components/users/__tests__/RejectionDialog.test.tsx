import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import RejectionDialog from '../RejectionDialog';

describe('RejectionDialog', () => {
  it('renders user name in dialog', () => {
    render(
      <RejectionDialog
        open={true}
        userName="John Doe"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        loading={false}
      />
    );
    expect(screen.getByText(/reject john doe/i)).toBeInTheDocument();
  });

  it('requires minimum 10 character reason', () => {
    render(
      <RejectionDialog
        open={true}
        userName="John Doe"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        loading={false}
      />
    );
    
    const input = screen.getByLabelText(/reason/i);
    fireEvent.change(input, { target: { value: 'short' } });
    
    // Button should be disabled with short reason
    expect(screen.getByRole('button', { name: /reject/i })).toBeDisabled();
  });

  it('enables reject button with valid reason', () => {
    render(
      <RejectionDialog
        open={true}
        userName="John Doe"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        loading={false}
      />
    );
    
    const input = screen.getByLabelText(/reason/i);
    fireEvent.change(input, { target: { value: 'This is a valid rejection reason' } });
    
    expect(screen.getByRole('button', { name: /reject/i })).not.toBeDisabled();
  });

  it('calls onConfirm with reason when reject button clicked', () => {
    const onConfirm = vi.fn();
    render(
      <RejectionDialog
        open={true}
        userName="John Doe"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
        loading={false}
      />
    );
    
    const input = screen.getByLabelText(/reason/i);
    fireEvent.change(input, { target: { value: 'Invalid documentation provided' } });
    fireEvent.click(screen.getByRole('button', { name: /reject/i }));
    
    expect(onConfirm).toHaveBeenCalledWith('Invalid documentation provided');
  });
});
