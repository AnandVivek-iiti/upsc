# 🎯 UPSC Mentor

**An AI-powered preparation companion for UPSC Civil Services aspirants — syllabus tracking, subject-wise study analytics, Mains answer evaluation, Prelims PYQ drilling, MCQ test series with AI diagnostics, an AI notes workspace, and a personal AI mentor, all in one platform.**

🔗 **Live App:** [upsc-by-iitian.onrender.com](https://upsc-by-iitian.onrender.com/)

---

## ✨ Overview

UPSC Mentor is a full-stack exam-prep platform built for CSE aspirants. It combines a structured syllabus tracker, a subject-aware daily study timer with cross-device sync, a multi-provider AI engine for grading Mains answers and chatting with an AI mentor, an AI-powered notes workspace with undo history and rich rendering, a Prelims PYQ practice bank organized by subject/topic, an MCQ Test Series module with automated diagnostic reports, a curated resource library, and a founder-level behavioral analytics panel — all wrapped in a single dashboard with an admin control panel.

---

## 🚀 Core Features

### 📊 Dashboard
- **Subject Study Timer** — live stopwatch that tracks time per UPSC subject (12 subjects), persists per day/user, and syncs across open tabs/devices in real time via Socket.io.
- **Subject Analytics Dashboard** — per-subject daily/weekly/monthly/lifetime accumulation with a syllabus bridge (1 hr = 10% progress, capped at 95%).
- **Study Chart** — visual history of daily study hours vs. the user's daily target.
- **Today Planner** — quick add/check-off daily task list.
- **Current Affairs Log** — capture daily current-affairs notes/headlines.
- **Answer Writing Tracker** — log Mains answer-writing practice outside the formal evaluator flow.
- **Paper Progress** — at-a-glance completion percentage per GS paper, pulled from the Syllabus Tracker.
- **Streak & Countdown** — daily login streak, longest streak, and a live countdown to the user's configured exam date.
- **ActionHub** — four quick-access study action cards for core platform workflows.

### 📚 Syllabus Tracker
- Full GS Prelims + Mains (GS1–GS4) syllabus broken into papers → modules.
- Per-module status (Pending / In Progress / Revision / Done) with progress bars.
- **Bulk syllabus update** endpoint so multiple modules can be saved in a single request.
- Stage-level coverage bars summarizing how much of Prelims/Mains is complete.

### 🤖 AI Mentor Chat
- Persistent, multi-thread conversational mentor backed by a dedicated system prompt that enforces structured markdown (headings, tables, `:::memory:::` recall blocks, exam tips) and bans flattery/filler.
- **Durable memory extraction** — a background process distills long-term facts about the student (recurring weak spots, study patterns) from each conversation turn.
- Available as both a compact floating chat bubble and a dedicated full-page **AI Mentor Workspace**.
- Quote-of-the-day cards can be sent straight into the mentor chat for instant explanation, historical context, and essay/GS deployment advice.

### 📝 Mentor Notes (AI-Powered)
- Full-featured notes workspace with a two-pane layout: note list sidebar + editor.
- **8 UPSC subject tags** (Polity, History, Economy, Geography, Sociology, Ethics, Environment, Science & Tech) for filtering and organisation.
- **AI actions on notes**: Improve Notes, Find Mistakes (with Knowledge / Clarity / Retention scores), Generate Revision Notes, Convert to Mains Format — all backed by the multi-provider AI chain.
- **Reading mode** — rich markdown-lite renderer with headings, bullet lists, memory-card blocks (`:::memory:::`), callout boxes (`[!NOTE]`, `[!TIP]`, `[!WARN]`), inline code, and tables.
- **Undo history** — per-note content snapshot stack (up to 40 snapshots, 2s debounce); triggered by Ctrl+Z / Cmd+Z or the History button. Pre-AI-apply snapshots are also pushed so every AI rewrite is reversible.
- Autosave with debounce (1.4s), flush on tab switch/unmount, relative-time save indicator.
- Notes stored in `localStorage`; AI features require sign-in (sign-in gate drawer shown otherwise).

### ✍️ Mains Grind (Answer Evaluation)
- Submit a typed or handwritten answer for a chosen GS paper (GS1–GS4, Essay) and receive a structured AI evaluation: score, rationale, strengths, weaknesses, a topper-style model answer, keyword analysis (present / missing / bonus), structural feedback, and priority actions.
- Paper-specific grading rubrics via dedicated system instructions per paper.
- Handwritten answers processed via Gemini Vision's multimodal capability.
- Rate-limited to 10 evaluations/user/day (admins exempt).

### 📝 Prelims Grind & Topic-wise Practice
- Large bank of Prelims PYQs organized subject-wise (Polity, Economy, History, Modern History, Geography, Environment & Ecology, Art & Culture, Science & Tech, Social Issues, IR/IYP) and CSAT (Comprehension, Maths, Reasoning).
- Topic-wise view groups both Prelims PYQs and Mains PYQs (2024 & 2025, GS1–GS4) by subject.
- **PyqVault** — aggregated PYQ browser across all subjects and years.
- Per-question attempt tracking synced to the server.
- **Spaced-repetition queue** — push tough topics into a revision queue with difficulty weighting.

### 🧪 Test Series (MCQ)
- Full timed mock-test interface (question palette, timer, review mode) across 16 test series files.
- Server-side scoring using the exact UPSC marking fraction (+2 / −2/3) at full precision.
- **AI Diagnostic Report** per attempt: performance band (Needs Work / Average / Good / Excellent), strong & weak topics with accuracy %, a realistic 7-day topic-prioritized study plan, and spaced-repetition recommendations.
- Re-analyze any past attempt on demand; rate-limited to 20 AI analyses/user/day.

### 📖 Resource Library
- NCERT book tracker (subject-filterable, with completion state).
- Curated reference books, topper/expert notes, and YouTube class links — organized by subject/paper/module with tag filtering.

### 👤 Profile & Auth
- Email/password registration and **Google OAuth (Google Identity Services)** sign-in.
- JWT-based session auth; profile page for editing target year, daily target hours, exam date, and changing password.
- Avatar circle with initials fallback.

### 🛡️ Admin Panel
- Aggregate visitor analytics (daily hits, distinct visitors, route breakdown — SHA-256 hashed IPs).
- User list view and feature flag management.
- **Founder/behavioral analytics** — user journey tracking, session timeline construction (30-minute inactivity gap heuristic), per-feature analytics across 9 named features, retention segmentation (Power Users / At Risk / Dormant / New Users), feature discovery analysis, auto-generated narrative insights. In-memory caching with 5-minute TTL.
- **AdminStudyAnalytics** — subject-session analytics across all users.
- Gated behind `protect` + `adminOnly` middleware.

### 💬 Feedback Modal
- In-app feedback collection with rating and free-text, persisted to the `Feedback` model.
- Shown to logged-in users; synced to backend via `feedbackController`.

---

## 🛠️ Tech Stack

### Frontend
- **React** (JSX) + **Vite**
- **Tailwind CSS** — utility-first styling with a custom CSS-variable design system (light/dark theme via `data-theme` on `document.documentElement`, persisted to `localStorage`)
- **lucide-react** — icon set
- **Socket.io-client** — real-time timer/progress sync across tabs and devices
- Custom hooks: `useAuth`, `useUserData`, `useAI`, `useQuestionAttempts`, `useRevisionQueue`, `useSubjectTimer`, `timerStore`
- PWA install prompt (`PWAInstallPrompt.jsx`)
- Google Identity Services SDK for OAuth

### Backend
- **Node.js + Express**
- **Sequelize ORM** over **PostgreSQL** (SSL-enabled, `alter: true` auto-sync on boot)
- **Socket.io** — real-time server for cross-device timer sync
- **JWT (jsonwebtoken)** — authentication
- **bcryptjs** — password hashing
- **express-rate-limit** — tiered rate limiting (global, auth, AI-evaluation, test-analysis)
- **CORS** — explicit allow-list

### AI Layer (multi-provider fallback chain)
- **Google Gemini** (`gemini-2.5-flash`) — primary for chat, Mains evaluation, test analysis, notes AI, memory extraction
- **Groq** (`llama-3.3-70b-versatile`) — fallback 1
- **OpenRouter** (free model rotation: Llama 3.3 70B, Qwen3 235B, Qwen3 32B, Gemma 3 27B, Mistral Small) — fallback 2+
- Each AI task has its own dedicated system instruction file (`mentorInstructions.js`, `notesInstructions.js`, `systemInstructions.js`, `testInstructions.js`).

### Database
- **PostgreSQL** — models: `User`, `UserData`, `TestAttempt`, `SubjectSession`, `DailyActiveUsers`, `Feedback`, `UserEvents`, `VisitorLog`.

---

## 🏗️ System Architecture

```
React (Vite) SPA  ──HTTP (fetch, JWT bearer)──▶  Express API  ──Sequelize──▶  PostgreSQL
        │                                              │
        └──────────── Socket.io (WSS) ─────────────────┘
                  (timer + progress live sync)

Express Controllers ──▶ ai-client.js ──▶ Gemini → Groq → OpenRouter
                                              (first available provider wins,
                                               normalized response shape)
```

1. The React SPA holds local UI state and a single source of truth (`userData`) fetched from `GET /api/dashboard`, kept in sync via `useUserData`.
2. Mutating actions hit dedicated `PATCH`/`POST` routes under `/api/dashboard/*`, each backed by Sequelize and persisted to PostgreSQL.
3. The subject study timer is mirrored across open tabs/devices over Socket.io; `timerStore` is a module-level singleton so the interval survives React navigation.
4. AI-backed features (`/api/evaluate/*`, `/api/tests/submit`, `/api/notes/*`) build structured prompts server-side, send them through the provider fallback chain in `ai-client.js`, parse/normalize JSON responses, and persist results.
5. Every request passes through a `VisitorLog` middleware recording hashed-IP hit counts per route per day.
6. Auth uses JWT bearer tokens validated by `protect` middleware; `adminOnly` gates Admin routes.
7. Subject sessions are tracked via `SubjectSession` model and `subjectSessionController`, with per-subject daily/weekly/monthly/lifetime aggregations surfaced in `AdminStudyAnalytics`.

---

## ⚙️ Local Installation & Setup

### Prerequisites
- Node.js (LTS)
- PostgreSQL database (local, Render, Supabase, or Neon)
- API key for at least one AI provider (Gemini recommended as primary)

### 1. Clone & install

```bash
git clone https://github.com/AnandVivek-iiti/upsc.git
cd upsc

# Backend
cd server
npm install

# Frontend
cd ../client
npm install
```

### 2. Environment variables

**`server/.env`**
```env
PORT=5000
NODE_ENV=development

# Database
DATABASE_URL=postgres://user:password@host:5432/dbname

# Auth
JWT_SECRET=your-long-random-secret
JWT_EXPIRES_IN=7d

# AI Providers (at least one required; Gemini is primary)
GEMINI_API_KEY=your-gemini-key
GROQ_API_KEY=your-groq-key
OPENROUTER_API_KEY=your-openrouter-key

# Google OAuth (server-side token verification)
GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

**`client/.env`**
```env
VITE_API_URL=http://localhost:5000/api
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id
```

### 3. Run in development

```bash
# Terminal 1 — backend (http://localhost:5000)
cd server
npm run dev

# Terminal 2 — frontend (http://localhost:5173)
cd client
npm run dev
```

On first boot, Sequelize runs `sync({ alter: true })`, automatically creating/migrating all tables.

### 4. Build for production

```bash
cd client
npm run build
```

Deploy the Express server and the built `dist/` to your platform — live deployment is on [Render](https://upsc-by-iitian.onrender.com/).

---

## 📁 Project Structure

### Frontend (`client/src/`)

```
App.jsx                          # Root: routing, theme, auth, layout
index.css / main.jsx

├── components/
│   ├── FeedbackModal.jsx        # In-app feedback collection
│   ├── PWAInstallPrompt.jsx     # PWA install banner
│   ├── QuestionStats.jsx        # SVG donut/radial bar charts for attempt stats
│   ├── layout/
│   │   ├── BottomNav.jsx        # Mobile bottom navigation
│   │   ├── Footer.jsx
│   │   └── Sidebar.jsx          # Desktop sidebar with theme toggle
│   └── ui/
│       ├── AuthGate.jsx
│       ├── ExplanationBox.jsx
│       ├── MainsQuestionCard.jsx
│       ├── MatchTable.jsx
│       ├── QuestionRenderer.jsx
│       └── UserTimeline.jsx     # Session timeline for admin analytics

├── data/
│   ├── quotes_data.js           # 365-quote engine (hourly rotation)
│   ├── subjectConstants.js      # 12 UPSC subjects with metadata
│   ├── upscLinks.js
│   ├── PYQs/
│   │   ├── Mains_papers.js
│   │   ├── Prelims_paper.js
│   │   └── syllabusData.js
│   ├── Resources/
│   │   ├── classes.js
│   │   ├── ncert_data.js
│   │   ├── notes_data.js
│   │   └── reference_books_data.js
│   ├── Subjectwise/
│   │   ├── mains/
│   │   │   ├── 2024/  (GS1–GS4)
│   │   │   └── 2025/  (GS1–GS4)
│   │   └── pre/
│   │       ├── CSAT/  (Comprehension, Maths, Reasoning)
│   │       └── GS/    (Polity, Economy, History, ModernHistory, Geography,
│   │                   Environment, ArtCulture, SciTech, SocialIssues, IR)
│   └── Test/
│       └── Testseries_t*.js     # 16 test series data files (SFG 2026)

├── hooks/
│   ├── timerStore.js            # Module-level singleton; survives React nav
│   ├── useAI.js                 # AI feature API calls + improveNotes, findMistakes etc.
│   ├── useAuth.js               # JWT auth state
│   ├── useQuestionAttempts.js   # PYQ attempt tracking + cross-device sync
│   ├── Usequestionstats.js      # Attempt stats aggregation
│   ├── useRevisionQueue.js      # Spaced repetition bookmark management
│   ├── useSubjectTimer.js       # Per-subject session timing hook
│   └── useUserData.js           # Central server data hook + mutation helpers

├── pages/
│   ├── Hero.jsx                 # HeroBanner with 365-quote engine + QuotePanel
│   ├── LandingHero.jsx
│   ├── Admin/
│   │   ├── Adminpannel.jsx      # Visitor analytics, user list, feature flags
│   │   └── AdminStudyAnalytics.jsx  # Subject-session analytics across users
│   ├── AI/
│   │   ├── AIEvaluatorPanel.jsx # Inline answer evaluator panel
│   │   ├── AIMentorChat.jsx     # Floating compact chat bubble
│   │   ├── AIMentorWorkspace.jsx # Full-page multi-thread mentor
│   │   └── AIRevisionPanel.jsx  # Spaced-repetition AI revision panel
│   ├── Dashboard/
│   │   ├── Dashboard.jsx        # Main dashboard with ActionHub
│   │   ├── SubjectAnalyticsDashboard.jsx  # Per-subject charts + syllabus bridge
│   │   └── SubjectStudyTimer.jsx          # 12-subject study timer UI
│   ├── PYQs/
│   │   ├── MainsGrind.jsx       # Mains answer evaluation workspace
│   │   ├── PrelimsGrind.jsx     # Prelims PYQ drilling by subject
│   │   ├── PyqVault.jsx         # Aggregated PYQ browser
│   │   └── Topicwise.jsx        # Cross-stage topic-wise view
│   └── User/
│       ├── AuthPage.jsx         # Email + Google OAuth sign-in/register
│       ├── MentorNotes.jsx      # AI-powered notes workspace with undo history
│       ├── ProfilePage.jsx      # Profile editing, avatar, stats
│       ├── ResourceLibrary.jsx  # NCERT, books, notes, classes
│       ├── SyllabusTracker.jsx  # Module-level syllabus progress
│       └── Testseriespage.jsx   # Timed MCQ test interface + results

└── utils/
    ├── adminReports.js          # Founder analytics report generation
    ├── api.js                   # Typed REST client (fetch + JWT)
    ├── dateUtils.js
    ├── exportCSV.js
    └── socket.js                # Socket.io client singleton
```

### Backend (`server/src/`)

```
server.js                        # Entry: env validation, DB connect, route mount, Socket.io

├── config/
│   ├── ai-client.js             # Multi-provider AI chain (Gemini → Groq → OpenRouter)
│   ├── db.js                    # Sequelize + PostgreSQL SSL connection
│   ├── mentorInstructions.js    # System prompt: AI Mentor chat (memory, no-filler rules)
│   ├── notesInstructions.js     # System prompts: improve, mistakes, revision, Mains format
│   ├── systemInstructions.js    # System prompts: Mains evaluation (per GS paper + Essay)
│   └── testInstructions.js      # System prompt: test diagnostic report

├── controllers/
│   ├── adminController.js       # Visitor analytics, user journey, retention, feature flags;
│   │                            #   in-memory cache (5-min TTL), 9-feature behavioral analytics
│   ├── authController.js        # Register, login, Google OAuth, profile update, password change
│   ├── dashboardController.js   # Full data fetch, syllabus bulk update, daily log, attempts
│   ├── evaluateController.js    # Typed + handwritten Mains answer evaluation
│   ├── feedbackController.js    # Feedback submission and retrieval
│   ├── notesController.js       # AI notes actions (improve, mistakes, revision, mains)
│   ├── subjectSessionController.js  # Subject study session CRUD + aggregation analytics
│   └── testController.js        # Test submission, scoring, history, on-demand re-analysis

├── middleware/
│   ├── authMiddleware.js        # JWT protect + adminOnly
│   ├── errorMiddleware.js       # Centralised error formatting
│   └── rateLimiter.js           # Global + per-feature tiered rate limits

├── models/
│   ├── DailyActiveUsers.js      # DAU tracking
│   ├── Feedback.js              # User feedback submissions
│   ├── SubjectSession.js        # Per-subject study sessions (userId, subject, duration, date)
│   ├── TestAttempt.js           # MCQ test results + AI diagnostic JSON
│   ├── User.js                  # Auth, profile, streak, exam date
│   ├── UserData.js              # Syllabus progress, daily logs, mentor threads/memory, attempts
│   ├── UserEvents.js            # Behavioral event log for founder analytics
│   └── VisitorLog.js            # Hashed-IP daily hit counts per route

├── routes/
│   ├── adminRoutes.js
│   ├── authRoutes.js
│   ├── dashboardRoutes.js
│   ├── evaluateRoutes.js
│   ├── feedbackRoutes.js
│   ├── notesRoutes.js
│   ├── subjectSessionRoutes.js
│   └── testRoutes.js

├── socket/
│   └── socketManager.js         # userRoom relay: timer:state broadcast + IST midnight rollover

└── utils/
    ├── dateUtils.js
    └── trackEvent.js            # UserEvents write helper for behavioral analytics
```

---

## 🗃️ Database Models

| Model | Key Fields | Purpose |
|---|---|---|
| `User` | id, email, password, google_id, role, streak, exam_date, daily_target_hours | Auth + profile |
| `UserData` | user_id, syllabus_progress, daily_logs, answers, spaced_repetition, question_attempts, mentor_threads, mentor_memory | All user content |
| `TestAttempt` | user_id, score, accuracy, performance_band, topic_breakdown, ai_analysis, ai_analysis_status | MCQ results + diagnostics |
| `SubjectSession` | user_id, subject, duration_seconds, date | Per-subject study tracking |
| `Feedback` | user_id, rating, text, created_at | In-app feedback |
| `UserEvents` | user_id, event_type, metadata, created_at | Behavioral analytics log |
| `DailyActiveUsers` | date, user_ids | DAU counter |
| `VisitorLog` | date, hits, distinct_visitors, visitor_hashes, routes | Privacy-safe traffic analytics |

---

## 🔌 API Routes

| Prefix | Controller | Auth | Key Endpoints |
|---|---|---|---|
| `/api/auth` | authController | None + rate limit | Register, login, Google OAuth, profile, password |
| `/api/dashboard` | dashboardController | JWT | Full data fetch, bulk syllabus update, daily log, question attempts |
| `/api/evaluate` | evaluateController | JWT + usage limit | Typed evaluation, handwritten (vision) evaluation |
| `/api/tests` | testController | JWT | Submit, history, result, re-analyze |
| `/api/notes` | notesController | JWT | Improve, find mistakes, revision notes, Mains format |
| `/api/subject-sessions` | subjectSessionController | JWT | Log session, get aggregates |
| `/api/feedback` | feedbackController | JWT | Submit feedback |
| `/api/admin` | adminController | JWT + admin | Analytics, user list, feature flags, behavioral report |

---

## 📄 License

Proprietary — © UPSC Mentor. All rights reserved.