# Sprint 2 Week 3: User Approval System - Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Supervisors can approve/reject volunteers in their region; Officials can approve/reject supervisors.

**Architecture:** Real-time Firestore subscriptions for pending users, MUI components for approval UI, Cloud Function for audit logging and defense-in-depth validation.

**Tech Stack:** React, TypeScript, MUI, Firebase (Firestore, Cloud Functions v2)

---

## Task 1: Update User Type with Approval Fields

**Files:**
- Modify: `src/types/user.ts`

**Step 1: Add approval fields to User interface**

Add after `updatedAt`:
```typescript
/** UID of the user who approved this account */
approvedBy?: string;
/** When the account was approved */
approvedAt?: Date;
/** UID of the user who rejected this account */
rejectedBy?: string;
/** When the account was rejected */
rejectedAt?: Date;
/** Reason for rejection (required on rejection) */
rejectionReason?: string;
```

**Step 2: Run type check**

Run: `npm run typecheck` (or `tsc --noEmit`)
Expected: PASS

**Step 3: Commit**

```bash
git add src/types/user.ts
git commit -m "feat(types): add approval fields to User interface"
```

---

## Task 2: Create Users Service

**Files:**
- Create: `src/services/users.ts`
- Create: `src/services/__tests__/users.test.ts`
- Modify: `src/test/mocks/firebase.ts` (add mockUpdateDoc)

**Step 1: Add mockUpdateDoc to firebase mocks**

Add to `src/test/mocks/firebase.ts`:
```typescript
export const mockUpdateDoc = vi.fn();

// In vi.mock('firebase/firestore', ...)
  updateDoc: (...args: unknown[]) => mockUpdateDoc(...args),

// In resetFirebaseMocks()
  mockUpdateDoc.mockReset();
```

**Step 2: Write failing tests**

```typescript
// src/services/__tests__/users.test.ts
import { describe, it, expect, beforeEach, vi } from 'vitest';
import {
  mockOnSnapshot,
  mockUpdateDoc,
  resetFirebaseMocks,
} from '../../test/mocks/firebase';
import {
  subscribeToPendingVolunteers,
  subscribeToPendingSupervisors,
  approveUser,
  rejectUser,
} from '../users';

describe('Users Service', () => {
  beforeEach(() => {
    resetFirebaseMocks();
  });

  describe('subscribeToPendingVolunteers', () => {
    it('subscribes to pending volunteers in a region', () => {
      const mockUnsubscribe = vi.fn();
      mockOnSnapshot.mockReturnValue(mockUnsubscribe);
      const callback = vi.fn();
      
      const unsubscribe = subscribeToPendingVolunteers('north-gaza', callback);
      
      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('subscribeToPendingSupervisors', () => {
    it('subscribes to all pending supervisors', () => {
      const mockUnsubscribe = vi.fn();
      mockOnSnapshot.mockReturnValue(mockUnsubscribe);
      const callback = vi.fn();
      
      const unsubscribe = subscribeToPendingSupervisors(callback);
      
      expect(mockOnSnapshot).toHaveBeenCalled();
      expect(typeof unsubscribe).toBe('function');
    });
  });

  describe('approveUser', () => {
    it('updates user status to approved', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);
      
      await approveUser('user-123', 'approver-456');
      
      expect(mockUpdateDoc).toHaveBeenCalled();
      const updateCall = mockUpdateDoc.mock.calls[0];
      expect(updateCall[1].status).toBe('approved');
      expect(updateCall[1].approvedBy).toBe('approver-456');
    });
  });

  describe('rejectUser', () => {
    it('updates user status to rejected with reason', async () => {
      mockUpdateDoc.mockResolvedValue(undefined);
      
      await rejectUser('user-123', 'rejecter-456', 'Incomplete documentation');
      
      expect(mockUpdateDoc).toHaveBeenCalled();
      const updateCall = mockUpdateDoc.mock.calls[0];
      expect(updateCall[1].status).toBe('rejected');
      expect(updateCall[1].rejectedBy).toBe('rejecter-456');
      expect(updateCall[1].rejectionReason).toBe('Incomplete documentation');
    });

    it('throws if rejection reason is too short', async () => {
      await expect(
        rejectUser('user-123', 'rejecter-456', 'short')
      ).rejects.toThrow('Rejection reason must be at least 10 characters');
    });
  });
});
```

