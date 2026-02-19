# SAHA-Care 🏥📡

**Community-Based Surveillance Mobile App for Infectious Disease Reporting in Conflict-Affected Regions**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Status: In Development](https://img.shields.io/badge/Status-In%20Development-orange)](https://github.com/)
[![Platform: Android](https://img.shields.io/badge/Platform-Android-green)](https://developer.android.com/)
[![Backend: GCP](https://img.shields.io/badge/Backend-Google%20Cloud-blue)](https://cloud.google.com/)
[![Course: GH598-2](https://img.shields.io/badge/Course-GH598--2%20Emory-blueviolet)](https://www.sph.emory.edu/)

> *Surveillance infrastructure that works when everything else doesn't.*

---

## Overview

SAHA-Care is a proposed **offline-first, community-based disease surveillance (CBS)** mobile application designed for infectious disease detection and reporting in conflict-affected, resource-constrained environments. Its initial implementation context is the **Gaza Strip**, where existing health surveillance infrastructure has collapsed under ongoing conflict and displacement.

The app enables community health workers (CHWs) and displaced individuals to report standardized case definitions even during **connectivity blackouts**, using SMS/USSD fallback when internet is unavailable. Reports are aggregated on a cloud-based backend with automated triage and alerting.

This project is a graduate capstone for **GH598-2: Digital Health Interventions in Low and Middle-Income Countries** at the **Rollins School of Public Health, Emory University**.

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

## Key Features

- **Offline-first data collection** — SQLite local storage with background sync when connectivity resumes
- **SMS/USSD fallback** — Reports submitted via structured SMS when mobile data is unavailable
- **Standardized case definitions** — WHO-aligned symptom checklists for priority diseases
- **Open-source architecture** — Auditable, forkable, adaptable for other crisis contexts
- **Cloud backend (GCP)** — Cloud Run, Firestore, Pub/Sub, Firebase Auth
- **Automated helpdesk** — Cloud Functions-powered alert routing and case escalation
- **Community-centered design** — Arabic/multilingual support, low-literacy UI considerations

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     FIELD LAYER                              │
│                                                             │
│  ┌────────────┐    ┌────────────┐    ┌──────────────────┐  │
│  │ Android    │    │  SMS/USSD  │    │  Web (CHW portal)│  │
│  │ Mobile App │    │  Fallback  │    │  (low bandwidth) │  │
│  │ (offline-  │    │  via Twilio│    │                  │  │
│  │  first)    │    │  /Africa's │    │                  │  │
│  │            │    │  Talking   │    │                  │  │
│  └─────┬──────┘    └─────┬──────┘    └────────┬─────────┘  │
│        │                 │                    │             │
└────────┼─────────────────┼────────────────────┼────────────┘
         │         (when connected)             │
         └─────────────────┼────────────────────┘
                           │ HTTPS / REST
┌──────────────────────────▼──────────────────────────────────┐
│                     GCP BACKEND                              │
│                                                             │
│  Cloud Run (API)  →  Firestore (case data)                  │
│  Cloud Functions  →  Pub/Sub (event streaming)              │
│  Firebase Auth    →  Cloud Storage (attachments)            │
│  BigQuery         →  Looker Studio (dashboards)             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Tech Stack:**

| Layer | Technology |
|---|---|
| Mobile client | Android (Kotlin), SQLite, WorkManager |
| SMS fallback | Africa's Talking / Twilio SMS Gateway |
| API | Python (FastAPI) on Cloud Run |
| Database | Firestore (primary), Cloud SQL (analytics) |
| Auth | Firebase Identity Platform |
| Messaging | GCP Pub/Sub |
| Storage | Cloud Storage |
| CI/CD | GitHub Actions → Cloud Run |

---

## Comparator Landscape

SAHA-Care is informed by and benchmarked against existing platforms:

| Platform | Strengths | Gap SAHA-Care Addresses |
|---|---|---|
| DHIS2 | Mature, widely adopted | Not offline-first; complex to deploy in crisis |
| KoboToolbox | Offline capable, flexible | Not designed for CBS; no SMS fallback |
| EWARS | WHO-backed, crisis context | Proprietary; connectivity-dependent |
| Nyss | CBS-focused, open-source | Limited SMS support; no conflict adaptation |
| AVADAR | Field-tested in OPV surveillance | Disease-specific; not generalizable |

---

## Deliverables

| Deliverable | Description | Link |
|---|---|---|
| Project Proposal | Initial scope, rationale, and literature review | *Coming soon* |
| System Design Document | Architecture, ERD, API spec | *Coming soon* |
| Midterm Presentation | Progress showcase | *Coming soon* |
| Final Report | Full evaluation and recommendations | *Coming soon* |
| Final Presentation | Capstone showcase | *Coming soon* |

---

## Ethical Considerations

Working in conflict-affected zones introduces significant ethical responsibilities:

- **Data minimization** — Collect only what is necessary for epidemiological surveillance
- **Conflict-sensitive design** — Avoid data collection that could endanger reporters or communities
- **Community trust** — Co-design and community validation are central to the implementation framework
- **No-harm principle** — Compliance with ICRC data protection standards for humanitarian contexts

---

## Team

| Name | Role | Program |
|---|---|---|
| **Leo** | Software Engineering, Technical Architecture, GCP Deployment | CS Graduate Student, Emory University |
| **Dalia** | Public Health Framing, Literature Review, Health Domain Expertise | Public Health Graduate Student, Rollins School of Public Health |

**Course:** GH598-2 — Digital Health Interventions in Low and Middle-Income Countries

---

## Repository Structure

```
saha-care/
├── android/          # Android mobile app (Kotlin)
├── backend/          # FastAPI backend (Cloud Run)
│   ├── api/
│   ├── functions/    # Cloud Functions
│   └── infra/        # Terraform / GCP config
├── sms-gateway/      # SMS/USSD handler
├── docs/             # Architecture docs, ERDs, API spec
├── deliverables/     # Academic deliverables (PDFs)
└── .github/
    └── workflows/    # CI/CD (GitHub Actions)
```

---

## License

This project is open-source under the [MIT License](LICENSE). We encourage adaptation for other humanitarian and crisis contexts.

---

*SAHA-Care — GH598-2 Capstone | Emory University | Spring 2025*
