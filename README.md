# TALENTFLOW – Mini Hiring Platform

TALENTFLOW is a full-featured mini ATS built with a modern React stack. It includes Jobs, Candidates (list, profile, Kanban), Assessments with a builder and submissions, Analytics, Export/Import, File Uploads, @mentions with notifications, Authentication and Role-Based Permissions. The app is fast, resilient, and fully mocked via MSW with Dexie-backed persistence for a realistic local experience.

## Highlights
- Clean, modern dark theme with smooth micro-interactions and performant drag-and-drop
- Virtualized candidates list, Kanban pipeline, assessment builder (sections, question types, validation, conditionals, live preview)
- IndexedDB persistence (Dexie) with first-run seeding and export/import
- Mocked REST API (MSW) with realistic latency and complete CRUD for all entities
- @mentions with styled rendering and in-app/mock email notifications
- Analytics dashboard and robust error boundary/bootstrapping

---

## Tech Stack
- UI: React 18, TypeScript, Vite, TailwindCSS
- State & Data: TanStack Query, Zustand (select areas), React Router DOM
- DnD & Lists: @dnd-kit/core + @dnd-kit/sortable, @tanstack/react-virtual
- Persistence: Dexie (IndexedDB) with versioned schema and seed
- API Mocking: MSW (Mock Service Worker) with write-through to Dexie
- Tooling: ESLint, PostCSS, Tailwind, Vite

---

## Architecture Overview

### 1) Data & Persistence (Dexie)
Schema defined in `src/db/types.ts`, database configured in `src/db/index.ts` with versioned stores:
- `jobs`: job postings (ordering, status, archived, slug)
- `candidates`: candidate records with stage
- `assessments`: submitted assessments
- `assessmentBuilders`: per-job builder definitions
- `assessmentResponses`: candidate answers
- `candidateTimelines`: history notes/events (includes `note` entries)
- `users`: default users (admin, recruiter, viewer)
- `uploadedFiles`: binary file storage for file questions

Seeding: `src/db/seed.ts` populates initial data if empty. Bootstrap ensures DB ready before app render.

### 2) API Layer (MSW)
Handlers in `src/msw/handlers/*` implement REST endpoints and simulate latency. All write-random-failure has been removed for deterministic behavior. Examples:
- Jobs: `GET /jobs`, `POST /jobs`, `PATCH /jobs/:id`, `PATCH /jobs/:id/reorder`, `PATCH /jobs/:id/archive|unarchive`, `DELETE /jobs/:id`, `GET /jobs/archived`
- Candidates: `GET /candidates`, `GET /candidates/:id`, `GET/POST /candidates/:id/timeline`, `POST /candidates`, `PATCH /candidates/:id`, `DELETE /candidates/:id`
- Assessments: `GET /assessments`, `GET/PUT /assessments/:jobId` (builder), `POST /assessments/:jobId` (create), `PATCH /assessments/:id`, `DELETE /assessments/:id`, `POST /assessments/:jobId/submit`

Startup: `src/main.tsx` starts MSW in dev mode before rendering (fail-fast) and logs all registered routes. The API client (`src/api/client.ts`) retries once if HTML is returned (transient SW timing) and produces actionable errors if MSW isn’t intercepting.

### 3) Client State & Data Fetching
- TanStack Query caches lists and details, with optimistic updates (e.g., drag-and-drop reorder, archive/unarchive)
- React Router controls navigation and deep linking (e.g., `/jobs/:jobId`, `/candidates/:id`, `/assessments/builder/:jobId`)

### 4) UI/UX System
- TailwindCSS with a custom “Corporate Modern” dark theme
- Smooth transitions, GPU hints for DnD, glassy cards, neumorphic touches
- Accessibility fixes (labels, titles, placeholders)

---

## Feature Modules (Pages & Components)

### Jobs
File: `src/features/jobs/pages/JobsBoard.tsx`
- Search, Tag filter, Status filter; pagination
- Multi-select bulk archive/unarchive/delete
- Custom confirm dialog (no browser prompt)
- Create/Edit modal with description; job cards expandable for full details
- Export/Import buttons (role-gated)
- Newest jobs first; archived listing available

### Candidates
Files: `src/features/candidates/pages/*`
- List: Virtualized (`@tanstack/react-virtual`) for performance
- Profile: Timeline + notes with @mentions (`renderMentions`), mention notifications
- Kanban: DnD pipeline with `@dnd-kit`, DragOverlay, optimized sensors, GPU hints, newest-first in column

### Assessments
Files: `src/features/assessments/pages/*`, components under `components/`
- Assessments list with create/edit/delete and newest-first
- Builder per Job: sections, question types (single/multi, short/long text, numeric with range, file upload), validation rules, conditional questions, live preview
- File Upload: `src/utils/fileUpload.ts` stores blobs in Dexie (`uploadedFiles`) and returns file IDs; integrated in builder
- Submissions: `POST /assessments/:jobId/submit`