**Step 3: Implement users service**

```typescript
// src/services/users.ts
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
  type Unsubscribe,
} from 'firebase/firestore';
import { db } from './firebase';
import type { User } from '../types';

const USERS_COLLECTION = 'users';

/**
 * Subscribe to pending volunteers in a specific region.
 * Used by supervisors to see users awaiting approval.
 */
export function subscribeToPendingVolunteers(
  region: string,
  callback: (users: User[]) => void
): Unsubscribe {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('role', '==', 'volunteer'),
    where('status', '==', 'pending'),
    where('region', '==', region),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map((doc) => ({
      ...doc.data(),
      uid: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as User[];
    callback(users);
  });
}

/**
 * Subscribe to all pending supervisors.
 * Used by officials to see supervisors awaiting approval.
 */
export function subscribeToPendingSupervisors(
  callback: (users: User[]) => void
): Unsubscribe {
  const q = query(
    collection(db, USERS_COLLECTION),
    where('role', '==', 'supervisor'),
    where('status', '==', 'pending'),
    orderBy('createdAt', 'desc')
  );

  return onSnapshot(q, (snapshot) => {
    const users = snapshot.docs.map((doc) => ({
      ...doc.data(),
      uid: doc.id,
      createdAt: doc.data().createdAt?.toDate() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate() || new Date(),
    })) as User[];
    callback(users);
  });
}

/**
 * Approve a user (change status from pending to approved).
 */
export async function approveUser(
  userId: string,
  approverId: string
): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    status: 'approved',
    approvedBy: approverId,
    approvedAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
}

/**
 * Reject a user with a required reason.
 */
export async function rejectUser(
  userId: string,
  rejecterId: string,
  reason: string
): Promise<void> {
  if (reason.length < 10) {
    throw new Error('Rejection reason must be at least 10 characters');
  }

  const userRef = doc(db, USERS_COLLECTION, userId);
  await updateDoc(userRef, {
    status: 'rejected',
    rejectedBy: rejecterId,
    rejectedAt: serverTimestamp(),
    rejectionReason: reason,
    updatedAt: serverTimestamp(),
  });
}

/**
 * Subscribe to count of pending users (for badge display).
 */
export function subscribeToPendingCount(
  role: 'volunteer' | 'supervisor',
  region: string | undefined,
  callback: (count: number) => void
): Unsubscribe {
  const constraints = [
    where('role', '==', role),
    where('status', '==', 'pending'),
  ];
  if (region) {
    constraints.push(where('region', '==', region));
  }

  const q = query(collection(db, USERS_COLLECTION), ...constraints);

  return onSnapshot(q, (snapshot) => {
    callback(snapshot.size);
  });
}
```

**Step 4: Run tests**

Run: `npm test -- src/services/__tests__/users.test.ts`
Expected: PASS

**Step 5: Commit**

```bash
git add src/services/users.ts src/services/__tests__/users.test.ts src/test/mocks/firebase.ts
git commit -m "feat(services): add users service for approval workflow"
```

---

## Task 3: Create UserStatusChip Component

**Files:**
- Create: `src/components/users/UserStatusChip.tsx`
- Create: `src/components/users/__tests__/UserStatusChip.test.tsx`

**Step 1: Write failing test**

```typescript
// src/components/users/__tests__/UserStatusChip.test.tsx
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
```

**Step 2: Implement component**

```typescript
// src/components/users/UserStatusChip.tsx
import { Chip } from '@mui/material';
import type { UserStatus } from '../../types';

const STATUS_COLORS: Record<UserStatus, 'warning' | 'success' | 'error'> = {
  pending: 'warning',
  approved: 'success',
  rejected: 'error',
};

interface UserStatusChipProps {
  status: UserStatus;
}

export default function UserStatusChip({ status }: UserStatusChipProps) {
  return (
    <Chip
      label={status}
      color={STATUS_COLORS[status]}
      size="small"
    />
  );
}
```

**Step 3: Run test**

