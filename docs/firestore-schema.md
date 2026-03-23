# Firestore Schema

This document describes the Firestore collections used by SAHA-Care.

---

## Collections Overview

| Collection | Purpose | Write Access | Read Access |
|------------|---------|--------------|-------------|
| `users` | User profiles and roles | Self (create), Supervisors/Officials (approve) | Self, Supervisors (region), Officials (all) |
| `reports` | Disease case reports | Volunteers (create) | Self, Supervisors (region), Officials (all) |
| `caseDefinitions` | WHO-aligned disease definitions | Officials only | All authenticated users |
| `alerts` | Outbreak alerts | Cloud Functions only | Supervisors, Officials |
| `aggregates` | Pre-computed dashboard data | Cloud Functions only | Supervisors, Officials |
| `auditLogs` | Approval/rejection audit trail | Cloud Functions only | Officials |

---

## `users`

User profiles with role-based access control.

```typescript
interface User {
  uid: string;              // Firebase Auth UID (document ID)
  email: string;
  displayName: string;
  role: 'volunteer' | 'supervisor' | 'official';
  status: 'pending' | 'approved' | 'rejected';
  supervisorId?: string;    // UID of assigned supervisor (volunteers only)
  region: string;           // Geographic region
  approvedBy?: string;      // UID of the user who approved this account
  approvedAt?: Timestamp;   // When the account was approved
  rejectedBy?: string;      // UID of the user who rejected this account
  rejectedAt?: Timestamp;   // When the account was rejected
  rejectionReason?: string; // Reason for rejection (required on rejection)
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Document ID:** User's Firebase Auth UID

**Indexes:**
- `region` + `role` + `status`
- `role` + `status` + `createdAt`
- `role` + `status` + `region` + `createdAt`

---

## `reports`

Disease case reports submitted by volunteers.

```typescript
interface Report {
  id: string;               // Auto-generated document ID
  disease: string;          // References caseDefinitions.disease
  answers: QuestionAnswer[]; // Structured answers to assessment questions
  symptoms: string[];       // Flat list of "Yes" answer texts (for display)
  temp?: number;            // Patient temperature in Celsius
  dangerSigns?: string[];   // Observed danger signs
  location: {
    lat: number;
    lng: number;
    name?: string;          // Manual location fallback
  };
  status: 'pending' | 'verified' | 'rejected';
  reporterId: string;       // UID of submitting volunteer
  reporterName?: string;    // Denormalized for list views
  region: string;           // Region where report was filed
  verifiedBy?: string;      // UID of verifying supervisor
  verificationNotes?: string;
  hasDangerSigns: boolean;  // Whether any danger sign was flagged
  isImmediateReport: boolean; // Whether flagged for immediate alert
  personsCount: number;     // Number of persons affected (minimum 1)
  reclassifiedFrom?: string; // Original disease if reclassification occurred
  createdAt: Timestamp;
  verifiedAt?: Timestamp;
}

interface QuestionAnswer {
  questionId: string;
  questionText: string;     // Denormalized for offline readability
  answer: boolean;
  numericValue?: number;    // Numeric follow-up value if applicable
}
```

**Document ID:** Auto-generated

**Indexes:**
- `region` + `status` + `createdAt` (supervisor pending reports query)
- `region` + `createdAt` (dashboard reports by region)
- `reporterId` + `createdAt` (volunteer's own reports)
- `region` + `disease` + `createdAt` (dashboard filtering)
- `disease` + `region` + `status` + `createdAt` (threshold queries)

---

## `caseDefinitions`

WHO-aligned case definitions for reportable diseases.

```typescript
interface CaseDefinition {
  id: string;               // URL-safe slug (e.g., "acute-watery-diarrhea")
  disease: string;          // Display name
  definition: string;       // Short clinical definition
  questions: AssessmentQuestion[]; // Structured assessment questions
  dangerSigns: string[];    // Red flags requiring referral
  guidance: string;         // Clinical guidance for CHWs
  active: boolean;          // Whether currently in use
  thresholds: AlertThreshold[]; // Alert thresholds with time windows
  prioritySurveillance: boolean; // Whether this is a priority target
}

