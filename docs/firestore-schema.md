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
  createdAt: Timestamp;
  updatedAt: Timestamp;
}
```

**Document ID:** User's Firebase Auth UID

**Indexes:** None required (queries by region use security rules)

---

## `reports`

Disease case reports submitted by volunteers.

```typescript
interface Report {
  id: string;               // Auto-generated document ID
  disease: string;          // References caseDefinitions.id
  symptoms: string[];       // Selected symptom IDs from case definition
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
  createdAt: Timestamp;
  verifiedAt?: Timestamp;
}
```

**Document ID:** Auto-generated

**Indexes:**
- `region` + `status` + `createdAt` (supervisor pending reports query)
- `reporterId` + `createdAt` (volunteer's own reports)
- `disease` + `region` + `createdAt` (dashboard filtering)

---

## `caseDefinitions`

WHO-aligned case definitions for reportable diseases.

```typescript
interface CaseDefinition {
  id: string;               // URL-safe slug (e.g., "acute-watery-diarrhea")
  disease: string;          // Display name
  symptoms: Array<{
    id: string;
    name: string;
    required: boolean;      // Required for suspected case
  }>;
  dangerSigns: string[];    // Red flags requiring referral
  guidance: string;         // Clinical guidance for CHWs
  active: boolean;          // Whether currently in use
  threshold: number;        // Alert threshold (cases per region)
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
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'active' | 'resolved';
  createdAt: Timestamp;
  resolvedAt?: Timestamp;
}
```

**Document ID:** Auto-generated

**Indexes:**
- `status` + `createdAt` (active alerts query)
- `region` + `status` (regional alerts)

**Note:** Created exclusively by the `onReportWrite` Cloud Function.

---

## `aggregates`

Pre-computed rollups for dashboard performance.

```typescript
interface Aggregate {
  id: string;               // Composite: `{disease}_{region}_{period}_{date}`
  disease: string;
  region: string;
  period: 'day' | 'week';
  caseCount: number;
  verifiedCount: number;
  lastUpdated: Timestamp;
}
```

**Document ID:** Composite key for upsert operations

**Indexes:**
- `disease` + `period` + `lastUpdated`
- `region` + `period` + `lastUpdated`

**Note:** Maintained exclusively by the `aggregateCases` Cloud Function.

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

---

## Offline Behavior

Firestore offline persistence is enabled via `enableIndexedDbPersistence()`. This means:

1. **Reads:** Cached data served when offline
2. **Writes:** Queued locally, synced on reconnect
3. **Listeners:** `onSnapshot` fires with cached data, updates on sync

Reports submitted offline will have `createdAt` set to client time and sync when connectivity returns.
