# Sprint 2 — Location & Verification

**Dates:** Mar 10 – Mar 23, 2026
**Goal:** Supervisors can approve users and verify reports.
**Milestone:** M2 (Mar 23) — Supervisor Flow (no messaging)

**Prerequisite:** M1 complete (auth + offline reporting working)

---

## Week 3: Location & User Approval (Mar 10–14)

### Tasks

- [x] **T3.1** Add GPS capture to report submission
  - Use Geolocation API on submit
  - Store lat/lng in report document
  - Handle permission denied gracefully

- [x] **T3.2** Build manual location fallback
  - Text input for location name/description
  - Show when GPS fails or user declines
  - Store location.name alongside or instead of coords

- [x] **T3.3** Display location on report detail
  - Show coordinates or location name
  - Optional: small static map preview (can defer to Sprint 3)

### User Approval UI Implementation

#### Design Overview

The user approval system allows supervisors to approve/reject volunteer registrations in their region, and officials to approve/reject supervisor registrations.

| Requirement | Decision |
|-------------|----------|
| Scope | User approval only (not report verification) |
| Rejection reason | Required (min 10 characters) |
| Rejected user experience | Show reason, allow re-registration |
| Region scoping | Strict - supervisors see only their own region |
| Offline support | No - approval actions require connectivity |
| Validation | Firestore security rules + Cloud Function |

#### New Routes

| Route | Page | Access |
|-------|------|--------|
| `/supervisor` | SupervisorHomePage | supervisor (approved) |
| `/supervisor/pending-users` | PendingVolunteersPage | supervisor (approved) |
| `/official` | OfficialHomePage | official (approved) |
| `/official/pending-users` | PendingSupervisorsPage | official (approved) |

#### Components Architecture

**Shared Components (`src/components/users/`):**

- **`UserApprovalCard`** - Displays pending user info with approve/reject buttons
- **`ApprovalConfirmDialog`** - Confirmation modal for approve action
- **`RejectionDialog`** - Modal with required rejection reason (min 10 chars)
- **`UserStatusChip`** - Colored status badge (pending=yellow, approved=green, rejected=red)
- **`PendingUsersList`** - Generic list using UserApprovalCard

#### User Type Updates

Add approval fields to `src/types/user.ts`:

```typescript
export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: UserRole;
  status: UserStatus;
  supervisorId?: string;
  region: string;
  createdAt: Date;
  updatedAt: Date;
  // Approval fields
  approvedBy?: string;
  approvedAt?: Date;
  rejectedBy?: string;
  rejectedAt?: Date;
  rejectionReason?: string;
}
```

#### Service Layer (`src/services/users.ts`)

```typescript
// Subscribe to pending users (real-time)
subscribeToPendingVolunteers(region: string, callback): Unsubscribe
subscribeToPendingSupervisors(callback): Unsubscribe

// Approval actions
approveUser(userId: string, approverId: string): Promise<void>
rejectUser(userId: string, approverId: string, reason: string): Promise<void>

// For badge counts
subscribeToPendingCount(role: 'volunteer' | 'supervisor', region?: string, callback): Unsubscribe
```

#### Data Flow

```
+------------------+     +-------------------+     +------------------+
|  PendingUsers    |---->|  users service    |---->|   Firestore      |
|     Page         |     |  (subscription)   |     |   users/{uid}    |
+------------------+     +-------------------+     +------------------+
        |                                                 |
        | approve/reject                                  |
        v                                                 v
+------------------+     +-------------------+     +------------------+
| Approval Dialog  |---->|  users service    |---->| Security Rules   |
|                  |     |  (mutation)       |     |   validate       |
+------------------+     +-------------------+     +------------------+
                                                          |
                                                          v
                                                  +------------------+
                                                  | Cloud Function   |
                                                  | (audit+validate) |
                                                  +------------------+
```

### User Approval Tasks

- [x] **T3.4** Update User type with approval fields
  - Modify: `src/types/user.ts`
  - Add: approvedBy, approvedAt, rejectedBy, rejectedAt, rejectionReason

