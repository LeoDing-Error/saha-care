Project Schedule

Review
Saha-Care — Week-by-Week Schedule (Revised)
Start: Feb 23, 2026 · End: May 3, 2026 · 10 weeks / 5 sprints

Milestones
#	Date	Milestone	What's Demoable
M1	Mar 8	App MVP	Offline case reporting with auth
M2	Mar 22	Supervisor Flow	Full verification workflow + messaging
M3	Apr 5	Dashboard Live	Charts, maps, filtering for officials
M4	Apr 19	Security Hardened	Audited rules, polished UI, CI/CD
M5	May 3	Final Demo	Complete, tested, documented
⚠️ Failed to render Mermaid diagram: Cannot read properties of undefined (reading 'type')
gantt
    title Saha-Care 10-Week Plan
    dateFormat YYYY-MM-DD
    axisFormat %b %d

    section Sprint 1
    Foundation & Reporting      :s1, 2026-02-23, 14d
    milestone M1: App MVP       :milestone, m1, 2026-03-08, 0d

    section Sprint 2
    Verification & Messaging    :s2, after s1, 14d
    milestone M2: Supervisor    :milestone, m2, 2026-03-22, 0d

    section Sprint 3
    Dashboard & Maps            :s3, after s2, 14d
    milestone M3: Dashboard     :milestone, m3, 2026-04-05, 0d

    section Sprint 4
    Alerts, Security & Polish   :s4, after s3, 14d
    milestone M4: Hardened      :milestone, m4, 2026-04-19, 0d

    section Sprint 5
    Testing & Demo              :s5, after s4, 14d
    milestone M5: Final Demo    :milestone, m5, 2026-05-03, 0d
Sprint 1 — Foundation & Core Reporting (Weeks 1–2)
Week 1 · Feb 23 – Mar 1
Day	Focus	Deliverable
Mon–Tue	Project Setup	Vite + React + TS scaffolded, PWA plugin configured, Firebase project created, Firestore Emulator running
Wed	Firestore Schema	Collections designed (users, reports, caseDefinitions), security rules deployed
Thu–Fri	Auth	Firebase Auth integrated, login/register screens, role selection, pending approval state, custom claims
Week 2 · Mar 2 – Mar 8
Day	Focus	Deliverable
Mon–Tue	Case Report Form	Multi-step form with WHO case definitions, disease selection, symptom checklist
Wed	Offline Support	Service worker caching, Firestore offline persistence enabled, reports sync on reconnect
Thu	Offline Testing	Test: create reports offline → reconnect → verify sync. Test: app loads offline
Fri	🧪 Internal Test	Full auth + reporting flow tested. Bug fixes
🏁 M1 (Mar 8): App MVP — Volunteer registers, logs in, submits reports offline, data syncs.

Sprint 2 — Location, Verification & Messaging (Weeks 3–4)
Week 3 · Mar 9 – Mar 15
Day	Focus	Deliverable
Mon	GPS + Location	Auto-capture on submit, manual fallback, location on report detail
Tue–Wed	User Approval	Supervisor sees pending volunteers → approve/reject. Official approves supervisors
Thu–Fri	Verification Workflow	Supervisor review screen, pending reports list, verify/reject/clarify actions, status state machine
Week 4 · Mar 16 – Mar 22
Day	Focus	Deliverable
Mon–Tue	Messaging	In-app chat (volunteer ↔ supervisor), Firestore-backed, offline message queue
Wed	Notifications	In-app notification badges for new reports, status changes, messages
Thu–Fri	🧪 Internal Test	Full volunteer → supervisor flow: submit → review → verify → discuss. Bug fixes
🏁 M2 (Mar 22): Supervisor Flow — Complete volunteer/supervisor interaction with messaging.

Sprint 3 — Dashboard & Maps (Weeks 5–6)
Week 5 · Mar 23 – Mar 29
Day	Focus	Deliverable
Mon	Dashboard Layout	Official role view: KPI summary cards (total reports, active alerts, verified vs pending)
Tue–Wed	Charts	Recharts: case counts by disease (bar), trends over time (line), cases by location
Thu–Fri	Map View	Leaflet + OSM: report markers, clustering, color-coded by disease, click-to-drill-down
Week 6 · Mar 30 – Apr 5
Day	Focus	Deliverable
Mon–Tue	Filtering	Filter by disease, date range, location, verification status. Drill-down from clusters
Wed	Role Scoping	Officials see all; supervisors see their region. PII hidden at dashboard level
Thu–Fri	🧪 Internal Test	Dashboard with real data, filters, map interactions, role-based views. Bug fixes
🏁 M3 (Apr 5): Dashboard Live — Officials monitor outbreaks via charts and maps.

Sprint 4 — Alerts, Security & Polish (Weeks 7–8)
Week 7 · Apr 6 – Apr 12
Day	Focus	Deliverable
Mon–Tue	Alert Thresholds	Client-side monitoring: flag when case counts exceed thresholds per disease/location
Wed	Security Audit	Review all Firestore security rules, test unauthorized access, verify role scoping
Thu–Fri	UI Polish	Consistent design, loading skeletons, error boundaries, empty states, responsive layout
Week 8 · Apr 13 – Apr 19
Day	Focus	Deliverable
Mon	Accessibility	Keyboard navigation, ARIA labels, color contrast
Tue	CI/CD	GitHub Actions: lint → test → build → deploy to Firebase Hosting
Wed	Deploy	Production deployment to Firebase Hosting
Thu–Fri	🧪 Internal Test	Full E2E: volunteer submits → supervisor verifies → dashboard updates → alert fires. Security tests
🏁 M4 (Apr 19): Security Hardened — All features working, audited, deployed.

Sprint 5 — Testing, Docs & Demo (Weeks 9–10)
Week 9 · Apr 20 – Apr 26
Day	Focus	Deliverable
Mon	Seed Data	Realistic demo dataset: multiple diseases, locations, time-series, various statuses
Tue–Wed	Documentation	README, architecture diagram, setup guide, user guide
Thu–Fri	Regression Testing	Full regression of all features, fix remaining bugs
Week 10 · Apr 27 – May 3
Day	Focus	Deliverable
Mon–Tue	Demo Script	Written walkthrough of all user flows, slides/talking points
Wed	🧪 Final Regression	Complete regression, verify all environments stable
Thu	Demo Rehearsal	Practice full demo end-to-end
Fri	🎤 Demo Day	Ready to present
🏁 M5 (May 3): Final Demo — Complete, tested, documented, demo-rehearsed.

Testing Cadence
Type	When
Unit tests	Continuous (written with features)
Internal testing day	Friday of Weeks 2, 4, 6, 8
Full E2E	Week 8 (Sprint 4)
Final regression	Weeks 9–10