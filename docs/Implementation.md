Implementation Plan

Review
Saha-Care — Tech Stack (Revised)
Project Context
Solo developer using AI agents, class project (CS 584), ~7.5 weeks in 4 sprints (~13 days each). Single offline-first PWA for disease surveillance in conflict zones — one app serves all roles (volunteer, supervisor, official). SMS and in-app messaging are documented as future phases.

Budget: $50 Google Cloud credits + free tiers

Recommended Stack
React PWA (Progressive Web App)
Component	Choice
Framework	React (with Vite for fast builds)
Language	TypeScript
UI Library	Material UI (MUI)
Charts	Recharts
Maps	Leaflet + OpenStreetMap
State	React Context + Firestore onSnapshot listeners + local useState
Offline	Service Worker (Vite PWA plugin) + Firestore offline cache
Install	"Add to Home Screen" on Android Chrome — behaves like native app
TIP

One codebase, one language, one deployment. Role-based routing shows different views per user role.

Firebase
Service	Role
Firestore	NoSQL database, offline sync, real-time listeners, security rules
Firebase Auth	Email/password auth, custom claims for roles
Firebase Hosting	Free hosting with SSL and CDN
Cloud Functions	Server-side triggers: approval validation, alert detection, data aggregation (3 functions)
Cloud Storage	Attachments (optional, if needed)
NOTE

Cloud Functions handle three server-side concerns that can't be reliably done client-side:
1. **Approval enforcement** (`onUserApproval`) — validates role escalation server-side, enforces region scoping (security)
2. **Alert detection** (`onReportWrite`) — checks thresholds and creates alerts even when no dashboard is open (reliability)
3. **Data aggregation** (`aggregateCases`) — pre-computes rollups so dashboards load fast on low-end devices (performance)

Security & Encryption
Layer	Approach
In transit	TLS (Firebase default)
At rest (server)	Firestore encryption (Google-managed)
At rest (device)	Browser storage — sensitive data stays in Firestore cache (encrypted by browser)
Access control	Firestore Security Rules + Auth custom claims per role
PII protection	Dashboard views show aggregated data; individual data restricted by role + region
DevOps
Tool	Purpose
GitHub	Source control
GitHub Actions	CI/CD: lint → test → build → deploy to Firebase Hosting
Firebase Emulator Suite	Local development (Firestore, Auth)
Cost Estimate
Service	Cost
Firebase Blaze (pay-as-you-go)	Firestore, Auth, Hosting, Cloud Functions — free tier includes 2M function invocations/month, 1 GB Firestore, 10 GB hosting
GitHub Actions	2,000 min/month free
Leaflet + OpenStreetMap	Free
Total	$0 (within free tier at project scale)
Sprint Roadmap — 7.5 Weeks / 4 Sprints (Feb 24 – Apr 16)
Sprint 1 — Auth & Offline Reporting (Feb 24 – Mar 8)
Goal: Volunteer can register, log in, and submit offline case reports.

React + Vite + TypeScript project scaffold with PWA plugin
Firebase project setup (Firestore, Auth, Hosting)
Firestore schema + security rules
Auth: email/password, role selection, pending approval state, custom claims
Case report form (disease, symptoms, temp, location) with WHO-aligned case definitions
GPS auto-capture + manual location fallback
Offline persistence via Firestore cache + service worker
Sprint 2 — Verification & Approval (Mar 9 – Mar 21)
Goal: Supervisors review and verify reports; approval hierarchy works.

User approval flow (supervisors approve volunteers, officials approve supervisors)
Supervisor report review screen with map view (Leaflet)
Verification actions: verify / reject (status state machine)
Region-scoped views (supervisors see only their region)
In-app notification badges for report status changes
Sprint 3 — Dashboard & Maps (Mar 22 – Apr 3)
Goal: Officials and supervisors monitor outbreaks via charts and maps.

Official dashboard: KPI cards, Recharts charts (case counts by disease, trends over time)
Supervisor regional chart view
Leaflet map: report markers, clustering, color-coded by disease, click-to-drill-down
Filtering: disease, date range, region, verification status
Role-based scoping (official = all regions, supervisor = their region)
Sprint 4 — Alerts, Cloud Functions, Polish & Demo (Apr 4 – Apr 16)
Goal: Server-side logic, alert system, security audit, demo-ready product.

Cloud Functions setup: `functions/` directory, TypeScript config, deploy pipeline
Deploy `onUserApproval`: server-side approval validation
Deploy `onReportWrite`: threshold detection, auto-create `alerts` documents
Deploy `aggregateCases`: pre-computed rollups in `aggregates` collection for dashboard
Alert threshold configuration (disease/region thresholds in `caseDefinitions`)
Alerts surface on dashboard
Firestore security rules audit
UI polish: loading states, error handling, responsive design
Seed data for realistic demo
Testing + demo preparation
Future Phase (Out of Scope)
In-app messaging (volunteer ↔ supervisor, Firestore-backed)
SMS/USSD fallback via Twilio + Cloud Functions
Native mobile app (Flutter or React Native)
Push notifications via FCM