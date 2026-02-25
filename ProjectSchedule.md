Project Schedule

Review
Saha-Care — Week-by-Week Schedule (Revised)
Start: Feb 24, 2026 · End: Apr 16, 2026 · ~7.5 weeks / 4 sprints (~13 days each)

Milestones
#	Date	Milestone	What's Demoable
M1	Mar 8	App MVP	Offline case reporting with auth
M2	Mar 21	Supervisor Flow	Full verification workflow with maps
M3	Apr 3	Dashboard Live	Charts, maps, filtering for officials + supervisors
M4	Apr 16	Final Demo	Alerts, Cloud Functions, polished, tested, demo-ready

```mermaid
gantt
    title Saha-Care 7.5-Week Plan
    dateFormat YYYY-MM-DD
    axisFormat %b %d

    section Sprint 1
    Auth & Offline Reporting       :s1, 2026-02-24, 13d
    milestone M1: App MVP          :milestone, m1, 2026-03-08, 0d

    section Sprint 2
    Verification & Approval        :s2, after s1, 13d
    milestone M2: Supervisor Flow  :milestone, m2, 2026-03-21, 0d

    section Sprint 3
    Dashboard & Maps               :s3, after s2, 13d
    milestone M3: Dashboard Live   :milestone, m3, 2026-04-03, 0d

    section Sprint 4
    Alerts, Functions, Polish & Demo :s4, after s3, 13d
    milestone M4: Final Demo       :milestone, m4, 2026-04-16, 0d
```

Sprint 1 — Auth & Offline Reporting (Feb 24 – Mar 8)
Week 1 · Feb 24 – Feb 28
Day	Focus	Deliverable
Mon–Tue	Project Setup	Vite + React + TS scaffolded, PWA plugin configured, Firebase project created, Firestore Emulator running
Wed	Firestore Schema	Collections designed (users, reports, caseDefinitions), security rules deployed
Thu–Fri	Auth	Firebase Auth integrated, login/register screens, role selection, pending approval state, custom claims

Week 2 · Mar 1 – Mar 8
Day	Focus	Deliverable
Mon–Tue	Case Report Form	Multi-step form with WHO case definitions, disease selection, symptom checklist, temp, location
Wed	GPS + Location	GPS auto-capture on submit, manual location name fallback
Thu	Offline Support	Service worker caching, Firestore offline persistence enabled, reports sync on reconnect
Fri	Offline Testing	Test: create reports offline → reconnect → verify sync. Test: app loads offline
Sat–Sun	Buffer + Bug Fixes	Catch up on any incomplete items, bug fixes

🏁 M1 (Mar 8): App MVP — Volunteer registers, logs in, submits reports offline, data syncs.

Sprint 2 — Verification & Approval (Mar 9 – Mar 21)
Week 3 · Mar 9 – Mar 14
Day	Focus	Deliverable
Mon–Tue	User Approval Flow	Supervisor sees pending volunteers → approve/reject. Official approves supervisors
Wed–Thu	Verification Workflow	Supervisor review screen, pending reports list, verify/reject actions, status state machine
Fri	Map Integration	Supervisor sees report locations on Leaflet map for verification

Week 4 · Mar 15 – Mar 21
Day	Focus	Deliverable
Mon–Tue	Region Scoping	Supervisors see only their region's reports and users
Wed	Status Notifications	In-app notification badges for report status changes (pending → verified/rejected)
Thu	Integration Testing	Full volunteer → supervisor flow: submit → review → verify/reject
Fri	🧪 Internal Test	Bug fixes, edge cases (offline verify, role transitions)
Sat–Sun	Buffer + Bug Fixes	Catch up on any incomplete items

🏁 M2 (Mar 21): Supervisor Flow — Complete volunteer/supervisor interaction with verification.

Sprint 3 — Dashboard & Maps (Mar 22 – Apr 3)
Week 5 · Mar 22 – Mar 28
Day	Focus	Deliverable
Mon	Dashboard Layout	Official role view: KPI summary cards (total reports, active alerts, verified vs pending)
Tue–Wed	Charts	Recharts: case counts by disease (bar), trends over time (line), cases by region
Thu–Fri	Map View	Leaflet + OSM: report markers, clustering, color-coded by disease, click-to-drill-down

Week 6 · Mar 29 – Apr 3
Day	Focus	Deliverable
Mon	Supervisor Charts	Supervisor regional chart view (same chart components, scoped to their region)
Tue–Wed	Filtering	Filter by disease, date range, region, verification status. Drill-down from map clusters
Thu	Role Scoping	Officials see all regions; supervisors see their region. PII hidden at dashboard level
Fri	🧪 Internal Test	Dashboard with real data, filters, map interactions, role-based views. Bug fixes
Sat–Sun	Buffer + Bug Fixes	Catch up on any incomplete items

🏁 M3 (Apr 3): Dashboard Live — Officials and supervisors monitor outbreaks via charts and maps.

Sprint 4 — Alerts, Cloud Functions, Polish & Demo (Apr 4 – Apr 16)
Week 7 · Apr 4 – Apr 10
Day	Focus	Deliverable
Mon	Cloud Functions Setup	`functions/` directory, TypeScript config, Firebase emulator integration
Tue	onUserApproval	Deploy server-side approval validation function
Wed	onReportWrite	Deploy threshold detection + auto-create alerts function
Thu	aggregateCases	Deploy pre-computed rollups function, wire dashboard to aggregates collection
Fri	Alert UI	Alerts surface on dashboard, severity indicators, alert threshold config in caseDefinitions

Week 8 · Apr 11 – Apr 16
Day	Focus	Deliverable
Mon	Security Audit	Review all Firestore security rules, test unauthorized access, verify role scoping
Tue	UI Polish	Loading states, error handling, responsive design, empty states
Wed	Seed Data + Testing	Realistic demo dataset, full E2E regression of all user flows
Thu	Demo Prep	Demo script, walkthrough of all user flows
Fri	🧪 Final Test	Complete regression, verify all environments stable
Thu Apr 16	🎤 Demo Day	Ready to present

🏁 M4 (Apr 16): Final Demo — Complete, tested, demo-ready product with alerts and Cloud Functions.

Core Features (5)
1. Authentication & Role-Based Access
2. Offline Case Reporting
3. Supervisor Verification Workflow
4. Dashboard & Maps (Officials + Supervisors)
5. Alert System (Cloud Functions)

Future Phase (Out of Scope)
In-app messaging (volunteer ↔ supervisor, Firestore-backed)
SMS/USSD fallback via Twilio + Cloud Functions
Native mobile app (Flutter or React Native)
Push notifications via FCM

Testing Cadence
Type	When
Unit tests	Continuous (written with features)
Internal testing day	End of each sprint (Mar 8, Mar 21, Apr 3, Apr 16)
Full E2E	Week 8 (Sprint 4)
Final regression	Apr 15–16