Run: `npm test -- src/components/users/__tests__/UserStatusChip.test.tsx`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/users/
git commit -m "feat(components): add UserStatusChip component"
```

---

## Task 4: Create ApprovalConfirmDialog Component

**Files:**
- Create: `src/components/users/ApprovalConfirmDialog.tsx`
- Create: `src/components/users/__tests__/ApprovalConfirmDialog.test.tsx`

**Step 1: Write failing test**

```typescript
// src/components/users/__tests__/ApprovalConfirmDialog.test.tsx
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
```

**Step 2: Implement component**

```typescript
// src/components/users/ApprovalConfirmDialog.tsx
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  CircularProgress,
} from '@mui/material';

interface ApprovalConfirmDialogProps {
  open: boolean;
  userName: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}

export default function ApprovalConfirmDialog({
  open,
  userName,
  onConfirm,
  onCancel,
  loading,
}: ApprovalConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel}>
      <DialogTitle>Approve {userName}?</DialogTitle>
      <DialogContent>
        <DialogContentText>
          This will grant {userName} access to the application. They will be
          able to submit reports and use all features for their role.
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          color="success"
          disabled={loading}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          Approve
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

**Step 3: Run test**

Run: `npm test -- src/components/users/__tests__/ApprovalConfirmDialog.test.tsx`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/users/
git commit -m "feat(components): add ApprovalConfirmDialog component"
```

---

## Task 5: Create RejectionDialog Component

**Files:**
- Create: `src/components/users/RejectionDialog.tsx`
- Create: `src/components/users/__tests__/RejectionDialog.test.tsx`

**Step 1: Write failing test**

```typescript
// src/components/users/__tests__/RejectionDialog.test.tsx
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
```

**Step 2: Implement component**

```typescript
// src/components/users/RejectionDialog.tsx
import { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material';

const MIN_REASON_LENGTH = 10;

interface RejectionDialogProps {
  open: boolean;
  userName: string;
  onConfirm: (reason: string) => void;
  onCancel: () => void;
  loading: boolean;
}

export default function RejectionDialog({
  open,
  userName,
  onConfirm,
  onCancel,
  loading,
}: RejectionDialogProps) {
  const [reason, setReason] = useState('');

  const isValid = reason.length >= MIN_REASON_LENGTH;

  const handleConfirm = () => {
    if (isValid) {
      onConfirm(reason);
      setReason('');
    }
  };

  const handleCancel = () => {
    setReason('');
    onCancel();
  };

  return (
    <Dialog open={open} onClose={handleCancel} maxWidth="sm" fullWidth>
      <DialogTitle>Reject {userName}?</DialogTitle>
      <DialogContent>
        <DialogContentText sx={{ mb: 2 }}>
          Please provide a reason for rejecting this user. They will see this
          reason and may re-register with updated information.
        </DialogContentText>
        <TextField
          autoFocus
          label="Rejection Reason"
          fullWidth
          multiline
          rows={3}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          helperText={`${reason.length}/${MIN_REASON_LENGTH} characters minimum`}
          error={reason.length > 0 && !isValid}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCancel} disabled={loading}>
          Cancel
        </Button>
        <Button
          onClick={handleConfirm}
          variant="contained"
          color="error"
          disabled={loading || !isValid}
          startIcon={loading ? <CircularProgress size={16} /> : null}
        >
          Reject
        </Button>
      </DialogActions>
    </Dialog>
  );
}
```

**Step 3: Run test**

Run: `npm test -- src/components/users/__tests__/RejectionDialog.test.tsx`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/users/
git commit -m "feat(components): add RejectionDialog component"
```

---

## Task 6: Create UserApprovalCard Component

**Files:**
- Create: `src/components/users/UserApprovalCard.tsx`
- Create: `src/components/users/__tests__/UserApprovalCard.test.tsx`

**Step 1: Write failing test**

```typescript
// src/components/users/__tests__/UserApprovalCard.test.tsx
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
```

**Step 2: Implement component**

