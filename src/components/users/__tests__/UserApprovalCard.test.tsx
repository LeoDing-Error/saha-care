import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import UserApprovalCard from '../UserApprovalCard';
import type { User } from '../../../types';

const mockUser: User = {
  uid: 'user-123',
  email: 'john@example.com',
  displayName: 'John Doe',
  role: 'volunteer',
  status: 'pending',
  region: 'north-gaza',
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
};

describe('UserApprovalCard', () => {
  it('renders user information', () => {
    render(
      <UserApprovalCard
        user={mockUser}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        loading={false}
      />
    );
    expect(screen.getByText('John Doe')).toBeInTheDocument();
    expect(screen.getByText('john@example.com')).toBeInTheDocument();
    expect(screen.getByText('north-gaza')).toBeInTheDocument();
  });

  it('calls onApprove when approve button clicked', () => {
    const onApprove = vi.fn();
    render(
      <UserApprovalCard
        user={mockUser}
        onApprove={onApprove}
        onReject={vi.fn()}
        loading={false}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /approve/i }));
    expect(onApprove).toHaveBeenCalledWith(mockUser);
  });

  it('calls onReject when reject button clicked', () => {
    const onReject = vi.fn();
    render(
      <UserApprovalCard
        user={mockUser}
        onApprove={vi.fn()}
        onReject={onReject}
        loading={false}
      />
    );
    fireEvent.click(screen.getByRole('button', { name: /reject/i }));
    expect(onReject).toHaveBeenCalledWith(mockUser);
  });

  it('disables buttons when loading', () => {
    render(
      <UserApprovalCard
        user={mockUser}
        onApprove={vi.fn()}
        onReject={vi.fn()}
        loading={true}
      />
    );
    expect(screen.getByRole('button', { name: /approve/i })).toBeDisabled();
    expect(screen.getByRole('button', { name: /reject/i })).toBeDisabled();
  });
});
