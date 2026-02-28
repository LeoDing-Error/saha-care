# Project Schedule

## Saha-Care — Week-by-Week Schedule (Revised)

**Start:** Feb 24, 2026 · **End:** Apr 14, 2026 · ~7 weeks / 4 sprints

---

## Milestones

| # | Date | Milestone | What's Demoable |
|---|------|-----------|-----------------|
| M1 | Mar 9 | App MVP | Offline case reporting with auth |
| M2 | Mar 23 | Supervisor Flow | Full verification workflow with location capture |
| M3 | Apr 6 | Dashboard Live | Charts, maps, filtering for officials + supervisors |
| M4 | Apr 14 | Security Hardened | CI/CD, security audit, polished, tested, demo-ready |

```mermaid
gantt
    title Saha-Care Schedule
    dateFormat YYYY-MM-DD
    axisFormat %b %d

    section Sprint 1
    Foundation & Core Reporting    :s1, 2026-02-24, 13d
    milestone M1: App MVP          :milestone, m1, 2026-03-09, 0d

    section Sprint 2
    Location & Verification        :s2, after s1, 14d
    milestone M2: Supervisor Flow  :milestone, m2, 2026-03-23, 0d

    section Sprint 3
    Dashboard & Maps               :s3, after s2, 14d
    milestone M3: Dashboard Live   :milestone, m3, 2026-04-06, 0d

    section Sprint 4
    Security & Polish              :s4, after s3, 8d
    milestone M4: Security Hardened :milestone, m4, 2026-04-14, 0d
```

---

## Sprint Breakdown

### Sprint 1 — Foundation & Core Reporting (Feb 24 – Mar 9)

**Goal:** Volunteer can register, log in, and submit offline case reports.

| Week | Dates | Focus |
|------|-------|-------|
| Week 1 | Feb 24–28 | Project setup, Firebase config, Firestore schema, PWA plugin, MUI theme, emulator suite |
| Week 2 | Mar 3–9 | Auth (login/register), case report form, offline persistence, service worker caching |

📋 **Details:** [Sprint1-Foundation.md](Sprint1-Foundation.md)

🏁 **M1 (Mar 9):** App MVP — Volunteer registers, logs in, submits reports offline, data syncs.

---

### Sprint 2 — Location & Verification (Mar 10 – Mar 23)

**Goal:** Supervisors can approve users and verify reports.

| Week | Dates | Focus |
|------|-------|-------|
| Week 3 | Mar 10–14 | GPS capture, manual location fallback, user approval flow (supervisor → volunteer, official → supervisor) |
| Week 4 | Mar 17–23 | Report verification workflow, status state machine, offline verification, status filters |

📋 **Details:** [Sprint2-Verification.md](Sprint2-Verification.md)

🏁 **M2 (Mar 23):** Supervisor Flow — Complete volunteer/supervisor interaction with verification.

---

### Sprint 3 — Dashboard & Maps (Mar 24 – Apr 6)

**Goal:** Officials see outbreak data on charts and maps.

| Week | Dates | Focus |
|------|-------|-------|
| Week 5 | Mar 24–28 | Recharts setup, dashboard layout, KPI cards, data aggregation queries, bar/line/pie charts |
| Week 6 | Mar 31 – Apr 6 | Leaflet map with markers + clustering, disease/status/date filters, role-based data scoping |

📋 **Details:** [Sprint3-Dashboard.md](Sprint3-Dashboard.md)

🏁 **M3 (Apr 6):** Dashboard Live — Officials and supervisors monitor outbreaks via charts and maps.

---

### Sprint 4 — Security & Polish (Apr 7 – Apr 14)

**Goal:** Production-ready, security audited, deployed.

⚠️ **Compressed 1-week sprint. Prioritize ruthlessly.**

| Day | Date | Focus |
|-----|------|-------|
| Mon | Apr 7 | Security audit — Firestore rules, unauthorized access testing, role scoping, PII audit |
| Tue | Apr 8 | CI/CD — GitHub Actions (lint → type-check → build → deploy), Firebase service account |
| Wed | Apr 9 | Deploy & polish — production config, loading/error/empty states, responsive audit, offline indicator |
| Thu | Apr 10 | Seed data & full regression — volunteer/supervisor/official flows, offline flows |
| Fri | Apr 11 | Buffer — P0/P1 bug fixes, README update, final deployment, demo accounts |

📋 **Details:** [Sprint4-Security.md](Sprint4-Security.md)

🏁 **M4 (Apr 14):** Security Hardened — Complete, tested, demo-ready product.

---

## Core Features (5)

1. Authentication & Role-Based Access
2. Offline Case Reporting
3. Supervisor Verification Workflow
4. Dashboard & Maps (Officials + Supervisors)
5. Security Audit & CI/CD

## Future Phase (Out of Scope)

- In-app messaging (volunteer ↔ supervisor, Firestore-backed)
- SMS/USSD fallback via Twilio + Cloud Functions
- Native mobile app (Flutter or React Native)
- Push notifications via FCM

---

## Testing Cadence

| Type | When |
|------|------|
| Unit tests | Continuous (written with features) |
| Internal testing day | End of each sprint (Mar 9, Mar 23, Apr 6, Apr 14) |
| Full E2E | Sprint 4 (Apr 10) |
| Final regression | Apr 11 |