```typescript
// src/components/users/UserApprovalCard.tsx
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  Button,
  Box,
  Chip,
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import type { User } from '../../types';
import { ROLES } from '../../constants';

interface UserApprovalCardProps {
  user: User;
  onApprove: (user: User) => void;
  onReject: (user: User) => void;
  loading: boolean;
}

export default function UserApprovalCard({
  user,
  onApprove,
  onReject,
  loading,
}: UserApprovalCardProps) {
  const formattedDate = user.createdAt instanceof Date
    ? user.createdAt.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
      })
    : 'Unknown';

  return (
    <Card sx={{ mb: 2 }}>
      <CardContent>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <Box>
            <Typography variant="h6" fontWeight={600}>
              {user.displayName}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.email}
            </Typography>
          </Box>
          <Chip label={ROLES[user.role]} size="small" color="primary" variant="outlined" />
        </Box>
        <Box sx={{ mt: 1, display: 'flex', gap: 1, flexWrap: 'wrap' }}>
          <Chip label={user.region} size="small" variant="outlined" />
          <Typography variant="caption" color="text.secondary" sx={{ alignSelf: 'center' }}>
            Registered {formattedDate}
          </Typography>
        </Box>
      </CardContent>
      <CardActions sx={{ justifyContent: 'flex-end', px: 2, pb: 2 }}>
        <Button
          size="small"
          color="error"
          startIcon={<CancelIcon />}
          onClick={() => onReject(user)}
          disabled={loading}
        >
          Reject
        </Button>
        <Button
          size="small"
          variant="contained"
          color="success"
          startIcon={<CheckCircleIcon />}
          onClick={() => onApprove(user)}
          disabled={loading}
        >
          Approve
        </Button>
      </CardActions>
    </Card>
  );
}
```

**Step 3: Run test**

Run: `npm test -- src/components/users/__tests__/UserApprovalCard.test.tsx`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/users/
git commit -m "feat(components): add UserApprovalCard component"
```

---

## Task 7: Create PendingUsersList Component and Barrel Export

**Files:**
- Create: `src/components/users/PendingUsersList.tsx`
- Create: `src/components/users/index.ts`

**Step 1: Implement PendingUsersList**

```typescript
// src/components/users/PendingUsersList.tsx
import { useState } from 'react';
import { Box, Typography, Alert, Snackbar, CircularProgress } from '@mui/material';
import UserApprovalCard from './UserApprovalCard';
import ApprovalConfirmDialog from './ApprovalConfirmDialog';
import RejectionDialog from './RejectionDialog';
import { approveUser, rejectUser } from '../../services/users';
import type { User } from '../../types';

interface PendingUsersListProps {
  users: User[];
  loading: boolean;
  approverId: string;
  emptyMessage?: string;
}

export default function PendingUsersList({
  users,
  loading,
  approverId,
  emptyMessage = 'No pending users to review.',
}: PendingUsersListProps) {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [dialogType, setDialogType] = useState<'approve' | 'reject' | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  const handleApproveClick = (user: User) => {
    setSelectedUser(user);
    setDialogType('approve');
  };

  const handleRejectClick = (user: User) => {
    setSelectedUser(user);
    setDialogType('reject');
  };

  const handleApproveConfirm = async () => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await approveUser(selectedUser.uid, approverId);
      setSnackbar({
        open: true,
        message: `${selectedUser.displayName} has been approved`,
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to approve user. Please try again.',
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
      setDialogType(null);
      setSelectedUser(null);
    }
  };

  const handleRejectConfirm = async (reason: string) => {
    if (!selectedUser) return;
    setActionLoading(true);
    try {
      await rejectUser(selectedUser.uid, approverId, reason);
      setSnackbar({
        open: true,
        message: `${selectedUser.displayName} has been rejected`,
        severity: 'success',
      });
    } catch (error) {
      setSnackbar({
        open: true,
        message: 'Failed to reject user. Please try again.',
        severity: 'error',
      });
    } finally {
      setActionLoading(false);
      setDialogType(null);
      setSelectedUser(null);
    }
  };

  const handleCancel = () => {
    setDialogType(null);
    setSelectedUser(null);
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (users.length === 0) {
    return <Alert severity="info">{emptyMessage}</Alert>;
  }

  return (
    <Box>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
        {users.length} pending {users.length === 1 ? 'user' : 'users'}
      </Typography>
      
      {users.map((user) => (
        <UserApprovalCard
          key={user.uid}
          user={user}
          onApprove={handleApproveClick}
          onReject={handleRejectClick}
          loading={actionLoading}
        />
      ))}

      <ApprovalConfirmDialog
        open={dialogType === 'approve'}
        userName={selectedUser?.displayName || ''}
        onConfirm={handleApproveConfirm}
        onCancel={handleCancel}
        loading={actionLoading}
      />

      <RejectionDialog
        open={dialogType === 'reject'}
        userName={selectedUser?.displayName || ''}
        onConfirm={handleRejectConfirm}
        onCancel={handleCancel}
        loading={actionLoading}
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar((s) => ({ ...s, open: false }))}
        message={snackbar.message}
      />
    </Box>
  );
}
```

**Step 2: Create barrel export**

```typescript
// src/components/users/index.ts
export { default as UserStatusChip } from './UserStatusChip';
export { default as ApprovalConfirmDialog } from './ApprovalConfirmDialog';
export { default as RejectionDialog } from './RejectionDialog';
export { default as UserApprovalCard } from './UserApprovalCard';
export { default as PendingUsersList } from './PendingUsersList';
```

**Step 3: Run all component tests**

Run: `npm test -- src/components/users/`
Expected: PASS

**Step 4: Commit**

```bash
git add src/components/users/
git commit -m "feat(components): add PendingUsersList and barrel exports"
```

---

## Task 8: Create Supervisor Pages

**Files:**
- Create: `src/pages/supervisor/SupervisorHomePage.tsx`
- Create: `src/pages/supervisor/PendingVolunteersPage.tsx`
- Create: `src/pages/supervisor/index.ts`

**Step 1: Implement SupervisorHomePage**

```typescript
// src/pages/supervisor/SupervisorHomePage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Badge,
} from '@mui/material';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToPendingCount } from '../../services/users';

