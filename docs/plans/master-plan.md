# Saha-Care Master Plan

## Overview

Community-based disease surveillance PWA for conflict zones (Gaza Strip). Offline-first web app with role-based views + outbreak dashboard.

**Project Context:** Solo developer using AI agents, class project (CS 584), ~7.5 weeks in 4 sprints (~13 days each). Single offline-first PWA for disease surveillance — one app serves all roles (volunteer, supervisor, official).

**Budget:** $50 Google Cloud credits + free tiers

---

## Tech Stack

### React PWA (Progressive Web App)

| Component | Choice |
|-----------|--------|
| Framework | React (with Vite for fast builds) |
| Language | TypeScript |
| UI Library | Material UI (MUI) |
| Charts | Recharts |
| Maps | Leaflet + OpenStreetMap |
| State | React Context + Firestore onSnapshot listeners + local useState |
| Offline | Service Worker (Vite PWA plugin) + Firestore offline cache |
| Install | "Add to Home Screen" on Android Chrome — behaves like native app |

### Firebase

| Service | Role |
|---------|------|
| Firestore | NoSQL database, offline sync, real-time listeners, security rules |
| Firebase Auth | Email/password auth, custom claims for roles |
| Firebase Hosting | Free hosting with SSL and CDN |
| Cloud Functions | Server-side triggers: approval validation, alert detection, data aggregation |
| Cloud Storage | Attachments (optional, if needed) |

**Cloud Functions handle three server-side concerns:**
1. **Approval enforcement** (`onUserApproval`) — validates role escalation server-side, enforces region scoping
2. **Alert detection** (`onReportWrite`) — checks thresholds and creates alerts even when no dashboard is open
3. **Data aggregation** (`aggregateCases`) — pre-computes rollups so dashboards load fast on low-end devices

### Security & Encryption

| Layer | Approach |
|-------|----------|
| In transit | TLS (Firebase default) |
| At rest (server) | Firestore encryption (Google-managed) |
| At rest (device) | Browser storage — sensitive data stays in Firestore cache (encrypted by browser) |
| Access control | Firestore Security Rules + Auth custom claims per role |
| PII protection | Dashboard views show aggregated data; individual data restricted by role + region |

### DevOps

| Tool | Purpose |
|------|---------|
| GitHub | Source control |
| GitHub Actions | CI/CD: lint → test → build → deploy to Firebase Hosting |
| Firebase Emulator Suite | Local development (Firestore, Auth) |

### Cost Estimate

| Service | Cost |
|---------|------|
| Firebase Blaze (pay-as-you-go) | Free tier: 2M function invocations/month, 1 GB Firestore, 10 GB hosting |
| GitHub Actions | 2,000 min/month free |
| Leaflet + OpenStreetMap | Free |
| **Total** | $0 (within free tier at project scale) |

---

## Timeline & Milestones

**Start:** Feb 24, 2026 · **End:** Apr 14, 2026 · ~7 weeks / 4 sprints

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

## Sprint Overview

| Sprint | Dates | Goal | Details |
|--------|-------|------|---------|
| **Sprint 1** | Feb 24 – Mar 9 | Foundation & Core Reporting | [Sprint1-Foundation.md](Sprint1-Foundation.md) |
| **Sprint 2** | Mar 10 – Mar 23 | Location & Verification | [Sprint2-Verification.md](Sprint2-Verification.md) |
| **Sprint 3** | Mar 24 – Apr 6 | Dashboard & Maps | [Sprint3-Dashboard.md](Sprint3-Dashboard.md) |
| **Sprint 4** | Apr 7 – Apr 14 | Security & Polish | [Sprint4-Security.md](Sprint4-Security.md) |

---

## Core Features (5)

1. Authentication & Role-Based Access
2. Offline Case Reporting
3. Supervisor Verification Workflow
4. Dashboard & Maps (Officials + Supervisors)
5. Security Audit & CI/CD

---

## Testing Cadence

| Type | When |
|------|------|
| Unit tests | Continuous (written with features) |
| Internal testing day | End of each sprint (Mar 9, Mar 23, Apr 6, Apr 14) |
| Full E2E | Sprint 4 (Apr 10) |
| Final regression | Apr 11 |

---

## Future Phase (Out of Scope)

- In-app messaging (volunteer ↔ supervisor, Firestore-backed)
- SMS/USSD fallback via Twilio + Cloud Functions
- Native mobile app (Flutter or React Native)
- Push notifications via FCM
- Accessibility audit (ARIA, keyboard nav)
- Internationalization (Arabic)
