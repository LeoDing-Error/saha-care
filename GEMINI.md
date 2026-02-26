# Saha-Care Project Reference (GEMINI.md)

Community-based disease surveillance PWA for conflict zones (Gaza Strip). Offline-first web app with role-based views + outbreak dashboard.
Served via Firebase Hosting and GitHub Pages.

## Tech Stack

- **App:** React + Vite + TypeScript (PWA with service worker)
- **UI:** Material UI (MUI) + Leaflet + Recharts
- **BaaS:** Firebase (Firestore, Auth, Hosting, Cloud Functions)
- **Server-side:** Cloud Functions (Node.js/TypeScript) — approval enforcement, alert triggers, data aggregation
- **State:** React Context (AuthContext) + Firestore `onSnapshot` listeners + local `useState`
- **Offline:** Firestore offline cache + Vite PWA plugin (service worker)
- **Landing Page:** GitHub Pages (HTML/CSS/JS)

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
                                                     └─────────────┘
Firebase Hosting ──► serves PWA (CDN + SSL)
GitHub Pages ──► serves Landing Page
```

One app, three role-based views: Volunteer (reporting), Supervisor (verification), Official (dashboard).

## User Roles

| Role | Access | Approval |
|---|---|---|
| **Volunteer** | Submit reports | Approved by supervisor |
| **Supervisor** | Review/verify reports, approve volunteers, maps, regional charts | Approved by official |
| **Official** | Dashboard, aggregated data, maps, charts, approve supervisors | Pre-provisioned |

Self-registration with approval — users enter `pending` state until approved by higher role.

## Cloud Functions

Server-side logic deployed as Firebase Cloud Functions (Node.js/TypeScript). Triggered by Firestore writes — no HTTP endpoints needed.

| Function | Trigger | Purpose |
|---|---|---|
| `onUserApproval` | `users/{uid}` onUpdate | Validates role escalation, enforces region scoping, prevents unauthorized approval |
| `onReportWrite` | `reports/{id}` onCreate | Checks case counts against thresholds per disease/region, auto-creates `alerts` documents |
| `aggregateCases` | `reports/{id}` onWrite | Maintains pre-computed rollup documents in `aggregates` collection for dashboard performance |

## Firestore Collections

- `users` — uid, email, displayName, role, status (pending/approved), supervisorId, region
- `reports` — disease, symptoms, temp, location (lat/lng + name), status (pending/verified/rejected), reporterId, verifiedBy
- `caseDefinitions` — disease, symptoms (JSON), dangerSigns, guidance, active flag
- `alerts` — disease, region, caseCount, threshold, severity, status
- `conversations` — reportId, participantIds, lastMessageAt *(future phase)*
  - `messages` (subcollection) — senderId, text, read, sentAt *(future phase)*
- `aggregates` — disease, region, period (day/week), caseCount, verifiedCount, lastUpdated (maintained by Cloud Function)

## Key Constraints

- **Offline-first:** Firestore offline cache + service worker. Reports created offline sync on reconnect.
- **Low-to-mid range Android:** Keep bundle small, minimal heavy animations, test on Chrome Android.
- **Data security:** Firestore security rules enforce role + region scoping. TLS everywhere.

## Project Structure

```
saha-care/
├── src/                      # React PWA source
│   ├── components/
│   │   ├── common/           
│   │   ├── forms/            
│   │   ├── maps/             
│   │   └── charts/           
│   ├── layouts/              
│   ├── pages/
│   │   ├── auth/             
│   │   ├── volunteer/        
│   │   ├── supervisor/       
│   │   └── official/         
│   ├── services/             
│   ├── contexts/             
│   ├── hooks/                
│   ├── types/                
│   ├── utils/                
│   ├── constants/            
│   ├── router/               
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
├── docs/                     # GitHub Pages Landing Site
│   ├── index.html            # Landing page HTML
│   ├── style.css             # Landing page styles
│   ├── main.js               # Landing page script
│   └── diagrams/             # Mermaid diagrams (architecture, ERD)
├── public/                   # PWA manifest, icons
├── scripts/                  # Seed data scripts
├── firestore.rules
├── firestore.indexes.json    
├── firebase.json
└── vite.config.ts            
```

## Dev Environment

- **Local testing:** Firebase Emulator Suite (Firestore, Auth, Cloud Functions)
- **CI/CD:** GitHub Actions → lint → test → build → deploy to Firebase Hosting
- **Run locally:** `npm run dev`
