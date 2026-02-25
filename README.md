# SAHA-Care

**Community-Based Disease Surveillance PWA for Conflict-Affected Regions**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: In Development](https://img.shields.io/badge/Status-In%20Development-orange)](https://github.com/)
[![Platform: PWA](https://img.shields.io/badge/Platform-PWA-green)](https://web.dev/progressive-web-apps/)
[![Backend: Firebase](https://img.shields.io/badge/Backend-Firebase-blue)](https://firebase.google.com/)

> *Surveillance infrastructure that works when everything else doesn't.*

---

## Overview

SAHA-Care is an **offline-first, community-based disease surveillance (CBS)** progressive web app designed for infectious disease detection and reporting in conflict-affected, resource-constrained environments. Its initial implementation context is the **Gaza Strip**, where existing health surveillance infrastructure has collapsed under ongoing conflict and displacement.

The app enables community health workers (CHWs) and displaced individuals to report standardized case definitions even during **connectivity blackouts**. Reports are stored locally via Firestore's offline cache and automatically sync when connectivity resumes. Verified data is aggregated into dashboards with maps, charts, and automated outbreak alerts.

One app serves three roles: **Volunteers** submit reports, **Supervisors** verify and approve, **Officials** monitor outbreaks via dashboards.

---

## The Problem

| Challenge | Impact |
|---|---|
| Conflict-driven infrastructure collapse | Surveillance systems go dark precisely when they're needed most |
| Mass displacement | Hard-to-reach populations are invisible to traditional systems |
| Connectivity blackouts | Internet-dependent apps fail in the field |
| Fragmented reporting | No standardized case definitions across actors |
| Community distrust | Top-down systems exclude local knowledge and agency |

---

## Core Features

- **Offline-first data collection** -- Firestore offline cache + service worker. Reports created offline sync automatically on reconnect.
- **Standardized case definitions** -- WHO-aligned symptom checklists for priority diseases
- **Role-based access** -- Volunteer (reporting), Supervisor (verification + maps), Official (dashboard + alerts)
- **Supervisor verification** -- Review reports, verify/reject, view locations on map, approve volunteers
- **Dashboard & maps** -- KPI cards, Recharts charts (disease trends, case counts), Leaflet map with clustered markers
- **Automated alerts** -- Cloud Functions detect when case counts exceed thresholds per disease/region
- **Self-registration with approval** -- Users register and enter a pending state until approved by a higher role
- **Installable PWA** -- "Add to Home Screen" on Android Chrome, behaves like a native app

---

## Architecture

```
React PWA ──> Firestore (offline cache <-> auto-sync) ──> Firestore DB
                                                              |
                                                       Cloud Functions
                                                       (onWrite triggers)
                                                              |
                                                       +--------------+
                                                       |  alerts      |
                                                       |  aggregates  |
                                                       |  users       |
                                                       +--------------+
Firebase Hosting ──> serves PWA (CDN + SSL)
```

See [`docs/architecture.mmd`](docs/architecture.mmd) for the full Mermaid diagram.

**Tech Stack:**

| Layer | Technology |
|---|---|
| Framework | React + Vite + TypeScript (PWA) |
| UI | Material UI (MUI) |
| Maps | Leaflet + OpenStreetMap |
| Charts | Recharts |
| State | React Context + Firestore `onSnapshot` listeners |
| Database | Firestore (NoSQL, offline sync, real-time, security rules) |
| Auth | Firebase Auth (email/password, custom claims for roles) |
| Server-side | Cloud Functions (Node.js/TypeScript) -- 3 Firestore-triggered functions |
| Hosting | Firebase Hosting (CDN + SSL) |
| Offline | Firestore offline cache + Vite PWA plugin (service worker) |
| CI/CD | GitHub Actions -> Firebase Hosting |

---

## User Roles

| Role | Access | Approval |
|---|---|---|
| **Volunteer** | Submit reports | Approved by supervisor |
| **Supervisor** | Review/verify reports, approve volunteers, maps, regional charts | Approved by official |
| **Official** | Dashboard, aggregated data, maps, charts, approve supervisors | Pre-provisioned |

---

## Cloud Functions

Server-side logic triggered by Firestore writes -- no HTTP endpoints needed.

| Function | Trigger | Purpose |
|---|---|---|
| `onUserApproval` | `users/{uid}` onUpdate | Validates role escalation, enforces region scoping |
| `onReportWrite` | `reports/{id}` onCreate | Checks thresholds per disease/region, auto-creates alerts |
| `aggregateCases` | `reports/{id}` onWrite | Maintains pre-computed rollups for dashboard performance |

---

## Data Model

See [`docs/erd.mmd`](docs/erd.mmd) for the full Mermaid ERD.

**Firestore Collections:**

- `users` -- uid, email, displayName, role, status, supervisorId, region
- `reports` -- disease, symptoms, temp, location, status, reporterId, verifiedBy
- `caseDefinitions` -- disease, symptoms, dangerSigns, guidance, threshold
- `alerts` -- disease, region, caseCount, threshold, severity, status
- `aggregates` -- disease, region, period, caseCount, verifiedCount, lastUpdated

---

## Repository Structure

```
saha-care/
├── src/                      # React PWA source
│   ├── components/           # Shared UI components
│   ├── pages/
│   │   ├── auth/             # Login, Register
│   │   ├── volunteer/        # Report form, report list
│   │   ├── supervisor/       # Verification, approval
│   │   └── dashboard/        # Charts, maps, filtering
│   ├── services/             # Firebase config, auth, firestore helpers
│   ├── contexts/             # React Context providers (AuthContext)
│   ├── hooks/                # Custom hooks (useReports, useAlerts, etc.)
│   ├── types/                # TypeScript interfaces
│   ├── App.tsx
│   └── main.tsx
├── functions/                # Cloud Functions
│   ├── src/
│   │   ├── onUserApproval.ts
│   │   ├── onReportWrite.ts
│   │   ├── aggregateCases.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── docs/                     # Architecture & ERD diagrams (Mermaid)
├── public/                   # PWA manifest, icons
├── firestore.rules
├── firebase.json
└── vite.config.ts            # PWA plugin config
```

---

## Ethical Considerations

Working in conflict-affected zones introduces significant ethical responsibilities:

- **Data minimization** -- Collect only what is necessary for epidemiological surveillance
- **Conflict-sensitive design** -- Avoid data collection that could endanger reporters or communities
- **Community trust** -- Co-design and community validation are central to the implementation framework
- **No-harm principle** -- Compliance with ICRC data protection standards for humanitarian contexts

---

## Team

| Name | Role | Program |
|---|---|---|
| **Leo** | Software Engineering, Technical Architecture, Firebase Deployment | CS Graduate Student, Emory University |
| **Dalia** | Public Health Framing, Literature Review, Health Domain Expertise | Public Health Graduate Student, Rollins School of Public Health |

---

## License

This project is open-source under the [MIT License](LICENSE). We encourage adaptation for other humanitarian and crisis contexts.

---

*SAHA-Care | Emory University | Spring 2026*
