import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import ApprovalConfirmDialog from '../ApprovalConfirmDialog';

describe('ApprovalConfirmDialog', () => {
  it('renders user name in dialog', () => {
    render(
      <ApprovalConfirmDialog
        open={true}
        userName="John Doe"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        loading={false}
      />
    );
    expect(screen.getByText(/approve john doe/i)).toBeInTheDocument();
  });

  it('calls onConfirm when approve button clicked', () => {
    const onConfirm = vi.fn();
    render(
      <ApprovalConfirmDialog
        open={true}
        userName="John Doe"
        onConfirm={onConfirm}
        onCancel={vi.fn()}
        loading={false}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /approve/i }));
    expect(onConfirm).toHaveBeenCalled();
  });

  it('calls onCancel when cancel button clicked', () => {
    const onCancel = vi.fn();
    render(
      <ApprovalConfirmDialog
        open={true}
        userName="John Doe"
        onConfirm={vi.fn()}
        onCancel={onCancel}
        loading={false}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /cancel/i }));
    expect(onCancel).toHaveBeenCalled();
  });

  it('disables buttons when loading', () => {
    render(
      <ApprovalConfirmDialog
        open={true}
        userName="John Doe"
        onConfirm={vi.fn()}
        onCancel={vi.fn()}
        loading={true}
      />
    );
    expect(screen.getByRole('button', { name: /approve/i })).toBeDisabled();
  });
});
