import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserStatusChip from '../UserStatusChip';

describe('UserStatusChip', () => {
  it('renders pending status with warning color', () => {
    render(<UserStatusChip status="pending" />);
    const chip = screen.getByText('pending');
    expect(chip).toBeInTheDocument();
  });

  it('renders approved status with success color', () => {
    render(<UserStatusChip status="approved" />);
    const chip = screen.getByText('approved');
    expect(chip).toBeInTheDocument();
  });

  it('renders rejected status with error color', () => {
    render(<UserStatusChip status="rejected" />);
    const chip = screen.getByText('rejected');
    expect(chip).toBeInTheDocument();
  });
});