export default function SupervisorHomePage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    if (!userProfile) return;
    
    const unsubscribe = subscribeToPendingCount(
      'volunteer',
      userProfile.region,
      setPendingCount
    );
    
    return unsubscribe;
  }, [userProfile]);

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Supervisor Dashboard
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardActionArea onClick={() => navigate('/supervisor/pending-users')}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Badge badgeContent={pendingCount} color="warning">
                  <PeopleIcon fontSize="large" color="action" />
                </Badge>
                <Box>
                  <Typography variant="h6">Pending Volunteers</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Review and approve volunteer registrations
                  </Typography>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card>
            <CardActionArea onClick={() => navigate('/supervisor/reports')}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <AssignmentIcon fontSize="large" color="action" />
                <Box>
                  <Typography variant="h6">Pending Reports</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Verify submitted case reports
                  </Typography>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
```

**Step 2: Implement PendingVolunteersPage**

```typescript
// src/pages/supervisor/PendingVolunteersPage.tsx
import { useEffect, useState } from 'react';
import { Typography, Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToPendingVolunteers } from '../../services/users';
import { PendingUsersList } from '../../components/users';
import type { User } from '../../types';

export default function PendingVolunteersPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userProfile) return;

    const unsubscribe = subscribeToPendingVolunteers(userProfile.region, (data) => {
      setUsers(data);
      setLoading(false);
    });

    return unsubscribe;
  }, [userProfile]);

  if (!userProfile) return null;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/supervisor')}
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>
      
      <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
        Pending Volunteers
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        Region: {userProfile.region}
      </Typography>

      <PendingUsersList
        users={users}
        loading={loading}
        approverId={userProfile.uid}
        emptyMessage="No pending volunteers in your region."
      />
    </Box>
  );
}
```

**Step 3: Create barrel export**

```typescript
// src/pages/supervisor/index.ts
export { default as SupervisorHomePage } from './SupervisorHomePage';
export { default as PendingVolunteersPage } from './PendingVolunteersPage';
```

**Step 4: Commit**

```bash
git add src/pages/supervisor/
git commit -m "feat(pages): add supervisor home and pending volunteers pages"
```

---

## Task 9: Create Official Pages

**Files:**
- Create: `src/pages/official/OfficialHomePage.tsx`
- Create: `src/pages/official/PendingSupervisorsPage.tsx`
- Create: `src/pages/official/index.ts`

**Step 1: Implement OfficialHomePage**

```typescript
// src/pages/official/OfficialHomePage.tsx
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Typography,
  Box,
  Card,
  CardContent,
  CardActionArea,
  Grid,
  Badge,
} from '@mui/material';
import SupervisorAccountIcon from '@mui/icons-material/SupervisorAccount';
import DashboardIcon from '@mui/icons-material/Dashboard';
import { subscribeToPendingCount } from '../../services/users';

