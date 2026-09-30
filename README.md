# Scholarship Application Platform

A self-hosted web app for running student scholarship schemes. Students apply online, upload proof documents, and track their application; sponsors configure scheme rules and process applications with OCR-assisted document checks.

## Why this exists

Running scholarship schemes on paper or spreadsheets means slow reviews, repeated follow-ups with students over missing or unreadable documents, and no shared view of where each application stands. This project digitises the pipeline and automates the mechanical parts of checking, leaving judgement calls to reviewers.

## How it works

- **Applicants** register, choose a scheme, fill in a form, upload scans of their documents, fix anything a reviewer flags, and follow the status of each application.
- **Schemes are data, not code** — income ceiling, minimum marks, and the required document list live in PostgreSQL rows (JSONB), so a new scheme is an insert, not a deploy.
- **Document checks** — each upload is forwarded to a small FastAPI service that runs EasyOCR (English + Hindi) and returns the extracted text with an average confidence figure. Reviewers see this next to the original file; nothing is auto-approved.
- **Deficiency loop** — a reviewer rejects one document with a reason, the applicant re-uploads, and the exchange stays linked to the application.
- **Audit log** — every status change is written to `audit_logs`.

## Screenshots

Applicant portal — scheme listings and application entry point:

![Applicant portal home](docs/screenshots/01-home-portal.png)

Eligibility pre-check — deterministic rule checks against the selected scheme's published norms (officer verification still applies):

![Eligibility pre-check](docs/screenshots/05-eligibility-precheck.png)

AI document screening — an uploaded scan is screened and returned with a risk label and the tamper signals that caused it:

![AI screening result](docs/screenshots/02-ai-screening-result.png)

Error Level Analysis residual map — brighter areas changed more on recompression, flagging possible edits for human review:

![ELA residual map](docs/screenshots/03-ela-forensic-map.png)

OCR extraction — text pulled from the document with per-run confidence, shown beside the screening result:

![OCR extracted text](docs/screenshots/04-ocr-extracted-text.png)

## Tech Stack

| Layer | Technology |
|---|---|
| Backend API | Node.js, Express |
| Database | PostgreSQL (JSONB for flexible scheme/document data) |
| AI Service | Python, FastAPI, EasyOCR |
| Auth | JWT + bcrypt |
| File Uploads | Multer |
| Frontend | Static HTML/JS (served by the backend, also deployable via GitHub Pages) |

## Architecture

```
frontend (static HTML/JS)
        │
        ▼
backend (Express, :5000)  ──────►  PostgreSQL
        │
        ▼
ai-service (FastAPI, :8000)  ──►  EasyOCR (en + hi)
```

- `backend/services/aiClient.js` forwards uploaded documents to the AI service and stores the extracted text and confidence back on the document record.
- The AI service falls back to a clear error response if the OCR engine is unavailable — the app continues to work with manual review.

## Getting Started

### Prerequisites

- Node.js 18+
- PostgreSQL 14+
- Python 3.10+

### 1. Database

```bash
createdb scholarship_db
psql -d scholarship_db -f backend/db/schema.sql
```

### 2. Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in DATABASE_URL and a strong JWT_SECRET
npm start              # http://localhost:5000
```

### 3. AI Service

```bash
cd ai-service
pip install -r requirements.txt
uvicorn main:app --port 8000   # http://localhost:8000
```

The first OCR run downloads EasyOCR models, so allow a few minutes.

## API Overview

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/api/auth/register` | Create applicant/admin account |
| POST | `/api/auth/login` | Issue JWT |
| GET | `/api/schemes` | List active schemes |
| POST | `/api/applications` | Submit an application |
| GET | `/api/applications/mine` | Applicant's own applications |
| GET | `/api/applications` | Officer view of all applications |
| POST | `/api/documents/:applicationId/upload` | Upload document (triggers OCR) |

## Data Model

- `users` — applicants and administrators (role-based)
- `schemes` — configurable scheme eligibility rules and required documents
- `applications` — form data, workflow status, AI risk score, OCR confidence, officer remarks
- `documents` — uploaded files with extracted text and verification status
- `deficiencies` — flagged issues and applicant responses
- `audit_logs` — immutable action history

## Current Status & Roadmap

Working: auth, scheme CRUD, application submission, document upload with OCR extraction, deficiency records, audit logging.

Planned: admin dashboards and analytics, rule-based eligibility auto-checks, merit ranking, email/SMS notifications, and payout tracking.

## License

Private — all rights reserved.