- [x] **T3.5** Create users service
  - Create: `src/services/users.ts`
  - Functions: subscribeToPendingVolunteers, subscribeToPendingSupervisors, approveUser, rejectUser, subscribeToPendingCount

- [x] **T3.6** Create user approval components
  - Create: `src/components/users/UserStatusChip.tsx`
  - Create: `src/components/users/ApprovalConfirmDialog.tsx`
  - Create: `src/components/users/RejectionDialog.tsx`
  - Create: `src/components/users/UserApprovalCard.tsx`
  - Create: `src/components/users/PendingUsersList.tsx`
  - Create: `src/components/users/index.ts`

- [x] **T3.7** Build supervisor pages
  - Create: `src/pages/supervisor/SupervisorHomePage.tsx`
  - Create: `src/pages/supervisor/PendingVolunteersPage.tsx`
  - Create: `src/pages/supervisor/index.ts`

- [x] **T3.8** Build official pages
  - Create: `src/pages/official/OfficialHomePage.tsx`
  - Create: `src/pages/official/PendingSupervisorsPage.tsx`
  - Create: `src/pages/official/index.ts`

- [x] **T3.9** Update router with new routes
  - Modify: `src/router/AppRouter.tsx`
  - Add supervisor routes with RoleGuard
  - Add official routes with RoleGuard

- [x] **T3.10** Update AppLayout navigation
  - Modify: `src/layouts/AppLayout.tsx`
  - Add supervisor nav items (Home, Pending Volunteers)
  - Add official nav items (Home, Pending Supervisors)

- [x] **T3.11** Update security rules for approval workflow
  - Supervisors can update volunteer status in their region
  - Officials can update supervisor status
  - Users cannot approve themselves

### Cloud Function: onUserApproval

**Trigger:** Firestore `onUpdate` on `users/{userId}`

**Responsibilities:**
1. Validate approval hierarchy (defense in depth)
2. Audit logging to `auditLogs` collection
3. Future: Notifications (not in scope now)

**Audit Log Schema:**

```typescript
interface AuditLog {
  action: 'user_approved' | 'user_rejected';
  targetUserId: string;
  targetUserRole: 'volunteer' | 'supervisor';
  performedBy: string;
  performedByRole: 'supervisor' | 'official';
  region: string;
  previousStatus: 'pending';
  newStatus: 'approved' | 'rejected';
  rejectionReason?: string;
  timestamp: Timestamp;
}
```

- [x] **T3.12** Implement onUserApproval Cloud Function
  - Create/Modify: `functions/src/onUserApproval.ts`
  - Update: `functions/src/index.ts` to export function

### Firestore Indexes

Add composite indexes for pending user queries to `firestore.indexes.json`:

```json
{
  "indexes": [
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "role", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "region", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    },
    {
      "collectionGroup": "users",
      "queryScope": "COLLECTION",
      "fields": [
        { "fieldPath": "role", "order": "ASCENDING" },
        { "fieldPath": "status", "order": "ASCENDING" },
        { "fieldPath": "createdAt", "order": "DESCENDING" }
      ]
    }
  ]
}
```

- [x] **T3.13** Add Firestore indexes for pending user queries
  - Modify: `firestore.indexes.json`

### Tests (Week 3)

- [x] **Test W3.1** Report submission captures GPS coordinates
- [x] **Test W3.2** Manual location input works when GPS unavailable
- [x] **Test W3.3** Location displays on report detail view
- [x] **Test W3.4** Supervisor sees only pending volunteers in their region
- [x] **Test W3.5** Supervisor can approve volunteer → status changes to 'approved'
- [x] **Test W3.6** Supervisor can reject volunteer → status changes to 'rejected'
- [x] **Test W3.7** Approved volunteer can now access full app
- [x] **Test W3.8** Official sees pending supervisors
- [x] **Test W3.9** Official can approve/reject supervisors
- [x] **Test W3.10** Security rule test: volunteer cannot approve other users

---

## Week 4: Verification Workflow (Mar 17–23)

### Tasks

