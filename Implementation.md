Implementation Plan

Review
Saha-Care — Tech Stack (Revised)
Project Context
Solo developer using AI agents, class project (CS 584), 10 weeks in 2-week sprints. Single offline-first PWA for disease surveillance in conflict zones — one app serves all roles (volunteer, supervisor, official). SMS is documented as a future phase.

Budget: $50 Google Cloud credits + free tiers

Recommended Stack
React PWA (Progressive Web App)
Component	Choice
Framework	React (with Vite for fast builds)
Language	TypeScript
UI Library	Material UI (MUI)
Charts	Recharts
Maps	Leaflet + OpenStreetMap
State	Zustand (lightweight)
Offline	Service Worker (Vite PWA plugin) + Firestore offline cache
Install	"Add to Home Screen" on Android Chrome — behaves like native app
TIP

One codebase, one language, one deployment. Role-based routing shows different views per user role.

Firebase
Service	Role
Firestore	NoSQL database, offline sync, real-time listeners, security rules
Firebase Auth	Email/password auth, custom claims for roles
Firebase Hosting	Free hosting with SSL and CDN
Cloud Storage	Attachments (optional, if needed)
NOTE

No Cloud Functions needed for the simplified stack. Alert logic can be handled via Firestore onSnapshot listeners client-side or added later as a Cloud Function if needed.

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
Firebase Spark (free)	1 GB Firestore, 10 GB hosting, 50K reads/day
GitHub Actions	2,000 min/month free
Leaflet + OpenStreetMap	Free
Total	$0
Sprint Roadmap — 10 Weeks / 5 Sprints
Sprint 1 — Foundation & Core Reporting (Weeks 1–2)
Goal: Volunteer can register, log in, and submit offline case reports.

React + Vite + TypeScript project scaffold with PWA plugin
Firebase project (Firestore, Auth, Hosting)
Firestore schema + security rules
Auth: email/password, role selection, pending approval state
Case report form with WHO-aligned case definitions
Offline persistence via Firestore cache + service worker
Sprint 2 — Location, Verification & Messaging (Weeks 3–4)
Goal: Supervisors review reports; messaging works offline.

GPS auto-capture + manual location fallback
User approval flow (supervisors approve volunteers, officials approve supervisors)
Supervisor verification workflow (pending → verified/rejected/clarification)
In-app messaging (Firestore-backed, offline-capable)
Sprint 3 — Dashboard & Maps (Weeks 5–6)
Goal: Officials see outbreak data on charts and maps.

Dashboard view: KPI cards, Recharts charts (disease counts, trends)
Leaflet map: report markers, clustering, color-coded by disease
Filtering: disease, date range, location, status
Role-based view scoping
Sprint 4 — Alerts, Polish & Security (Weeks 7–8)
Goal: Alert thresholds, security audit, UI polish.

Client-side alert detection (threshold monitoring via Firestore queries)
Firestore security rules audit
UI polish: loading states, error handling, responsive design, accessibility
CI/CD pipeline via GitHub Actions
Sprint 5 — Testing, Docs & Demo (Weeks 9–10)
Goal: Demo-ready product.

End-to-end testing of all user flows
Seed data for realistic demo
Documentation (README, architecture, setup guide)
Demo preparation and rehearsal
Future Phase (Out of Scope)
SMS/USSD fallback via Twilio + Cloud Functions
Native mobile app (Flutter or React Native)
Push notifications via FCM
Cloud Functions for server-side alert triggers