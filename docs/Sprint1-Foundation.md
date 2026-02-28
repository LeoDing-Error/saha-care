# Sprint 1 — Foundation & Core Reporting

**Dates:** Feb 24 – Mar 9, 2026  
**Goal:** Volunteer can register, log in, and submit offline case reports.  
**Milestone:** M1 (Mar 9) — App MVP

---

## Week 1: Project Setup (Feb 24–28)

### Tasks

- [ ] **T1.1** Initialize Vite + React + TypeScript project
  - `npm create vite@latest saha-care -- --template react-ts`
  - Verify dev server runs

- [ ] **T1.2** Configure PWA plugin
  - Install `vite-plugin-pwa`
  - Add basic manifest.json (app name, icons, theme color)
  - Verify "Add to Home Screen" prompt works on Chrome Android

- [ ] **T1.3** Set up Material UI
  - Install MUI core + icons
  - Create theme with project colors
  - Add basic AppBar shell component

- [ ] **T1.4** Create Firebase project
  - Create project in Firebase Console
  - Enable Firestore (start in test mode, lock down in Sprint 4)
  - Enable Authentication (email/password provider)
  - Add Firebase config to app (`src/services/firebase.ts`)

- [ ] **T1.5** Set up Firebase Emulator Suite
  - Install Firebase CLI
  - Initialize emulators (Firestore, Auth)
  - Add npm scripts: `npm run emulators`, `npm run dev:emulators`
  - Document local dev workflow in README

- [ ] **T1.6** Design Firestore collections
  - Create `src/types/` with TypeScript interfaces:
    - `User` (uid, email, displayName, role, status, supervisorId, region)
    - `Report` (disease, symptoms, temp, location, status, reporterId, verifiedBy, createdAt)
    - `CaseDefinition` (disease, symptoms, dangerSigns, guidance, active)
  - Document schema in `docs/firestore-schema.md`

- [ ] **T1.7** Draft initial security rules
  - Create `firestore.rules` with basic role-based access
  - Users can only read/write their own user doc
  - Reports writeable by volunteers, readable by supervisors in same region
  - Deploy to emulator for testing

- [ ] **T1.8** Set up Zustand store structure
  - Install Zustand
  - Create `src/stores/authStore.ts` (user state, loading, error)
  - Create `src/stores/reportStore.ts` (reports list, current report)

### Tests (Week 1)

- [ ] **Test W1.1** Dev server starts without errors
- [ ] **Test W1.2** PWA manifest loads (check Chrome DevTools > Application)
- [ ] **Test W1.3** Firebase emulators start and connect
- [ ] **Test W1.4** Can write/read test doc to Firestore emulator
- [ ] **Test W1.5** MUI theme applies correctly

---

## Week 2: Auth & Reporting (Mar 3–9)

### Tasks

- [ ] **T2.1** Build Login page
  - Email/password form with validation
  - Firebase Auth `signInWithEmailAndPassword`
  - Error handling (wrong password, user not found)
  - Redirect to role-appropriate home on success

- [ ] **T2.2** Build Register page
  - Email/password/confirm password form
  - Role selection (Volunteer, Supervisor, Official)
  - Firebase Auth `createUserWithEmailAndPassword`
  - Create user doc in Firestore with `status: 'pending'`

- [ ] **T2.3** Implement auth state listener
  - `onAuthStateChanged` in authStore
  - Fetch user doc from Firestore on auth
  - Handle pending approval state (show "awaiting approval" message)

- [ ] **T2.4** Build protected route wrapper
  - Redirect to login if not authenticated
  - Redirect to pending page if status !== 'approved'
  - Role-based route guards

- [ ] **T2.5** Seed case definitions
  - Create `scripts/seedCaseDefinitions.ts`
  - Add 3-5 priority diseases (acute watery diarrhea, measles, acute respiratory infection, suspected cholera, jaundice)
  - WHO-aligned symptom checklists
  - Run against emulator

- [ ] **T2.6** Build case report form
  - Multi-step form or single scrollable form
  - Disease selection dropdown (from caseDefinitions)
  - Dynamic symptom checklist based on selected disease
  - Temperature input (optional)
  - Patient age/sex (no PII names)
  - Submit button

- [ ] **T2.7** Implement report submission
  - Write to Firestore `reports` collection
  - Include reporterId, timestamp, status: 'pending'
  - Show success feedback
  - Clear form on success

- [ ] **T2.8** Enable Firestore offline persistence
  - Call `enableIndexedDbPersistence()` on init
  - Handle multi-tab errors gracefully
  - Verify writes queue when offline

- [ ] **T2.9** Configure service worker caching
  - PWA plugin workbox config for app shell caching
  - Cache static assets, fonts, MUI
  - Test offline app load

- [ ] **T2.10** Build volunteer home/report list
  - Show user's submitted reports
  - Display status badge (pending, verified, rejected)
  - Pull-to-refresh or auto-update via Firestore listener

### Tests (Week 2)

- [ ] **Test W2.1** Can register new volunteer account
- [ ] **Test W2.2** New user shows status 'pending' in Firestore
- [ ] **Test W2.3** Can log in with registered account
- [ ] **Test W2.4** Pending user sees "awaiting approval" state
- [ ] **Test W2.5** (Manual) Approve user in Firestore, verify they can access app
- [ ] **Test W2.6** Case definitions load in report form
- [ ] **Test W2.7** Symptom checklist updates when disease changes
- [ ] **Test W2.8** Can submit report and see it in Firestore
- [ ] **Test W2.9** Report appears in volunteer's report list
- [ ] **Test W2.10** **CRITICAL: Offline submission test**
  - Disable network in DevTools
  - Submit report
  - Verify no error shown to user
  - Re-enable network
  - Verify report syncs to Firestore
- [ ] **Test W2.11** App loads when started offline (cached shell)

---

## Definition of Done (M1)

- [ ] Volunteer can register with email/password and role selection
- [ ] Volunteer sees pending state until approved
- [ ] Approved volunteer can log in and access report form
- [ ] Report form shows WHO-aligned case definitions
- [ ] Volunteer can submit report online
- [ ] Volunteer can submit report offline and it syncs on reconnect
- [ ] Volunteer can see their submitted reports with status
- [ ] App shell loads when offline
- [ ] Code committed to GitHub
- [ ] Emulator-based dev workflow documented

---

## Notes

- If offline sync causes issues, prioritize getting it working over form polish
- Don't worry about perfect UI—functional > pretty for M1
- Dalia input needed: Verify case definitions match WHO standards before M2
