# Saha-Care

Community-based disease surveillance PWA for conflict zones (Gaza Strip). Offline-first web app with role-based views + outbreak dashboard.

## Tech Stack

- **App:** React + Vite + TypeScript (PWA with service worker)
- **UI:** shadcn/ui + Tailwind CSS + Leaflet + Recharts
- **BaaS:** Firebase (Firestore, Auth, Hosting, Cloud Functions)
- **Server-side:** Cloud Functions (Node.js/TypeScript) — approval enforcement, alert triggers, data aggregation, notifications
- **State:** React Context (AuthContext, DashboardContext, NotificationContext) + Firestore `onSnapshot` listeners + local `useState`
- **Offline:** Firestore offline cache + Vite PWA plugin (service worker)

## Architecture

```
React PWA ──► Firestore (offline cache ↔ auto-sync) ──► Firestore DB
                                                            │
                                                     Cloud Functions
                                                     (onWrite triggers)
                                                            │
                                                     ┌──────┴──────┐
                                                     │  alerts     │
                                                     │  aggregates │
                                                     │  users      │
                                                     │  notifications│
                                                     └─────────────┘
Firebase Hosting ──► serves PWA (CDN + SSL)
```

One app, three role-based views: Volunteer (reporting), Supervisor (verification), Official (dashboard).

## User Roles

| Role | Access | Approval |
|---|---|---|
| **Volunteer** | Submit reports, messages, guide, notifications | Approved by supervisor |
| **Supervisor** | Review/verify reports, approve volunteers, messages, maps, regional charts | Approved by official |
| **Official** | Dashboard, aggregated data, maps, charts, approve supervisors | Pre-provisioned |

Self-registration with approval — users enter `pending` state until approved by higher role.

## Cloud Functions

Server-side logic deployed as Firebase Cloud Functions (Node.js/TypeScript). Triggered by Firestore writes — no HTTP endpoints needed.

| Function | Trigger | Purpose |
|---|---|---|
| `onUserApproval` | `users/{uid}` onUpdate | Validates role escalation, enforces region scoping, prevents unauthorized approval |
| `onReportWrite` | `reports/{id}` onCreate | Checks case counts against thresholds per disease/region, auto-creates `alerts` documents |
| `aggregateCases` | `reports/{id}` onWrite | Maintains pre-computed rollup documents in `aggregates` collection for dashboard performance |
| `onAlertCreate` | `alerts/{id}` onCreate | Handles new alert creation side effects |
| `onMessageCreate` | `conversations/{id}/messages/{msgId}` onCreate | Creates notification for recipient when a new message is sent |
| `notifications` | (helper) | Shared notification utilities used by other functions |

## Firestore Collections

- `users` — uid, email, displayName, role, status (pending/approved), supervisorId, region
- `reports` — disease, symptoms, temp, location (lat/lng + name), status (pending/verified/rejected), reporterId, verifiedBy
- `caseDefinitions` — disease, symptoms (JSON), dangerSigns, guidance, active flag
- `alerts` — disease, region, caseCount, threshold, severity, status
- `conversations` — reportId, reportDisease, reportDate, volunteerId, volunteerName, supervisorId, supervisorName, participantIds, region, lastMessage, lastMessageAt, unreadCounts, createdAt
  - `messages` (subcollection) — senderId, senderName, senderRole, text, sentAt, read
- `notifications` — userId, type, title, body, read, createdAt, metadata
- `aggregates` — disease, region, period (day/week), caseCount, verifiedCount, lastUpdated (maintained by Cloud Function)

## Key Constraints

- **Offline-first:** Firestore offline cache + service worker. Reports created offline sync on reconnect.
- **Low-to-mid range Android:** Keep bundle small, minimal heavy animations, test on Chrome Android.
- **Data security:** Firestore security rules enforce role + region scoping. TLS everywhere.

## Project Structure

```
montpellier/
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

## Documentation

- **Firebase setup:** `docs/FIREBASE_SETUP.md` — Firebase configuration and setup guide
- **Manual tests:** `docs/MANUAL_TESTS.md` — manual testing procedures
- **Firestore schema:** `docs/firestore-schema.md` — Firestore collection schema reference
- **Master plan:** `docs/plans/master-plan.md` — overall project plan
- **Sprint details:** `docs/plans/Sprint1-Foundation.md` through `docs/plans/Sprint4-Security.md` — day-by-day tasks, tests, and definition of done per sprint

## Dev Environment

- **Local testing:** Firebase Emulator Suite (Firestore, Auth, Cloud Functions)
- **CI/CD:** GitHub Actions → lint → test → build → deploy to Firebase Hosting
- **Run locally:** `npm run dev`
- **Setup:** `setup.sh` — initial project setup script