### Analytics
File: `src/features/analytics/pages/AnalyticsDashboard.tsx`
- KPIs for jobs, candidates, assessments; candidates by stage; recent activity feed

### Authentication & Permissions
Files: `src/features/auth/pages/LoginPage.tsx`, `src/utils/auth.ts`
- Default users: admin/recruiter/viewer (password: `password`)
- Role-based permissions (admin: `*`, recruiter: entity writes + export/import, viewer: read)
- Session persisted in `localStorage` with expiry

### Notifications & Mentions
Files: `src/utils/mentions.tsx`, `src/utils/notifications.ts`
- `parseMentions` and `renderMentions` convert `@username` to styled badges
- `useMentionNotifications` shows in-app toasts and logs mock emails

### Export/Import
Files: `src/utils/exportImport.ts`, component `src/components/ExportImportButtons.tsx`
- Full DB export/import (JSON). Overwrite import clears stores then bulk adds, wrapped in Dexie transaction

### Error Handling & Bootstrap
Files: `src/components/ErrorBoundary.tsx`, `src/main.tsx`
- Fail-fast DB/MSW initialization with clear on-screen fallback on fatal errors

---

## Data Model (High-Level)

- Job
  - id, title, department, location, status (`open|paused|closed`), tags[], order, archived, slug, description, createdAt
- Candidate
  - id, name, email, jobId, stage (`applied|screen|interview|offer|hired|rejected`), createdAt
- AssessmentBuilder (by jobId)
  - jobId, sections[], questions[], rules, metadata
- Assessment
  - id, jobId, candidateId, score?, status (`pending|completed`), createdAt
- AssessmentResponse
  - id, jobId, candidateId, answers, createdAt
- CandidateTimelineEntry
  - id, candidateId, type (`note|statusChange|...`), message, createdAt
- User
  - id, username, email, name, role (`admin|recruiter|viewer`), createdAt
- UploadedFile
  - id, filename, mimeType, size, data (ArrayBuffer), uploadedAt, uploadedBy

---

## API Surface (Mocked via MSW)
All endpoints return JSON and use realistic delays (20–150ms). See `src/msw/handlers/*`.
- Jobs: `/jobs`, `/jobs/archived`, `/jobs/:id`, `/jobs/:id/archive`, `/jobs/:id/unarchive`, `/jobs/:id/reorder`
- Candidates: `/candidates`, `/candidates/:id`, `/candidates/:id/timeline`
- Assessments: `/assessments`, `/assessments/:jobId` (builder), `/assessments/:jobId/submit`, `/assessments/:id`

Client utilities live in `src/api/*` with a robust `getJson` handling MSW timing issues and content-type checks.

---

## Project Structure

```
talentflow/
  src/
    api/                # API client utilities and endpoints
    components/         # Shared components (ErrorBoundary, ExportImportButtons, etc.)
    db/                 # Dexie schema, instance, seeds
    features/
      jobs/
        components/     # CreateEditJobModal, dialogs
        hooks/          # useJobs, mutations
        pages/          # JobsBoard
      candidates/
        components/     # CreateEditCandidateModal
        hooks/          # useCandidates
        pages/          # CandidatesPage, CandidatesKanbanPage, CandidateProfilePage
      assessments/
        components/     # CreateEditAssessmentModal
        pages/          # AssessmentsPage, AssessmentBuilderPage
      analytics/
        pages/          # AnalyticsDashboard
      auth/
        pages/          # LoginPage
    msw/                # MSW handlers and browser setup
    providers/          # QueryProvider, ToastProvider
    styles/             # Tailwind/theme CSS
    utils/              # auth, analytics, fileUpload, exportImport, mentions, notifications
    App.tsx             # Router and navigation
    main.tsx            # Bootstrap (DB, MSW, providers, error boundary)
  public/
    mockServiceWorker.js
  REQUIREMENTS_VERIFICATION.md
  TROUBLESHOOTING.md
  README.md
```

---

## Development

### Prerequisites
- Node 18+

### Install & Run
```
npm install
npm run dev
```
The app starts with DB seeding and MSW boot. If MSW fails, the app won’t render (fail-fast) and shows diagnostics in the console.

### Build
```
npm run build
npm run preview
```

---

## Performance Notes
- DnD optimizations: pointer sensor constraints, `will-change`, `translateZ(0)`, DragOverlay
- Virtualization for long lists (CandidatesPage)
- TanStack Query caching with reduced unnecessary refetches
- Fast, deterministic MSW responses (20–150ms latency)

---

## Accessibility
- Inputs include `label`, `title`, and placeholders where appropriate
- Keyboard-friendly interactions; color contrast considerate in dark theme

---

## Troubleshooting & Verification
- See `TROUBLESHOOTING.md` for MSW/DB startup issues and diagnostics
- See `REQUIREMENTS_VERIFICATION.md` for a checklist of all implemented requirements and status

---

## Licensing & Credits
This project is a demo/learning application. It uses open-source libraries per their respective licenses.

