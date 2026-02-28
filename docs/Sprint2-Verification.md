# Sprint 2 — Location & Verification

**Dates:** Mar 10 – Mar 23, 2026  
**Goal:** Supervisors can approve users and verify reports.  
**Milestone:** M2 (Mar 23) — Supervisor Flow (no messaging)

**Prerequisite:** M1 complete (auth + offline reporting working)

---

## Week 3: Location & User Approval (Mar 10–14)

### Tasks

- [ ] **T3.1** Add GPS capture to report submission
  - Use Geolocation API on submit
  - Store lat/lng in report document
  - Handle permission denied gracefully

- [ ] **T3.2** Build manual location fallback
  - Text input for location name/description
  - Show when GPS fails or user declines
  - Store location.name alongside or instead of coords

- [ ] **T3.3** Display location on report detail
  - Show coordinates or location name
  - Optional: small static map preview (can defer to Sprint 3)

- [ ] **T3.4** Build supervisor home page
  - Role-based routing: supervisor sees different home than volunteer
  - Navigation tabs: Pending Users, Pending Reports

- [ ] **T3.5** Build pending volunteers list (supervisor view)
  - Query users where `status === 'pending'` AND `role === 'volunteer'`
  - Filter by supervisor's region
  - Show email, displayName, registration date

- [ ] **T3.6** Implement volunteer approval actions
  - Approve button → update `status: 'approved'`, set `supervisorId`
  - Reject button → update `status: 'rejected'`
  - Show confirmation before action
  - Optimistic UI update

- [ ] **T3.7** Build official home page
  - Role-based routing for official role
  - Navigation: Pending Supervisors, Dashboard (placeholder for Sprint 3)

- [ ] **T3.8** Build pending supervisors list (official view)
  - Query users where `status === 'pending'` AND `role === 'supervisor'`
  - Filter by official's region (if applicable)

- [ ] **T3.9** Implement supervisor approval actions
  - Same pattern as volunteer approval
  - Official approves/rejects supervisors

- [ ] **T3.10** Update security rules for approval workflow
  - Supervisors can update volunteer status in their region
  - Officials can update supervisor status
  - Users cannot approve themselves

### Tests (Week 3)

- [ ] **Test W3.1** Report submission captures GPS coordinates
- [ ] **Test W3.2** Manual location input works when GPS unavailable
- [ ] **Test W3.3** Location displays on report detail view
- [ ] **Test W3.4** Supervisor sees only pending volunteers in their region
- [ ] **Test W3.5** Supervisor can approve volunteer → status changes to 'approved'
- [ ] **Test W3.6** Supervisor can reject volunteer → status changes to 'rejected'
- [ ] **Test W3.7** Approved volunteer can now access full app
- [ ] **Test W3.8** Official sees pending supervisors
- [ ] **Test W3.9** Official can approve/reject supervisors
- [ ] **Test W3.10** Security rule test: volunteer cannot approve other users

---

## Week 4: Verification Workflow (Mar 17–23)

### Tasks

- [ ] **T4.1** Build pending reports list (supervisor view)
  - Query reports where `status === 'pending'`
  - Filter by supervisor's region
  - Show disease, date, reporter, location summary
  - Sort by date (newest first or oldest first—decide)

- [ ] **T4.2** Build report detail view (supervisor)
  - Full report data display
  - All symptoms checked
  - Temperature, patient demographics
  - Location with map pin (if coords available)
  - Reporter info (limited—email or ID, not full PII)

- [ ] **T4.3** Implement report status state machine
  - States: `pending` → `verified` | `rejected`
  - Add `verifiedBy`, `verifiedAt` fields on verification
  - Add `rejectionReason` field on rejection

- [ ] **T4.4** Build verification action buttons
  - Verify button → prompt for optional notes, update status
  - Reject button → require rejection reason, update status
  - Confirmation modal before action

- [ ] **T4.5** Update report list UI with status filters
  - Tabs or dropdown: All, Pending, Verified, Rejected
  - Default to Pending for supervisor workflow

- [ ] **T4.6** Show verification status to volunteer
  - Update volunteer's report list to show verified/rejected badges
  - Optional: show verifier notes or rejection reason

- [ ] **T4.7** Build supervisor's verified reports view
  - Historical list of reports they've verified
  - Useful for their own tracking

- [ ] **T4.8** Update security rules for verification
  - Only supervisors can update report status
  - Supervisors can only verify reports in their region
  - Volunteers cannot modify reports after submission

- [ ] **T4.9** Handle offline verification
  - Verification actions should queue offline
  - Test verify while offline → reconnect → sync

- [ ] **T4.10** Add loading and error states
  - Skeleton loaders for lists
  - Error boundaries for failed queries
  - Retry buttons where appropriate

### Tests (Week 4)

- [ ] **Test W4.1** Supervisor sees pending reports from their region
- [ ] **Test W4.2** Supervisor can open report detail view
- [ ] **Test W4.3** Supervisor can verify report → status updates to 'verified'
- [ ] **Test W4.4** Verified report shows verifiedBy and verifiedAt
- [ ] **Test W4.5** Supervisor can reject report with reason
- [ ] **Test W4.6** Rejected report shows rejection reason
- [ ] **Test W4.7** Volunteer sees updated status on their report
- [ ] **Test W4.8** Status filter works (pending/verified/rejected tabs)
- [ ] **Test W4.9** **Offline verification test**
  - Go offline
  - Verify a report
  - Reconnect
  - Confirm status synced to Firestore
- [ ] **Test W4.10** Security rule test: volunteer cannot change report status
- [ ] **Test W4.11** Security rule test: supervisor cannot verify reports outside their region

---

## Definition of Done (M2)

- [ ] Reports capture GPS location or manual fallback
- [ ] Supervisors see pending volunteers and can approve/reject
- [ ] Officials see pending supervisors and can approve/reject
- [ ] Supervisors see pending reports from their region
- [ ] Supervisors can verify or reject reports with notes/reason
- [ ] Volunteers see verification status on their reports
- [ ] Verification works offline and syncs on reconnect
- [ ] Security rules enforce role-based access
- [ ] All user approval and report verification flows tested

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
