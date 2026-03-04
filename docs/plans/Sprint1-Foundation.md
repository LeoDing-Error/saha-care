# Sprint 1 — Foundation & Core Reporting

**Dates:** Feb 24 – Mar 9, 2026  
**Goal:** Volunteer can register, log in, and submit offline case reports.  
**Milestone:** M1 (Mar 9) — App MVP

---

## Week 1: Project Setup (Feb 24–28)

### Tasks

- [x] **T1.1** Initialize Vite + React + TypeScript project
  - `npm create vite@latest saha-care -- --template react-ts`
  - Verify dev server runs

- [x] **T1.2** Configure PWA plugin
  - Install `vite-plugin-pwa`
  - Add basic manifest.json (app name, icons, theme color)
  - Verify "Add to Home Screen" prompt works on Chrome Android

- [x] **T1.3** Set up Material UI
  - Install MUI core + icons
  - Create theme with project colors
  - Add basic AppBar shell component

- [x] **T1.4** Create Firebase project
  - Create project in Firebase Console
  - Enable Firestore (start in test mode, lock down in Sprint 4)
  - Enable Authentication (email/password provider)
  - Add Firebase config to app (`src/services/firebase.ts`)

- [x] **T1.5** Set up Firebase Emulator Suite
  - Install Firebase CLI
  - Initialize emulators (Firestore, Auth)
  - Add npm scripts: `npm run emulators`, `npm run dev:emulators`
  - Document local dev workflow in README

- [x] **T1.6** Design Firestore collections
  - Create `src/types/` with TypeScript interfaces:
    - `User` (uid, email, displayName, role, status, supervisorId, region)
    - `Report` (disease, symptoms, temp, location, status, reporterId, verifiedBy, createdAt)
    - `CaseDefinition` (disease, symptoms, dangerSigns, guidance, active)
  - Document schema in `docs/firestore-schema.md`

- [x] **T1.7** Draft initial security rules
  - Create `firestore.rules` with basic role-based access
  - Users can only read/write their own user doc
  - Reports writeable by volunteers, readable by supervisors in same region
  - Deploy to emulator for testing

- [x] **T1.8** Set up React Context + Firestore listeners
  - Create `src/contexts/AuthContext.tsx` (user state, loading, error)
  - Use `onAuthStateChanged` for auth state listener
  - Use Firestore `onSnapshot` listeners for real-time data (reports, case definitions)

### Tests (Week 1)

- [x] **Test W1.1** Dev server starts without errors
- [x] **Test W1.2** PWA manifest loads (check Chrome DevTools > Application)
- [x] **Test W1.3** Firebase emulators start and connect
- [x] **Test W1.4** Can write/read test doc to Firestore emulator
- [x] **Test W1.5** MUI theme applies correctly

---

## Week 2: Auth & Reporting (Mar 3–9)

### Tasks

- [x] **T2.1** Build Login page
  - Email/password form with validation
  - Firebase Auth `signInWithEmailAndPassword`
  - Error handling (wrong password, user not found)
  - Redirect to role-appropriate home on success

- [x] **T2.2** Build Register page
  - Email/password/confirm password form
  - Role selection (Volunteer, Supervisor, Official)
  - Firebase Auth `createUserWithEmailAndPassword`
  - Create user doc in Firestore with `status: 'pending'`

- [x] **T2.3** Implement auth state listener
  - `onAuthStateChanged` in AuthContext
  - Fetch user doc from Firestore on auth
  - Handle pending approval state (show "awaiting approval" message)

- [x] **T2.4** Build protected route wrapper
  - Redirect to login if not authenticated
  - Redirect to pending page if status !== 'approved'
  - Role-based route guards

- [x] **T2.5** Seed case definitions
  - Create `scripts/seedCaseDefinitions.ts`
  - Add 3-5 priority diseases (acute watery diarrhea, measles, acute respiratory infection, suspected cholera, jaundice)
  - WHO-aligned symptom checklists
  - Run against emulator

- [x] **T2.6** Build case report form
  - Multi-step form or single scrollable form
  - Disease selection dropdown (from caseDefinitions)
  - Dynamic symptom checklist based on selected disease
  - Temperature input (optional)
  - Patient age/sex (no PII names)
  - Submit button

- [x] **T2.7** Implement report submission
  - Write to Firestore `reports` collection
  - Include reporterId, timestamp, status: 'pending'
  - Show success feedback
  - Clear form on success

- [x] **T2.8** Enable Firestore offline persistence
  - Call `enableIndexedDbPersistence()` on init
  - Handle multi-tab errors gracefully
  - Verify writes queue when offline

- [x] **T2.9** Configure service worker caching
  - PWA plugin workbox config for app shell caching
  - Cache static assets, fonts, MUI
  - Test offline app load

- [x] **T2.10** Build volunteer home/report list
  - Show user's submitted reports
  - Display status badge (pending, verified, rejected)
  - Pull-to-refresh or auto-update via Firestore listener

### Tests (Week 2)

- [x] **Test W2.1** Can register new volunteer account
- [x] **Test W2.2** New user shows status 'pending' in Firestore
- [x] **Test W2.3** Can log in with registered account
- [x] **Test W2.4** Pending user sees "awaiting approval" state
- [x] **Test W2.5** (Manual) Approve user in Firestore, verify they can access app
- [x] **Test W2.6** Case definitions load in report form
- [x] **Test W2.7** Symptom checklist updates when disease changes
- [x] **Test W2.8** Can submit report and see it in Firestore
- [x] **Test W2.9** Report appears in volunteer's report list
- [x] **Test W2.10** **CRITICAL: Offline submission test**
  - Disable network in DevTools
  - Submit report
  - Verify no error shown to user
  - Re-enable network
  - Verify report syncs to Firestore
- [x] **Test W2.11** App loads when started offline (cached shell)

---

## Definition of Done (M1)

- [x] Volunteer can register with email/password and role selection
- [x] Volunteer sees pending state until approved
- [x] Approved volunteer can log in and access report form
- [x] Report form shows WHO-aligned case definitions
- [x] Volunteer can submit report online
- [x] Volunteer can submit report offline and it syncs on reconnect
- [x] Volunteer can see their submitted reports with status
- [x] App shell loads when offline
- [x] Code committed to GitHub
- [x] Emulator-based dev workflow documented

---

## Notes

- If offline sync causes issues, prioritize getting it working over form polish
- Don't worry about perfect UI—functional > pretty for M1
- Dalia input needed: Verify case definitions match WHO standards before M2