interface AssessmentQuestion {
  id: string;
  text: string;             // Yes/No question text
  category: 'core' | 'associated' | 'severity' | 'history';
  required: boolean;        // Required for suspected case
  inputType: 'none' | 'number';
  inputLabel?: string;
  inputUnit?: string;
  yesNote?: string;         // Note shown on "Yes" answer
  isDangerSign: boolean;
  isImmediateReport: boolean;
  reclassifyTo?: string;    // Disease ID to reclassify to on "Yes"
}

interface AlertThreshold {
  count: number;            // Cases that trigger alert
  windowHours: number;      // Time window (24 = day, 168 = week)
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
}
```

**Document ID:** URL-safe disease slug

**Indexes:** None required (small collection, fetched in full)

---

## `alerts`

Outbreak alerts auto-generated when case counts exceed thresholds.

```typescript
interface Alert {
  id: string;
  disease: string;          // Disease that triggered alert
  region: string;           // Affected region
  caseCount: number;        // Current case count
  threshold: number;        // Threshold that was exceeded
  windowHours: number;      // Time window of the threshold (in hours)
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved';
  immediateAlert: boolean;  // Whether triggered by immediate-report flag
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
}
```

**Document ID:** Auto-generated

**Indexes:**
- `status` + `createdAt` (active alerts, all regions)
- `status` + `severity` + `createdAt`
- `region` + `status` + `createdAt` (regional alerts)
- `disease` + `region` + `status` (dedup check)

**Note:** Created exclusively by the `onReportWrite` Cloud Function.

---

## `aggregates`

Pre-computed rollups for dashboard performance.

```typescript
interface Aggregate {
  id: string;               // Composite: `{disease-slug}_{region-slug}_{period}_{date}`
  disease: string;
  region: string;
  period: 'day' | 'week';
  dateKey: string;          // Explicit date key (e.g., "2026-03-12")
  caseCount: number;
  verifiedCount: number;
  personsCount: number;     // Total persons affected
  lastUpdated: Timestamp;
}
```

**Document ID:** Composite key for upsert operations

**Indexes:**
- `disease` + `region` + `period`
- `period` + `region`

**Note:** Maintained exclusively by the `aggregateCases` Cloud Function. Uses report's `createdAt` for time bucketing (not function execution time).

---

## `auditLogs`

Audit trail for user approval and rejection actions. Created by the `onUserApproval` Cloud Function.

```typescript
interface AuditLog {
  id: string;
  action: string;           // e.g., "approve_user", "reject_user"
  targetUid: string;        // UID of affected user
  performedBy: string;      // UID of the approver/rejector
  details: Record<string, unknown>; // Additional context
  createdAt: Timestamp;
}
```

**Document ID:** Auto-generated

**Note:** No TTL/cleanup policy currently configured.

---

## Security Rules Summary

See `firestore.rules` for full implementation.

| Collection | Rule |
|------------|------|
| `users` | Self can read/create. Supervisors approve volunteers in region. Officials approve supervisors. |
| `reports` | Volunteers create own. Supervisors verify in region. Officials read all. |
| `caseDefinitions` | Read: all authenticated. Write: officials only. |
| `alerts` | Read: supervisors/officials. Write: Cloud Functions only (no client writes). |
| `aggregates` | Read: supervisors/officials. Write: Cloud Functions only. |
| `auditLogs` | Read: officials only. Write: Cloud Functions only. |

---

## Offline Behavior

Firestore offline persistence is enabled via `initializeFirestore` with `persistentLocalCache` and `persistentMultipleTabManager`. This means:

1. **Reads:** Cached data served when offline
2. **Writes:** Queued locally, synced on reconnect
3. **Listeners:** `onSnapshot` fires with cached data, updates on sync
4. **Multi-tab:** Persistence works across multiple browser tabs

Reports submitted offline will have `createdAt` set to client time and sync when connectivity returns. Aggregates use the report's `createdAt` for time bucketing, ensuring offline-submitted reports are bucketed correctly.
