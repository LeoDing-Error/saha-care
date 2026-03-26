# SAHA-Care

**Community-Based Disease Surveillance PWA for Conflict-Affected Regions**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: In Development](https://img.shields.io/badge/Status-In%20Development-orange)](https://github.com/)
[![Platform: PWA](https://img.shields.io/badge/Platform-PWA-green)](https://web.dev/progressive-web-apps/)
[![Backend: Firebase](https://img.shields.io/badge/Backend-Firebase-blue)](https://firebase.google.com/)

> Main Project Page: *[SAHA-Care](https://leoding-error.github.io/saha-care/)*

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
- **Standardized case definitions** -- WHO-aligned symptom checklists for priority diseases with an in-app guide and quick-report actions
- **Role-based access** -- Volunteer (reporting, messages, guide, notifications), Supervisor (verification, approval, maps, regional charts), Official (dashboard, alerts, approve supervisors)
- **Supervisor verification** -- Review reports, verify/reject, view locations on map, approve volunteers
- **Dashboard & maps** -- KPI cards, Recharts charts (disease trends, case counts), Leaflet map with heatmap layers and clustered markers
- **Automated alerts** -- Cloud Functions detect when case counts exceed thresholds per disease/region
- **In-app messaging** -- Volunteer↔Supervisor conversations linked to reports with real-time updates
- **Notifications** -- Real-time notification system for approvals, new messages, and outbreak alerts
- **Self-registration with approval** -- Users register and enter a pending state until approved by a higher role
- **Profile management** -- User profile page with role and region information
- **Installable PWA** -- "Add to Home Screen" on Android Chrome, behaves like a native app

---

## Architecture

```
React PWA ──> Firestore (offline cache <-> auto-sync) ──> Firestore DB
                                                              |
                                                       Cloud Functions
                                                       (onWrite triggers)
                                                              |
                                                       +-----------------+
                                                       |  alerts         |
                                                       |  aggregates     |
                                                       |  users          |
                                                       |  notifications  |
                                                       +-----------------+
Firebase Hosting ──> serves PWA (CDN + SSL)
```

See [`docs/architecture.mmd`](docs/architecture.mmd) for the full Mermaid diagram.

**Tech Stack:**

| Layer | Technology |
|---|---|
| Framework | React + Vite + TypeScript (PWA) |
| UI | shadcn/ui + Tailwind CSS |
| Maps | Leaflet + OpenStreetMap |
| Charts | Recharts |
| State | React Context + Firestore `onSnapshot` listeners + local `useState` |
| Database | Firestore (NoSQL, offline sync, real-time, security rules) |
| Auth | Firebase Auth (email/password, custom claims for roles) |
| Server-side | Cloud Functions (Node.js/TypeScript) -- 6 Firestore-triggered functions |
| Hosting | Firebase Hosting (CDN + SSL) |
| Offline | Firestore offline cache + Vite PWA plugin (service worker) |
| CI/CD | GitHub Actions -> Firebase Hosting |

---

## User Roles

| Role | Access | Approval |
|---|---|---|
| **Volunteer** | Submit reports, messages, guide, notifications | Approved by supervisor |
| **Supervisor** | Review/verify reports, approve volunteers, messages, maps, regional charts | Approved by official |
| **Official** | Dashboard, aggregated data, maps, charts, approve supervisors | Pre-provisioned |

---

## Cloud Functions

Server-side logic triggered by Firestore writes -- no HTTP endpoints needed.

| Function | Trigger | Purpose |
|---|---|---|
| `onUserApproval` | `users/{uid}` onUpdate | Validates role escalation, enforces region scoping, prevents unauthorized approval |
| `onReportWrite` | `reports/{id}` onCreate | Checks thresholds per disease/region, auto-creates alerts |
| `aggregateCases` | `reports/{id}` onWrite | Maintains pre-computed rollups in `aggregates` collection for dashboard performance |
| `onAlertCreate` | `alerts/{id}` onCreate | Handles new alert creation side effects |
| `onMessageCreate` | `conversations/{id}/messages/{msgId}` onCreate | Creates notification for recipient when a new message is sent |
| `notifications` | (helper) | Shared notification utilities used by other functions |

---

## Data Model

See [`docs/erd.mmd`](docs/erd.mmd) for the full Mermaid ERD.

**Firestore Collections:**

- `users` -- uid, email, displayName, role, status (pending/approved), supervisorId, region
- `reports` -- disease, symptoms, temp, location (lat/lng + name), status (pending/verified/rejected), reporterId, verifiedBy
- `caseDefinitions` -- disease, symptoms (JSON), dangerSigns, guidance, active flag
- `alerts` -- disease, region, caseCount, threshold, severity, status
- `conversations` -- reportId, reportDisease, reportDate, volunteerId, supervisorId, participantIds, region, lastMessage, lastMessageAt, unreadCounts
  - `messages` (subcollection) -- senderId, senderName, senderRole, text, sentAt, read
- `notifications` -- userId, type, title, body, read, createdAt, metadata
- `aggregates` -- disease, region, period (day/week), caseCount, verifiedCount, lastUpdated

---

## Local Development

### Prerequisites

- Node.js 18+
- Firebase CLI (`npm install -g firebase-tools`)
- Java 11+ (required for Firebase emulators)

### Running with Emulators

Start both the Vite dev server and Firebase emulators:

```bash
npm install              # Install dependencies (including concurrently)
npm run dev:emulators    # Start Vite + Firebase emulators concurrently
```

Or run them separately:

```bash
npm run emulators        # Start Firebase emulators only
npm run dev              # Start Vite dev server only (in another terminal)
```

### Emulator Ports

| Service | Port |
|---------|------|
| Firestore | 8080 |
| Auth | 9099 |
| Hosting | 5000 |
| Emulator UI | 4000 |

Access the Emulator UI at [http://localhost:4000](http://localhost:4000) to view/manage emulator data.

The app automatically connects to emulators when running on `localhost` in development mode.

---

## Repository Structure

```
minnetonka/
├── src/
│   ├── components/
│   │   ├── charts/           # AlertsPanel, CasesByDiseaseChart, CasesOverTimeChart, ChartWrapper, DashboardFilters, KPICards
│   │   ├── maps/             # ReportMap, DiseaseMarker, HeatmapLayer, HeatmapLegend, LocationPickerMap, MapLegend, leafletSetup
│   │   ├── reports/          # AlertReportsList, ReportDetailDialog
│   │   ├── ui/               # shadcn/ui primitives (button, card, dialog, form, table, tabs, etc.)
│   │   ├── Header.tsx        # App header bar
│   │   ├── RootLayout.tsx    # Root layout wrapper
│   │   └── Sidebar.tsx       # Navigation sidebar
│   ├── constants/            # index, regions, roles
│   ├── contexts/             # AuthContext, DashboardContext, NotificationContext (+ __tests__/)
│   ├── hooks/                # useCaseDefinitions, useDashboard, useOfflineStatus
│   ├── pages/
│   │   ├── auth/             # LoginPage, SignupPage
│   │   ├── DashboardPage.tsx
│   │   ├── GuidePage.tsx     # Case definition guide with report-case actions
│   │   ├── MessagesPage.tsx  # Conversation list + chat interface
│   │   ├── NotFoundPage.tsx
│   │   ├── NotificationsPage.tsx
│   │   ├── ProfilePage.tsx
│   │   ├── ReportFormPage.tsx
│   │   ├── ReportsPage.tsx
│   │   ├── VolunteersPage.tsx
│   │   └── __tests__/
│   ├── router/               # AppRouter, ProtectedRoute, RoleGuard (+ __tests__/)
│   ├── services/             # firebase, auth, reports, users, dashboard, conversations, notifications (+ __tests__/)
│   ├── test/                 # Test setup + mocks (firebase mock)
│   ├── types/                # user, report, alert, caseDefinition, conversation, notification, index
│   ├── utils/                # location, formatTime, regionDetection, urgency (+ __tests__/)
│   ├── App.tsx
│   └── main.tsx
├── functions/                # Cloud Functions
│   ├── src/
│   │   ├── onUserApproval.ts
│   │   ├── onReportWrite.ts
│   │   ├── aggregateCases.ts
│   │   ├── onAlertCreate.ts
│   │   ├── onMessageCreate.ts
│   │   ├── notifications.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── docs/                     # Documentation + GitHub Pages Landing Site
│   ├── FIREBASE_SETUP.md
│   ├── MANUAL_TESTS.md
│   ├── firestore-schema.md
│   ├── plans/                # Sprint & planning docs
│   ├── diagrams/             # Mermaid diagrams (architecture.mmd, erd.mmd)
│   ├── index.html            # Landing page HTML
│   ├── style.css             # Landing page styles
│   └── main.js               # Landing page script
├── public/                   # PWA icons (favicon, apple-touch, pwa-192/512, mask-icon)
├── scripts/                  # seedCaseDefinitions, seedReports, seedGazaCityAlerts, generateIcons
├── .github/workflows/        # deploy.yml — CI/CD pipeline
├── firestore.rules
├── firestore.indexes.json
├── firebase.json
├── vite.config.ts            # PWA plugin config
└── vitest.config.ts          # Test config
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