export default function OfficialHomePage() {
  const navigate = useNavigate();
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    const unsubscribe = subscribeToPendingCount(
      'supervisor',
      undefined, // Officials see all regions
      setPendingCount
    );
    
    return unsubscribe;
  }, []);

  return (
    <Box>
      <Typography variant="h5" fontWeight={600} sx={{ mb: 3 }}>
        Official Dashboard
      </Typography>
      
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Card>
            <CardActionArea onClick={() => navigate('/official/pending-users')}>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Badge badgeContent={pendingCount} color="warning">
                  <SupervisorAccountIcon fontSize="large" color="action" />
                </Badge>
                <Box>
                  <Typography variant="h6">Pending Supervisors</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Review and approve supervisor registrations
                  </Typography>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <Card>
            <CardActionArea disabled>
              <CardContent sx={{ display: 'flex', alignItems: 'center', gap: 2, opacity: 0.5 }}>
                <DashboardIcon fontSize="large" color="action" />
                <Box>
                  <Typography variant="h6">Analytics Dashboard</Typography>
                  <Typography variant="body2" color="text.secondary">
                    Coming in Sprint 3
                  </Typography>
                </Box>
              </CardContent>
            </CardActionArea>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
}
```

**Step 2: Implement PendingSupervisorsPage**

```typescript
// src/pages/official/PendingSupervisorsPage.tsx
import { useEffect, useState } from 'react';
import { Typography, Box, Button } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import { subscribeToPendingSupervisors } from '../../services/users';
import { PendingUsersList } from '../../components/users';
import type { User } from '../../types';

export default function PendingSupervisorsPage() {
  const { userProfile } = useAuth();
  const navigate = useNavigate();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = subscribeToPendingSupervisors((data) => {
      setUsers(data);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (!userProfile) return null;

  return (
    <Box>
      <Button
        startIcon={<ArrowBackIcon />}
        onClick={() => navigate('/official')}
        sx={{ mb: 2 }}
      >
        Back to Dashboard
      </Button>
      
      <Typography variant="h5" fontWeight={600} sx={{ mb: 1 }}>
        Pending Supervisors
      </Typography>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
        All regions
      </Typography>

      <PendingUsersList
        users={users}
        loading={loading}
        approverId={userProfile.uid}
        emptyMessage="No pending supervisors to review."
      />
    </Box>
  );
}
```

**Step 3: Create barrel export**

```typescript
// src/pages/official/index.ts
export { default as OfficialHomePage } from './OfficialHomePage';
export { default as PendingSupervisorsPage } from './PendingSupervisorsPage';
```

**Step 4: Commit**

```bash
git add src/pages/official/
git commit -m "feat(pages): add official home and pending supervisors pages"
```

---

## Task 10: Update Router with New Routes

**Files:**
- Modify: `src/router/AppRouter.tsx`

Update imports and replace placeholder routes with actual pages.

**Step 1: Commit**

```bash
git add src/router/AppRouter.tsx
git commit -m "feat(router): add supervisor and official routes"
```

---

## Task 11: Update AppLayout Navigation

**Files:**
- Modify: `src/layouts/AppLayout.tsx`

Add navigation items for supervisor and official roles.

**Step 1: Commit**

```bash
git add src/layouts/AppLayout.tsx
git commit -m "feat(layout): add supervisor and official navigation items"
```

---

## Task 12: Add Firestore Indexes

**Files:**
- Modify: `firestore.indexes.json`

Add indexes for pending user queries.

**Step 1: Commit**

```bash
git add firestore.indexes.json
git commit -m "feat(firestore): add indexes for pending user queries"
```

---

## Task 13: Implement onUserApproval Cloud Function

**Files:**
- Create: `functions/src/onUserApproval.ts`
- Modify: `functions/src/index.ts`

Implement cloud function with audit logging.

**Step 1: Commit**

```bash
git add functions/
git commit -m "feat(functions): implement onUserApproval cloud function with audit logging"
```

---

## Task 14: Add auditLogs Security Rules

**Files:**
- Modify: `firestore.rules`

Add security rules for audit logs collection.

**Step 1: Commit**

```bash
git add firestore.rules
git commit -m "feat(security): add auditLogs collection rules"
```

---

## Task 15: Final Verification

Run all tests, type check, and lint. Manual testing checklist.

**Step 1: Commit**

```bash
git add -A
git commit -m "feat(sprint2): complete user approval workflow - Week 3"
```
