# Sprint 1 Manual Test Checklist

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
