# Manual Test Checklist

This document contains manual test cases for Sprint 1 that cannot be fully automated. Run these tests before marking Sprint 1 as complete.

## Prerequisites

- Node.js installed
- Firebase CLI installed (`npm install -g firebase-tools`)
- Java Runtime (for Firebase emulators)
- Chrome browser (for DevTools testing)

---

## Week 1: Setup Verification

### W1.1 - Dev Server Starts Without Errors

**Steps:**
1. Open terminal in `saha-care/` directory
2. Run `npm run dev`
3. Observe terminal output

**Expected:**
- [ ] Server starts without errors
- [ ] Shows "VITE ready" message
- [ ] Shows local URL (http://localhost:5173)

**To verify:**
- [ ] Open http://localhost:5173 in browser
- [ ] App loads without console errors

---

### W1.2 - PWA Manifest Loads

**Steps:**
1. Start dev server (`npm run dev`)
2. Open http://localhost:5173 in Chrome
3. Open DevTools (F12)
4. Go to Application tab → Manifest

**Expected:**
- [ ] Manifest section shows app details
- [ ] Name: "SAHA-Care"
- [ ] Icons array is populated (192x192, 512x512)
- [ ] Theme color is set
- [ ] Display mode: "standalone"

**Additional PWA check:**
- [ ] Go to Application → Service Workers
- [ ] Service worker is registered (in production build)

---

### W1.3 - Firebase Emulators Start and Connect

**Steps:**
1. Open terminal in `saha-care/` directory
2. Run `npm run emulators`
3. Wait for emulators to start

**Expected:**
- [ ] No errors in terminal
- [ ] Auth emulator running on port 9099
- [ ] Firestore emulator running on port 8080
- [ ] Emulator UI available at http://localhost:4000

**To verify connection:**
1. In another terminal, run `npm run dev`
2. Open http://localhost:5173
3. Check browser console for "Connected to emulators" message (or similar)

---

### W1.4 - Can Write/Read Test Doc to Firestore Emulator

**Steps:**
1. Start emulators (`npm run emulators`)
2. Open Emulator UI at http://localhost:4000
3. Go to Firestore tab
4. Click "Start collection"
5. Create collection "test" with document "doc1" containing field "name": "test"

**Expected:**
- [ ] Document created successfully
- [ ] Document appears in Firestore emulator UI
- [ ] Can read the document back

**Alternative (via app):**
1. Start app with emulators (`npm run dev:emulators`)
2. Register a new user
3. Check Firestore emulator UI for new document in "users" collection

---

### W1.5 - MUI Theme Applies Correctly

**Steps:**
1. Start dev server (`npm run dev`)
2. Open http://localhost:5173 in browser
3. Navigate to login page

**Expected:**
- [ ] App uses Material UI components (buttons, inputs, cards)
- [ ] Primary color is applied (blue theme)
- [ ] Typography uses MUI fonts (Roboto)
- [ ] No unstyled/broken components

---

## Week 2: Auth & Reporting

### W2.1 - Can Register New Volunteer Account

**Prerequisites:** Emulators running

**Steps:**
1. Open http://localhost:5173/register
2. Fill in registration form:
   - Email: test@example.com
   - Password: TestPassword123
   - Confirm Password: TestPassword123
   - Display Name: Test Volunteer
   - Role: Volunteer
   - Region: (select any)
3. Click Register

**Expected:**
- [ ] No validation errors
- [ ] Registration succeeds
- [ ] Redirected to pending approval page or home

---

### W2.2 - New User Shows Status 'pending' in Firestore

**Prerequisites:** W2.1 completed

**Steps:**
1. Open Emulator UI at http://localhost:4000
2. Go to Firestore tab
3. Open "users" collection
4. Find the user document for test@example.com

**Expected:**
- [ ] User document exists
- [ ] `status` field is "pending"
- [ ] `role` field is "volunteer"
- [ ] `email` field matches registered email

---

### W2.3 - Can Log In With Registered Account

**Prerequisites:** W2.1 completed

**Steps:**
1. Log out if logged in
2. Go to http://localhost:5173/login
3. Enter registered credentials
4. Click Login

**Expected:**
- [ ] Login succeeds
- [ ] No error messages
- [ ] Redirected to appropriate page

---

### W2.4 - Pending User Sees "Awaiting Approval" State

**Prerequisites:** W2.1, W2.3 completed (user is pending)

**Steps:**
1. Log in as the pending user
2. Observe the page content

**Expected:**
- [ ] User sees "pending approval" or similar message
- [ ] Cannot access report form
- [ ] Clear indication that account needs approval

---

### W2.5 - Approved User Can Access App

**Prerequisites:** W2.1-W2.4 completed

**Steps:**
1. Open Emulator UI at http://localhost:4000
2. Go to Firestore → users collection
3. Find the test user document
4. Edit: change `status` from "pending" to "approved"
5. Refresh the app in browser

**Expected:**
- [ ] User now sees volunteer home page
- [ ] Can access report form
- [ ] No more "pending approval" message

---

### W2.6 - Case Definitions Load in Report Form

**Prerequisites:** 
- Emulators running
- Case definitions seeded (`npm run seed:cases`)
- Approved volunteer logged in

**Steps:**
1. Navigate to report form
2. Look for disease selection

**Expected:**
- [ ] Disease options appear (not empty)
- [ ] Shows diseases: Acute Watery Diarrhea, Measles, ARI, Cholera, Jaundice
- [ ] No loading spinner stuck

---

### W2.7 - Symptom Checklist Updates When Disease Changes

**Prerequisites:** W2.6 completed

**Steps:**
1. Select "Acute Watery Diarrhea"
2. Proceed to symptoms step
3. Note the symptoms shown
4. Go back and select "Measles"
5. Proceed to symptoms step again

**Expected:**
- [ ] Symptoms are different for each disease
- [ ] AWD shows diarrhea-related symptoms
- [ ] Measles shows rash, fever, etc.

---

### W2.8 - Can Submit Report and See It in Firestore

**Prerequisites:** W2.6 completed

**Steps:**
1. Complete report form (all steps)
2. Submit report
3. Check Emulator UI → Firestore → reports collection

**Expected:**
- [ ] Success message shown in app
- [ ] New document appears in "reports" collection
- [ ] Report has status: "pending"
- [ ] Report has correct disease and symptoms

---

### W2.9 - Report Appears in Volunteer's Report List

**Prerequisites:** W2.8 completed

**Steps:**
1. After submitting report, navigate to volunteer home/report list
2. Look for the submitted report

**Expected:**
- [ ] Report appears in the list
- [ ] Shows disease name
- [ ] Shows "pending" status badge
- [ ] Shows submission date/time

---

### W2.10 - CRITICAL: Offline Submission Test

**This is the most important test for the app's core value proposition.**

**Prerequisites:** 
- App running in production mode (`npm run build && npm run preview`)
- OR dev mode with service worker enabled
- At least one successful online report submitted first

**Steps:**
1. Open app in Chrome
2. Submit one report while online (to ensure app is cached)
3. Open DevTools → Network tab
4. Check "Offline" checkbox to simulate offline mode
5. Verify offline indicator appears in app
6. Fill out a new report form
7. Submit the report
8. **Expected while offline:**
   - [ ] No error shown to user
   - [ ] Success message appears
   - [ ] Report shows in local list
9. Uncheck "Offline" in DevTools (go back online)
10. Wait a few seconds
11. Check Firestore Emulator UI

**Expected after reconnection:**
- [ ] Report appears in Firestore "reports" collection
- [ ] No duplicate reports
- [ ] All data intact (disease, symptoms, location)

**Troubleshooting:**
- If report doesn't sync, check console for errors
- Firestore offline persistence must be enabled
- Service worker must be registered

---

### W2.11 - App Loads When Started Offline (Cached Shell)

**Prerequisites:**
- App has been loaded at least once while online
- Production build recommended (`npm run build && npm run preview`)

**Steps:**
1. Open app in Chrome
2. Navigate around to cache pages
3. Close the browser tab
4. Open DevTools → Network tab
5. Check "Offline" checkbox
6. Open a new tab and go to the app URL

**Expected:**
- [ ] App shell loads (not browser error page)
- [ ] Shows offline indicator
- [ ] Can navigate within cached pages
- [ ] Cached data (previous reports) is visible

---

## Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| W1.1 | [ ] Pass / [ ] Fail | |
| W1.2 | [ ] Pass / [ ] Fail | |
| W1.3 | [ ] Pass / [ ] Fail | |
| W1.4 | [ ] Pass / [ ] Fail | |
| W1.5 | [ ] Pass / [ ] Fail | |
| W2.1 | [ ] Pass / [ ] Fail | |
| W2.2 | [ ] Pass / [ ] Fail | |
| W2.3 | [ ] Pass / [ ] Fail | |
| W2.4 | [ ] Pass / [ ] Fail | |
| W2.5 | [ ] Pass / [ ] Fail | |
| W2.6 | [ ] Pass / [ ] Fail | |
| W2.7 | [ ] Pass / [ ] Fail | |
| W2.8 | [ ] Pass / [ ] Fail | |
| W2.9 | [ ] Pass / [ ] Fail | |
| W2.10 | [ ] Pass / [ ] Fail | **CRITICAL** |
| W2.11 | [ ] Pass / [ ] Fail | |

**Date tested:** _______________
**Tester:** _______________
**Build/commit:** _______________

---
---

## Sprint 2: Location & Verification

## Week 3: Location & User Approval

### W3.1 - Report Submission Captures GPS Coordinates

**Prerequisites:** Emulators running, approved volunteer logged in

**Steps:**
1. Navigate to New Report form
2. Fill in disease and symptoms
3. At the location step, click "Get GPS Location"
4. Allow browser location permission when prompted
5. Submit the report
6. Check Firestore Emulator UI → reports collection → new document

**Expected:**
- [ ] GPS button shows loading spinner while acquiring position
- [ ] Coordinates (lat/lng) appear on screen after capture
- [ ] Report document in Firestore contains `location.lat` and `location.lng` fields
- [ ] Coordinates are reasonable values (not 0/0)

---

### W3.2 - Manual Location Input Works When GPS Unavailable

**Prerequisites:** Emulators running, approved volunteer logged in

**Steps:**
1. Navigate to New Report form
2. Fill in disease and symptoms
3. At the location step, deny GPS permission (or use DevTools → Sensors → override location to "Unavailable")
4. Observe the fallback UI
5. Type a manual location name (e.g., "Khan Younis Market")
6. Submit the report
7. Check Firestore Emulator UI → reports collection

**Expected:**
- [ ] Error message shows when GPS fails
- [ ] Manual location text field is available
- [ ] Report document contains `location.name` field with the entered text
- [ ] Report can be submitted with only manual location (no lat/lng required)

---

### W3.3 - Location Displays on Report Detail View

**Prerequisites:** W3.1 or W3.2 completed (reports exist with location data)

**Steps:**
1. As volunteer: navigate to report list and find the submitted report
2. Observe location display
3. As supervisor: navigate to Review Reports and find the report

**Expected:**
- [ ] Reports with GPS show coordinates (e.g., "31.5167, 34.4500")
- [ ] Reports with manual location show the location name
- [ ] Location is visible in both volunteer list and supervisor review card

---

### W3.4 - Supervisor Sees Only Pending Volunteers in Their Region

**Prerequisites:**
- Emulators running
- Register 2 volunteers in region "North Gaza" and 1 volunteer in region "Rafah"
- Register and approve a supervisor in region "North Gaza"

**Steps:**
1. Log in as the North Gaza supervisor
2. Navigate to Pending Volunteers page

**Expected:**
- [ ] Only the 2 North Gaza volunteers appear
- [ ] The Rafah volunteer does NOT appear
- [ ] List shows user names, emails, and registration dates

---

### W3.5 - Supervisor Can Approve Volunteer → Status Changes to 'approved'

**Prerequisites:** W3.4 completed

**Steps:**
1. On the Pending Volunteers page, click "Approve" on a volunteer
2. Confirm in the approval dialog
3. Check Firestore Emulator UI → users collection

**Expected:**
- [ ] Confirmation dialog appears before approval
- [ ] Success snackbar shows (e.g., "John Doe has been approved")
- [ ] User disappears from pending list
- [ ] In Firestore: user `status` = "approved", `approvedBy` is set, `approvedAt` is set

---

### W3.6 - Supervisor Can Reject Volunteer → Status Changes to 'rejected'

**Prerequisites:** W3.4 completed (at least one pending volunteer remains)

**Steps:**
1. On the Pending Volunteers page, click "Reject" on a volunteer
2. In the rejection dialog, enter a reason (at least 10 characters)
3. Confirm rejection
4. Check Firestore Emulator UI

**Expected:**
- [ ] Rejection dialog requires reason with minimum 10 characters
- [ ] Cannot submit with short reason (validation error shown)
- [ ] Success snackbar shows after rejection
- [ ] In Firestore: user `status` = "rejected", `rejectedBy`, `rejectedAt`, `rejectionReason` are set

---

### W3.7 - Approved Volunteer Can Now Access Full App

**Prerequisites:** W3.5 completed (a volunteer was approved)

**Steps:**
1. Log out of supervisor account
2. Log in as the newly approved volunteer
3. Navigate the app

**Expected:**
- [ ] No "pending approval" message shown
- [ ] Volunteer sees their dashboard/report list
- [ ] Can access the New Report form
- [ ] Can submit a report

---

### W3.8 - Official Sees Pending Supervisors

**Prerequisites:**
- Emulators running
- Register 2 supervisors (any region), leave them as pending
- Create an official user (set `role: "official"`, `status: "approved"` in Firestore)

**Steps:**
1. Log in as the official
2. Navigate to Pending Supervisors page

**Expected:**
- [ ] Both pending supervisors appear regardless of region
- [ ] Shows user name, email, region, registration date
- [ ] Approve and Reject buttons visible

---

### W3.9 - Official Can Approve/Reject Supervisors

**Prerequisites:** W3.8 completed

**Steps:**
1. Approve one supervisor using the Approve button
2. Reject the other supervisor with a reason
3. Check Firestore Emulator UI

**Expected:**
- [ ] Approval: supervisor `status` = "approved", `approvedBy` set
- [ ] Rejection: supervisor `status` = "rejected", `rejectionReason` set
- [ ] Both supervisors removed from pending list
- [ ] Success snackbars shown for each action

---

### W3.10 - Security Rule Test: Volunteer Cannot Approve Other Users

**Prerequisites:** Emulators running, approved volunteer logged in

**Steps:**
1. Open browser DevTools console
2. Attempt to update another user's status directly via Firestore SDK:
   ```js
   import { doc, updateDoc } from 'firebase/firestore';
   await updateDoc(doc(db, 'users', 'other-user-uid'), { status: 'approved' });
   ```
3. Alternatively, try to navigate to `/supervisor/pending-users` as a volunteer

**Expected:**
- [ ] Firestore write is rejected with permission error
- [ ] Route guard prevents volunteer from accessing supervisor pages
- [ ] No unauthorized status changes in Firestore

---

## Week 4: Report Verification Workflow

### W4.1 - Supervisor Sees Pending Reports From Their Region

**Prerequisites:**
- Emulators running
- Approved volunteer in "North Gaza" has submitted 2 reports
- Volunteer in "Rafah" has submitted 1 report
- Approved supervisor in "North Gaza" logged in

**Steps:**
1. Navigate to Review Reports page
2. Select the "Pending" tab

**Expected:**
- [ ] Only North Gaza reports appear
- [ ] Rafah reports do NOT appear
- [ ] Reports show disease name, date, reporter name, location
- [ ] Pending tab count matches number of pending reports

---

### W4.2 - Supervisor Can Open Report Detail View

**Prerequisites:** W4.1 completed

**Steps:**
1. On the Review Reports page, examine a report card
2. Review the displayed information

**Expected:**
- [ ] Report card shows disease name
- [ ] Shows symptoms/assessment answers
- [ ] Shows location (GPS coords or manual name)
- [ ] Shows reporter information
- [ ] Shows danger signs if flagged
- [ ] Verify and Reject buttons are visible for pending reports

---

### W4.3 - Supervisor Can Verify Report → Status Updates to 'verified'

**Prerequisites:** W4.1 completed

**Steps:**
1. Click "Verify" on a pending report
2. Optionally enter verification notes
3. Confirm the action
4. Check Firestore Emulator UI → reports collection

**Expected:**
- [ ] Verification dialog appears
- [ ] Success snackbar shown
- [ ] Report no longer shows in Pending tab
- [ ] Report appears in Verified tab
- [ ] In Firestore: `status` = "verified", `verifiedBy` set, `verifiedAt` set

---

### W4.4 - Verified Report Shows verifiedBy and verifiedAt

**Prerequisites:** W4.3 completed

**Steps:**
1. Switch to "Verified" tab on Review Reports page
2. Find the verified report
3. Check Firestore Emulator UI for the report document

**Expected:**
- [ ] Report card shows "Verified" status chip (green)
- [ ] Firestore document has `verifiedBy` = supervisor's UID
- [ ] Firestore document has `verifiedAt` timestamp
- [ ] If verification notes were entered, they are stored in `verificationNotes`

---

### W4.5 - Supervisor Can Reject Report With Reason

**Prerequisites:** W4.1 completed (at least one pending report remains)

**Steps:**
1. Click "Reject" on a pending report
2. Enter rejection notes explaining why
3. Confirm the action
4. Check Firestore Emulator UI

**Expected:**
- [ ] Rejection dialog appears
- [ ] Success snackbar shown after rejection
- [ ] Report no longer in Pending tab
- [ ] Report appears in Rejected tab
- [ ] In Firestore: `status` = "rejected", `verifiedBy` set, `verificationNotes` contains reason

---

### W4.6 - Rejected Report Shows Rejection Reason

**Prerequisites:** W4.5 completed

**Steps:**
1. Switch to "Rejected" tab
2. Find the rejected report
3. Examine the displayed information

**Expected:**
- [ ] Report shows "Rejected" status chip (red)
- [ ] Verification notes (rejection reason) are displayed on the card

---

### W4.7 - Volunteer Sees Updated Status on Their Report

**Prerequisites:** W4.3 or W4.5 completed

**Steps:**
1. Log out of supervisor account
2. Log in as the volunteer who submitted the reports
3. Navigate to My Reports list

**Expected:**
- [ ] Verified reports show green "Verified" status chip
- [ ] Rejected reports show red "Rejected" status chip
- [ ] Remaining reports show yellow "Pending" status chip
- [ ] Verification notes displayed if present

---

### W4.8 - Status Filter Works (Pending/Verified/Rejected Tabs)

**Prerequisites:** Reports exist in multiple statuses (pending, verified, rejected)

**Steps:**
1. Log in as supervisor
2. Navigate to Review Reports
3. Click through each tab: All, Pending, Verified, Rejected

**Expected:**
- [ ] "All" tab shows all reports with correct total count
- [ ] "Pending" tab shows only pending reports with count
- [ ] "Verified" tab shows only verified reports with count
- [ ] "Rejected" tab shows only rejected reports with count
- [ ] Counts in tab labels are accurate
- [ ] Switching tabs updates the list immediately

---

### W4.9 - Offline Verification Test

**Prerequisites:**
- App running in production mode (`npm run build && npm run preview`)
- Supervisor logged in with pending reports available
- App has been loaded at least once while online

**Steps:**
1. Open DevTools → Network tab
2. Check "Offline" checkbox
3. Verify offline indicator appears
4. Click "Verify" on a pending report
5. Confirm the verification
6. **Expected while offline:**
   - [ ] Verification action completes locally (no error)
   - [ ] Report status updates in the UI
7. Uncheck "Offline" in DevTools (go back online)
8. Wait a few seconds
9. Check Firestore Emulator UI

**Expected after reconnection:**
- [ ] Report document in Firestore has `status` = "verified"
- [ ] `verifiedBy` and `verifiedAt` fields are set
- [ ] No duplicate or conflicting updates

**Troubleshooting:**
- If verification doesn't sync, check console for Firestore errors
- Firestore offline persistence must be enabled

---

### W4.10 - Security Rule Test: Volunteer Cannot Change Report Status

**Prerequisites:** Emulators running, approved volunteer logged in

**Steps:**
1. Open browser DevTools console
2. Attempt to update a report's status directly:
   ```js
   import { doc, updateDoc } from 'firebase/firestore';
   await updateDoc(doc(db, 'reports', 'some-report-id'), { status: 'verified' });
   ```

**Expected:**
- [ ] Firestore write is rejected with permission error
- [ ] Report status remains unchanged
- [ ] Volunteer cannot see Review Reports page (route guard blocks access)

---

### W4.11 - Security Rule Test: Supervisor Cannot Verify Reports Outside Their Region

**Prerequisites:**
- Emulators running
- Report exists in "Rafah" region
- Supervisor is approved in "North Gaza" region

**Steps:**
1. Log in as the North Gaza supervisor
2. Attempt to update a Rafah report's status via DevTools console:
   ```js
   import { doc, updateDoc } from 'firebase/firestore';
   await updateDoc(doc(db, 'reports', 'rafah-report-id'), { status: 'verified', verifiedBy: 'supervisor-uid' });
   ```

**Expected:**
- [ ] Firestore write is rejected with permission error
- [ ] Rafah reports do not appear in the supervisor's Review Reports page
- [ ] Status of the Rafah report remains unchanged

---

## Sprint 2 Test Results Summary

| Test | Status | Notes |
|------|--------|-------|
| W3.1 | [ ] Pass / [ ] Fail | |
| W3.2 | [ ] Pass / [ ] Fail | |
| W3.3 | [ ] Pass / [ ] Fail | |
| W3.4 | [ ] Pass / [ ] Fail | |
| W3.5 | [ ] Pass / [ ] Fail | |
| W3.6 | [ ] Pass / [ ] Fail | |
| W3.7 | [ ] Pass / [ ] Fail | |
| W3.8 | [ ] Pass / [ ] Fail | |
| W3.9 | [ ] Pass / [ ] Fail | |
| W3.10 | [ ] Pass / [ ] Fail | |
| W4.1 | [ ] Pass / [ ] Fail | |
| W4.2 | [ ] Pass / [ ] Fail | |
| W4.3 | [ ] Pass / [ ] Fail | |
| W4.4 | [ ] Pass / [ ] Fail | |
| W4.5 | [ ] Pass / [ ] Fail | |
| W4.6 | [ ] Pass / [ ] Fail | |
| W4.7 | [ ] Pass / [ ] Fail | |
| W4.8 | [ ] Pass / [ ] Fail | |
| W4.9 | [ ] Pass / [ ] Fail | **CRITICAL** |
| W4.10 | [ ] Pass / [ ] Fail | |
| W4.11 | [ ] Pass / [ ] Fail | |

**Date tested:** _______________
**Tester:** _______________
**Build/commit:** _______________