- [x] **T4.1** Build pending reports list (supervisor view)
  - Query reports where `status === 'pending'`
  - Filter by supervisor's region
  - Show disease, date, reporter, location summary
  - Sort by date (newest first or oldest first—decide)

- [x] **T4.2** Build report detail view (supervisor)
  - Full report data display
  - All symptoms checked
  - Temperature, patient demographics
  - Location with map pin (if coords available)
  - Reporter info (limited—email or ID, not full PII)

- [x] **T4.3** Implement report status state machine
  - States: `pending` → `verified` | `rejected`
  - Add `verifiedBy`, `verifiedAt` fields on verification
  - Add `rejectionReason` field on rejection

- [x] **T4.4** Build verification action buttons
  - Verify button → prompt for optional notes, update status
  - Reject button → require rejection reason, update status
  - Confirmation modal before action

- [x] **T4.5** Update report list UI with status filters
  - Tabs or dropdown: All, Pending, Verified, Rejected
  - Default to Pending for supervisor workflow

- [x] **T4.6** Show verification status to volunteer
  - Update volunteer's report list to show verified/rejected badges
  - Optional: show verifier notes or rejection reason

- [x] **T4.7** Build supervisor's verified reports view
  - Historical list of reports they've verified
  - Useful for their own tracking

- [x] **T4.8** Update security rules for verification
  - Only supervisors can update report status
  - Supervisors can only verify reports in their region
  - Volunteers cannot modify reports after submission

- [x] **T4.9** Handle offline verification
  - Verification actions should queue offline
  - Test verify while offline → reconnect → sync

- [x] **T4.10** Add loading and error states
  - Skeleton loaders for lists
  - Error boundaries for failed queries
  - Retry buttons where appropriate

### Tests (Week 4)

- [x] **Test W4.1** Supervisor sees pending reports from their region
- [x] **Test W4.2** Supervisor can open report detail view
- [x] **Test W4.3** Supervisor can verify report → status updates to 'verified'
- [x] **Test W4.4** Verified report shows verifiedBy and verifiedAt
- [x] **Test W4.5** Supervisor can reject report with reason
- [x] **Test W4.6** Rejected report shows rejection reason
- [x] **Test W4.7** Volunteer sees updated status on their report
- [x] **Test W4.8** Status filter works (pending/verified/rejected tabs)
- [x] **Test W4.9** **Offline verification test**
  - Go offline
  - Verify a report
  - Reconnect
  - Confirm status synced to Firestore
- [x] **Test W4.10** Security rule test: volunteer cannot change report status
- [x] **Test W4.11** Security rule test: supervisor cannot verify reports outside their region

---

## Definition of Done (M2)

- [x] Reports capture GPS location or manual fallback
- [x] Supervisors see pending volunteers and can approve/reject
- [x] Officials see pending supervisors and can approve/reject
- [x] Supervisors see pending reports from their region
- [x] Supervisors can verify or reject reports with notes/reason
- [x] Volunteers see verification status on their reports
- [x] Verification works offline and syncs on reconnect
- [x] Security rules enforce role-based access
- [x] All user approval and report verification flows tested

---

## Error Handling

| Scenario | Handling |
|----------|----------|
| Offline | Disable approve/reject buttons, show offline indicator |
| Permission denied | Show Alert: "You don't have permission to perform this action" |
| User already approved/rejected | Real-time subscription removes from list; show snackbar if action fails |
| Network error | Show Alert with retry option |

## Loading States

- Initial load: `CircularProgress` centered (matches existing pattern)
- Action in progress: Button shows spinner, other buttons disabled
- Optimistic UI: Not used (require confirmation before updating UI)

## Success Feedback

- Snackbar: "John Doe has been approved" or "John Doe has been rejected"
- User card animates out of list (or list re-renders via subscription)

---

## Deferred to Future

- [ ] In-app messaging between volunteer and supervisor
- [ ] Push notifications for status changes
- [ ] "Request clarification" status (simplified to just verify/reject for now)

---

## Notes

- Region scoping is critical for security—make sure queries and rules both filter by region
- If time is short, verification notes can be optional; rejection reason should be required
- Coordinate with Dalia on what metadata supervisors need to see for verification decisions
